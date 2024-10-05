use std::collections::HashMap;

use super::{DomAnaylsier, DomTable};
use crate::ir::function::BasicBlock;
use crate::ir::function::Function;
use crate::ir_optimizer::anaylsis::DebuggerAnaylsis;
use crate::ir_optimizer::print_table_helper::print_table_row;
use crate::ir_optimizer::print_table_helper::{
    get_max_block_id_len, print_divider, print_header, sort_block_ids,
};

fn print_out_idom(output: &mut String, table: &DomTable, max_len: usize) {
    output.push_str(print_divider(max_len).as_str());
    output.push_str(print_header("IDom", max_len).as_str());
    output.push_str(print_divider(max_len).as_str());

    let mut idom_map: HashMap<BasicBlock, BasicBlock> = HashMap::new();
    for (block_id, entry) in table {
        if let Some(idom) = entry.idom {
            idom_map.insert(block_id.clone(), idom);
        }
    }
    let sorted_dom = sort_block_ids(
        idom_map
            .keys()
            .into_iter()
            .map(|id| id.clone())
            .collect::<Vec<_>>(),
    );
    for block in sorted_dom {
        let idom = idom_map.get(&block).unwrap();
        output.push_str(format!("|  Block id: {}  |  BB{}  |\n", block.0, idom.0).as_str());
        output.push_str(print_divider(max_len).as_str());
    }
}

macro_rules! generate_print_out_dom_set {
    ($name: ident, $property: ident, $table_name: expr) => {
        fn $name(
            output: &mut String,
            sorted_blocks: &Vec<BasicBlock>,
            table: &DomTable,
            max_len: usize,
            row_body_len: usize,
            row_header_len: usize,
        ) {
            output.push_str(print_divider(max_len).as_str());
            output.push_str(print_header($table_name, max_len).as_str());
            output.push_str(print_divider(max_len).as_str());

            for block_id in sorted_blocks {
                if let Some(entry) = table.get(block_id) {
                    let mut index = 0;
                    let len = entry.$property.len();
                    if len == 0 {
                        continue;
                    }
                    let dom_vec = entry
                        .$property
                        .clone()
                        .into_iter()
                        .collect::<Vec<BasicBlock>>();
                    for dom in &sort_block_ids(dom_vec) {
                        let left;
                        if index == len / 2 {
                            left = format!("  Block id: {}  ", block_id.0);
                        } else {
                            left = format!(" ");
                        }
                        output.push_str(
                            print_table_row(
                                &left,
                                format!("  BB{}  ", dom.0).as_str(),
                                row_header_len,
                                row_body_len,
                            )
                            .as_str(),
                        );
                        index += 1;
                    }
                    output.push_str(print_divider(max_len).as_str());
                }
            }
        }
    };
}

generate_print_out_dom_set!(print_out_dom, dom, "Dom");
generate_print_out_dom_set!(print_out_df, dom_frontier, "DF");
generate_print_out_dom_set!(print_out_dom_children, dom_tree_children, "Dom-Children");

impl DebuggerAnaylsis<DomTable> for DomAnaylsier {
    fn debugger(&mut self, function: &Function, table: &DomTable) -> String {
        let max_id_len = get_max_block_id_len(function);
        let row_header_len = "  Block id:   ".len() + max_id_len;
        let row_body_len = "  BB  ".len() + max_id_len;
        let max_len = row_body_len + row_header_len + 3 - 2;
        let mut output = String::new();
        let blocks = function
            .blocks
            .iter()
            .map(|entry| entry.0.clone())
            .collect::<Vec<_>>();
        let sorted_blocks = sort_block_ids(blocks);
        print_out_idom(&mut output, table, max_len);
        print_out_dom(
            &mut output,
            &sorted_blocks,
            table,
            max_len,
            row_body_len,
            row_header_len,
        );
        print_out_df(
            &mut output,
            &sorted_blocks,
            table,
            max_len,
            row_body_len,
            row_header_len,
        );
        print_out_dom_children(
            &mut output,
            &sorted_blocks,
            table,
            max_len,
            row_body_len,
            row_header_len,
        );
        output
    }
}
