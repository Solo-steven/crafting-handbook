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
    let source = "
func licm_topo_order (reg0: i16, reg1: i16) {
block0:
  reg2 = addi reg0 10
  reg3 = subi reg1 10
  jump block1
block1:
  reg4 = phi [block0 reg0, block2 reg7]
  reg5 = add reg2 reg3
  jump block2
block2:
  reg6 = addi reg5 10
  reg7 = subi reg4 1
  brif reg7 block1 block3
block3:
  ret 
}
";
    let mut module = parse(source);
    println!("{}", format(&module).as_str());
    let module_id = module.get_module_id_by_symbol("licm_topo_order").unwrap();
    let func_id = module_id.to_func_id();
    let func = module.get_mut_function(func_id).unwrap();
    let cfg = cfg_anylysis(func);
    let rpo = revrese_post_order_analysis(&cfg);
    let dom = domtree_analysis(&func, &cfg);
    let natural_loops = natural_loop_analysis(&dom, &cfg);
    licm_pass(func, &cfg, &dom, &rpo, &natural_loops);
    println!("{}", format(&module).as_str());
}
