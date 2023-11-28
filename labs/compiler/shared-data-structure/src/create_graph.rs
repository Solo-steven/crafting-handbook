/// This module is for create fake control flow and 
/// import or export control flow graph to json format
use crate::*;
use serde_json::{to_string_pretty, from_str};
use std::fs::File;
use std::io::{Write, Read};
/// inner helper function for connect two block
fn connect_block(parent: usize, child: usize, blocks: &mut Vec<BasicBlock>) {
    blocks[parent].predecessor.push(child);
    blocks[child].successor.push(parent);
}
/// write a control flow to json file
pub fn write_graph_to_json(control_flow: &ControlFlow, path: &str) {
    let file = File::create(path).unwrap();
    write!(&file, "{}", to_string_pretty(control_flow).unwrap().as_str()).unwrap();
}
/// read a control flow from json file
pub fn read_graph_form_file(path: &str) -> ControlFlow {
    let mut file = File::open(path).unwrap();
    let mut data = String::new();
    file.read_to_string(&mut data).unwrap();
    from_str(data.as_str()).unwrap()
}
/// Create a fake basic block contain operation below:
/// - `a = b + c`
/// - `b = a - d`
/// - `c = b + c`
/// - `d = a - d`
pub fn create_fake_basic_block_1() -> BasicBlock {
    BasicBlock {
        id : 0,
        predecessor: Vec::new(),
        successor: Vec::new(),
        instructions: vec![
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Identifier(String::from("b")), 
                src2: IdentifierOrConst::Identifier(String::from("c")), 
                dst: String::from("a"), 
                ops: BinaryOps::Add, 
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Identifier(String::from("a")), 
                src2: IdentifierOrConst::Identifier(String::from("d")), 
                dst: String::from("b"), 
                ops: BinaryOps::Sub, 
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Identifier(String::from("b")), 
                src2: IdentifierOrConst::Identifier(String::from("c")), 
                dst: String::from("c"), 
                ops: BinaryOps::Sub, 
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Identifier(String::from("a")), 
                src2: IdentifierOrConst::Identifier(String::from("d")), 
                dst: String::from("d"), 
                ops: BinaryOps::Sub, 
            })
        ]
    }
}
/// Create a fake basic block contain operation below:
/// - `a = -10`
/// - `b = 10`
/// - `c = e + f`
/// - `d = a + b` 
/// - `d = -d`
/// - `h = a + b`
/// - `g = e + f`
pub fn create_fake_basic_block_2() -> BasicBlock {
    BasicBlock {
        id : 0,
        predecessor: Vec::new(),
        successor: Vec::new(),
        instructions: vec![
            Instruction::UnaryInst(UnaryInstruction {
                dst: String::from("a"),
                src:IdentifierOrConst::Const(10),
                ops: UnaryOps::Neg,
            }),
            Instruction::UnaryInst(UnaryInstruction {
                dst: String::from("b"),
                src:IdentifierOrConst::Const(10),
                ops: UnaryOps::Copy,
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Identifier(String::from("e")), 
                src2: IdentifierOrConst::Identifier(String::from("f")), 
                dst: String::from("c"), 
                ops: BinaryOps::Add, 
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Identifier(String::from("a")), 
                src2: IdentifierOrConst::Identifier(String::from("b")), 
                dst: String::from("d"), 
                ops: BinaryOps::Add, 
            }),
            Instruction::UnaryInst(UnaryInstruction {
                dst: String::from("d"),
                src:IdentifierOrConst::Identifier(String::from("d")),
                ops: UnaryOps::Neg,
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Identifier(String::from("a")), 
                src2: IdentifierOrConst::Identifier(String::from("b")), 
                dst: String::from("h"), 
                ops: BinaryOps::Add, 
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Identifier(String::from("e")), 
                src2: IdentifierOrConst::Identifier(String::from("f")), 
                dst: String::from("g"), 
                ops: BinaryOps::Add, 
            }),
        ]
    }
}
/// Create a fake basic block contain operation below:
/// - `a = 10 + b`
/// - `b = 10 + a`
/// - `c = 10 + b` 
/// - `d = 10 + a`
pub fn create_fake_basic_block_3() -> BasicBlock {
    BasicBlock {
        id : 0,
        predecessor: Vec::new(),
        successor: Vec::new(),
        instructions: vec![
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Const(10),
                src2: IdentifierOrConst::Identifier(String::from("b")), 
                dst: String::from("a"), 
                ops: BinaryOps::Add, 
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Const(10),
                src2: IdentifierOrConst::Identifier(String::from("a")), 
                dst: String::from("b"), 
                ops: BinaryOps::Add, 
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Const(10),
                src2: IdentifierOrConst::Identifier(String::from("b")), 
                dst: String::from("c"), 
                ops: BinaryOps::Add, 
            }),
            Instruction::BinInst(BinaryInstruction { 
                src1: IdentifierOrConst::Const(10),
                src2: IdentifierOrConst::Identifier(String::from("a")), 
                dst: String::from("d"), 
                ops: BinaryOps::Add, 
            })
        ]
    }
}
/// create fake control flow
pub fn create_fake_control_flow() -> ControlFlow {
    // init each basic block
    let mut blocks = Vec::new();
    for i in 0..7 {
        blocks.push( BasicBlock {
            id : i,
            instructions: Vec::new(),
            predecessor: Vec::new(),
            successor: Vec::new(),
        } )
    }
    // connect for graph
    connect_block(0, 1, &mut blocks);
    connect_block(0, 2, &mut blocks);
    connect_block(1, 6, &mut blocks);
    connect_block(2, 3, &mut blocks);
    connect_block(2, 4, &mut blocks);
    connect_block(3, 5, &mut blocks);
    connect_block(4, 5, &mut blocks);
    connect_block(5, 6, &mut blocks);
    // create instructions

    ControlFlow { basic_block: blocks }
}