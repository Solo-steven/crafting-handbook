
mod lexer;
mod parser;
mod span;
mod token;
mod marco;
mod ast;

use crate::token::TokenKind;
fn main(){
    let source = "
        struct Node {
            int* value;
            float account;
            struct Node* left;
            struct Node* right;
        }
        union IntOrFloat {
            int age;
            float number
        }
        enum Expr {
            BinaryExpr;
            UnaryExpr;
            UpdateExpr;
        }
        struct Complex {
            struct Node * root;
            union IntOrFloat value;
            enum Expr kind;
        }
        int main(int argc, char *argv) {
            
        }
    ";
    let source2 = "
        person->computeSome(a, b, 10);
    ";
    let mut lexer = lexer::Lexer::new(source2);
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
    let mut parser = parser::Parser::new(source2);
    parser.parse();
}