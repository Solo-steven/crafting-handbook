use super::util::*;
use super::SSCPPass;
use crate::ir::function::{self, Function};
use crate::ir::instructions::{Instruction, InstructionData};
use crate::ir::value::{Immi, IrValueType, Value, ValueData};

/// ## Lattice Of Constant Propagation
/// - Element: when a lhs value have a element lattice, it means inst could
///         be replace as `dst = value`, the value's value data is promised
///         to be a immi.
#[derive(Debug, Clone, PartialEq)]
pub enum LatticeElement {
    BottomElement,
    TopElement,
    Element(Value),
    PhiInst(Vec<LatticeElement>),
}

fn get_optimistic_phi_inst_element(phi_inst_element: &Vec<LatticeElement>, function: &Function) -> LatticeElement {
    let mut only_value: Option<Value> = None;
    for ele in phi_inst_element {
        // narrow down the lattice
        let ele_not_phi = match *ele {
            LatticeElement::PhiInst(ref elements) => &get_optimistic_phi_inst_element(elements, function),
            _ => ele,
        };
        match *ele_not_phi {
            LatticeElement::BottomElement => return LatticeElement::BottomElement,
            LatticeElement::TopElement => continue,
            LatticeElement::Element(ref val) => match only_value {
                Some(exist_value) => {
                    if *function.values.get(&exist_value).unwrap() == *function.values.get(val).unwrap() {
                        continue;
                    } else {
                        return LatticeElement::BottomElement;
                    }
                }
                None => {
                    only_value = Some(val.clone());
                    continue;
                }
            },
            _ => unreachable!(),
        }
    }
    return LatticeElement::Element(only_value.unwrap());
}

fn unwrap_lattice_element_to_value(ele: &LatticeElement) -> Value {
    match ele {
        LatticeElement::Element(val) => val.clone(),
        _ => unreachable!(),
    }
}

pub fn is_lattice_element_equal(source: &LatticeElement, target: &LatticeElement, function: &Function) -> bool {
    if *source == LatticeElement::BottomElement || *target == LatticeElement::BottomElement {
        return *source == *target;
    }
    if *source == LatticeElement::TopElement || *target == LatticeElement::TopElement {
        return *source == *target;
    }
    if let LatticeElement::Element(source_element) = source {
        if let LatticeElement::Element(target_element) = target {
            return *function.values.get(source_element).unwrap() == *function.values.get(target_element).unwrap();
        }
    }
    let source_elements = match source {
        LatticeElement::PhiInst(elements) => elements,
        _ => unreachable!(),
    };
    let target_elements = match target {
        LatticeElement::PhiInst(elements) => elements,
        _ => unreachable!(),
    };
    if source_elements.len() != target_elements.len() {
        return false;
    }
    for i in 0..source_elements.len() {
        let source_ele = &source_elements[i];
        let target_ele = &target_elements[i];
        if *source_ele == LatticeElement::BottomElement || *target_ele == LatticeElement::BottomElement {
            return *source_ele == *target_ele;
        }
        if *source_ele == LatticeElement::TopElement || *target_ele == LatticeElement::TopElement {
            return *source_ele == *target_ele;
        }
        if let LatticeElement::Element(source_element) = source_ele {
            if let LatticeElement::Element(target_element) = target_ele {
                if *function.values.get(source_element).unwrap() != *function.values.get(target_element).unwrap() {
                    return false;
                }
            }
        }
    }
    return true;
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
                        Some(LatticeElement::Element(function.add_immi(result)))
                    } else {
                        Some(LatticeElement::TopElement)
                    }
                } else {
                    Some(LatticeElement::TopElement)
                }
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
                    let value = function.add_immi(computed_immi);
                    Some(LatticeElement::Element(value))
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
                    if let ValueData::Immi(_) = &function.values.get(val).unwrap() {
                        Some(LatticeElement::Element(val.clone()))
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
    ///
    pub(super) fn get_lattice_element_from_inst_with_context(
        &self,
        inst: &Instruction,
        function: &mut Function,
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
                        let src1_ele_narrow = match *src1_ele {
                            LatticeElement::PhiInst(ref elements) => {
                                &get_optimistic_phi_inst_element(elements, &function)
                            }
                            _ => src1_ele,
                        };
                        let src2_ele_narrow = match *src2_ele {
                            LatticeElement::PhiInst(ref elements) => {
                                &get_optimistic_phi_inst_element(elements, &function)
                            }
                            _ => src2_ele,
                        };
                        if *src1_ele_narrow == LatticeElement::BottomElement
                            || *src2_ele_narrow == LatticeElement::BottomElement
                        {
                            return Some(LatticeElement::BottomElement);
                        }
                        if *src1_ele_narrow == LatticeElement::TopElement
                            || *src2_ele_narrow == LatticeElement::TopElement
                        {
                            return Some(LatticeElement::TopElement);
                        }

                        let src_1_immi = unwrap_to_immi(&unwrap_lattice_element_to_value(src1_ele_narrow), &function);
                        let src_2_immi = unwrap_to_immi(&unwrap_lattice_element_to_value(src2_ele_narrow), &function);
                        let ir_type = function.get_value_ir_type(src1.clone());
                        let result = compute_binary_immi(src_1_immi, src_2_immi, opcode, &ir_type);
                        Some(LatticeElement::Element(function.add_immi(result)))
                    }
                    (Some(src_ele), None) => {
                        let narrow_src_ele = match *src_ele {
                            LatticeElement::PhiInst(ref elements) => {
                                &get_optimistic_phi_inst_element(elements, &function)
                            }
                            _ => src_ele,
                        };
                        match *narrow_src_ele {
                            LatticeElement::BottomElement => Some(LatticeElement::BottomElement),
                            LatticeElement::TopElement => Some(LatticeElement::TopElement),
                            LatticeElement::Element(val) => {
                                let immi = unwrap_to_immi(src2, function);
                                let ele_immi = unwrap_to_immi(&val, function);
                                let ir_type = function.get_value_ir_type(val.clone());
                                let result = compute_binary_immi(immi, ele_immi, opcode, &ir_type);
                                Some(LatticeElement::Element(function.add_immi(result)))
                            }
                            _ => unreachable!(),
                        }
                    }
                    (None, Some(src_ele)) => {
                        let narrow_src_ele = match *src_ele {
                            LatticeElement::PhiInst(ref elements) => {
                                &get_optimistic_phi_inst_element(elements, &function)
                            }
                            _ => src_ele,
                        };
                        match *narrow_src_ele {
                            LatticeElement::BottomElement => Some(LatticeElement::BottomElement),
                            LatticeElement::TopElement => Some(LatticeElement::TopElement),
                            LatticeElement::Element(val) => {
                                let immi = unwrap_to_immi(src1, function);
                                let ele_immi = unwrap_to_immi(&val, function);
                                let ir_type = function.get_value_ir_type(val.clone());
                                let result = compute_binary_immi(immi, ele_immi, opcode, &ir_type);
                                Some(LatticeElement::Element(function.add_immi(result)))
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
                let mut elements: Vec<LatticeElement> = Vec::with_capacity(from.len());
                for (_, value) in from {
                    let element: Option<&LatticeElement> = self.lvalue_map_element.get(value);
                    if let Some(ele) = element {
                        elements.push(match ele {
                            LatticeElement::PhiInst(phi_elements) => {
                                get_optimistic_phi_inst_element(phi_elements, &function)
                            }
                            _ => ele.clone(),
                        });
                    } else {
                        continue;
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
