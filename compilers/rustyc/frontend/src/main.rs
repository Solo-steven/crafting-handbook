
mod lexer;

use lexer::Lexer;
use rustyc_shared::token::TokenKind;
fn main(){
    let source = "
        int main() {
            printf(10);
            return 0;
        }
    ";
    let mut lexer = lexer::Lexer::new(source);
    loop {
        let tok = lexer.next_token();
        match tok {
            TokenKind::EOFToken => {
                println!("kind: {:?}, start : {:?}, finish: {:?}", tok, lexer.get_start_span(), lexer.get_finish_span());
                break;
            }
            _ => {
                println!("kind: {:?}, start : {:?}, finish: {:?}", tok, lexer.get_start_span(), lexer.get_finish_span());
            }
        }
    }
}