

struct ErrorMap {
    nullish_require_parans: &'static str,
}

impl ErrorMap {
    pub fn new() -> Self {
        Self {
            nullish_require_parans: "",
        }
    }
}