use super::expr_key::ExprValueNumberSet;
use super::{expr_key::ExpreKey, LCMPass};
use crate::ir::function::{BasicBlock, Function};
use crate::ir::value::ValueData;
use crate::ir_optimizer::pass::DebuggerPass;
use crate::ir_optimizer::print_table_helper::{print_divider, print_header, print_table_row};
use std::collections::HashMap;

fn value_data_to_string(value_data: &ValueData) -> String {
    match value_data {
        ValueData::VirRegister(reg) => reg.clone(),
        ValueData::FunctionRef(func_ref) => func_ref.clone(),
        ValueData::GlobalRef(global_ref) => global_ref.clone(),
        ValueData::Immi(_) => {
            panic!();
        }
    }
}
fn sort_block_ids(mut block_ids: Vec<BasicBlock>) -> Vec<BasicBlock> {
    for i in 0..block_ids.len() - 1 {
        for j in 0..(block_ids.len() - 1 - i) {
            if block_ids[j].0 > block_ids[j + 1].0 {
                let temp = block_ids[j];
                block_ids[j] = block_ids[j + 1];
                block_ids[j + 1] = temp;
            }
        }
    }
    block_ids
}
fn print_expr_key(expr_key: &ExpreKey, function: &Function) -> String {
    match expr_key {
        ExpreKey::Binary((src1, src2, opcode)) => {
            let src1_data = function.values.get(src1).unwrap();
            let src2_data = function.values.get(src2).unwrap();
            format!(
                "{:?}, {:?} {:?}",
                opcode,
                value_data_to_string(src1_data),
                value_data_to_string(src2_data)
            )
        }
        ExpreKey::Unary((src, opcode)) => {
            let src_data = function.values.get(src).unwrap();
            format!("{:?}, {:?}", opcode, value_data_to_string(src_data))
        }
        ExpreKey::Cmp((src1, src2, flag)) => {
            let src1_data = function.values.get(src1).unwrap();
            let src2_data = function.values.get(src2).unwrap();
            format!(
                " CMP {:?}, {:?} {:?}",
                flag,
                value_data_to_string(src1_data),
                value_data_to_string(src2_data)
            )
        }
    }
}

impl LCMPass {
    fn get_max_block_id_len(&self, function: &Function) -> usize {
        let mut max_block_id_len = 0;
        for (block_id, _) in &function.blocks {
            let block_id_len = block_id.0.to_string().len();
            if block_id_len > max_block_id_len {
                max_block_id_len = block_id_len
            }
        }
        max_block_id_len + "Block ".len() + 4
    }
    fn debug_value_set(
        &self,
        name: &str,
        output: &mut String,
        table: &HashMap<BasicBlock, ExprValueNumberSet>,
        function: &Function,
        max_block_id_len: usize,
        max_expr_key_len: usize,
        sorted_block_ids: &Vec<BasicBlock>,
    ) {
        let total_len = max_block_id_len + max_expr_key_len;
        output.push_str(print_divider(total_len).as_str());
        output.push_str(print_header(name, total_len).as_str());
        output.push_str(print_divider(total_len).as_str());
        for block_id in sorted_block_ids {
            let expr_use = table.get(block_id).unwrap();
            let len = expr_use.len();
            if len == 0 {
                continue;
            }
            let mut index = 0;
            let center_index = len / 2;
            for value_number in expr_use {
                let left;
                if index == center_index {
                    left = format!("Block {}", block_id.0);
                } else {
                    left = format!(" ");
                }
                let expr_key = self
                    .key_manager
                    .get_expr_key_from_value_number(value_number)
                    .unwrap();
                let right = print_expr_key(expr_key, function);
                output.push_str(&print_table_row(
                    &left,
                    &right,
                    max_block_id_len - 1,
                    max_expr_key_len,
                ));
                index += 1;
            }
            output.push_str(print_divider(total_len).as_str());
        }
    }
}

impl DebuggerPass for LCMPass {
    fn debugger(&self, function: &Function) -> String {
        let mut output = String::new();
        let max_block_id_len = self.get_max_block_id_len(function);
        // fixed max len, since we pre-defined the structure
        let max_expr_key_len = 31 as usize;
        let sorted_block_ids = sort_block_ids(
            function
                .blocks
                .keys()
                .into_iter()
                .map(|id| id.clone())
                .collect(),
        );
        // earliest pass
        self.debug_value_set(
            "Use Expr",
            &mut output,
            &self.expression_use,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        self.debug_value_set(
            "Kill Set",
            &mut output,
            &self.expression_kill,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        self.debug_value_set(
            "Avaiable In",
            &mut output,
            &self.available_in,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        self.debug_value_set(
            "Avaiable Out",
            &mut output,
            &self.available_out,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        self.debug_value_set(
            "Anticipate In",
            &mut output,
            &self.anticipate_in,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        self.debug_value_set(
            "Anticipate Out",
            &mut output,
            &self.anticipate_out,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        self.debug_value_set(
            "Earliest",
            &mut output,
            &self.earliest_in,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        // latest pass
        self.debug_value_set(
            "Postponable In",
            &mut output,
            &self.postponable_in,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        self.debug_value_set(
            "Postponable Out",
            &mut output,
            &self.postponable_out,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        self.debug_value_set(
            "Latest",
            &mut output,
            &self.latest_in,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        self.debug_value_set(
            "Used Expr",
            &mut output,
            &self.used_expr_in,
            function,
            max_block_id_len,
            max_expr_key_len,
            &sorted_block_ids,
        );
        output
    }
}
