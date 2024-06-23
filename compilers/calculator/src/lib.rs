mod ast;
mod codegen;
pub mod lexer;
mod marco;
pub mod parser;
mod token;
mod utils;

use codegen::Codegen;
use inkwell::context::Context;
use parser::Parser;

pub type ExecuteResult = Result<(Option<String>, f64), String>;

pub fn execute_program(code_string: String, emit_llvm: bool) -> ExecuteResult {
    let mut parser = Parser::new(code_string);
    let program_ast = parser.parse()?;
    let llvm_context = Context::create();
    let mut code_generator = Codegen::new(&llvm_context, &program_ast);
    code_generator.generate()?;
    let execute_return_value = code_generator.execute()?;
    let llvm_code_string = code_generator.get_llvm_code_as_string();

    if emit_llvm {
        Ok((Some(llvm_code_string), execute_return_value))
    } else {
        Ok((None, execute_return_value))
    }
}
