pub mod ir;
pub mod ir_converter;
pub mod ir_optimizer;

use crate::ir_converter::Converter;
use rustyc_frontend::parser::Parser;
use std::fs::File;
use std::io::Write;

fn write_string_to_file(file_string: String) {
    let mut file1 = File::create("./test.txt").unwrap();
    write!(file1, "{}", file_string).unwrap();
}

fn converter_example() {
    let program = Parser::new(
        "
        int test() {
            return 10;
        }

        int with_argu(int a) {
            return 10 + a;
        }

        int main() {
            test();
            int a = test();
            a = test() + 1;
            a = test() + test() + a;
            a = test() + a;

            with_argu(1);
            int b = with_argu(4);
            b = with_argu(a) + 10;
            b = with_argu (6) + a;
            b = with_argu(a) + with_argu(b) + 100;

            return 0;
        }
    ",
    )
    .parse()
    .unwrap();
    let mut converter = Converter::new();
    let module = converter.convert(&program);
    write_string_to_file(module.print_to_string());
}

fn main() {
    converter_example();
}
