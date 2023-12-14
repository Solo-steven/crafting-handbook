use calculator_llvm_compiler::execute_program;
use std::fs::File;
use std::io::Write;
fn main() {
    match execute_program("
        function main(): number {
            var a = 10;
            if (a > 10) {
                a = 10;
            }else {
                a=100;
            }
            return a;
        }
    
    ".to_string(), true) {
        Result::Ok(result) => {
            match result.0 {
                Some(code) => {
                    println!("{:#?}", code);
                    let mut file = File::create("./test.llvm").unwrap();
                    write!(file, "{}", code.as_str());
                    
                }
                _ => {}
            }
        }
        Err(error) => {

        }
    }
}