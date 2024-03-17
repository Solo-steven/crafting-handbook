use crate::lexer::TokenKind;
use crate::finish_token;
use super::{Lexer, LexerResult};

impl<'a> Lexer<'a> {
    pub (super) fn read_word(&mut self) -> LexerResult {
        let start = self.cur_offset;
        self.eat_char();
        loop {
            if let Some(ch) = self.get_char() {
                match ch {
                    '\n' | ' '  | '\t' |
                    '{' | '}' | '[' | ']' | '(' | ')' | ':' | ';' |
                    ',' | '+' | '-' | '*' | '/' | '%' | '>' | '<' | 
                    '=' | '!' | '&' | '|' | '?' | '^' | '~' | '.' |
                    '\'' | '\"' | '`' => {
                        break;
                    }
                    _ => {
                        self.eat_char()
                    }
                }
            }else {
                break;
            }
        }
        let word = &self.source[start..self.cur_offset];
        match word {
            "true" => { finish_token!(TokenKind::TrueKeyword, self); },
            "false" => { finish_token!(TokenKind::FalseKeyword, self); },
            "null" => { finish_token!(TokenKind::NullKeyword, self); },
            "undefined" => { finish_token!(TokenKind::UndefinedKeyword, self); }
            "await" => { finish_token!(TokenKind::AwaitKeyword, self); }
            "break" => { finish_token!(TokenKind::BreakKeyword, self); }
            "case" => { finish_token!(TokenKind::CaseKeyword, self); }
            "catch" => { finish_token!(TokenKind::CatchKeyword, self); }
            "class" => { finish_token!(TokenKind::ClassKeyword, self); }
            "const" => { finish_token!(TokenKind::ConstKeyword, self); }
            "continue" => { finish_token!(TokenKind::ContinueKeyword, self); }
            "debugger" => { finish_token!(TokenKind::DebuggerKeyword, self); }
            "default" => { finish_token!(TokenKind::DefaultKeyword, self); }
            "do" => { finish_token!(TokenKind::DoKeyword, self); }
            "else" => { finish_token!(TokenKind::ElseKeyword, self); }
            "enum" => { finish_token!(TokenKind::EnumKeyword, self); }
            "export" => { finish_token!(TokenKind::ExportKeyword, self); }
            "extends" => { finish_token!(TokenKind::ExtendsKeyword, self); }
            "finally" => { finish_token!(TokenKind::FinallyKeyword, self); }
            "for" => { finish_token!(TokenKind::ForKeyword, self); }
            "function" => { finish_token!(TokenKind::FunctionKeyword, self); }
            "if" => { finish_token!(TokenKind::IfKeyword, self); }
            "import" => { finish_token!(TokenKind::ImportKeyword, self); }
            "new" => { finish_token!(TokenKind::NewKeyword, self); }
            "return" => { finish_token!(TokenKind::ReturnKeyword, self); }
            "super" => { finish_token!(TokenKind::SuperKeyword, self); }
            "switch" => { finish_token!(TokenKind::SwitchKeyword, self); }
            "this" => { finish_token!(TokenKind::ThisKeyword, self); }
            "throw" => { finish_token!(TokenKind::ThrowKeyword, self); }
            "try" => { finish_token!(TokenKind::TryKeyword, self); }
            "var" => { finish_token!(TokenKind::VarKeyword, self); }
            "with" => { finish_token!(TokenKind::WithKeyword, self); }
            "while" => { finish_token!(TokenKind::WhileKeyword, self); }
            "yield" => { finish_token!(TokenKind::YieldKeyword, self); }
            "let" => { finish_token!(TokenKind::LetKeyword, self); }
            "delete" => { finish_token!(TokenKind::DeleteKeyword, self); }
            "void" => { finish_token!(TokenKind::VoidKeyword, self); }
            "typeof" => { finish_token!(TokenKind::TypeofKeyword, self); }
            "in" => { finish_token!(TokenKind::InKeyword, self); }
            "instanceof" => { finish_token!(TokenKind::InstanceofKeyword, self); }
            _ => { finish_token!(TokenKind::Identifier, self); },
        }
    }
    // fn read_unicode_word() {
    //     todo!();
    // }

}