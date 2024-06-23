#[derive(Debug, Clone, PartialEq)]
pub struct Span {
    pub offset: usize,
    pub col: usize,
    pub row: usize,
}

impl Default for Span {
    fn default() -> Self {
        Self::new()
    }
}

impl Span {
    pub fn new() -> Self {
        Self {
            offset: 0,
            col: 0,
            row: 0,
        }
    }
}
