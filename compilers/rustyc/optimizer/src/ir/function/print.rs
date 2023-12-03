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
        output_code.push_str(") ");
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
        output_code.push_str("}");
        output_code
    }
    /// Private method for print a single instruction.
    fn print_inst(&self, output_code: &mut String, instruction: &InstructionData) {
        output_code.push_str("\t");
        match instruction {
            InstructionData::Add { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = add {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Sub { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = sub {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Divide { opcode: _ , src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = divide {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Reminder { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = reminder {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::Icmp { opcode, flag, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = icmp {} {} {:?}\n", dst_str, src1_str, src2_str, flag).as_str());
            }
            InstructionData::FAdd { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = fadd {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::FSub { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = fsub {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::FDivide { opcode: _ , src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = fdivide {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::FReminder { opcode: _, src1, src2, dst } => {
                let src1_str = get_text_format_of_value(self.values.get(src1).unwrap());
                let src2_str = get_text_format_of_value(self.values.get(src2).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = freminder {} {}\n", dst_str, src1_str, src2_str).as_str());
            }
            InstructionData::ToU16 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = toU16 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToU32 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = toU32 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToI16 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = toI16 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToI32 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = toI32 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToI64 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = toI64 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToF32 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = toF32 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::ToF64 { opcode: _, src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = toF64 {}\n", dst_str, src_str).as_str());
            }
            InstructionData::Move { opcode: _ , src, dst } => {
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" {} = {}\n", dst_str, src_str).as_str());
            }
            InstructionData::LoadRegister { opcode: _, base, offset, dst, data_type } => {
                let base_str = get_text_format_of_value(self.values.get(base).unwrap());
                let offset = get_text_format_of_value(self.values.get(offset).unwrap());
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                let type_str = get_text_format_of_datatype(data_type);
                output_code.push_str(format!(" load {} {} [{}, {}]\n", type_str, dst_str, base_str, offset).as_str());
            }
            InstructionData::StoreRegister { opcode: _, base, offset, src , data_type} => {
                let base_str = get_text_format_of_value(self.values.get(base).unwrap());
                let offset = get_text_format_of_value(self.values.get(offset).unwrap());
                let src_str = get_text_format_of_value(self.values.get(src).unwrap());
                let type_str = get_text_format_of_datatype(data_type);
                output_code.push_str(format!(" store {} {} [{}, {}]\n", type_str, src_str, base_str, offset).as_str());
            }
            InstructionData::StackAlloc { opcode: _, size, align, dst } => {
                let dst_str = get_text_format_of_value(self.values.get(dst).unwrap());
                output_code.push_str(format!(" stackalloc {}, {}, {}\n", dst_str, size, align).as_str());
            }
            InstructionData::BrIf { opcode: _ , test, conseq, alter } => {
                let test_str = get_text_format_of_value(self.values.get(test).unwrap());
                output_code.push_str(format!("brif {}, block{}, block{}\n", test_str, conseq.0 , alter.0).as_str());
            }
            InstructionData::Jump { opcode: _, dst } => {
                output_code.push_str(format!(" jump {}\n", dst.0).as_str());
            }
            _ => {}
        }
    }
}


/// Get the text format of a ValueData
fn get_text_format_of_value(value: &ValueData) -> String {
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
fn get_text_format_of_datatype(data_type: &IrValueType) -> &'static str {
    match data_type {
        IrValueType::U8 => "u8",
        IrValueType::U16 => "u16",
        IrValueType::F32 => "f32",
        IrValueType::F64 => "f64",
        IrValueType::I16 => "i16",
        IrValueType::I32 => "i32",
        IrValueType::I64 => "i64",
        IrValueType::U32 => "u32",
        IrValueType::U64 => "u64",
    }
}