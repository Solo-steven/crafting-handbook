pub mod builder;
pub mod entities;
pub mod formatter;
pub mod frontend;
pub mod opti;

use crate::opti::licm::natural_loop::NaturalLoopAnalysis;
use builder::FunctionBuilder;
use entities::function::Function;
use entities::immediate::Offset;
use entities::module::{self, DataDescription, Module, ModuleLevelId};
use entities::r#type::ValueType;
use formatter::Formatter;
use frontend::parser::Parser;
use opti::cfg::{cfg_anylysis, ControlFlowGraph};
use opti::dce::dce_pass;
use opti::domtree::{domtree_analysis, DomTree};
use opti::licm::licm_pass;
use opti::licm::natural_loop::natural_loop_analysis;
use opti::post_domtree::post_domtree_analysis;
use opti::rpo::revrese_post_order_analysis;
use serde::{Deserialize, Serialize};

use formatter::format;
use frontend::{parse, to_tokens};

use opti::gvn::gvn_pass;

fn main() {
    let dce_triangle = "
func dce_triangle (reg0: i8, reg1: i8) {
block0:
  reg2 = add reg0 reg1
  brif reg2 block1 block2
block1:
  ret
block2:
  ret
}
";
    let mut module = parse(dce_triangle);
    println!("{}", format(&module).as_str());
    let module_id = module.get_module_id_by_symbol("dce_triangle").unwrap();
    let func_id = module_id.to_func_id();
    let func = module.get_mut_function(func_id).unwrap();
    let cfg = cfg_anylysis(func);
    // let rpo = revrese_post_order_analysis(&cfg);
    // println!("RPO:{:?}", rpo.get_blocks_in_rpo());
    let dom = post_domtree_analysis(&cfg);
    dce_pass(func, &dom);
    println!("{:?}", dom.dom_tree);
    println!("{}", format(&module).as_str());
}
