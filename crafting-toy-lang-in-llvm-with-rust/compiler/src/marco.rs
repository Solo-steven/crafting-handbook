#[macro_export]
macro_rules! syntax_error {
    ($msg: expr) => {
        return Err(format!("[Syntax Error]: {:?}.", $msg));   
    };
}
#[macro_export]
macro_rules! unreach_error {
    ($msg: expr) => {
        return Err(format!("[Runtime Error]: {:?}", $msg));
    };
}
#[macro_export]
macro_rules! semantic_error {
    ($msg: expr) => {
        return Err(format!("[Semantic Error]: {:?}.", $msg));  
    };
}