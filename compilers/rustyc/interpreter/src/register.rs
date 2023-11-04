//// Register struct, contain GPR and other register
/// 1. `R0 ~ R12` serve as general purpose register,
/// 2. `R13` serve as return address register, when call `RET`, machine would go back to address where `R13` store
/// 3. `R14` serve as stack pointer register, always pointer to next spac we can store. 
/// 4. `R15` serve as frame pointer register, store base address of current frame.
#[derive(Debug, Clone, PartialEq)]
pub struct Registers {
    gpr: [u32; 13],
    return_address: u32, // 13
    stack_pointer: u32,  // 14
    frame_pointer: u32,  // 15
}

impl Registers {
    pub fn new() -> Self{
        Self {
            gpr: [0;13],
            return_address: 0,
            stack_pointer: 0,
            frame_pointer: 0,
        }
    }
    pub fn get(&self, index: usize) -> u32 {
        match index {
            0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12  => self.gpr[index],
            13 => self.return_address,
            14 => self.stack_pointer,
            15 => self.frame_pointer,
            _ => panic!()
        }
    }
    pub fn set(&mut self, index: usize, value: u32) {
        match index {
            0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12  => self.gpr[index]  = value,
            13 => self.return_address = value,
            14 => self.stack_pointer = value,
            15 => self.frame_pointer = value,
            _ => panic!()
        };
    }
}
