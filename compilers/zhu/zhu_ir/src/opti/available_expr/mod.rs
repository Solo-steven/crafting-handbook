use std::collections::{HashMap, HashSet};

use crate::entities::block::Block;
use crate::entities::function::Function;
use crate::entities::instruction::Instruction;
use crate::entities::set_operation::intersection_sets;
use crate::opti::cfg::ControlFlowGraph;
use crate::opti::rpo::RevresePostOrder;
use crate::opti::AnalysisPass;

pub fn available_expression_analysis(
    func: &Function,
    cfg: &ControlFlowGraph,
    rpo: &RevresePostOrder,
) -> AvailableExpression {
    let mut pass = AvailableExpressionPass::new(cfg, rpo);
    pass.process(func)
}
pub struct AvailableExpression {
    downward_exposed_expr: HashMap<Block, HashSet<Instruction>>,
    avail_expr_in: HashMap<Block, HashSet<Instruction>>,
    avail_expr_out: HashMap<Block, HashSet<Instruction>>,
}

impl AvailableExpression {
    pub fn new() -> Self {
        Self {
            downward_exposed_expr: Default::default(),
            avail_expr_in: Default::default(),
            avail_expr_out: Default::default(),
        }
    }
    /// Get availableOut set of given block
    pub fn get_available_out(&self, block: Block) -> &HashSet<Instruction> {
        self.avail_expr_out.get(&block).unwrap()
    }
}

pub struct AvailableExpressionPass<'a> {
    rpo: &'a RevresePostOrder,
    cfg: &'a ControlFlowGraph,
}

impl<'a> AnalysisPass<AvailableExpression> for AvailableExpressionPass<'a> {
    fn process(&mut self, func: &Function) -> AvailableExpression {
        let mut exprs = AvailableExpression::new();
        self.run(func, &mut exprs);
        exprs
    }
}

impl<'a> AvailableExpressionPass<'a> {
    /// Create a new available expression pass.
    pub fn new(cfg: &'a ControlFlowGraph, rpo: &'a RevresePostOrder) -> Self {
        Self { cfg, rpo }
    }
    /// Run fixed point iterative algorithm as forward data flow anaylsis.
    /// ```text
    /// avail_in = intersection of predecessors avail_out
    /// avail_out = avail_in & down_expose_expr
    /// ```
    fn run(&mut self, function: &Function, exprs: &mut AvailableExpression) {
        self.init_sets(function, exprs);
        self.compute_single_block_set(function, exprs);
        self.iter_flow_equation(exprs);
    }
    /// Init in and out set as forward data flow
    fn init_sets(&mut self, function: &Function, exprs: &mut AvailableExpression) {
        let all_insts: HashSet<Instruction> = function.insts().into_iter().collect();
        let entry = self.cfg.get_entry();
        for block in function.blocks() {
            if block == entry {
                exprs.avail_expr_in.insert(block, Default::default());
            } else {
                exprs.avail_expr_in.insert(block, HashSet::from(all_insts.clone()));
            };
            exprs.avail_expr_out.insert(block, Default::default());
        }
    }
    /// Get downward-exposed expression and expression kill set of block
    /// - Since our IR is SSA, it imply that:
    ///   1. there is no expression kill set, since we will not re-defined
    ///      a operand in SSA
    ///   2. every expression is downward-exposed, since expression will not
    ///      be kill in same block.
    fn compute_single_block_set(&mut self, function: &Function, exprs: &mut AvailableExpression) {
        for block in function.blocks() {
            exprs
                .downward_exposed_expr
                .insert(block, function.get_insts_of_block(block).into_iter().collect());
        }
    }
    /// Iterative forward data flow algorithm of available expression.
    fn iter_flow_equation(&mut self, exprs: &mut AvailableExpression) {
        let mut is_changed = true;
        let blocks_in_rpo = self.rpo.get_blocks_in_rpo();
        while is_changed {
            is_changed = false;
            for block in &blocks_in_rpo {
                let predecessors = self.cfg.get_predecessors(block);
                let out_sets_of_predecessors: Vec<&HashSet<Instruction>> = predecessors
                    .iter()
                    .map(|predecessor| exprs.avail_expr_out.get(predecessor).unwrap())
                    .collect();
                let in_set_of_block = intersection_sets(out_sets_of_predecessors);
                let next_in_set_of_block =
                    intersection_sets(vec![&in_set_of_block, exprs.downward_exposed_expr.get(block).unwrap()]);
                let exit_in_set_of_block = exprs.avail_expr_out.get(block).unwrap();

                if next_in_set_of_block != *exit_in_set_of_block {
                    is_changed = true;
                    exprs.avail_expr_out.insert(*block, next_in_set_of_block);
                }
            }
        }
    }
}
