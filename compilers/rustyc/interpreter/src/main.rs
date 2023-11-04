
mod vm;
mod instruction;
mod register;

use instruction::*;

fn run_simple_loop_with_register() {
    // C code: {
    //    int sum = 0;
    //    for(int i = 0 ; i < 10; ++i) { sum += i; }
    // }
    // --------------
    // Label_init:
    //     immi r1 0
    // Label_cond:
    //     Lti, r1, 10
    //     Br  Label_body
    //     Jump Lable_finish
    // Label_body:
    //     Add r0, r1, r0
    // Label_post_op
    //     Addi, r1, r1, 1
    //     Jump Label_cond
    // Lable_finish
    // 
    let mut virtual_machine = vm::VM::new();
    // using R0 as sum, using R1 as i
    let instructions = vec![
        // Lable 1: init
        /* 0 */ Instruction::Addi(AddImmiInstruction { src: 1, dst: 1, value: 0 }),
        // Label 2: condition
        /* 1 */ Instruction::Lti(LessThanImmiInstruction { src: 1, value: 10 }),
        /* 2 */ Instruction::Br(BranchInstruction { address: 4, condition: 0 }),
        /* 3 */ Instruction::Jump(JumpInstruction { address: 7 }),
        // Label 3: body
        /* 4 */ Instruction::Add(AddInstruction { src1: 0, src2: 1, dst: 0 }),
        // Label 4: post operation
        /* 5 */ Instruction::Addi(AddImmiInstruction { src: 1, dst: 1, value: 1 }),
        /* 6 */ Instruction::Jump(JumpInstruction { address: 1 }),
        /* 7 */
    ];
    virtual_machine.execute_with_instruction(instructions, 0);
}

fn run_simple_loop_with_memory() {
    // C code:  {
    //   int sum = 0;
    //   for(int i = 0 ; i < 10; ++i) { sum += i; }
    // }
    // --------------
    // immi r0, 0,
    // str  sp, 0, r0
    // addi sp, sp, 1  ;; (fp + 0 is sum)
    // Label_init:
    //     immi r0, 0,
    //     str sp, 0, r0 ;; (fp + 1 is i)
    //     addi sp, sp, 1
    // Label_cond:
    //     ldr fp, 0, r0
    //     lti r0, 10
    //     Br  Label_body
    //     Jump Lable_finish
    // Label_body:
    //     ldr fp, 0, r0
    //     ldr fp, 1, r1
    //     Add r0, r1, r0
    //     str fp, 0, r0
    // Label_post_op
    //     ldr fp, 1, r0
    //     Addi, r0, r10, 1
    //     str   fp, 0, r0
    //     Jump Label_cond
    // Lable_finish:
    //    subi sp, sp, 2
    // 
    let mut virtual_machine = vm::VM::new();
    let instructions = vec![
        /* 0 */ Instruction::Immi(ImmiInstruction { dst: 0, value: 0 }),
        /* 1 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 2 */ Instruction::Addi( AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Label_init:
        /* 3 */ Instruction::Immi(ImmiInstruction { value: 0, dst: 0 }),
        /* 4 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 5 */ Instruction::Addi( AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // // Label_cond:
        /* 6 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 0 }),
        /* 7 */ Instruction::Lti(LessThanImmiInstruction { src: 0, value: 10 }),
        /* 8 */ Instruction::Br(BranchInstruction { address: 10, condition: 0 }),
        /* 9 */ Instruction::Jump(JumpInstruction { address: 18 }),
        // // Label_body:
        /* 10 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 0, dst: 0 }),
        /* 11 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 1 }),
        /* 11 */ Instruction::Add(AddInstruction { src1: 0, src2: 1, dst: 0 }),
        /* 13 */ Instruction::Str(StoreRegisterInstruction{ base: 15, offset: 0, src: 0 }),
        // // Label_post_op
        /* 14 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 0 }),
        /* 15 */ Instruction::Addi( AddImmiInstruction { src: 0, dst: 0, value: 1 }),
        /* 16 */ Instruction::Str(StoreRegisterInstruction{ base: 15, offset: 1, src: 0 }),
        /* 17 */ Instruction::Jump(JumpInstruction { address: 6 }),
        // Label_finish
        /* 18 */
    ];
    virtual_machine.execute_with_instruction(instructions, 0);
}


fn run_simple_function_call() {
    // int test_func() {
    //    int sum = 0;
    //    for(int i = 0 ; i < 10; ++i) { sum += i; }
    // }
    // int main() {
    //   int a = 10;    
    //   test_func();
    //   a += 10;
    // }
}

fn main() {
    run_simple_loop_with_memory();
}