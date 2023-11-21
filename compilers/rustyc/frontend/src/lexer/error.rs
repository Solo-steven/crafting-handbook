/// Error map for lexer panic error
pub struct LexerPanicError {
    pub unclose_char_literal: &'static str,
    pub unclose_string_literal: &'static str,
    pub illegal_escape_char: &'static str,
}

impl Default for LexerPanicError {
    fn default() -> Self {
        Self::new()
    }
}

impl LexerPanicError {
    pub const fn new() -> Self {
        Self {
            unclose_char_literal: "",
            unclose_string_literal: "",
            illegal_escape_char: "",
        }
    }
}