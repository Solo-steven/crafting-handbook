
#[macro_export]
macro_rules! lexer_panic {
    ($msg: expr) => {
        panic!($msg)
    };
}