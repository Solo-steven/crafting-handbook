use std::env;
use std::fs::{read_to_string, File};
use std::io::Write;
use rjs_parser::lexer::Lexer;
use rjs_parser::{to_tokens, lexer::LexerStateCache};
use serde_json::{from_str, to_string_pretty};
/// Get a path of `assets/js/tokenize` in the repo
fn get_js_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("../../../../assets/js/tokenize/").as_os_str().to_str().unwrap())
}
/// Get a path the ir result `./tests/tokenize`.
fn get_token_result_dir_path() -> String {
    String::from(env::current_dir().unwrap().join("./tests/tokenize/").as_os_str().to_str().unwrap())
}
fn get_js_file_path(file_name: &'static str) -> String {
    let mut path = get_js_dir_path();
    path.push_str(file_name);
    path.push_str(".js");
    path
}
fn get_json_file_path(file_name: &'static str) -> String {
    let mut path = get_token_result_dir_path();
    path.push_str(file_name);
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
            let tokens = to_tokens(code.as_str());
            if is_update {
                let mut file = File::create(json_path).unwrap();
                let result_string = to_string_pretty(&tokens).unwrap();
                write!(file, "{}", result_string).unwrap();
            }else {
                match read_to_string(json_path.clone()) {
                    Ok(expect_tokens_string) => {
                        let expect_tokens: Vec<LexerStateCache> = from_str(&expect_tokens_string).unwrap();
                        assert_eq!(expect_tokens, tokens);
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
    (test_arrow_func_line_terminator_flag_1, "arrow-func-line-terminator-flag-1"),
    (test_arrow_func_line_terminator_flag_2, "arrow-func-line-terminator-flag-2"),
    (test_async_arrow_func_line_terminator_flag_1, "async-arrow-func-line-terminator-flag-1"),
    (test_async_arrow_func_line_terminator_flag_2, "async-arrow-func-line-terminator-flag-2"),
    (test_number_binary_in_hex, "number-binary"), 
    (test_number_expon, "number-expon"),
    (test_number_hex, "number-hex"),
    (test_number_oct, "number-oct"),
    (test_template, "template"),
    (test_template_escap, "template-escap"),
    (test_template_nested, "template-nested"),
    (test_template_muliti_expr, "template-multi-expr")
);


macro_rules! get_lexer_cache {
    ($lexer: expr) => {
        LexerStateCache { 
            token: $lexer.get_token(),
            raw_value: $lexer.get_current_value(), 
            start_span: $lexer.get_start_span(), 
            finish_span: $lexer.get_finish_span(), 
            last_finish_span: $lexer.get_last_token_finish_span(),
            line_terminator_flag: $lexer.get_line_terminator_flag(),
        }
    };
}

#[test]
fn test_lookahead_arrow_func() {
    let file_name = "lookahead_arrow_func";
    let js_file_path = get_js_file_path(file_name);
    let json_file_path = get_json_file_path(file_name);
    let is_update = env::var("UPDATE").is_ok();


    match read_to_string(js_file_path.clone()) {
        Ok(code) => {
            let mut tokens = Vec::new();
            let mut lexer = Lexer::new(code.as_str());

            tokens.push(get_lexer_cache!(lexer));
            tokens.push(lexer.lookahead_lexer_state());
            tokens.push(get_lexer_cache!(lexer));
            tokens.push(lexer.lookahead_lexer_state());
            tokens.push(get_lexer_cache!(lexer));

            lexer.next_token();

            tokens.push(get_lexer_cache!(lexer));
            tokens.push(lexer.lookahead_lexer_state());
            tokens.push(get_lexer_cache!(lexer));
            tokens.push(lexer.lookahead_lexer_state());
            tokens.push(get_lexer_cache!(lexer));            

            if is_update {
                let mut file = File::create(json_file_path).unwrap();
                let result_string = to_string_pretty(&tokens).unwrap();
                write!(file, "{}", result_string).unwrap();
            }else {
                match read_to_string(json_file_path.clone()) {
                    Ok(expect_tokens_string) => {
                        let expect_tokens: Vec<LexerStateCache> = from_str(&expect_tokens_string).unwrap();
                        assert_eq!(expect_tokens, tokens);
                    }
                    Err(_) =>  {panic!("Can not read json file - {}", json_file_path)}
                }
            }
        }
        Err(_) => panic!("Can not read js code - {}", js_file_path),
    }
}