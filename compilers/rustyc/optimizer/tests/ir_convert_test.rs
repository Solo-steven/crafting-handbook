use std::env;
use std::fs::read_to_string;
use rustyc_frontend::parser::Parser;
use rustyc_optimizer::ir_converter::Converter;

fn get_c_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("../../../assets/c/").as_os_str().to_str().unwrap())
}

fn get_ir_result_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("tests/ir_convert/").as_os_str().to_str().unwrap())
}

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
fn test_basic_type_access_int() {
    test_file_name("simple_basic_access_int");
}

#[test]
fn test_basic_access_float() {
    test_file_name("simple_basic_access_float");
}
#[test]
fn test_basic_pointer_access() {
    test_file_name("simple_basic_pointer_access");
}
#[test]
fn test_pointer_to_pointer_access() {
    
}

#[test]
fn test_complex_struct_access() {

}