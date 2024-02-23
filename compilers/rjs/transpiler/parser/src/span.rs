use serde::{Deserialize, Serialize};
#[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
pub struct Span{
    pub offset: usize,
    pub line: usize,
    pub col: usize,
}

impl Span {
    pub fn new(offset: usize, line: usize, col: usize) -> Self {
        Self {
            offset,
            line,
            col
        }
    }
}


