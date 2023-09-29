use toy_lang_compiler::execute_program;

fn main() {
    let result = std::panic::catch_unwind(|| {
        execute_program(String::from(""), false);
    });
    match result.err().unwrap().downcast_ref::<String>() {
        Some(as_string) => {
            println!("String ({}): {}", as_string.len(), as_string);
        }
        None => {
            println!("No ?");
        }
    }
}