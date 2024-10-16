use crate::ir::function::Function;

pub mod dfs_ordering;
pub mod domtree;
pub mod liveness_anaylsis;
pub mod post_domtree;
pub mod use_def_chain;

pub trait OptimizerAnaylsis<T> {
    fn anaylsis(&mut self, function: &Function) -> T;
}

pub trait DebuggerAnaylsis<T> {
    fn debugger(&mut self, function: &Function, table: &T) -> String;
}
