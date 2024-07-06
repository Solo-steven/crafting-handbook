use std::env;
use std::path::PathBuf;
use std::fs::read_to_string;
use std::fs::File;
use std::io::Write;

use rustyc_frontend::parser::Parser;
use rustyc_optimizer::ir_converter::Converter;
use rustyc_optimizer::ir::function::Function;
use rustyc_optimizer::ir_optimizer::anaylsis::DebuggerAnaylsis;
use rustyc_optimizer::ir_optimizer::anaylsis::OptimizerAnaylsis;
use rustyc_optimizer::ir_optimizer::pass::DebuggerPass;
use rustyc_optimizer::ir_optimizer::pass::OptimizerPass;

#[allow(dead_code)]
pub fn get_assets_folder_root_path() -> PathBuf {
    let mut package_root = env::current_dir().unwrap();
    package_root.push("../../../assets");
    package_root
}
#[allow(dead_code)]
pub fn get_tests_folder_root_path() -> PathBuf {
  let mut package_root = env::current_dir().unwrap();
  package_root.push("./tests");
  package_root   
}
#[allow(dead_code)]
pub fn test_convert(name: &'static str, mut c_path: String, mut ir_path: String) {
    c_path.push_str(name);
    c_path.push_str(".c");
    let is_update = env::var("UPDATE").is_ok();
    match read_to_string(c_path.clone()) {
        Ok(code) => {
            let mut parser = Parser::new(code.as_str());
            let ast = parser.parse().unwrap();
            let mut convert = Converter::new();
            let module = convert.convert(&ast);
            let result_string = module.print_to_string();
            ir_path.push_str(name);
            ir_path.push_str(".ir");
            if is_update {
                let mut file = File::create(ir_path).unwrap();
                write!(file, "{}", result_string).unwrap();
                return;
            }
            match read_to_string(ir_path.clone()) {
                Ok(ir) => {
                    println!("{}", is_update);
                    assert_eq!(ir, result_string);
                }
                Err(_) => {
                    panic!("Can not read ir file - {}", ir_path)
                }
            }
        }
        Err(_) => panic!("Can not read c code - {}", c_path),
    }
}
#[macro_export]
macro_rules! test_convert_case {
    ($func_name: ident, $test_case: expr, $c_path: expr, $ir_path: expr) => {
        #[test]
        fn $func_name() {
            test_convert($test_case, $c_path, $ir_path);
        }
    };
}
#[macro_export]
macro_rules! generate_converter_cases {
    (
        $(
            ($func_name: ident, $test_case: expr)
        ),* 
    ) => {
        $(
            test_convert_case!(
                $func_name, 
                $test_case, 
                get_c_code_folder_path(), 
                get_ir_test_result_folder_path()
            );
        )*
    };
}
#[allow(dead_code)]
pub fn test_pass(name: &'static str, function: &mut Function, mut table_path: String, mut pass: impl OptimizerPass + DebuggerPass) {
    table_path.push_str(name);
    table_path.push_str(".table");
    let is_update = env::var("UPDATE").is_ok();
    pass.process(function);
    let result_string = pass.debugger(function);
    if is_update {
        let mut file = File::create(table_path).unwrap();
        write!(file, "{}", result_string).unwrap();
        return;
    }
    match read_to_string(table_path.clone()) {
        Ok(table_string) => {
            assert_eq!(table_string, result_string);
        }
        Err(_) => panic!("Can not read table of pass - {}", table_path),
    }
}
#[macro_export]
macro_rules! generate_pass_cases {
    (
        $(
            ($func_name: ident, $test_case: expr, $function: expr)
        ),* 
    ) => {
        $(
            #[test]
            fn $func_name() {
                test_pass($test_case, $function, get_table_path() ,get_pass())
            }
        )*
    };
}

pub fn test_anaylsis<T, Anaylsier : OptimizerAnaylsis<T> + DebuggerAnaylsis<T>>(name: &'static str, function: &Function, mut table_path: String, mut anaylsis : Anaylsier) {
    table_path.push_str(name);
    table_path.push_str(".table");
    let is_update = env::var("UPDATE").is_ok();
    let result = anaylsis.anaylsis(function);
    let result_string = Anaylsier::debugger(function, &result);
    if is_update {
        let mut file = File::create(table_path).unwrap();
        write!(file, "{}", result_string).unwrap();
        return;
    }
    match read_to_string(table_path.clone()) {
        Ok(table_string) => {
            assert_eq!(table_string, result_string);
        }
        Err(_) => panic!("Can not read table of anaylsis - {}", table_path),
    }
}

