
mod lexer;
mod span;
mod token;
mod marco;

use crate::token::TokenKind;
fn main(){
    let source = "
        int main() {
            int a = 00010.0010f;
            printf(10);
            return 0;
        }
    ";
    let mut lexer = lexer::Lexer::new(source);
    loop {
        let tok = lexer.next_token();
        match tok {
            TokenKind::EOFToken => {
                println!("kind: {:?}, value: {:?}, start : {:?}, finish: {:?}", tok, lexer.get_raw_value(), lexer.get_start_span(), lexer.get_finish_span());
                break;
            }
            _ => {
                println!("kind: {:?}, value: {:?}, start : {:?}, finish: {:?}", tok, lexer.get_raw_value(), lexer.get_start_span(), lexer.get_finish_span());
            }
        }
    }
}