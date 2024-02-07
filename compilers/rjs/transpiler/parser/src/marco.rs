#[macro_export]
macro_rules! finish_token_with_eat {
    ( $item: expr, $lexer: expr) => {
        $lexer.eat_char();
        $lexer.cur_token = $item;
        $lexer.finish_token();
        return Ok(());
    };
}
#[macro_export]
macro_rules! finish_token {
    ( $item: expr, $lexer: expr) => {
        $lexer.cur_token = $item;
        $lexer.finish_token();
        return Ok(());
    };
}
