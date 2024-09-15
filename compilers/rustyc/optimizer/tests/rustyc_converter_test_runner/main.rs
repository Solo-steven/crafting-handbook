mod test_cases;
mod test_runner;

use serde::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;
use test_cases::read_test_cases_from_root;
use test_runner::run_ir_converter_test_cases;

#[derive(Debug, Serialize, Deserialize)]
pub enum IrFailResult {
    ParserError,
    ConverterError,
    OptimizerError,
    IrCompareError,
    FileSystemError,
}
pub type IrTestCaseResult = Result<(), IrFailResult>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TestCaseTarget {
    Converter,
    Optimizer,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TestCase {
    pub c_file_path: PathBuf,
    pub output_file_path: PathBuf,
}

fn main() {
    let ir_converter_test_cases_root = env::current_dir()
        .unwrap()
        .join("./tests/fixtures/ir_converter");
    let ir_converter_test_cases = read_test_cases_from_root(ir_converter_test_cases_root);
    let results = run_ir_converter_test_cases(ir_converter_test_cases);
    // println!("{:?}", results);
}
