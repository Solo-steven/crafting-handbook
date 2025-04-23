use crate::entities::function::Function;
use crate::entities::global_value::{GlobalValue, GlobalValueData};
use crate::entities::instruction::Instruction;
use crate::entities::r#type::{MemTypeData, ValueType};
use std::fmt;

impl Function {
    fn print_global(&self, global: &GlobalValue) -> String {
        let global_data = self.global_values.get(global).unwrap();
        let rhs_text = match global_data {
            GlobalValueData::Symbol { name } => {
                format!("sybmol {}", name)
            }
            GlobalValueData::Load { base, offset, ty } => {
                format!("load {} [{}, {}] ", self.print_value_type(ty), base.0, offset)
            }
            GlobalValueData::AddI { base, offset, ty } => {
                format!("addi {} [{}, {}] ", self.print_value_type(ty), base.0, offset)
            }
        };
        format!("@global {} = {}", global.0, rhs_text)
    }
    fn print_value_type(&self, ty: &ValueType) -> String {
        match ty {
            ValueType::U8 => format!("u8"),
            ValueType::U16 => format!("u16"),
            ValueType::U32 => format!("u32"),
            ValueType::U64 => format!("u64"),
            ValueType::I16 => format!("i16"),
            ValueType::I32 => format!("i32"),
            ValueType::I64 => format!("i64"),
            ValueType::F32 => format!("f32"),
            ValueType::F64 => format!("f64"),
            ValueType::Pointer => format!("ptr"),
            ValueType::Void => format!("void"),
            ValueType::Mem(mem_type) => {
                let mem_type_data = self.mem_type.get(&mem_type).unwrap();
                match mem_type_data {
                    MemTypeData::Array(array_type) => {
                        format!("[{} * {}]", array_type.size, self.print_value_type(&array_type.ty))
                    }
                    MemTypeData::Struct(struct_type) => {
                        format!("struct {}", struct_type.name)
                    }
                }
            }
        }
    }
    fn print_inst(&self, inst: &Instruction) -> String {
        let inst_data = self.entities.insts.get(inst).unwrap();
        let inst_result = self.entities.insts_result.get(inst);

        match inst_data {
            crate::entities::instruction::InstructionData::UnaryConst { opcode, constant } => {
                let constant_data = self.constants.get(constant).unwrap();
                format!("reg{} = {} {}", inst_result.unwrap().0, opcode, constant_data)
            }
            crate::entities::instruction::InstructionData::Unary { opcode, value } => {
                format!("reg{} = {} reg{}", inst_result.unwrap().0, opcode, value.0)
            }
            crate::entities::instruction::InstructionData::UnaryI { opcode, imm } => {
                format!("reg{} = {} reg{}", inst_result.unwrap().0, opcode, imm)
            }
            crate::entities::instruction::InstructionData::Binary { opcode, args } => {
                format!(
                    "reg{} = {} reg{} reg{}",
                    inst_result.unwrap().0,
                    opcode,
                    args[0].0,
                    args[1].0
                )
            }
            crate::entities::instruction::InstructionData::BinaryI { opcode, value, imm } => {
                format!("reg{} = {} reg{} {}", inst_result.unwrap().0, opcode, value.0, imm)
            }
            crate::entities::instruction::InstructionData::Move { opcode, src } => {
                format!("reg{} = {} reg{}", inst_result.unwrap().0, opcode, src.0)
            }
            crate::entities::instruction::InstructionData::Icmp { opcode, flag, args }
            | crate::entities::instruction::InstructionData::Fcmp { opcode, flag, args } => {
                format!(
                    "reg{} = {} {} reg{} reg{}",
                    inst_result.unwrap().0,
                    flag,
                    opcode,
                    args[0].0,
                    args[1].0
                )
            }
            crate::entities::instruction::InstructionData::Call { opcode, name, params } => {
                let func_sign = self.external_funcs.get(name).unwrap();
                let mut param_string = String::new();
                let mut index = 0;
                for param in params {
                    if index == 0 {
                        param_string.push_str(format!("reg{}", param.0).as_str());
                    } else {
                        param_string.push_str(format!(" ,reg{}", param.0).as_str());
                    }
                    index += 1;
                }
                format!("{}, @fun {} ()", opcode, func_sign.name)
            }
            crate::entities::instruction::InstructionData::Ret { opcode, value } => {
                if let Some(val) = value {
                    format!("{}, {}", opcode, val.0)
                } else {
                    format!("{}", opcode)
                }
            }
            crate::entities::instruction::InstructionData::Convert { opcode, src } => {
                format!("reg{} = {} reg{}", inst_result.unwrap().0, opcode, src.0)
            }
            crate::entities::instruction::InstructionData::StackAlloc { opcode, size, align } => {
                format!(
                    "reg{} = {}, size {}, align {}",
                    inst_result.unwrap().0,
                    opcode,
                    size.0,
                    align
                )
            }
            crate::entities::instruction::InstructionData::LoadRegister { opcode, base, offset } => {
                format!(
                    "reg{} = {}, [reg{} reg{}]",
                    inst_result.unwrap().0,
                    opcode,
                    base.0,
                    offset.0
                )
            }
            crate::entities::instruction::InstructionData::StoreRegister {
                opcode,
                base,
                offset,
                src,
            } => {
                format!("{}, reg{}, [reg{}, reg{}]", opcode, src.0, base.0, offset.0)
            }
            crate::entities::instruction::InstructionData::GlobalLoad { opcode, base, offset } => {
                format!(
                    "reg{} = {}, [@global{} reg{}]",
                    inst_result.unwrap().0,
                    opcode,
                    base.0,
                    offset.0
                )
            }
            crate::entities::instruction::InstructionData::GlobalStore {
                opcode,
                base,
                offset,
                src,
            } => {
                format!("{}, reg{}, [@global{}, reg{}]", opcode, src.0, base.0, offset.0)
            }
            crate::entities::instruction::InstructionData::BrIf {
                opcode,
                test,
                conseq,
                alter,
            } => {
                format!("{}, reg{},[block{}, block{}]", opcode, test.0, conseq.0, alter.0)
            }
            crate::entities::instruction::InstructionData::Jump { opcode, dst } => {
                format!("{}, block{}", opcode, dst.0)
            }
            crate::entities::instruction::InstructionData::Phi { opcode, from } => {
                let mut phi_string = String::new();
                let mut index = 0;
                for (block, value) in from {
                    if index == 0 {
                        phi_string.push_str(format!("block{} reg{}", block.0, value.0).as_str());
                    } else {
                        phi_string.push_str(format!(" , block{} reg{}", block.0, value.0).as_str());
                    }
                    index += 1;
                }
                format!("reg {} = {}, [{}]", inst_result.unwrap().0, opcode, phi_string)
            }
            crate::entities::instruction::InstructionData::Comment(s) => {
                format!(";;{}", s)
            }
        }
    }
}

impl fmt::Display for Function {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // write signature
        let mut arguments_string = String::new();
        for index in 0..self.signature.params.len() {
            let ty = &self.signature.params[index];
            let param = &self.entities.params[index];
            if index == 0 {
                arguments_string.push_str(format!("reg{}: {}", param.0, &self.print_value_type(ty)).as_str());
            } else {
                arguments_string.push_str(format!(", reg{}: {}", param.0, &self.print_value_type(ty)).as_str());
            }
        }
        write!(f, "function ({})", arguments_string)?;
        // write puncator for function body start
        write!(f, " {{\n")?;
        // write global
        for (global, _) in &self.global_values {
            write!(f, "  {}\n", self.print_global(global))?;
        }
        // write block and instruction
        for (block, _) in &self.entities.blocks {
            let block_layout = self.layout.blocks.get(block).unwrap();
            write!(f, "block{}:\n", block.0)?;
            let mut cur_inst = block_layout.first_inst.clone();
            loop {
                if let Some(inst) = cur_inst {
                    write!(f, "  {}\n", self.print_inst(&inst))?;
                    let inst_node = self.layout.insts.get(&inst).unwrap();
                    cur_inst = inst_node.next.clone()
                } else {
                    break;
                }
            }
        }
        // write puncator for function body end
        write!(f, "}}\n")?;
        Ok(())
    }
}
