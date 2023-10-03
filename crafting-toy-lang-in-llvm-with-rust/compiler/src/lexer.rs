use std::collections::HashSet;
use crate::token::Token;
use crate::utils::Position;
use crate::syntax_error;
pub struct Lexer {
    code: String,
    position: Position,
    current_token: Option<Token>,

    start_position: Position,
    end_position: Position,
}

pub type LexerResult = Result<Token, String>;

impl Lexer {
    pub fn new(code: String) -> Lexer {
        Lexer {
            code,
            position: Position { row: 0, col: 0, index:0 },
            current_token: None,

            start_position: Position { row: 0, col: 0, index: 0 },
            end_position: Position { row: 0, col: 0, index: 0 },
        }
    }
    pub fn next_token(&mut self) -> LexerResult {
        let t = self.toknize()?;
        self.current_token = Some(t.clone());
        Ok(t.clone())
    }
    pub fn get_token(&mut self)-> LexerResult {
        return match self.current_token.clone() {
            None => {
                let t = self.toknize()?;
                self.current_token = Some(t.clone());
                Ok(t.clone())
            }
            Some(t) => {
                Ok(t.clone())
            }
        }
    }
    pub fn lookahead(&mut self) -> LexerResult {
        let last_poistion = self.get_position();
        let lookahead_token = self.next_token();
        self.position = last_poistion;
        lookahead_token
    }
    pub fn get_position(&self) -> Position {
        self.position.clone()
    }
    pub fn get_index(&self) -> usize {
        self.position.index
    }
    fn get_char(&self) -> Option<char> {
        self.code[self.position.index..].chars().next()
    }
    fn eat_char(&mut self, mut n:  usize) {
        if n == 0 {
            panic!("[Error]: Eat function eat 0 char.")
        }
        loop {
            if self.position.index >= self.code.len() || n == 0 {
                break;
            }
            if self.code[self.position.index..].chars().next().unwrap() == '\n' {
                self.position.col = 0 ;
                self.position.row += 1;
            }else {
                self.position.col += 1
            }
            self.position.index += 1;
            n -= 1;
        }
    }
    fn start_with(&self, s: &str) -> bool {
        if self.position.index > self.code.len() {
            return false;
        }
        return self.code[self.position.index..].starts_with(s);
    }
    fn skip_space_and_change_line(&mut self) {
        loop {
            match self.get_char()  {
                None => {
                    return
                } 
                Some(ch) => {
                    if ch == '\n' || ch == ' ' || ch == '\t' {
                        self.eat_char(1)
                    }else {
                        return
                    }
                }
            }
        }   
    }
    fn start_token(&mut self) {
        self.start_position = self.get_position()
    }
    fn end_token(&mut self) {
        self.end_position = self.get_position()
    }
    fn toknize(&mut self) -> LexerResult {
        self.skip_space_and_change_line();
        let current_char = self.get_char();
        self.start_token();
        return match current_char {
            None => {
                Ok(Token::EOF)
            }
            Some(current_ch) => {
                match current_ch {
                    // Punctations
                    ';' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::Semi)
                    }
                    ',' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::Comma)
                    }
                    ':' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::Colon)
                    }
                    '#' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::HashTag)
                    }
                    '{' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::BracesLeft)
                    }
                    '}' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::BracesRight)
                    }
                    '[' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::BracketLeft)
                    }
                    ']' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::BracketRight)
                    }
                    '(' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::ParenthesesLeft)
                    }
                    ')' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::ParenthesesRight)
                    }
                    '.' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::Dot)
                    }
                    '?' => {
                        self.eat_char(1);
                        self.end_token();
                        Ok(Token::Qustion)  
                    }
                    '\'' => {
                        panic!();
                    }
                    '\"' => {
                        panic!();
                    }
                    // Operators
                    '+' => {
                        self.read_plus()
                    }
                    '-' => {
                        self.read_mius()
                    }
                    '/' => {
                        self.read_divide()
                    }
                    '*' => {
                        self.eat_char(1);
                        Ok(Token::Multply)
                    }
                    '%' => {
                        self.eat_char(1);
                        Ok(Token::Mod)
                    }
                    '=' => {
                        self.read_assign()
                    }
                    '>' => {
                        self.read_gt()
                    }
                    '<' => {
                        self.read_lt()
                    }
                    '!' => {
                        self.read_not()
                    }
                    '|' => {
                        self.read_bitwise_or()
                    }
                    '&' => {
                        self.read_bitwise_and()
                    }
                    // Number Literal
                    '0' | '1' | '2' | '3' | '4' |
                    '5' | '6' | '7' | '8' | '9' => {
                        self.read_number_literal()
                    }
                    // Fallback -> Keyword OR Literal OR Identifier
                    _ => {
                        self.read_keyword_or_identifier()
                    }
                }
            }
        }
    }
    fn read_plus(&mut self) -> LexerResult {
        if self.start_with("+=") {
            syntax_error!("Not Support Plus Assigment");
        }
        if self.start_with("++") {
            syntax_error!("Not Support Update Operator");
        }
        self.eat_char(1);
        Ok(Token::Plus)
    }
    fn read_mius(&mut self) -> LexerResult {
        if self.start_with("-=") {
            syntax_error!("Not Support Minu Assignment");
        }
        if self.start_with("--") {
            syntax_error!("Not Support Update Operator");
        }
        self.eat_char(1);
        Ok(Token::Minus)
    }
    fn read_divide(&mut self) -> LexerResult {
        if self.start_with("/=") {
            syntax_error!("Not Support Divide Assignment");
        }
        self.eat_char(1);
        Ok(Token::Divide)
    }
    fn read_assign(&mut self) -> LexerResult {
        if self.start_with("==") {
            self.eat_char(2);
            Ok(Token::Eq)
        }else {
            self.eat_char(1);
            Ok(Token::Assign)
        }
    }
    fn read_gt(&mut self)-> LexerResult {
        if self.start_with(">=") {
            self.eat_char(2);
            return Ok(Token::Gteq);
        }
        self.eat_char(1);
        Ok(Token::Gt)
    }
    fn read_lt(&mut self)-> LexerResult {
        if self.start_with("<=") {
            self.eat_char(2);
            return Ok(Token::Lteq);
        }
        self.eat_char(1);
        Ok(Token::Lt)
    }
    fn read_not(&mut self) -> LexerResult {
        if self.start_with("!=") {
            self.eat_char(2);
            return Ok(Token::NotEq);
        }
        self.eat_char(1);
        Ok(Token::LogicalNOT)
    }
    fn read_bitwise_or(&mut self) -> LexerResult {
        if self.start_with("||") {
            self.eat_char(2);
            return Ok(Token::LogicalOR)
        }
        syntax_error!("Not Support Bitwise OR");
    }
    fn read_bitwise_and(&mut self) -> LexerResult {
        if self.start_with("&&") {
            self.eat_char(2);
            return Ok(Token::LogicalAND)
        }
        syntax_error!("Not Support Bitwise AND");
    }
    fn read_number_literal(&mut self) -> LexerResult {
        // TODO
        let number_chars: HashSet<char> = vec![
            '0','1','2','3','4',
            '5','6','7','8','9'
        ].into_iter().collect();
        let mut number_word = String::from("");
        loop {
            match self.get_char() {
                None => {
                    break;
                }
                Some(ch) => {
                    if !number_chars.contains(&ch) {
                        break;
                    }
                    number_word.push(ch);
                    self.eat_char(1)
                }
            }
        }
        Ok(Token::NumberLiteral(number_word.parse().unwrap()))
    }
    fn read_keyword_or_identifier(&mut self) -> LexerResult{
        // Resevered Word Start, TODO
       let resevered_word_start_set: HashSet<char> = vec![
            // Puncation
            '{', '}',
            '[', ']',
            '(', ')',
            ';', '.', ':', ',',
            // Operator
            '+', '/', '*', '%','=', '|', '&',
            '<', '>',
            // Space and Change Line
            '\n', '\t', ' ',
        ].into_iter().collect();
        // Read Word
        let mut word = String::from("");
        loop {
            match self.get_char() {
                None => {
                    break;
                }
                Some(ch) => {
                    if resevered_word_start_set.contains(&ch) {
                        break;
                    }
                    word.push(ch);
                    self.eat_char(1);
                }
            }
        }
        // Match By Word's value
        Ok(match word.as_str()  {
            // Keywords
            "while" => {
                Token::WhileKeyword
            }
            "for" => {
                Token::ForKeyword
            }
            "if" => {
                Token::IfKeyword
            }
            "else" => {
                Token::ElesKeyword
            }
            "return" => {
                Token::ReturnKeyword
            }
            "var" => {
                Token::VarKeyword
            }
            "function" => {
                Token::FunctionKeyword
            }
            "number" => {
                Token::NumberKeyword
            }
            "void" => {
                Token::VoidKeyword
            }
            _ => {
                Token::Identifier(word)
            }
        })
    }
}
