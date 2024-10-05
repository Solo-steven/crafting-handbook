pub mod copy_propagation;
pub mod gvn;
pub mod lcm;
pub mod licm;
pub mod mem2reg;
pub mod value_numbering;

use crate::ir::function::Function;
/// This trait provide a debugger method to print the string which represent
/// the tabls of a pass
/// NOTE: table should be a data flow analysis result map, mapping block id
/// and the set of values
pub trait OptimizerPass {
    fn process(&mut self, function: &mut Function);
}

pub trait DebuggerPass {
    fn debugger(&self, function: &Function) -> String;
}
