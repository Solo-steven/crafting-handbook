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
use opti::domtree::{domtree_analysis, DomTree};
use opti::licm::licm_pass;
use opti::licm::natural_loop::natural_loop_analysis;
use opti::rpo::revrese_post_order_analysis;
use serde::{Deserialize, Serialize};

use formatter::format;
use frontend::{parse, to_tokens};

use opti::gvn::gvn_pass;

fn main() {
    let source = "
func gvn_func (reg0: u8, reg1: u8) {
block0:
    reg2 = addi reg0 1
    reg3 = addi reg1 1
    reg4 = add reg2 reg3
    brif reg0 block1 block2
block1:
    reg5 = addi reg1 1
    jump block3
block2:
    reg6 = addi reg0 1
    jump block3
block3:
    reg7 = phi [block1 reg5, block2 reg6]
    ret
}
";
    let mut module = parse(source);
    println!("{}", format(&module).as_str());
    let module_id = module.get_module_id_by_symbol("gvn_func").unwrap();
    let func_id = module_id.to_func_id();
    let func = module.get_mut_function(func_id).unwrap();
    let cfg = cfg_anylysis(func);
    let rpo = revrese_post_order_analysis(&cfg);
    println!("RPO:{:?}", rpo.get_blocks_in_rpo());
    let dom = domtree_analysis(&cfg);
    gvn_pass(func, &dom, &cfg, &rpo);
    println!("{}", format(&module).as_str());
}
