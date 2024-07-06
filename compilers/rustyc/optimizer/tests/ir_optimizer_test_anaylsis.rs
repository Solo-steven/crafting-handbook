mod test_utils;
use rustyc_optimizer::ir::function::Function;
use rustyc_optimizer::ir_optimizer::anaylsis::domtree::{DomAnaylsier, DomTable};
use test_utils::test_anaylsis;

fn test() {
    test_anaylsis::<DomTable, DomAnaylsier>("", &mut Function::new("".to_string()), String::new(), DomAnaylsier::new());
}

