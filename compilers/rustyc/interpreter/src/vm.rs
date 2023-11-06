use crate::instruction::*;
use crate::register::Registers;
const MEMORY_MAX_SIZE: usize = 1024;

#[derive(Debug, Clone, PartialEq)]
pub struct VM {
    registers: Registers,
    program_counter: u32,
    memory: [u32; MEMORY_MAX_SIZE],
    condition_flags: u8,
}

impl VM {
    pub fn new() -> Self {
        Self {
            registers: Registers::new(),
            program_counter: 0,
            memory: [0; MEMORY_MAX_SIZE],
            condition_flags: 0,
        }
    }
    pub fn log(&mut self) {
        
    }
    pub fn execute_with_instruction(&mut self, instructions: Vec<Instruction>, base: usize) {
        self.program_counter = base as u32;
        //println!("{:?}", base);
        loop {
            if self.program_counter as usize >= instructions.len() {
                break;
            }
            let instruction = &instructions[self.program_counter as usize];
            //sleep(time::Duration::from_secs(1));
            self.program_counter += 1;
            match *instruction {
                // Arithmetic instructions
                Instruction::Immi(ref instruction) => self.immi_instruction(instruction),
                Instruction::Add(ref instruction ) => self.add_instruction(instruction),
                Instruction::Addi(ref instruction) => self.addi_instruction(instruction),
                Instruction::Subi(ref instruction) => self.subi_instruction(instruction),
                // Relation instructions.
                Instruction::Gt(ref instruction ) => self.gt_instruction(instruction),
                Instruction::Gti(ref instruction) => self.gti_instruction(instruction),
                Instruction::Gq(ref instruction) => self.gq_instruction(instruction),
                Instruction::Gqi(ref instruction) => self.gqi_instruction(instruction),
                Instruction::Lt(ref instruction) => self.lt_instruction(instruction),
                Instruction::Lti(ref instruction) => self.lti_instruction(instruction),
                Instruction::Lq(ref instruction) => self.lq_instruction(instruction),
                Instruction::Lqi(ref instruction) => self.lqi_instruction(instruction),
                Instruction::Eq(ref instruction) => self.eq_instruction(instruction),
                Instruction::Eqi(ref instruction) => self.eqi_instruction(instruction),
                Instruction::Neq(ref instruction) => self.neq_instruction(instruction),
                Instruction::Neqi(ref instruction) => self.neqi_instruction(instruction),
                // Control instructions
                Instruction::Jsr(ref instruction) => self.jsr_instruction(instruction),
                Instruction::Ret(ref instruction) => self.ret_instruction(instruction),
                Instruction::Br(ref instruction) => self.br_instruction(instruction),
                Instruction::Jump(ref instruction) => self.jump_instruction(instruction),
                // Memory related instructions
                Instruction::Ldr(ref instruction) => self.ldr_instruction(instruction),
                Instruction::Str(ref instruction) => self.str_instruction(instruction),
                _ => {}
            }
        }
    }
    /// Execute 'JSR' instruction
    fn jsr_instruction(&mut self, instruction: &JSRInstruction) {
        // set return address as program counter
        self.registers.set(13, self.program_counter);
        // goto jsr's target address
        self.program_counter = instruction.adress;
    }
    fn ret_instruction(&mut self, _instruction: &RetInstruction) {
        // jump to address that `return address` register store
        self.program_counter = self.registers.get(13);
    }
    fn br_instruction(&mut self, instruction: &BranchInstruction) {
        // get condition flag of compare result
        let condition_flag = self.condition_flags & 0b10000000;
        // branch if result is 1
        if condition_flag > 0 {
            self.program_counter = instruction.address;
        }
    }
    fn ldr_instruction(&mut self, instruction: &LoadRegisterInstruction) {
        // get address by base + offset
        let address = (self.registers.get(instruction.base as usize) as i32 + instruction.offset) as usize;
        // get value by memory[address]
        let value = self.memory[address];
        // set register to value
        self.registers.set(instruction.dst as usize, value);
    }
    fn str_instruction(&mut self, instruction: &StoreRegisterInstruction) {
        // get address by base + offset
        let address = (self.registers.get(instruction.base as usize) as i32 + instruction.offset) as usize;
        // set memory by dst register
        self.memory[address] = self.registers.get(instruction.src as usize);
    }
    // Execute unconditional jump instuction
    fn jump_instruction(&mut self, instruction: &JumpInstruction) {
        self.program_counter = instruction.address;
    }
    /// Execute `IMMI` instruction 
    fn immi_instruction(&mut self, instruction: &ImmiInstruction) {
        self.registers.set(instruction.dst as usize,  instruction.value);
    }
    /// Execute `ADD` instruction
    fn add_instruction(&mut self, instruction: &AddInstruction) {
        let src1 = self.registers.get(instruction.src1 as usize);
        let src2 = self.registers.get(instruction.src2 as usize);
        self.registers.set(instruction.dst as usize, src1 + src2);
    }
    // Execute Addi instruction. `Addi` stand for addi 
    // format: `Addi <dst> <src> <const>` (dst = src + const)
    fn addi_instruction(&mut self, instruction: &AddImmiInstruction) {
        let src_value = self.registers.get(instruction.src as usize);
        self.registers.set(instruction.dst as usize, src_value + instruction.value);
    }
    fn subi_instruction(&mut self, instruction: &SubiInstruction) {
        let src_value = self.registers.get(instruction.src as usize);
        self.registers.set(instruction.dst as usize, src_value - instruction.value);
    }
    /// Execute `GT` instruction. `GT` stand for greate then (>)
    /// format: `GT <src1> <src2>` (src1 > src2)
    fn gt_instruction(&mut self, instruction: &GreaterThanInstruction) {
        let src1_value = self.registers.get(instruction.src1 as usize);
        let src2_value = self.registers.get(instruction.src2 as usize);
        if src1_value > src2_value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `GTI` instruction. `GTI` stand for great then immi (>)
    /// format: `GTI <src> <const>` (src > const)
    fn gti_instruction(&mut self, instruction: &GreaterThanImmiInstruction) {
        let src_value = self.registers.get(instruction.src as usize);
        if src_value > instruction.value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `GQ` instruction. `GQ` stand for great or equal (>=)
    /// format: `Gq <src1> <src2>`(src1 >= src2)
    fn gq_instruction(&mut self, instruction: &GreaterEqualInstruction) {
        let src1_value = self.registers.get(instruction.src1 as usize);
        let src2_value = self.registers.get(instruction.src2 as usize);
        if src1_value >= src2_value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `GQI` instruction, `GQI` instruction greate or equal to immi
    /// format: `Gqi <src> <const> (src >= const)`
    fn gqi_instruction(&mut self, instruction: &GreaterEqualImmiInstruction) {
        let src_value = self.registers.get(instruction.src as usize);
        if src_value > instruction.value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `LT` instruction. `LT` stand for less then (<)
    /// format: `LT <src1> <src2>` (src1 < src2)
    fn lt_instruction(&mut self, instruction: &LessThanInstruction) {
        let src1_value = self.registers.get(instruction.src1 as usize);
        let src2_value = self.registers.get(instruction.src2 as usize);
        if src1_value < src2_value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `LTI` instruction. `LTI` stand for less then immi (M)
    /// format: `LTI <src> <const>` (src < const)
    fn lti_instruction(&mut self, instruction: &LessThanImmiInstruction) {
        let src_value = self.registers.get(instruction.src as usize);
        if src_value < instruction.value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `Lq` instruction. `lq` stand for less or equal (>=)
    /// format: `lq <src1> <src2>`(src1 <= src2)
    fn lq_instruction(&mut self, instruction: &LessEqualInstruction) {
        let src1_value = self.registers.get(instruction.src1 as usize);
        let src2_value = self.registers.get(instruction.src2 as usize);
        if src1_value <= src2_value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `LQI` instruction, `LQI` instruction less or equal to immi
    /// format: `Lqi <src> <const> (src <= const)`
    fn lqi_instruction(&mut self, instruction: &LessEqualImmiInstruction) {
        let src_value = self.registers.get(instruction.src as usize);
        if src_value < instruction.value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `Eq` instruction. `eq` stand for equal (==)
    /// - format: `eq <src1> <src2>` (src1 == src2)
    fn eq_instruction(&mut self, instruction: &EqualInstruction) {
        let src1_value = self.registers.get(instruction.src1 as usize);
        let src2_value = self.registers.get(instruction.src2 as usize);
        if src1_value == src2_value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `Eqi` instruction. `Eqi` stand for equal to immi (==)
    /// - format: `eqi <src> <const>` (src == const)
    fn eqi_instruction(&mut self, instruction: &EqualImmiInstruction) {
        let src_value = self.registers.get(instruction.src as usize);
        if src_value == instruction.value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `neq` instruction. `neq` stand for not equal (!=)
    /// - format: `neq <src1> <src2>`(src1 != src2)
    fn neq_instruction(&mut self, instruction: &NonEqualInstruction) {
        let src1_value = self.registers.get(instruction.src1 as usize);
        let src2_value = self.registers.get(instruction.src2 as usize);
        if src1_value <= src2_value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
    /// Execute `neqi` instruction, `Neqi` stand for non-equal to immi (==)
    /// - format: `neqi <src> <const>` (src == const)
    fn neqi_instruction(&mut self, instruction: &NonEqualImmiInstruction) {
        let src_value = self.registers.get(instruction.src as usize);
        if src_value < instruction.value {
            self.condition_flags |= 0b10000000;
        }else {
            self.condition_flags &= 0b01111111;
        }
    }
}