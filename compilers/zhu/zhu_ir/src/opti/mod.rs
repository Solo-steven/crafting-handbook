pub mod cfg;
pub mod domtree;
pub mod licm;

use crate::entities::function::Function;

pub trait OptiPass {
    fn process(&mut self, func: &mut Function);
}
