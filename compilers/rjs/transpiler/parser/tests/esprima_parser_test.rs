use std::env;
use std::fs::{read_to_string, File};
use std::io::Write;
use rjs_parser::ast::Program;
use rjs_parser::parser::Parser;
use serde_json::{from_str, to_string_pretty};
/// Get a path of `assets/js/tokenize` in the repo
fn get_esprima_js_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("../../../../assets/js/parse/esprima/").as_os_str().to_str().unwrap())
}
/// Get a path the ir result `./tests/tokenize`.
fn get_ast_result_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("./tests/parse/esprima/").as_os_str().to_str().unwrap())
}
fn get_js_file_path(file_path: &'static str) -> String {
    let mut path = get_esprima_js_dir_path();
    path.push_str(file_path);
    path.push_str(".js");
    path
}
fn get_json_file_path(file_path: &'static str) -> String {
    let mut path = get_ast_result_dir_path();
    path.push_str(file_path);
    path.push_str(".json");
    path
}
/// Test helper, test is js code tokenize result match the expectation
fn test_file_name(name: &'static str)  {
    let js_file_path = get_js_file_path(name);
    let json_path = get_json_file_path(name);
    let is_update = env::var("UPDATE").is_ok();
    match read_to_string(js_file_path.clone()) {
        Ok(code) => {
            let mut parser = Parser::new(code.as_str());
            let ast = match parser.parse() {
                Ok(ast) => ast,
                Err(_) => panic!("Error"),
            };
            if is_update {
                let mut file = File::create(json_path).unwrap();
                let result_string = to_string_pretty(&ast).unwrap();
                write!(file, "{}", result_string).unwrap();
            }else {
                match read_to_string(json_path.clone()) {
                    Ok(expect_ast_string) => {
                        let expect_ast: Program = from_str(&expect_ast_string).unwrap();
                        assert_eq!(expect_ast, ast);
                    }
                    Err(_) =>  {panic!("Can not read json file - {}", json_path)}
                }
            }
        }
        Err(_) => panic!("Can not read js code - {}", js_file_path),
    }
}

macro_rules! test_cases {
    ( $(
        ($func_name: ident, $test_case: expr)
    ),* ) => {
        $(
            #[test]
            fn $func_name() {
                test_file_name($test_case)
            }
        )*
    };
}

test_cases!(
    (declaration_const_migrated_0000, "declaration/const/migrated_0000")
);
