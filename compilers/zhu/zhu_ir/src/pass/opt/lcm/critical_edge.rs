use crate::builder::FunctionBuilder;
use crate::entities::block::Block;
use crate::entities::function::Function;
use crate::entities::instruction::InstructionData;

use crate::pass::analysis::cfg::ControlFlowGraph;
use crate::pass::analysis::rpo::RevresePostOrder;
use crate::pass::OptiPass;

pub fn critical_edge_opt(cfg: &ControlFlowGraph, rpo: &RevresePostOrder, function: &mut Function) {
    let mut pass = CritialEdgePass::new(cfg, rpo);
    pass.process(function);
}

pub struct CritialEdgePass<'a> {
    cfg: &'a ControlFlowGraph,
    rpo: &'a RevresePostOrder,
    edges: Vec<(Block, Block)>,
}

impl<'a> OptiPass for CritialEdgePass<'a> {
    fn process(&mut self, func: &mut Function) {
        self.run(func);
    }
}

impl<'a> CritialEdgePass<'a> {
    pub fn new(cfg: &'a ControlFlowGraph, rpo: &'a RevresePostOrder) -> Self {
        Self {
            cfg,
            rpo,
            edges: Default::default(),
        }
    }

    fn run(&mut self, function: &mut Function) {
        self.find_edges(function);
        self.insert_blocks(function);
    }
    /// find every edge lead to a bb that has multiple predecessor
    fn find_edges(&mut self, function: &Function) {
        for block in function.blocks() {
            let successors = self.cfg.get_successors(&block);
            for sucessor in successors {
                if self
                    .cfg
                    .get_predecessors(sucessor)
                    .iter()
                    .filter(|predeceesor| self.rpo.get_block_rpo(**predeceesor) < self.rpo.get_block_rpo(*sucessor))
                    .collect::<Vec<_>>()
                    .len()
                    > 1
                {
                    self.edges.push((block, *sucessor));
                }
            }
        }
    }
    /// insert block to the edges
    fn insert_blocks(&self, function: &mut Function) {
        for (src, dst) in &self.edges {
            let new_block = function.create_block();
            let mut builder = FunctionBuilder::new(function);
            builder.switch_to_block(new_block);
            builder.jump_inst(*dst);

            let last_inst_of_src = function.layout.get_last_inst(*src);
            match function.get_inst_data_mut(last_inst_of_src) {
                InstructionData::Jump { dst, .. } => *dst = new_block,
                InstructionData::BrIf { conseq, alter, .. } => {
                    if *conseq == *dst {
                        *conseq = new_block
                    }
                    if *alter == *dst {
                        *alter = new_block
                    }
                }
                _ => {
                    unreachable!()
                }
            }
        }
    }
}
