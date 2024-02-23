use std::env;
use std::fs::{read_to_string, File};
use std::io::Write;
use rjs_parser::{to_tokens, lexer::TokenWithSpanAndValue};
use serde_json::{from_str, to_string_pretty};
/// Get a path of `assets/js/tokenize` in the repo
fn get_js_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("../../../../assets/js/tokenize/").as_os_str().to_str().unwrap())
}
/// Gte a path the ir result `./tests/tokenize`.
fn get_token_result_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("./tests/tokenize/").as_os_str().to_str().unwrap())
}
/// Test helper, test is js code tokenize result match the expectation
fn test_file_name(name: &'static str)  {
    let mut path = get_js_dir_path();
    path.push_str(name);
    path.push_str(".js");
    println!("{:?}", path);
    let is_update = env::var("UPDATE").is_ok();
    match read_to_string(path.clone()) {
        Ok(code) => {
            let tokens = to_tokens(code.as_str());
            let mut json_path = get_token_result_dir_path();
            json_path.push_str(name);
            json_path.push_str(".json");
            match read_to_string(json_path.clone()) {
                Ok(expect_tokens_string) => {
                    if is_update {
                        let mut file = File::create(json_path).unwrap();
                        let result_string = to_string_pretty(&tokens).unwrap();
                        write!(file, "{}", result_string).unwrap();
                    }else {
                        let expect_tokens: Vec<TokenWithSpanAndValue> = from_str(&expect_tokens_string).unwrap();
                        assert_eq!(expect_tokens, tokens);
                    }
                }
                Err(_) =>  {panic!("Can not read json file - {}", json_path)}
            }
        }
        Err(_) => panic!("Can not read js code - {}", path),
    }
}

#[test]
fn test_number_binary_in_hex() {
    test_file_name("number-binary");
}
#[test]
fn test_number_expon() {
    test_file_name("number-expon");
}
#[test]
fn test_number_hex() {
    test_file_name("number-hex");
}
#[test]
fn test_number_oct() {
    test_file_name("number-oct");
}
#[test]
fn test_template_escap() {
    test_file_name("template-escap");
}
#[test]
fn test_template_nested() {
    test_file_name("template-nested");
}
#[test]
fn test_template() {
    test_file_name("template");
}
#[test]
fn test_template_multi_expr() {
    test_file_name("template-multi-expr");
}
