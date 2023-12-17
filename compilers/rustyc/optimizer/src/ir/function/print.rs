/// This module implement the print method  for function ir to 
/// print out basic-blocks and instructions.
use crate::ir::function::*;
use crate::ir::value::*;
use crate::ir::instructions::*;

impl Function {
    pub fn print_to_string(&self) -> String {
        let mut output_code = String::new();
        // function name
        output_code.push_str("function ");
        output_code.push_str(&self.name);
        output_code.push_str(" (");
        let mut index = 0;
        for value in &self.params_value {
            let is_end = index == self.params_value.len() - 1;
            match self.values.get(value).unwrap() {
                ValueData::VirRegister(register) => {
                    output_code.push_str(&register);
                    output_code.push_str(" ");
                    let value_type = self.value_types.get(value).unwrap();
                    output_code.push_str(get_text_format_of_datatype(value_type));
                    if !is_end {
                        output_code.push_str(", ");
                    }
                }
                ValueData::Immi(_) => {}
            }
            index +=1;
        }
        output_code.push_str(") -> ");
        output_code.push_str(match self.return_type {
            Some(ref ir_type) => get_text_format_of_datatype(ir_type),
            None => "void",
        });
        output_code.push(' ');
        output_code.push_str("{\n");
        // blocks
        for (_ ,block) in &self.blocks {
            output_code.push_str(&block.name);
            output_code.push_str(":\n");
            for inst_id in &block.instructions {
                match self.instructions.get(inst_id) {
                    Some(inst) => self.print_inst(&mut output_code, inst),
                    None => {/* TODO: should panic, unreachable */}
                }
            }
        }
        // end of function block
        output_code.push_str("}\n");
        // print out value type
        // sort key frist
        let mut sorted_value_key: Vec<&Value> = self.values.keys().collect();
        let len = sorted_value_key.len();
        for i in 0..len {
            for j in 0..(len-i-1) {
                if sorted_value_key[j].0 > sorted_value_key[j+1].0 {
                    let temp = sorted_value_key[j+1];
                    sorted_value_key[j+1] = sorted_value_key[j];
                    sorted_value_key[j] = temp;
                }
            }
        }
        // 
        for value in sorted_value_key {
            match self.values.get(value).unwrap() {
                ValueData::VirRegister(register) => {
                    output_code.push_str(";;  ");
                    output_code.push_str(&register);
                    output_code.push_str(" -> ");
                    let value_type = self.value_types.get(value).unwrap();
                    output_code.push_str(get_text_format_of_datatype(value_type));
                    output_code.push('\n');
                }
                ValueData::Immi(_) => {}
            }
        }
        output_code
    }
    /// Private method for print a single instruction.
    pub fn print_inst(&self, output_code: &mut String, instruction: &InstructionData) {
        output_code.push_str("\t");
        match instruction {
            InstructionData::BitwiseAnd { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = bitwise-and {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::BitwiseOR { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = bitwise-or {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::ShiftLeft { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = shiftleft {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::ShiftRight { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = shiftright {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::LogicalAnd { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = logical-and {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::LogicalOR { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = logical-or {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Add { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = add {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Sub { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = sub {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Divide { opcode: _ , src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = divide {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Reminder { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = reminder {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Mul { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = mul {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Icmp { opcode: _, flag, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = icmp {} {} {:?}\n", dst_str, src1_str, src2_str, flag).as_str());
            }
            InstructionData::FAdd { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = fadd {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::FSub { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = fsub {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::FDivide { opcode: _ , src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = fdivide {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::FReminder { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = freminder {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::FMul { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = fmul {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Fcmp { opcode: _ , flag, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = icmp {} {} {:?}\n", dst_str, src1_str, src2_str, flag).as_str());
            }
            InstructionData::Neg { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = neg {}\n", dst_str, src_str).as_str());
            }
            InstructionData::LogicalNot { opcode: _ , src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = logical-not {}\n", dst_str, src_str).as_str());
            }
            InstructionData::BitwiseNot { opcode: _ , src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = bitwise-not {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToU8 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toU8 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToU16 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toU16 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToU32 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toU32 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToU64 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toU64 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToI16 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toI16 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToI32 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toI32 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToI64 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toI64 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToF32 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toF32 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToF64 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toF64 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToAddress { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = toAddress {}\n", dst_str, src_str).as_str());
            }
            InstructionData::Move { opcode: _ , src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!("{} = {}\n", dst_str, src_str).as_str());
            }
            InstructionData::LoadRegister { opcode: _, base, offset, dst, data_type } => {
                let base_str = get_text_format_of_value(self.values.get(base).unwrap());
                let offset = get_text_format_of_value(self.values.get(offset).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                let type_str = get_text_format_of_datatype(data_type);
                output_code.push_str(format!("load {} {} [{}, {}]\n", type_str, dst_str, base_str, offset).as_str());
            }
            InstructionData::StoreRegister { opcode: _, base, offset, src , data_type} => {
                let base_str = get_text_format_of_value(self.values.get(base).unwrap());
                let offset = get_text_format_of_value(self.values.get(offset).unwrap());
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let type_str = get_text_format_of_datatype(data_type);
                output_code.push_str(format!("store {} {} [{}, {}]\n", type_str, src_str, base_str, offset).as_str());
            }
            InstructionData::StackAlloc { opcode: _, size, align, dst , ir_type} => {
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                let size_str = get_text_format_of_value(self.values.get(size).unwrap());
                output_code.push_str(format!(
                    "{} = stackalloc {}, size {}, align {}\n", 
                    dst_str,
                    match ir_type {
                        Some(ir) => get_text_format_of_datatype(ir),
                        None => "aggregate",
                    }
                    , size_str, align, 
                ).as_str());
            }
            InstructionData::BrIf { opcode: _ , test, conseq, alter } => {
                let test_str = get_text_format_of_value(self.values.get(test).unwrap());
                output_code.push_str(format!("brif {}, block{}, block{}\n", test_str, conseq.0 , alter.0).as_str());
            }
            InstructionData::Jump { opcode: _, dst } => {
                output_code.push_str(format!("jump {}\n", dst.0).as_str());
            }
            InstructionData::Phi { opcode: _, dst, from } => {
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                let src1_str = get_text_format_of_value(self.values.get(&from[0].1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(&from[1].1).unwrap());
                output_code.push_str(format!("phi {}, block{} {}, block{} {}\n", dst_str,from[0].0.0, src1_str, from[1].0.0, src2_str).as_str());
            }
            InstructionData::Call { opcode: _, dst, name, params } => {
                if let Some(value) = dst  {
                    let dst_str = get_text_format_of_value(self.values.get(value).unwrap());
                    output_code.push_str(format!("{} = ", dst_str).as_str());
                }
                let mut param_string = String::from(name);
                param_string.push('(');
                let mut index = 0;
                for param in params {
                    param_string.push_str(get_text_format_of_value(self.values.get(param).unwrap()).as_str());
                    if index != params.len() -1 {
                        param_string.push_str(", ");
                    }
                    index += 1;
                }
                param_string.push_str(")\n");
                output_code.push_str(param_string.as_str());
            }
            InstructionData::Ret { opcode: _, value } => {
                let s = match value {
                    Some(val) => get_text_format_of_value(self.values.get(val).unwrap()),
                    None => String::from("void"),
                };
                output_code.push_str(format!("ret {}\n", s).as_str())
            }
            InstructionData::Comment(comment) => {
                output_code.push_str(";;");
                output_code.push_str(&comment);
                output_code.push_str("\n");
            }
        }
    }
}


/// Get the text format of a ValueData
pub fn get_text_format_of_value(value: &ValueData) -> String {
    match value {
        ValueData::Immi(immi) => {
            match immi {
                Immi::U8(data) => format!("{}",data),
                Immi::U16(data) => format!("{}", data),
                Immi::I16(data) => format!("{}", data),
                Immi::I32(data) => format!("{}", data),
                Immi::I64(data) => format!("{}", data),
                Immi::U32(data) => format!("{}", data),
                Immi::U64(data) => format!("{}", data),
                Immi::F32(data) => format!("{}", data),
                Immi::F64(data) => format!("{}", data),
            }
        }
        ValueData::VirRegister(register) => {
            register.clone()
        }
    }
}
/// Get the text format of a DataType
pub fn get_text_format_of_datatype(data_type: &IrValueType) -> &'static str {
    match data_type {
        IrValueType::Void => "void",
        IrValueType::U8 => "u8",
        IrValueType::U16 => "u16",
        IrValueType::F32 => "f32",
        IrValueType::F64 => "f64",
        IrValueType::I16 => "i16",
        IrValueType::I32 => "i32",
        IrValueType::I64 => "i64",
        IrValueType::U32 => "u32",
        IrValueType::U64 => "u64",
        IrValueType::Address => "address",
    }
}