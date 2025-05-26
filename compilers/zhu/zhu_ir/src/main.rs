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
use serde::{Deserialize, Serialize};

use formatter::format;
use frontend::{parse, to_tokens};

use crate::entities::r#type::{MemTypeData, StructTypeData, StructTypeDataField};

const FUNC_NAME: &'static str = "mem_inst_struct";
fn build_module() -> Module {
    let mut module = Module::new();

    let func_id = module.declar_function(FUNC_NAME);
    let func_mut_reference = module.get_mut_function(func_id).unwrap();
    func_mut_reference.set_return_type(ValueType::I16);
    let mem_type_0 = func_mut_reference.declar_mem_type(MemTypeData::Struct(StructTypeData {
        size: 32,
        fields: vec![
            StructTypeDataField {
                offset: 0,
                ty: ValueType::I16,
            },
            StructTypeDataField {
                offset: 16,
                ty: ValueType::I16,
            },
        ],
    }));
    let mem_type_1 = func_mut_reference.declar_mem_type(MemTypeData::Struct(StructTypeData {
        size: 48,
        fields: vec![
            StructTypeDataField {
                offset: 0,
                ty: ValueType::I16,
            },
            StructTypeDataField {
                offset: 16,
                ty: ValueType::Mem(mem_type_0),
            },
        ],
    }));
    let bb = func_mut_reference.create_block();
    let mut builder = FunctionBuilder::new(func_mut_reference);
    builder.switch_to_block(bb);
    // build mem type 0
    let reg0 = builder.stack_alloc_inst(
        entities::immediate::Immediate::U32(32),
        entities::immediate::Immediate::U8(8),
        ValueType::Mem(mem_type_0),
    );
    let reg1 = builder.load_inst(reg0, Offset(0), ValueType::I16);
    let reg2 = builder.load_inst(reg0, Offset(16), ValueType::I16);
    let reg3 = builder.add_inst([reg1, reg2]);
    // build mem type 1
    let reg4 = builder.stack_alloc_inst(
        entities::immediate::Immediate::U32(32),
        entities::immediate::Immediate::U8(8),
        ValueType::Mem(mem_type_1),
    );
    let reg5 = builder.load_inst(reg4, Offset(0), ValueType::I16);
    let reg6 = builder.load_inst(reg4, Offset(32), ValueType::I16);
    let reg7 = builder.add_inst([reg5, reg6]);
    // build result
    let reg8 = builder.add_inst([reg3, reg7]);
    builder.ret_inst(Some(reg8));

    module
}

fn main() {
    let formatter = Formatter::new();
    let source = "
func for_loop_func (reg0: u8, reg1: u8) {
block0:
    jump block1
block1:
    reg2 = phi [block0 reg0, block4 reg5]
    jump block2
block2:
    reg3 = icmp lt reg2 reg1
    brif reg3 block3 block5
block3:
    reg4 = reg0 + reg1
    jump block4
block4:
    reg5 = addi reg2 1
    jump block1
block5:
    ret
}
";
    let do_while_loop_source = "
func find_natural_loops (reg0: u8, reg1: u8) {
block0:
    reg2 = mov reg0
    jump block1
block1:
    reg3 = phi [block0 reg2, block2 reg4]
    reg4 = addi reg3 1
    jump block2
block2:
    reg5 = icmp lt reg4 reg1
    brif reg5 block3 block1
block3:
    ret
}
";
    let do_while_loop_have_loop_invariant_source = "
func find_natural_loops (reg0: u8, reg1: u8) {
block0:
    reg2 = mov reg0
    reg3 = add reg0 reg1
    jump block1
block1:
    reg4 = phi [block0 reg2, block2 reg8]
    reg5 = addi reg3 1
    reg6 = add reg2 reg3
    reg7 = add reg5 reg6
    reg8 = addi reg4 1
    jump block2
block2:
    reg9 = icmp lt reg8 reg1
    brif reg6 block3 block1
block3:
    ret
}
";
    // println!("{:?}", to_tokens(source));
    // println!("{}", formatter.fmt_module(&parse(source)));
    let mut module = parse(do_while_loop_have_loop_invariant_source);
    println!("{}", format(&module).as_str());
    let module_id = module.get_module_id_by_symbol("find_natural_loops").unwrap();
    let func_id = module_id.to_func_id();
    let func = module.get_mut_function(func_id).unwrap();
    let cfg = cfg_anylysis(func);
    let dom = domtree_analysis(&cfg);
    let natural_loops = natural_loop_analysis(&dom, &cfg);
    licm_pass(func, &cfg, &dom, &natural_loops);
    println!("{}", format(&module).as_str());
}
