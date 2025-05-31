pub mod cfg;
pub mod domtree;
pub mod gvn;
pub mod licm;
pub mod post_domtree;
pub mod rpo;

use crate::entities::function::Function;
use crate::opti::cfg::ControlFlowGraph;
/// Trait for a pass which will mutate a function to get opti function.
pub trait OptiPass {
    fn process(&mut self, func: &mut Function);
}
/// Trait for a pass which is analysis based on blocks relationship.
pub trait AnalysisPass {
    fn process(&mut self, cfg: &ControlFlowGraph);
}
