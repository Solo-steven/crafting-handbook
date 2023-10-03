use toy_lang_compiler::execute_program;

fn main() {
    let result =  execute_program(String::from(""), false);
    match result {
        Ok(as_string) => {
            println!("String ({:?})", as_string);
        }
        Err(msg)=> {
            println!("No ?");
        }
    }
}