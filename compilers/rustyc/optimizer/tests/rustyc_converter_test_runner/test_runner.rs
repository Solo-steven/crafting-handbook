use crate::{IrFailResult, IrTestCaseResult, TestCase};
use rustyc_frontend::parser::Parser;
use rustyc_optimizer::ir_converter::Converter;
use std::fs::read_to_string;
fn run_single_ir_converter_test_case(test_case: TestCase) -> IrTestCaseResult {
    let c_code_string = match read_to_string(test_case.c_file_path.clone()) {
        Result::Ok(code) => code,
        Result::Err(_) => return Result::Err(IrFailResult::FileSystemError),
    };
    let mut parser = Parser::new(c_code_string.as_str());
    let ast = match parser.parse() {
        Result::Ok(prog) => prog,
        Result::Err(_) => return Result::Err(IrFailResult::ParserError),
    };
    let mut convert = Converter::new();
    let module = convert.convert(&ast);
    let result_string = module.print_to_string();

    let expect_result_string = match read_to_string(test_case.output_file_path) {
        Result::Ok(code) => code,
        Result::Err(_) => return Result::Err(IrFailResult::FileSystemError),
    };

    if result_string == expect_result_string {
        Result::Ok(())
    } else {
        println!("{:?}", test_case.c_file_path);
        Result::Err(IrFailResult::IrCompareError)
    }
}

pub fn run_ir_converter_test_cases(test_cases: Vec<TestCase>) -> Vec<IrTestCaseResult> {
    let mut results = Vec::new();
    for test_case in test_cases {
        results.push(run_single_ir_converter_test_case(test_case));
    }
    results
}
