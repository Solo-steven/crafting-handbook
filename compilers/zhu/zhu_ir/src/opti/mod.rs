pub mod available_expr;
pub mod cfg;
pub mod dce;
pub mod domtree;
pub mod gvn;
pub mod licm;
pub mod post_domtree;
pub mod rpo;

use crate::entities::function::Function;
/// Trait for a pass which will mutate a function to get opti function.
pub trait OptiPass {
    fn process(&mut self, func: &mut Function);
}
/// Trait for a pass which is analysis based on function, maybe return a
/// object for analysis.
pub trait AnalysisPass<T> {
    fn process(&mut self, func: &Function) -> T;
}
