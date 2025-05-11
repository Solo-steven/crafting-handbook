#![feature(macro_metavar_expr_concat)]
mod fixtures;

use std::env::current_dir;
use std::fs::read_to_string;
use zsh_ir::formatter::format;
use zsh_ir::frontend::parse;

macro_rules! generate_test_cases {
    ( $($test_case: ident),* ) => {
        $(
            fn ${concat(read_, $test_case, _ir_file)}() -> String {
                read_to_string(
                    current_dir()
                    .unwrap()
                    .join("tests/fixtures")
                    .join(stringify!($test_case))
                    .join("case.zhu")
                ).unwrap()
            }
            #[test]
            fn ${concat($test_case, _buildable)}() {
                fixtures::$test_case::build_module();
            }
            #[test]
            fn ${concat($test_case, _parseable)}() {
                let source = ${concat(read_, $test_case, _ir_file)}();
                parse(&source);
            }
            #[test]
            fn ${concat($test_case, _parse_match_formatter)}() {
                let source = ${concat(read_, $test_case, _ir_file)}();
                let module = parse(&source);
                let result = format(&module);
                assert_eq!(result, source);
            }
            #[test]
            fn ${concat($test_case, _build_match_formatter)}() {
                let module = fixtures::$test_case::build_module();
                let result = format(&module);
                let source = ${concat(read_, $test_case, _ir_file)}();
                assert_eq!(result, source);
            }
        )*
    };
}

generate_test_cases! {
    unary_inst,
    binary_inst_base,
    binary_inst_byte,
    binary_inst_float,
    binary_immi_inst
}

#[test]
fn when_reg_and_block_index_is_not_continue_module_create_by_parser_can_reset_the_index_correctly() {}
