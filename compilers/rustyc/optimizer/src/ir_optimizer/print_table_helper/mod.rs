use crate::ir::function::BasicBlock;
use crate::ir::function::Function;
use crate::ir::instructions::Instruction;
use crate::ir::value::Value;

static DIVIDE_CHAR: &'static str = "-";
/// ## Print Table Header
/// print header like below format:
/// ```markdown
/// |  {Header Name}  |
/// ```
/// - `total_len` is total space of header without `|` char.
/// - `name`: header name.
pub fn print_header(name: &str, total_len: usize) -> String {
    format!("|{name:^total_len$}|\n")
}
/// ## Print Divider of Table
/// print divider like below format:
/// ```markdown
/// |---------------|
/// ```
/// - `total_len`: is total number `-` char without `|`.
pub fn print_divider(total_len: usize) -> String {
    format!("|{DIVIDE_CHAR:->total_len$}|\n")
}
/// ## Print table row
/// print row as below format:
/// ```markdown
/// | {left} |  {right}  |
/// ```
/// - `left`: the content of left side of row.
/// - `left_len`: the total len size of left.
/// - `right`: the content of right side of row.
/// - `right_len`: the total len size of right.
pub fn print_table_row(left: &str, right: &str, left_len: usize, right_len: usize) -> String {
    format!("|{left:^left_len$}|{right:^right_len$}|\n")
}
pub fn get_max_block_id_len(function: &Function) -> usize {
    let mut max_block_id_len = 0;
    for (block_id, _) in &function.blocks {
        let block_id_len = block_id.0.to_string().len();
        if block_id_len > max_block_id_len {
            max_block_id_len = block_id_len
        }
    }
    max_block_id_len
}
/// ## Sorted blocks
/// sorted block ids by values usize by bubble sort.
pub fn sort_block_ids(mut block_ids: Vec<BasicBlock>) -> Vec<BasicBlock> {
    if block_ids.len() == 0 {
        return block_ids;
    }
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
/// ## Sorted Values
/// sorted value ids by value's usize by bubble sort.
pub fn sort_value_ids(mut value_ids: Vec<Value>) -> Vec<Value> {
    if value_ids.len() == 0 {
        return value_ids;
    }
    for i in 0..value_ids.len() - 1 {
        for j in 0..(value_ids.len() - 1 - i) {
            if value_ids[j].0 > value_ids[j + 1].0 {
                let temp = value_ids[j];
                value_ids[j] = value_ids[j + 1];
                value_ids[j + 1] = temp;
            }
        }
    }
    value_ids
}
/// ## Sorted Instructions
/// sorted Instructions ids by instruction's usize by bubble sort.
pub fn sort_inst_ids(mut inst_ids: Vec<Instruction>) -> Vec<Instruction> {
    if inst_ids.len() == 0 {
        return inst_ids;
    }
    for i in 0..inst_ids.len() - 1 {
        for j in 0..(inst_ids.len() - 1 - i) {
            if inst_ids[j].0 > inst_ids[j + 1].0 {
                let temp = inst_ids[j];
                inst_ids[j] = inst_ids[j + 1];
                inst_ids[j + 1] = temp;
            }
        }
    }
    inst_ids
}
