use std::env;
use std::fs::read_to_string;
use rustyc_frontend::parser::Parser;
use rustyc_optimizer::ir_converter::Converter;

/// Get a path to `assets/c` in the repo
fn get_c_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("../../../assets/c/expr/").as_os_str().to_str().unwrap())
}
/// Gte a path the ir result `./test/ir_convert`.
fn get_ir_result_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("tests/ir_convert/expr/").as_os_str().to_str().unwrap())
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
            convert.convert(&ast);
            let mut result_string = String::new();
            for fun in convert.functions {
                result_string.push_str(fun.print_to_string().as_str());
            }
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
fn test_cast_basic_type_expr() {
    test_file_name("cast_basic_type_expr");
}
#[test]
fn test_cast_struct_pointer_expr() {
    test_file_name("cast_struct_pointer_expr");
}
#[test]
fn test_size_of_array_basic_type_expr() {
    test_file_name("sizeof_array_basic_type_expr");
}
#[test]
fn test_should_cast_basic_type_implicitly() {
    test_file_name("should_cast_basic_type_implicitly");
}
#[test]
fn test_assignment_expr() {
    test_file_name("assignment_expr");
}