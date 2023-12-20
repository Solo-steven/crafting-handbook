use std::env;
use std::fs::read_to_string;
use rustyc_frontend::parser::Parser;
use rustyc_optimizer::ir_converter::Converter;

/// Get a path to `assets/c/assignment-and-access/` in the repo
fn get_c_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("../../../assets/c/assignment-and-access/").as_os_str().to_str().unwrap())
}
/// Gte a path the ir result `./test/ir_convert/assignment-and-access/`.
fn get_ir_result_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("tests/ir_convert/assignment-and-access/").as_os_str().to_str().unwrap())
}
/// Test helper, test is c code ouput ir match as expect.
fn test_file_name(name: &'static str)  {
    let mut path = get_c_dir_path();
    path.push_str(name);
    path.push_str(".c");
    match read_to_string(path.clone()) {
        Ok(code) => {
            let mut parser = Parser::new(code.as_str());
            let ast = parser.parse().unwrap();
            let mut convert = Converter::new();
            let module = convert.convert(&ast);
            let result_string = module.print_to_string();
            let mut ir_path = get_ir_result_dir_path();
            ir_path.push_str(name);
            ir_path.push_str(".ir");
            match read_to_string(ir_path.clone()) {
                Ok(ir) => {
                    assert_eq!(ir, result_string);
                }
                Err(_) =>  {panic!("Can not read ir file - {}", ir_path)}
            }
        }
        Err(_) => panic!("Can not read c code - {}", path),
    }
}
#[test]
fn test_basic_type_assignmenr() {
    test_file_name("basic_type_assignment");
}
#[test]
fn test_basic_type_pointer_assignment() {
    test_file_name("basic_type_pointer_assignment");
}
#[test]
fn test_basic_type_pointer_expr() {
    test_file_name("basic_type_pointer_expr");
}
#[test]
fn test_basic_type_pointer_to_pointer_assignment() {
    test_file_name("basic_type_pointer_to_pointer_assignment");
}
#[test]
fn test_basic_type_pointer_to_pointer_expr() {
    test_file_name("basic_type_pointer_to_pointer_expr");
}
#[test]
fn test_struct_type_assignment() {
    test_file_name("struct_type_assignment");
}
#[test]
fn test_struct_type_expr() {
    test_file_name("struct_type_expr");
}
#[test]
fn test_struct_type_pointer_assignment() {
    test_file_name("struct_type_pointer_assignment");
}
#[test]
fn test_struct_type_pointer_expr() {
    test_file_name("struct_type_pointer_expr");
}
#[test]
fn test_struct_nested_assignment() {
    test_file_name("struct_nested_assignment");
}
#[test]
fn test_struct_nested_expr() {
    test_file_name("struct_nested_expr");
}
#[test]
fn test_struct_nested_pointer_assignment() {
    test_file_name("struct_nested_pointer_assignment");
}