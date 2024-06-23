use std::collections::HashMap;

use super::expr_key::ExprValueNumberSet;
use super::{expr_key::ExpreKey, LCMPass};
use crate::ir::function::{BasicBlock, Function};
use crate::ir::value::ValueData;

static BLOCK_ID_HEADER: &'static str = "Block id: ";
static EMPTY_CHAR: &'static str = " ";
static DIVIDE_CHAR: &'static str = "-";

fn print_block_id_row_header_with_fixed_len(block_id: usize, max_block_id_len: usize) {
    print!("|  {BLOCK_ID_HEADER}{block_id:>max_block_id_len$}  |");
}
fn print_empty_line_row_header_with_fixed_len(max_block_id_len: usize) {
    let total_len = BLOCK_ID_HEADER.len() + max_block_id_len + 4;
    print!("|{EMPTY_CHAR:>total_len$}|");
}
fn print_divider(max_block_id_len: usize, max_expr_key_len: usize) {
    let total_block_header_len = BLOCK_ID_HEADER.len() + max_block_id_len + 4;
    let total_expr_key_len = max_expr_key_len + 4; 
    let total_len = total_block_header_len + total_expr_key_len;
    println!("|{DIVIDE_CHAR:->total_len$}|");
}
fn print_set_header(name: &str, max_block_id_len: usize, max_expr_key_len: usize) {
    let total_block_header_len = BLOCK_ID_HEADER.len() + max_block_id_len + 4;
    let total_expr_key_len = max_expr_key_len + 4; 
    let total_len = total_block_header_len + total_expr_key_len;
    println!("|{name:^total_len$}|");
}
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
fn print_expr_key(expr_key: &ExpreKey, function: &Function, max_expr_key_len: usize) {
    let inst_string = match expr_key {
        ExpreKey::Binary((src1, src2,opcode)) => {
            let src1_data = function.values.get(src1).unwrap();
            let src2_data = function.values.get(src2).unwrap();
            format!("{:?}, {:?} {:?}", opcode, value_data_to_string(src1_data), value_data_to_string(src2_data))
        }
        ExpreKey::Unary((src, opcode)) => {
            let src_data = function.values.get(src).unwrap();
            format!("{:?}, {:?}", opcode, value_data_to_string(src_data))
        }
        ExpreKey::Cmp((src1, src2, flag)) => {
            let src1_data = function.values.get(src1).unwrap();
            let src2_data = function.values.get(src2).unwrap();
            format!(" CMP {:?}, {:?} {:?}", flag, value_data_to_string(src1_data), value_data_to_string(src2_data))
        }
    };
    println!("  {inst_string:^max_expr_key_len$} |")
}

impl LCMPass {
    pub fn debugger(&self, function: &Function) {
        let max_block_id_len = self.get_max_block_id_len(function);
        // fixed max len, since we pre-defined the structure
        let max_expr_key_len = 31 as usize;
        // earliest pass
        self.debug_value_set("Use Expr", &self.expression_use, function, max_block_id_len, max_expr_key_len);
        self.debug_value_set("Kill Set", &self.expression_kill, function, max_block_id_len, max_expr_key_len);
        self.debug_value_set("Avaiable In", &self.available_in, function, max_block_id_len, max_expr_key_len);
        self.debug_value_set("Avaiable Out", &self.available_out, function, max_block_id_len, max_expr_key_len);
        self.debug_value_set("Anticipate In", &self.anticipate_in, function, max_block_id_len, max_expr_key_len);
        self.debug_value_set("Anticipate Out", &self.anticipate_out, function, max_block_id_len, max_expr_key_len);
        self.debug_value_set("Earliest", &self.earliest_in, function, max_block_id_len, max_expr_key_len);
        // latest pass
        self.debug_value_set("Postponable In", &self.postponable_in, function, max_block_id_len, max_expr_key_len);
        self.debug_value_set("Postponable Out", &self.postponable_out, function, max_block_id_len, max_expr_key_len);
        self.debug_value_set("Latest", &self.latest_in, function, max_block_id_len, max_expr_key_len);
        self.debug_value_set("Used Expr", &self.used_expr_in, function, max_block_id_len, max_expr_key_len);
    }
    fn get_max_block_id_len(&self, function: &Function) -> usize {
        let mut max_block_id_len = 0;
        for (block_id, _) in &function.blocks {
            let block_id_len = block_id.0.to_string().len();
            if block_id_len > max_block_id_len {
                max_block_id_len = block_id_len
            }
        }
        max_block_id_len
    }
    fn debug_value_set(
        &self, 
        name: &str, 
        table: &HashMap<BasicBlock, ExprValueNumberSet>,
        function: &Function, 
        max_block_id_len: usize, 
        max_expr_key_len: usize 
    ) {
        print_divider(max_block_id_len, max_expr_key_len);
        print_set_header(name, max_block_id_len, max_expr_key_len);
        print_divider(max_block_id_len, max_expr_key_len);
        for(block_id, _) in &function.blocks {
            let expr_use = table.get(block_id).unwrap();
            let len = expr_use.len();
            if len == 0 {
                continue;
            }
            let mut index = 0;
            let center_index = len / 2;
            for value_number in expr_use {
                if index == center_index {
                    print_block_id_row_header_with_fixed_len(block_id.0, max_block_id_len);
                }else {
                    print_empty_line_row_header_with_fixed_len(max_block_id_len);
                }
                let expr_key = self.value_number_map_expr_key.get(value_number).unwrap();
                print_expr_key(expr_key, function, max_expr_key_len);
                index += 1;
            }
            print_divider(max_block_id_len, max_expr_key_len)
        }
    }
}