use crate::ir::function::Function;
use crate::ir_optimizer::pass::DebuggerPass;
use super::GVNPass;

impl <'a> DebuggerPass for GVNPass<'a> {
    fn debugger(&self, _function: &Function) -> String {
        let mut output = String::new();
        output.push_str("Remove Inst:\n");
        for (block_id, inst) in &self.need_remove_insts {
            output.push_str(format!("block {}: {}\n", block_id.0, inst.0).as_str());
        }
        output
    }
}