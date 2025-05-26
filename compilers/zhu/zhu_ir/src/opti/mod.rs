pub mod cfg;
pub mod domtree;
pub mod gvn;
pub mod licm;
pub mod rpo;

use crate::entities::function::Function;

pub trait OptiPass {
    fn process(&mut self, func: &mut Function);
}
