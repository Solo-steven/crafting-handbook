mod test_cases;
mod test_runner;

use colored::Colorize;
use serde::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;
use std::process::exit;
use test_cases::read_test_cases_from_root;
use test_runner::run_ir_converter_test_cases;

#[derive(Debug, Serialize, Deserialize)]
pub enum IrFailResult {
    ParserError(PathBuf),
    ConverterError(PathBuf),
    IrCompareError(PathBuf),
    FileSystemError(PathBuf),
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

fn trim_path_with_current_dir(path: &PathBuf) -> &str {
    let mut iter = path.to_str().unwrap().split(".");
    iter.next();
    iter.next().unwrap()
}

fn main() {
    let ir_converter_test_cases_root = env::current_dir()
        .unwrap()
        .join("./tests/fixtures/ir_converter");
    let ir_converter_test_cases = read_test_cases_from_root(ir_converter_test_cases_root);
    let results = run_ir_converter_test_cases(ir_converter_test_cases);

    let is_failed = results.iter().any(|result| result.is_err());

    if !is_failed {
        println!(
            "{}",
            "|--------------------------------------------------------- |".green()
        );
        println!(
            "{}",
            "|------------------ Converter Test Pass ------------------ |".green()
        );
        println!(
            "{}",
            "|--------------------------------------------------------- |".green()
        );
        exit(0);
    } else {
        println!(
            "{}",
            "|--------------------------------------------------------- |".red()
        );
        println!(
            "{}",
            "|----------------- Converter Test Failed ----------------- |".red()
        );
        println!(
            "{}",
            "|--------------------------------------------------------- |".red()
        );
        for result in results {
            if let Result::Err(failed_result) = result {
                match failed_result {
                    IrFailResult::ConverterError(path) => {
                        println!(
                            "{}{}\n",
                            "| --> Reason: Converter Have Error. Path: ".red(),
                            trim_path_with_current_dir(&path).red()
                        );
                    }
                    IrFailResult::FileSystemError(path) => {
                        println!(
                            "{}{}\n",
                            "| --> Reason: File System Have Error. Path: ".red(),
                            trim_path_with_current_dir(&path).red()
                        );
                    }
                    IrFailResult::ParserError(path) => {
                        println!(
                            "{}{}\n",
                            "| --> Reason: Parser Have Error. Path: ".red(),
                            trim_path_with_current_dir(&path).red()
                        );
                    }
                    IrFailResult::IrCompareError(path) => {
                        println!(
                            "{}{}\n",
                            "| --> Reason: Compare IR Have Error. Path: ".red(),
                            trim_path_with_current_dir(&path).red()
                        );
                    }
                }
            }
        }
        println!(
            "{}",
            "|--------------------------------------------------------- |".red()
        );
        exit(1)
    }

    // println!("{:?}", results);
}
