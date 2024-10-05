use super::LICMPass;
use crate::ir::function::Function;
use crate::ir_optimizer::pass::DebuggerPass;
use crate::ir_optimizer::print_table_helper::{
    get_max_block_id_len, print_divider, print_header, print_table_row, sort_block_ids,
};

impl<'a> DebuggerPass for LICMPass<'a> {
    fn debugger(&self, function: &Function) -> String {
        let mut output_string = String::new();
        let len_of_right = get_max_block_id_len(function) + 2 + 3 /* len of "BB<space>" */;
        let len_of_left = "Header".len() + 2;
        let len_of_row = len_of_right + len_of_left + 1;
        // print natural loop
        let mut index = 1;
        for natural_loop in &self.loops {
            output_string.push_str(print_divider(len_of_row).as_str());
            output_string.push_str(print_header(&format!("Loop {}", index), len_of_row).as_str());
            output_string.push_str(print_divider(len_of_row).as_str());
            output_string.push_str(
                print_table_row(
                    "Header",
                    format!("BB {}", &natural_loop.header.0).as_str(),
                    len_of_left,
                    len_of_right,
                )
                .as_str(),
            );
            output_string.push_str(
                print_table_row(
                    "Tail",
                    format!("BB {}", &natural_loop.tails.0).as_str(),
                    len_of_left,
                    len_of_right,
                )
                .as_str(),
            );
            output_string.push_str(print_divider(len_of_row).as_str());
            let mut inner_index = 0 as usize;
            let blocks = sort_block_ids(natural_loop.blocks.iter().map(|b| b.clone()).collect());
            for block in blocks {
                let left = format!(
                    "{}",
                    if inner_index == natural_loop.blocks.len() / 2 {
                        "Blocks"
                    } else {
                        " "
                    }
                );
                output_string.push_str(&print_table_row(
                    left.as_str(),
                    format!("BB {}", block.0).as_str(),
                    len_of_left,
                    len_of_right,
                ));
                inner_index += 1;
            }
            output_string.push_str(print_divider(len_of_row).as_str());
            let mut inner_index = 0 as usize;
            let sorted_exits =
                sort_block_ids(natural_loop.exits.iter().map(|b| b.clone()).collect());
            for block in &sorted_exits {
                let left = format!(
                    "{}",
                    if inner_index == natural_loop.exits.len() / 2 {
                        "Exits"
                    } else {
                        " "
                    }
                );
                output_string.push_str(&print_table_row(
                    left.as_str(),
                    format!("BB {}", block.0).as_str(),
                    len_of_left,
                    len_of_right,
                ));
                inner_index += 1;
            }
            output_string.push_str(print_divider(len_of_row).as_str());

            index += 1;
        }
        output_string
    }
}
