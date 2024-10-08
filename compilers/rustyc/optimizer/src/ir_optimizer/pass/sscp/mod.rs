mod lattice;
mod util;
use crate::ir::function::Function;
use crate::ir::instructions::{InstructionData, OpCode};
use crate::ir::value::{Value, ValueData};
use crate::ir_optimizer::anaylsis::use_def_chain::{DefKind, UseDefTable};
use crate::ir_optimizer::pass::OptimizerPass;
use lattice::LatticeElement;
use std::collections::HashMap;
use util::get_lhs_value;

pub struct SSCPPass<'a> {
    use_def_table: &'a UseDefTable,
    worklist: Vec<Value>,
    /// Store data for `Value(n)` function for SSCP pass,
    /// - for a lvalue used in function, no matter is param or global ref,
    ///   it always can get the lattice element from this cache
    /// - for value is immi, it will get none from this cache.
    lvalue_map_element: HashMap<Value, LatticeElement>,
}

impl<'a> OptimizerPass for SSCPPass<'a> {
    fn process(&mut self, function: &mut Function) {
        self.initialize_pass(function);
        self.propagate_pass(function);
        self.rewrite_pass(function);
    }
}

impl<'a> SSCPPass<'a> {
    pub fn new(use_def_table: &'a UseDefTable) -> Self {
        Self {
            use_def_table,
            worklist: Default::default(),
            lvalue_map_element: Default::default(),
        }
    }
    /// ## Init pass of SSCP pass
    ///
    fn initialize_pass(&mut self, function: &mut Function) {
        let def_table = &self.use_def_table.1;
        let ssa_name_values = function
            .values
            .iter()
            .filter(|(_, value_data)| {
                if let ValueData::VirRegister(_) = value_data {
                    true
                } else {
                    false
                }
            })
            .map(|(value, _)| value.clone())
            .collect::<Vec<_>>();
        for value in &ssa_name_values {
            let def_kind = def_table.get(value).unwrap();
            if let DefKind::InternalDef(inst) = def_kind {
                // for a internal instruction def a SSA name
                let element = self
                    .get_lattice_element_from_inst_without_context(inst, function)
                    .expect("[Unreach case] value has a def instruction, but the instruction, has no left value");
                if element != LatticeElement::TopElement {
                    self.worklist.push(value.clone());
                }
                self.lvalue_map_element.insert(value.clone(), element);
            } else {
                // a value is def by outside of function, we have no knowledge about it
                self.lvalue_map_element
                    .insert(value.clone(), LatticeElement::BottomElement);
                self.worklist.push(value.clone());
            }
        }
        println!("Init: {:#?}, {:#?}", self.lvalue_map_element, function.values);
    }
    fn propagate_pass(&mut self, function: &Function) {
        let use_table = &self.use_def_table.0;
        while self.worklist.len() > 0 {
            let def_value = self.worklist.pop().unwrap();
            if let Some(use_insts) = use_table.get(&def_value) {
                for usage in use_insts {
                    let usage_inst_data = function.instructions.get(usage).unwrap();
                    if let Some(lhs) = get_lhs_value(usage_inst_data) {
                        let element = self.lvalue_map_element.get(&lhs).unwrap();
                        if *element == LatticeElement::BottomElement {
                            // reaching bottom, skip.
                            continue;
                        }
                        let next_element = self
                            .get_lattice_element_from_inst_with_context(usage, function)
                            .expect("[Unreach case]: Instruction already get LHS value, must produce the lattice");
                        if next_element != *element {
                            self.lvalue_map_element.insert(lhs.clone(), next_element);
                            self.worklist.push(lhs.clone());
                        }
                    } else {
                        // for some instruction is not have lhs, skip
                        continue;
                    }
                }
                println!(
                    "SSA name: {:#?}, Iter: {:#?}, values: {:#?}",
                    function.values.get(&def_value).unwrap(),
                    self.lvalue_map_element,
                    function.values
                );
            }
        }
    }
    fn rewrite_pass(&self, function: &mut Function) {
        for (val_of_ssa_name, element) in &self.lvalue_map_element {
            match element.get_pessimistic_element() {
                LatticeElement::BottomElement | LatticeElement::TopElement => {
                    continue;
                }
                LatticeElement::Element(immi) => {
                    let value = function.add_immi(immi);
                    let def = match self.use_def_table.1.get(&val_of_ssa_name).unwrap() {
                        DefKind::InternalDef(internal) => internal,
                        _ => unreachable!(),
                    };
                    let inst_data_ref = function.instructions.get_mut(def).unwrap();
                    *inst_data_ref = InstructionData::Move {
                        opcode: OpCode::Mov,
                        src: value,
                        dst: val_of_ssa_name.clone(),
                    };
                }
                _ => unreachable!(),
            }
        }
    }
}
