use rustyc_frontend::parser::Parser;
use rustyc_optimizer::ir_converter::Converter;
use std::env;
use std::fs::{read_to_string, File};
use std::io::Write;

/// Get a path to `assets/c` in the repo
fn get_c_dir_path() -> String {
    String::from(
        env::current_dir()
            .unwrap()
            .join("../../../assets/c/ir_convert/fun-call/")
            .as_os_str()
            .to_str()
            .unwrap(),
    )
}
/// Gte a path the ir result `./test/ir_convert`.
fn get_ir_result_dir_path() -> String {
    String::from(
        env::current_dir()
            .unwrap()
            .join("tests/ir_convert/fun-call/")
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
            let mut convert = Converter::new();
            let module = convert.convert(&ast);
            let result_string = module.print_to_string();
            let mut ir_path = get_ir_result_dir_path();
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
        Err(_) => panic!("Can not read c code - {}", path),
    }
}

#[test]
fn test_basic_type_return_expr() {
    test_file_name("basic_type_return_expr");
}
#[test]
fn test_fib_array_dp() {
    test_file_name("fib_array_dp");
}
#[test]
fn test_fib_tail_call() {
    test_file_name("fib_tail_call")
}
#[test]
fn test_pointer_to_pointer_basic_type_return() {
    //test_file_name("pointer_to_pointer_basic_type_return")
}
#[test]
fn test_pointer_type_basic_type_return() {
    test_file_name("pointer_type_basic_type_return_expr")
}
#[test]
fn test_struct_type_return_expr() {
    test_file_name("struct_type_return_expr")
}
#[test]
fn test_struct_type_return_with_pointer() {
    // test_file_name("struct_type_return_with_pointer")
}
#[test]
fn test_void_return_expr() {
    test_file_name("void_return_expr")
}
#[test]
fn test_call_by_function_pointer_in_structure() {
    test_file_name("call_by_function_pointer_in_structure");
}
#[test]
fn test_call_by_function_pointer() {
    test_file_name("call_by_function_pointer");
}
