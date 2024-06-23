use rustyc_frontend::ast::Program;
use rustyc_frontend::parser::Parser;
use serde_json::{from_str, to_string_pretty};
use std::env;
use std::fs::{read_to_string, File};
use std::io::Write;

/// Get a path to `assets/c` in the repo
fn get_c_dir_path() -> String {
    String::from(
        env::current_dir()
            .unwrap()
            .join("../../../assets/c/parse/")
            .as_os_str()
            .to_str()
            .unwrap(),
    )
}
/// Gte a path the ir result `./test/ir_convert`.
fn get_json_result_dir_path() -> String {
    String::from(
        env::current_dir()
            .unwrap()
            .join("tests/ast-serialization/")
            .as_os_str()
            .to_str()
            .unwrap(),
    )
}
/// Test helper, test is c code ouput ir match as expect.
fn test_file_name(name: &'static str) {
    let mut path = get_c_dir_path();
    path.push_str(name);
    path.push_str(".c");
    let is_update = env::var("UPDATE").is_ok();
    match read_to_string(path.clone()) {
        Ok(code) => {
            let mut parser = Parser::new(code.as_str());
            let ast = parser.parse().unwrap();
            let result_string = to_string_pretty(&ast).unwrap();
            let mut json_path = get_json_result_dir_path();
            json_path.push_str(name);
            json_path.push_str(".json");
            if is_update {
                let mut file = File::create(path).unwrap();
                write!(file, "{}", result_string).unwrap();
                return;
            }
            match read_to_string(json_path.clone()) {
                Ok(json_string) => {
                    let json_ast: Program = from_str(&json_string).unwrap();
                    assert_eq!(json_ast, ast);
                }
                Err(_) => {
                    panic!("Can not read json file - {}", json_path)
                }
            }
        }
        Err(_) => panic!("Can not read c code - {}", path),
    }
}

#[test]
fn test_basic_type_declar() {
    test_file_name("basic_type_declar");
}
