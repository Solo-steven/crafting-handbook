use crate::lexer::{Lexer, LexerResult };
use crate::token::{Token, get_pre_of_binary_op, is_binary_op};
use crate::ast::*;
use crate::{syntax_error, unreach_error};

pub type  ParserResult<T> = Result<T, String>;

pub struct  Parser {
    tokenizer: Lexer,
}
impl Parser {
    pub fn new(code: String) -> Parser {
        Parser {
            tokenizer: Lexer::new(code)
        }
    }
    // public api for parse given string
    pub fn parse(&mut self) -> ParserResult<Program> {
        return self.parse_program();
    }
    fn next_token(&mut self) -> LexerResult {
        self.tokenizer.next_token()
    }
    fn get_token(&mut self) -> LexerResult {
        return self.tokenizer.get_token();
    }
    fn parse_program(&mut self) -> ParserResult<Program> {
        let mut body = Vec::<ProgramItem>::new();
        loop {
            match self.get_token()? {
                Token::EOF => {
                    return Ok(Program { body })
                }
                _ => {
                    let ast = self.parse_program_item()?;
                    body.push(ast);
                }
            }
        }
    }
    fn parse_program_item(&mut self) -> ParserResult<ProgramItem> {
        let ast = match self.get_token()? {
            Token::VarKeyword => {
                ProgramItem::Decl(self.parse_variable_declaration()?)
            }
            Token::FunctionKeyword => {
                ProgramItem::Decl(self.parse_function_declaration()?)
            }
            Token::BracesLeft => {
                ProgramItem::Stmt(self.parse_block_statement()?)
            }
            Token::WhileKeyword => {
                ProgramItem::Stmt(self.parse_while_statement()?)
            }
            Token::IfKeyword => {
                ProgramItem::Stmt(self.parse_if_statement()?)
            }
            Token::ReturnKeyword => {
                ProgramItem::Stmt(self.parse_return_statement()?)
            }
            _ => {
                ProgramItem::Expr(self.parse_expression()?)
            }
        };
        match self.get_token()? {
            Token::Semi => {
                self.next_token()?;
            }
            _ => {}
        }
        return Ok(ast);
    }
/** =========================================
 *  Parse Statements
 * ==========================================
 */
    fn parse_while_statement(&mut self) -> ParserResult<Stmt> {
        let test: Expr;
        match self.get_token()? {
             Token::WhileKeyword  => {
                self.next_token()?;
             }
             _ => {
                unreach_error!("While statement should be start with `while` keyword");
             }
        }
        match self.get_token()? {
            Token::ParenthesesLeft  => {
                self.next_token()?;
                test = self.parse_expression()?;
            }
            _ => {
                syntax_error!("While Statement's Condition Should be Wrapped By ParentheseLeft");
            }
       }
       match self.get_token()? {
            Token::ParenthesesRight => {
                self.next_token()?;
            }
            _ => {
                syntax_error!("While Statement's Condition Should be Wrapper By ParentheseRight");
            }
       }
       return Ok(Stmt::WhileStmt(WhileStatement{
            test,
            body: Box::new(self.parse_block_statement()?)
       }))

    }
    fn parse_block_statement(&mut self) ->ParserResult<Stmt> {
        match self.get_token()? {
            Token::BracesLeft => {
                self.next_token()?;
            }
            _ => {
                unreach_error!("BlockStatement Should Start With BraceLeft");
            }
        }
        let mut body: Vec<ProgramItem> = Vec::<ProgramItem>::new();
        loop {
            match self.get_token()? {
                Token::EOF => {
                    syntax_error!("BlockStatement End Without BraceRight");
                }
                Token::BracesRight => {
                    self.next_token()?;
                    return Ok(Stmt::BlockStmt(BlockStatement{
                        body
                    }))
                }
                _ => {
                    body.push(self.parse_program_item()?);
                }
            }
        }
    }
    fn parse_if_statement(&mut self) -> ParserResult<Stmt> {
        match self.get_token()? {
            Token::IfKeyword => {
                self.next_token()?;
            }
            _ => {
                unreach_error!("If Statement Should Start With `if` keyword.");
            }
        }
        let test:Expr;
        match self.get_token()? {
            Token::ParenthesesLeft  => {
                self.next_token()?;
                test = self.parse_expression()?;
            }
            _ => {
                syntax_error!("Condition Of If Statement Should be Wrapper In Parentheses, Lock of ParentheseLeft");
            }
       }
       match self.get_token()? {
            Token::ParenthesesRight => {
                self.next_token()?;
            }
            _ => {
                syntax_error!("Condition Of If Statement Should be Wrapper In Parentheses, Lock of ParentheseRight");
            }
       }
       let consequence = self.parse_block_statement()?;
       match self.get_token()? {
           Token::ElesKeyword => {
             self.next_token()?;
             match self.get_token()? {
                Token::BracesLeft => {
                    Ok(Stmt::IfStmt(IfStatement { test, consequent: Box::new(consequence), alter:Some(Box::new(self.parse_block_statement()?)) }))
                }
                Token::IfKeyword => {
                    Ok(Stmt::IfStmt(IfStatement { test, consequent: Box::new(consequence), alter:Some(Box::new(self.parse_if_statement()?)) }))
                }
                _ => {
                    syntax_error!("Else Keyword Must Concat With Block Statement Or If Statement");
                }
             }
           }
           _ => {
            Ok(Stmt::IfStmt(IfStatement { test, consequent: Box::new(consequence), alter: None }))
           }
       }
    }
    fn parse_return_statement(&mut self) -> ParserResult<Stmt> {
        match self.get_token()? {
            Token::ReturnKeyword => {
                self.next_token()?;
            }
            _ => {
                unreach_error!("Return Statement Should Start With Return Keyword.");
            }
        }
        match self.get_token()? {
            Token::Semi | Token::BracesRight => {
                Ok(Stmt::ReturnStmt(ReturnStatement {
                    argument: None
                }))  
            }
            _  =>  {
                Ok(Stmt::ReturnStmt(ReturnStatement {
                    argument: Some(self.parse_expression()?)
                }))
            }
        }
    }
/** ===========================================
 *  Parse Declaration
 * ============================================
 */
    fn parse_variable_declaration(&mut self) -> ParserResult<Decl> {
        let identifier_name: String;
        match self.get_token()? {
            Token::VarKeyword => {
                self.next_token()?;
            }
            _ => {
                syntax_error!("Variable Declaration Should Start With `var` keyword");
            }
        }
        match self.get_token()? {
            Token::Identifier(value) => {
                self.next_token()?;
                identifier_name = value;
            }
            _ => {
                syntax_error!("Variable Delcaration Should Provide A Identifier");
            }
        }
        return match self.get_token()? {
            Token::Assign => {
                self.next_token()?;
                let init_expression = self.parse_expression()?;
                Ok(Decl::VariableDecl(VariableDeclaration { 
                    name: identifier_name, 
                    init: Some(init_expression)
                }))
            }
            _ => {
                Ok(Decl::VariableDecl(VariableDeclaration { 
                    name: identifier_name, 
                    init: None
                }))
            }
        }
    }
    fn parse_function_declaration(&mut self) -> ParserResult<Decl> {
        let function_name: String;
        let function_type: Type;
        match self.get_token()? {
            Token::FunctionKeyword => {
                self.next_token()?;
            }
            _ => {
                unreach_error!("Function Declaration Should Start With `var` keyword");
            }
        }
        match self.get_token()? {
            Token::Identifier(value) => {
                self.next_token()?;
                function_name = value;
            }
            _ => {
                syntax_error!("Function Delcaration Should Provide A Identifier.");
            }
        }
        let arguments = self.parse_function_declaration_aruguments()?;
        match self.get_token()? {
            Token::Colon => {
                self.next_token()?;
            }
            _ => {
                syntax_error!("Function Declaration Must Has Return Type With Colon.");
            }
        }
        match self.get_token()? {
            Token::NumberKeyword  => {
                self.next_token()?;
                function_type  = Type::Number;
             } 
             Token::VoidKeyword => {
                self.next_token()?;
                function_type = Type::Void;
             }
            _ => {
                syntax_error!("Function Declaration Must Has Return Type");
            }
        }
        let body = self.parse_block_statement()?;
        Ok(Decl::FunctionDecl(FunctionDeclaration { 
            name:function_name , 
            return_type: function_type, 
            arguments , 
            body
        }))

    }
    // argument -> identifier [',' identifier]
    fn parse_function_declaration_aruguments(&mut self) -> ParserResult<Vec<String>> {
        match self.get_token()? {
            Token::ParenthesesLeft => {
                self.next_token()?;
            }
            _ => {
                unreach_error!("Function Declaration Params Must Be Wrapped In ParenthesesLeft.");
            }
        }
        let mut params = Vec::<String>::new();
        match self.get_token()? {
            Token::Identifier(name) => {
                params.push(name);
                self.next_token()?;
            }
            _ => {
                match self.get_token()? {
                    Token::ParenthesesRight => {
                        self.next_token()?;
                    }
                    _ => {
                        syntax_error!("Function Declaration Params Must Be Wrapped In ParenthesesRight");
                    }
                }
                return Ok(params);
            }
        }
        loop {
            match self.get_token()? {
                Token::Comma => {
                    self.next_token()?;
                }
                _ => {
                    break
                }
            }
            match self.get_token()? {
                Token::Identifier(name) => {
                    params.push(name);
                    self.next_token()?;
                }
                _ => {
                    break;
                }
            }
        }
        match self.get_token()? {
            Token::ParenthesesRight => {
                self.next_token()?;
            }
            _ => {
                syntax_error!("Function Declaration Params Must Be Wrapped In ParenthesesRight.");
            }
        }
        return Ok(params);
    }
/** ===================================================
 *  Parse Expression
 * ====================================================
 */
    fn parse_expression(&mut self) -> ParserResult<Expr> {
        let mut expressions = vec![self.parse_assignment_expression()?];
        loop {
            match self.get_token()? {
                Token::Comma => {
                    self.next_token()?;
                    expressions.push(self.parse_assignment_expression()?)
                }
                _ => {
                    break;
                }
            }
        }
        if expressions.len() == 1 {
            // TODO: take ownership, not clone it.
            Ok(expressions[0].clone())
        }else {
            Ok(Expr::SequnceExpr(SequnceExpression {
                expressions
            }))
        }
    }
    fn parse_assignment_expression(&mut self) -> ParserResult<Expr> {
        let left = self.parse_condition_expression()?;
        match self.get_token()? {
            Token::Assign => {
                self.next_token()?;
                Ok(Expr::AssigmentExpr(AssigmentExpression { 
                    left: Box::<Expr>::new(left), 
                    right: Box::<Expr>::new(self.parse_condition_expression()?), 
                }))
            }
            _ => {
                Ok(left)
            }
        }
    }
    fn parse_condition_expression(&mut self) -> ParserResult<Expr> {
        let test = self.parse_binary_expression()?;
        match self.get_token()? {
            Token::Qustion => {
                self.next_token()?;
            }
            _ => {
                return Ok(test);
            }
        }
        let consequence =  self.parse_binary_expression()?;
        match self.get_token()? {
            Token::Colon => {
                self.next_token()?;
                return Ok(Expr::ConditionExpr(ConditionExpression {
                    test: Box::<Expr>::new(test),
                    consequnce: Box::<Expr>::new(consequence),
                    alter:Box::<Expr>::new(self.parse_binary_expression()?)
                }))
            }
            _ => {
                syntax_error!("Conditional Expression Should Have Consequnce And Alter Expression");
            }
        }
    }
    fn parse_binary_expression(&mut self)-> ParserResult<Expr> {
        let atom = self.parse_unary_expression()?;
        let op = self.get_token()?;
        if is_binary_op(&op) {
            self.parse_binary_ops(atom, -1)
        }else {
            Ok(atom)
        }
    }
    fn parse_binary_ops(&mut self, mut left: Expr, last_pre: i32) -> ParserResult<Expr> {
        loop {
            let current_op = self.get_token()?;
            if !is_binary_op(&current_op) || get_pre_of_binary_op(&current_op) < last_pre {
                break;
            }
            self.next_token()?;
            let mut right = self.parse_unary_expression()?;
            let next_op = self.get_token()?;
            if  
                is_binary_op(&next_op) && 
                (get_pre_of_binary_op(&next_op) > get_pre_of_binary_op(&current_op)) 
            {
                
                right = self.parse_binary_ops(right, get_pre_of_binary_op(&next_op))?
            }
            left = Expr::BinaryExpr(BinaryExpression { 
                left: Box::<Expr>::new(left), 
                right: Box::<Expr>::new(right),
                operator: get_ast_type_of_binary_op_token(current_op)
            } );
        }
        Ok(left)
    }
    fn parse_unary_expression(&mut self) -> ParserResult<Expr> {
        match self.get_token()? {
            Token::Plus => {
                self.next_token()?;
                Ok(Expr::UnaryExpr(UnaryExpression {
                    operator: Operator::Plus,
                    argument: Box::<Expr>::new(self.parse_primary_expression()?)
                }))
            }
            Token::Minus => {
                self.next_token()?;
                Ok(Expr::UnaryExpr(UnaryExpression {
                    operator: Operator::Minus,
                    argument: Box::<Expr>::new(self.parse_primary_expression()?)
                }))
            }
            _ => {
                self.parse_primary_expression()
            }
        }
    }
    fn parse_primary_expression(&mut self) -> ParserResult<Expr> {
        match self.get_token()? {
            Token::Identifier(identifier) => {
                self.next_token()?;
                match self.get_token()? {
                    Token::ParenthesesLeft => {
                        let params = self.parse_call_expression_param()?;
                        Ok(Expr::CallExpr(CallExpression { callee_name: identifier, params }))
                    }
                    _ => {
                        Ok(Expr::Ident(Identifier {
                            name: identifier,
                        }))
                    }
                }
            }
            Token::NumberLiteral(value) => {
                self.next_token()?;
                Ok(Expr::NumberExpr(NumberLiteral{
                    value
                }))
            }
            Token::ParenthesesLeft => {
                self.next_token()?;
                let expr = self.parse_expression()?;
                return match self.get_token()? {
                    Token::ParenthesesRight => {
                        self.next_token()?;
                        Ok(expr)
                    }
                    _ => {
                        syntax_error!("CoverParenthesizedExpression Must End With ParentheseRight.");
                    }
                }
            }
            _ => {
                syntax_error!("Failed For Get Primary Expression");
            }
        }
    }
    fn parse_call_expression_param(&mut self) -> ParserResult<Vec<Expr>> {
        let mut params = Vec::<Expr>::new();
        match self.get_token()? {
            Token::ParenthesesLeft  => {
                self.next_token()?;
            }
            _ => {
                syntax_error!("CallExpression's Param Call Be Wrapped By ParentheseLeft.");
            }
        }
        loop {
            match self.get_token()? {
                Token::ParenthesesRight => {
                    break;
                }
                _ => {
                    params.push(self.parse_condition_expression()?);
                }
            }
            match self.get_token()? {
                Token::Comma => {
                    self.next_token()?;
                }
                _ => {
                    break;
                }
            }
        }
        match self.get_token()? {
            Token::ParenthesesRight  => {
                self.next_token()?;
            }
            _ => {
                syntax_error!("CallExpression's Param Call Be Wrapped By ParentheseRight.");
            }
        }
        Ok(params)
    }
}