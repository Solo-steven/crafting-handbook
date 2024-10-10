use super::util::*;
use super::SSCPPass;
use crate::ir::function::Function;
use crate::ir::instructions::{Instruction, InstructionData};
use crate::ir::value::{Immi, ValueData};

/// ## Lattice Of Constant Propagation
/// - Element: when a lhs value have a element lattice, it means inst could
///         be replace as `dst = value`, the value's value data is promised
///         to be a immi.
#[derive(Debug, Clone, PartialEq)]
pub enum LatticeElement {
    BottomElement,
    TopElement,
    Element(Immi),
    PhiInst(Vec<PhiLatticeElement>),
}
#[derive(Debug, Clone, PartialEq)]
pub enum PhiLatticeElement {
    Lattice(LatticeElement),
    Immi(Immi),
}

impl LatticeElement {
    /// ## Helper function for narrow the lattice element to immi
    /// In same condition, we could use this helper to unwrap the lattice element
    /// to immi.
    fn unwrap_lattice_element_to_immi(&self) -> Immi {
        match *self {
            LatticeElement::Element(ref immi) => immi.clone(),
            _ => panic!(),
        }
    }
    /// ## Abstrct common logic from `get_xxx_element`
    /// The only different between `get_optimistic_element` and `get_pessimistic_element`
    /// is that the early return of phi elements
    fn compute_element(&self, is_optimistic: bool) -> LatticeElement {
        let phi_inst_element = match *self {
            LatticeElement::PhiInst(ref elements) => elements,
            _ => return self.clone(),
        };
        let mut exist_immi: Option<Immi> = None;
        for ele in phi_inst_element {
            if let PhiLatticeElement::Immi(immi_in_phi) = ele {
                match exist_immi {
                    Some(ref exist_immi_value) => {
                        if *exist_immi_value == *immi_in_phi {
                            continue;
                        } else {
                            return LatticeElement::BottomElement;
                        }
                    }
                    None => {
                        exist_immi = Some(immi_in_phi.clone());
                        continue;
                    }
                };
            } else if let PhiLatticeElement::Lattice(ele_not_const) = ele {
                // narrow down the lattice
                let ele_not_phi = match *ele_not_const {
                    LatticeElement::PhiInst(_) => &ele_not_const.compute_element(is_optimistic),
                    _ => ele_not_const,
                };
                match *ele_not_phi {
                    LatticeElement::BottomElement => return LatticeElement::BottomElement,
                    LatticeElement::TopElement => {
                        if is_optimistic {
                            continue;
                        } else {
                            return LatticeElement::TopElement;
                        }
                    }
                    LatticeElement::Element(ref current_immi) => match exist_immi {
                        Some(ref exist_immi_value) => {
                            if *exist_immi_value == *current_immi {
                                continue;
                            } else {
                                return LatticeElement::BottomElement;
                            }
                        }
                        None => {
                            exist_immi = Some(current_immi.clone());
                            continue;
                        }
                    },
                    _ => unreachable!(),
                }
            }
        }
        return LatticeElement::Element(exist_immi.unwrap());
    }
    /// ## Get the optimistic narrow element of current element
    /// Using when propagate the element by using `Value(n)` function, will get the optimistic
    /// phi instruction result, making propagation more useful.
    pub(super) fn get_optimistic_element(&self) -> LatticeElement {
        self.compute_element(true)
    }
    /// ## Special function for getting pessimistic element for Phi instruction
    /// Using when rewrite state, will get the pessimistic  phi instruction result.
    pub(super) fn get_pessimistic_element(&self) -> LatticeElement {
        self.compute_element(false)
    }
}

impl<'a> SSCPPass<'a> {
    /// ## Serve as `Value(n)` Init functon of SSCP pass
    /// - `case1`: for two oprand inst, compute result by op if two operand is immi
    /// - `case2`: for one operand inst, compute result by op, if operand is immi.
    /// - `case3`: Not all instruction has left value.  return None
    /// - `case4`: For instruction have Lvalue and side effect like load inst, return bottom element
    /// - `edge case1`: for phi,
    /// - `edge case2`: for call.
    pub(super) fn get_lattice_element_from_inst_without_context(
        &self,
        inst: &Instruction,
        function: &mut Function,
    ) -> Option<LatticeElement> {
        let inst_data = function.instructions.get(inst).unwrap();
        match inst_data {
            // case1: two operand inst
            InstructionData::Add { opcode, src1, src2, .. }
            | InstructionData::Sub { opcode, src1, src2, .. }
            | InstructionData::Mul { opcode, src1, src2, .. }
            | InstructionData::Divide { opcode, src1, src2, .. }
            | InstructionData::Reminder { opcode, src1, src2, .. }
            | InstructionData::FAdd { opcode, src1, src2, .. }
            | InstructionData::FSub { opcode, src1, src2, .. }
            | InstructionData::FMul { opcode, src1, src2, .. }
            | InstructionData::FDivide { opcode, src1, src2, .. }
            | InstructionData::FReminder { opcode, src1, src2, .. }
            | InstructionData::BitwiseAnd { opcode, src1, src2, .. }
            | InstructionData::BitwiseOR { opcode, src1, src2, .. }
            | InstructionData::LogicalAnd { opcode, src1, src2, .. }
            | InstructionData::LogicalOR { opcode, src1, src2, .. }
            | InstructionData::ShiftLeft { opcode, src1, src2, .. }
            | InstructionData::ShiftRight { opcode, src1, src2, .. }
            | InstructionData::Fcmp { opcode, src1, src2, .. }
            | InstructionData::Icmp { opcode, src1, src2, .. } => {
                let src1_data = function.values.get(src1).unwrap();
                let src2_data = function.values.get(src2).unwrap();
                if let ValueData::Immi(immi_1) = src1_data {
                    if let ValueData::Immi(immi_2) = src2_data {
                        let ir_type = function.get_value_ir_type(src1.clone());
                        let result = compute_binary_immi(immi_1.clone(), immi_2.clone(), opcode, &ir_type);
                        return Some(LatticeElement::Element(result));
                    }
                }
                return Some(LatticeElement::TopElement);
            }
            // case 2: one operand inst.
            InstructionData::Move { opcode, src, .. }
            | InstructionData::Neg { opcode, src, .. }
            | InstructionData::BitwiseNot { opcode, src, .. }
            | InstructionData::LogicalNot { opcode, src, .. }
            | InstructionData::ToU8 { opcode, src, .. }
            | InstructionData::ToU16 { opcode, src, .. }
            | InstructionData::ToU32 { opcode, src, .. }
            | InstructionData::ToU64 { opcode, src, .. }
            | InstructionData::ToI16 { opcode, src, .. }
            | InstructionData::ToI32 { opcode, src, .. }
            | InstructionData::ToI64 { opcode, src, .. }
            | InstructionData::ToF32 { opcode, src, .. }
            | InstructionData::ToF64 { opcode, src, .. }
            | InstructionData::ToAddress { opcode, src, .. } => {
                if let ValueData::Immi(immi) = function.values.get(src).unwrap() {
                    let computed_immi = compute_unary_immi(immi.clone(), opcode);
                    Some(LatticeElement::Element(computed_immi))
                } else {
                    Some(LatticeElement::TopElement)
                }
            }
            // case 3, Lvalue inst have side effect
            InstructionData::StackAlloc { .. } | InstructionData::LoadRegister { .. } => {
                Some(LatticeElement::BottomElement)
            }
            // case 4, Instruction do not have Lvalue
            InstructionData::Jump { .. }
            | InstructionData::BrIf { .. }
            | InstructionData::Ret { .. }
            | InstructionData::StoreRegister { .. }
            | InstructionData::Comment(_) => None,
            // edge case 1
            InstructionData::Phi { .. } => Some(LatticeElement::TopElement),
            // edge case 2
            InstructionData::Call { dst, .. } => {
                if let Some(val) = dst {
                    if let ValueData::Immi(immi) = &function.values.get(val).unwrap() {
                        Some(LatticeElement::Element(immi.clone()))
                    } else {
                        Some(LatticeElement::TopElement)
                    }
                } else {
                    Some(LatticeElement::TopElement)
                }
            }
        }
    }
    /// ## Serve as `Value(n)` in propgation pass
    /// Using Lvalue element table to get the lattice element first and
    pub(super) fn get_lattice_element_from_inst_with_context(
        &self,
        inst: &Instruction,
        function: &Function,
    ) -> Option<LatticeElement> {
        // if value not `lvalue_map`
        let inst_data = function.instructions.get(inst).unwrap();
        match inst_data {
            // case1: two operand inst
            InstructionData::Add { opcode, src1, src2, .. }
            | InstructionData::Sub { opcode, src1, src2, .. }
            | InstructionData::Mul { opcode, src1, src2, .. }
            | InstructionData::Divide { opcode, src1, src2, .. }
            | InstructionData::Reminder { opcode, src1, src2, .. }
            | InstructionData::FAdd { opcode, src1, src2, .. }
            | InstructionData::FSub { opcode, src1, src2, .. }
            | InstructionData::FMul { opcode, src1, src2, .. }
            | InstructionData::FDivide { opcode, src1, src2, .. }
            | InstructionData::FReminder { opcode, src1, src2, .. }
            | InstructionData::BitwiseAnd { opcode, src1, src2, .. }
            | InstructionData::BitwiseOR { opcode, src1, src2, .. }
            | InstructionData::LogicalAnd { opcode, src1, src2, .. }
            | InstructionData::LogicalOR { opcode, src1, src2, .. }
            | InstructionData::ShiftLeft { opcode, src1, src2, .. }
            | InstructionData::ShiftRight { opcode, src1, src2, .. }
            | InstructionData::Fcmp { opcode, src1, src2, .. }
            | InstructionData::Icmp { opcode, src1, src2, .. } => {
                let src1_element = self.lvalue_map_element.get(src1);
                let src2_element = self.lvalue_map_element.get(src2);
                match (src1_element, src2_element) {
                    (Some(src1_ele), Some(src2_ele)) => {
                        let src1_ele_narrow = src1_ele.get_optimistic_element();
                        let src2_ele_narrow = src2_ele.get_optimistic_element();
                        if src1_ele_narrow == LatticeElement::BottomElement
                            || src2_ele_narrow == LatticeElement::BottomElement
                        {
                            return Some(LatticeElement::BottomElement);
                        }
                        if src1_ele_narrow == LatticeElement::TopElement
                            || src2_ele_narrow == LatticeElement::TopElement
                        {
                            return Some(LatticeElement::TopElement);
                        }

                        let src_1_immi = src1_ele_narrow.unwrap_lattice_element_to_immi();
                        let src_2_immi = src2_ele_narrow.unwrap_lattice_element_to_immi();
                        let ir_type = function.get_value_ir_type(src1.clone());
                        let result = compute_binary_immi(src_1_immi, src_2_immi, opcode, &ir_type);
                        Some(LatticeElement::Element(result))
                    }
                    (Some(src_ele), None) => {
                        let narrow_src_ele = src_ele.get_optimistic_element();
                        match narrow_src_ele {
                            LatticeElement::BottomElement => Some(LatticeElement::BottomElement),
                            LatticeElement::TopElement => Some(LatticeElement::TopElement),
                            LatticeElement::Element(ref src1_immi) => {
                                let src2_immi = unwrap_to_immi(src2, function);
                                let ir_type = function.get_value_ir_type(src2.clone());
                                let result = compute_binary_immi(src1_immi.clone(), src2_immi, opcode, &ir_type);
                                Some(LatticeElement::Element(result))
                            }
                            _ => unreachable!(),
                        }
                    }
                    (None, Some(src_ele)) => {
                        let narrow_src_ele = src_ele.get_optimistic_element();
                        match narrow_src_ele {
                            LatticeElement::BottomElement => Some(LatticeElement::BottomElement),
                            LatticeElement::TopElement => Some(LatticeElement::TopElement),
                            LatticeElement::Element(ref src2_immi) => {
                                let src1_immi = unwrap_to_immi(src1, function);
                                let ir_type = function.get_value_ir_type(src1.clone());
                                let result = compute_binary_immi(src1_immi, src2_immi.clone(), opcode, &ir_type);
                                Some(LatticeElement::Element(result))
                            }
                            _ => unreachable!(),
                        }
                    }
                    (None, None) => {
                        // if both is const,
                        unreachable!();
                    }
                }
            }
            // case 2: one operand inst.
            InstructionData::Move { src, .. }
            | InstructionData::Neg { src, .. }
            | InstructionData::BitwiseNot { src, .. }
            | InstructionData::LogicalNot { src, .. }
            | InstructionData::ToU8 { src, .. }
            | InstructionData::ToU16 { src, .. }
            | InstructionData::ToU32 { src, .. }
            | InstructionData::ToU64 { src, .. }
            | InstructionData::ToI16 { src, .. }
            | InstructionData::ToI32 { src, .. }
            | InstructionData::ToI64 { src, .. }
            | InstructionData::ToF32 { src, .. }
            | InstructionData::ToF64 { src, .. }
            | InstructionData::ToAddress { src, .. } => {
                let src_element = self.lvalue_map_element.get(src);
                if let Some(element) = src_element {
                    Some(element.clone())
                } else {
                    // unary Instruction with const operand will not be a usage of any
                    // instruction, it should only be handle by init pass, which is
                    // `get_lattice_element_from_inst_without_context` function.
                    unreachable!();
                }
            }
            // case 3, Lvalue inst have side effect
            InstructionData::StackAlloc { .. } | InstructionData::LoadRegister { .. } => {
                Some(LatticeElement::BottomElement)
            }
            // case 4, Instruction do not have Lvalue
            InstructionData::Jump { .. }
            | InstructionData::BrIf { .. }
            | InstructionData::Ret { .. }
            | InstructionData::StoreRegister { .. }
            | InstructionData::Comment(_) => None,
            // edge case 1
            InstructionData::Phi { from, .. } => {
                let mut elements: Vec<PhiLatticeElement> = Vec::with_capacity(from.len());
                for (_, value) in from {
                    let element: Option<&LatticeElement> = self.lvalue_map_element.get(value);
                    if let Some(ele) = element {
                        elements.push(PhiLatticeElement::Lattice(ele.get_optimistic_element()));
                    } else {
                        elements.push(PhiLatticeElement::Immi(match function.values.get(value).unwrap() {
                            ValueData::Immi(immi) => immi.clone(),
                            _ => unreachable!(),
                        }));
                    }
                }
                Some(LatticeElement::PhiInst(elements))
            }
            // edge case 2
            InstructionData::Call { dst, .. } => {
                if let Some(val) = dst {
                    let val_element = self.lvalue_map_element.get(val).unwrap();
                    Some(val_element.clone())
                } else {
                    Some(LatticeElement::TopElement)
                }
            }
        }
    }
}
