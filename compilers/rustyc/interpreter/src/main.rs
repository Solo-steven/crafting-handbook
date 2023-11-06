
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
    // _Start:
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
    // _Start:
    //     immi r0, 0,
    //     str  sp, 0, r0
    //     addi sp, sp, 1  ;; (fp + 0 is sum)
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


fn run_simple_func_call() {
    // C Code :
    // void test_func() {
    //    int sum = 0;
    //    for(int i = 0 ; i < 10; ++i) { sum += i; }
    // }
    // int main() {
    //   int a = 10;    
    //   test_func();
    //   a += 10;
    // }
    // =============================================
    // test_fun:
    //     immi r0, 0,
    //     str  sp, 0, r0
    //     addi sp, sp, 1  ;; (fp + 0 is sum)
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
    //    ret
    // _Start:
    //     immi, r0, 10
    //     str  sp, 0, r0  ;; declar a in fp + 0
    //     addi sp, sp, 1
    //     ;; prepare for function call
    //     str  sp, 0, ra  ;; store return_address
    //     addi sp, sp, 1  
    //     str  sp, 0, fp  ;; store frame pointer
    //     addi sp, sp, 1
    //     addi fp, sp, 0  ;; assign new fp
    //     jsr test_fun
    //     ;; restore from function call
    //     ldr  sp, -1, fp  ;; restore frame pointer
    //     subi sp, sp, 1  
    //     ldr  sp, -1, ra  ;; restore return address
    //     subi sp, sp, 1
    //     ;; other operaion
    //     ldr  fp, 0, r0
    //     addi r0, r0, 10
    //     str  fp, 0, r0
    // 
    let mut virtual_machine = vm::VM::new();
    let instructions = vec![
        //  _test_fun
        /* 0 */ Instruction::Immi(ImmiInstruction { dst: 0, value: 0 }),
        /* 1 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 2 */ Instruction::Addi( AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Label_init:
        /* 3 */ Instruction::Immi(ImmiInstruction { value: 0, dst: 0 }),
        /* 4 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 5 */ Instruction::Addi( AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Label_cond:
        /* 6 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 0 }),
        /* 7 */ Instruction::Lti(LessThanImmiInstruction { src: 0, value: 10 }),
        /* 8 */ Instruction::Br(BranchInstruction { address: 10, condition: 0 }),
        /* 9 */ Instruction::Jump(JumpInstruction { address: 18 }),
        // Label_body:
        /* 10 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 0, dst: 0 }),
        /* 11 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 1 }),
        /* 11 */ Instruction::Add(AddInstruction { src1: 0, src2: 1, dst: 0 }),
        /* 13 */ Instruction::Str(StoreRegisterInstruction{ base: 15, offset: 0, src: 0 }),
        // Label_post_op
        /* 14 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 0 }),
        /* 15 */ Instruction::Addi( AddImmiInstruction { src: 0, dst: 0, value: 1 }),
        /* 16 */ Instruction::Str(StoreRegisterInstruction{ base: 15, offset: 1, src: 0 }),
        /* 17 */ Instruction::Jump(JumpInstruction { address: 6 }),
        // Label_finish
        /* 18 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 2 }),
        /* 19 */ Instruction::Ret(RetInstruction{}),
        // _Start:
        /* 20 */ Instruction::Immi(ImmiInstruction { dst: 0, value: 0 }),
        /* 21 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 22 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // prepare for function call
        /* 23 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 13 }),
        /* 24 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 25 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 15 }),
        /* 26 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 27 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 15, value: 0 }),
        /* 28 */ Instruction::Jsr(JSRInstruction { adress: 0 }),
        // restore from function call
        /* 29 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 15 }),
        /* 30 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 31 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 13 }),
        /* 32 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        // other operation
        /* 33 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 0, dst: 0 }),
        /* 34 */ Instruction::Addi(AddImmiInstruction { src: 0, dst: 0, value: 10 }),
        /* 35 */ Instruction::Str(StoreRegisterInstruction { base: 15, offset: 0, src: 0 })
    ];
    virtual_machine.execute_with_instruction(instructions, 20);
}

fn run_return_value_call() {
    // C Code :
    // int test_func() {
    //    int sum = 0;
    //    for(int i = 0 ; i < 10; ++i) { sum += i; }
    //    return sum;
    // }
    // int main() {
    //   int a = 20;    
    //   a = a + test_func();
    // }
    // =============================================
    // test_fun:
    //     immi r0, 0,
    //     str  sp, 0, r0
    //     addi sp, sp, 1  ;; (fp + 0 is sum)
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
    //    ret
    // _Start:
    //     immi, r0, 10
    //     str  sp, 0, r0  ;; declar a in fp + 0
    //     addi sp, sp, 1
    //     ;; call convention -> store r0 ~ r8, store r9, r10 r11
    //     str sp, 0, r0
    //     addi sp, sp, 1
    //     str sp, 0, r1
    //     addi sp, sp, 1
    //     str sp, 0, r2
    //     addi sp, sp, 1
    //     str sp, 0, r3
    //     addi sp, sp, 1
    //     str sp, 0, r4
    //     addi sp, sp, 1
    //     str sp, 0, r5
    //     addi sp, sp, 1
    //     str sp, 0, r6
    //     addi sp, sp, 1
    //     str sp, 0, r7
    //     addi sp, sp, 1
    //     str sp, 0, r8
    //     addi sp, sp, 1
    //     str sp, 0, r9
    //     addi sp, sp, 1
    //     str sp, 0, r10
    //     addi sp, sp, 1
    //     str sp, 0, r11
    //     addi sp, sp, 1
    //     ;; prepare for function call
    //     str  sp, 0, ra  ;; store return_address
    //     addi sp, sp, 1  
    //     str  sp, 0, fp  ;; store frame pointer
    //     addi sp, sp, 1
    //     addi fp, sp, 0  ;; assign new fp
    //     jsr test_fun
    //     ;; restore from function call
    //     ldr  sp, -1, fp  ;; restore frame pointer
    //     subi sp, sp, 1  
    //     ldr  sp, -1, ra  ;; restore return address
    //     subi sp, sp, 1
    //     ;; call convention -> restore r0 ~ r8, restore argument to  r9, r10, r11
    //     ldr sp, 0, r11
    //     subi sp, sp, 1
    //     ldr sp, 0, r10
    //     subi sp, sp, 1
    //     ldr sp, 0, r9
    //     subi sp, sp, 1
    //     ldr sp, 0, r8
    //     subi sp, sp, 1
    //     ldr sp, 0, r7
    //     subi sp, sp, 1
    //     ldr sp, 0, r6
    //     subi sp, sp, 1
    //     ldr sp, 0, r5
    //     subi sp, sp, 1
    //     ldr sp, 0, r4
    //     subi sp, sp, 1
    //     ldr sp, 0, r3
    //     subi sp, sp, 1
    //     ldr sp, 0, r2
    //     subi sp, sp, 1
    //     ldr sp, 0, r1
    //     subi sp, sp, 1
    //     ldr sp, 0, r0
    //     subi sp, sp, 1
    //     ;; other operaion
    //     add r0, r12, r0
    //     str fp, 0, r0
    // 
    let mut virtual_machine = vm::VM::new();
    let instructions = vec![
        //  _test_fun
        /* 0 */ Instruction::Immi(ImmiInstruction { dst: 0, value: 0 }),
        /* 1 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 2 */ Instruction::Addi( AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Label_init:
        /* 3 */ Instruction::Immi(ImmiInstruction { value: 0, dst: 0 }),
        /* 4 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 5 */ Instruction::Addi( AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Label_cond:
        /* 6 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 0 }),
        /* 7 */ Instruction::Lti(LessThanImmiInstruction { src: 0, value: 10 }),
        /* 8 */ Instruction::Br(BranchInstruction { address: 10, condition: 0 }),
        /* 9 */ Instruction::Jump(JumpInstruction { address: 18 }),
        // Label_body:
        /* 10 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 0, dst: 0 }),
        /* 11 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 1 }),
        /* 11 */ Instruction::Add(AddInstruction { src1: 0, src2: 1, dst: 0 }),
        /* 13 */ Instruction::Str(StoreRegisterInstruction{ base: 15, offset: 0, src: 0 }),
        // Label_post_op
        /* 14 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 0 }),
        /* 15 */ Instruction::Addi( AddImmiInstruction { src: 0, dst: 0, value: 1 }),
        /* 16 */ Instruction::Str(StoreRegisterInstruction{ base: 15, offset: 1, src: 0 }),
        /* 17 */ Instruction::Jump(JumpInstruction { address: 6 }),
        // Label_finish
        /* 18 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 2 }),
                 Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 0, dst: 0 }),
        /* 19 */ Instruction::Addi(AddImmiInstruction{ src: 0, value: 0, dst: 12 }),
        /* 20 */ Instruction::Ret(RetInstruction{}),
        // _Start:
        /* 21 */ Instruction::Immi(ImmiInstruction { dst: 0, value: 20 }),
        /* 22 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 23 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Call convention
        /* 24 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 25 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 26 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 1 }),
        /* 27 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 28 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 2 }),
        /* 29 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 30 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 3 }),
        /* 31 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 32 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 4 }),
        /* 33 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 34 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 5 }),
        /* 35 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 36 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 6 }),
        /* 37 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 38 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 7 }),
        /* 39 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 40 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 8 }),
        /* 41 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 42 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 9 }),
        /* 43 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 44 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 10 }),
        /* 45 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 46 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 11 }),
        /* 47 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // prepare for function call
        /* 48 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 13 }),
        /* 49 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 50 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 15 }),
        /* 51 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 52 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 15, value: 0 }),
        // Call function
        /* 53 */ Instruction::Jsr(JSRInstruction { adress: 0 }),
        // restore from function call
        /* 54 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 15 }),
        /* 55 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 56 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 13 }),
        /* 57 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        // Call convetion
        /* 58 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 11 }),
        /* 59 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 60 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 10 }),
        /* 61 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 62 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 9 }),
        /* 63 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 64 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 8 }),
        /* 65 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 66 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 7 }),
        /* 67 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 68 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 6 }),
        /* 69 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 70 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 5 }),
        /* 71 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 72 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 4 }),
        /* 73 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 74 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 3 }),
        /* 75 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 76 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 2 }),
        /* 77 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 78 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 1 }),
        /* 79 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 80 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 81 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        // other operation
        /* 33 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 0, dst: 0 }),
        /* 34 */ Instruction::Add(AddInstruction { src1: 0, src2: 12, dst: 0}),
        /* 35 */ Instruction::Str(StoreRegisterInstruction { base: 15, offset: 0, src: 0 })
    ];
    virtual_machine.execute_with_instruction(instructions, 22);
}

fn run_argument_func() {
    // C Code :
    // int test_func(times) {
    //    int sum = 0;
    //    for(int i = 0 ; i < times; ++i) { sum += i; }
    //    return sum;
    // }
    // int main() {
    //   int a = 20;    
    //   a = a + test_func(10);
    // }
    // =============================================
    // test_fun:
    //     immi r0, 0,
    //     str  sp, 0, r0
    //     addi sp, sp, 1  ;; (fp + 0 is sum)
    // Label_init:
    //     immi r0, 0,
    //     str sp, 0, r0 ;; (fp + 1 is i)
    //     addi sp, sp, 1
    // Label_cond:
    //     ldr fp, 0, r0
    //     lt r0, r9
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
    //    ret
    // _Start:
    //     immi, r0, 10
    //     str  sp, 0, r0  ;; declar a in fp + 0
    //     addi sp, sp, 1
    //     ;; call convention -> store r0 ~ r8, store r9, r10 r11
    //     str sp, 0, r0
    //     addi sp, sp, 1
    //     str sp, 0, r1
    //     addi sp, sp, 1
    //     str sp, 0, r2
    //     addi sp, sp, 1
    //     str sp, 0, r3
    //     addi sp, sp, 1
    //     str sp, 0, r4
    //     addi sp, sp, 1
    //     str sp, 0, r5
    //     addi sp, sp, 1
    //     str sp, 0, r6
    //     addi sp, sp, 1
    //     str sp, 0, r7
    //     addi sp, sp, 1
    //     str sp, 0, r8
    //     addi sp, sp, 1
    //     str sp, 0, r9
    //     addi sp, sp, 1
    //     str sp, 0, r10
    //     addi sp, sp, 1
    //     str sp, 0, r11
    //     addi sp, sp, 1
    //     ;; prepare for function call
    //     str  sp, 0, ra  ;; store return_address
    //     addi sp, sp, 1  
    //     str  sp, 0, fp  ;; store frame pointer
    //     addi sp, sp, 1
    //     addi fp, sp, 0  ;; assign new fp
    //     jsr test_fun
    //     ;; restore from function call
    //     ldr  sp, -1, fp  ;; restore frame pointer
    //     subi sp, sp, 1  
    //     ldr  sp, -1, ra  ;; restore return address
    //     subi sp, sp, 1
    //     ;; call convention -> restore r0 ~ r8, restore argument to  r9, r10, r11
    //     ldr sp, 0, r11
    //     subi sp, sp, 1
    //     ldr sp, 0, r10
    //     subi sp, sp, 1
    //     ldr sp, 0, r9
    //     subi sp, sp, 1
    //     ldr sp, 0, r8
    //     subi sp, sp, 1
    //     ldr sp, 0, r7
    //     subi sp, sp, 1
    //     ldr sp, 0, r6
    //     subi sp, sp, 1
    //     ldr sp, 0, r5
    //     subi sp, sp, 1
    //     ldr sp, 0, r4
    //     subi sp, sp, 1
    //     ldr sp, 0, r3
    //     subi sp, sp, 1
    //     ldr sp, 0, r2
    //     subi sp, sp, 1
    //     ldr sp, 0, r1
    //     subi sp, sp, 1
    //     ldr sp, 0, r0
    //     subi sp, sp, 1
    //     ;; other operaion
    //     add r0, r12, r0
    //     str fp, 0, r0
    // 
    let mut virtual_machine = vm::VM::new();
    let instructions = vec![
        //  _test_fun
        /* 0 */ Instruction::Immi(ImmiInstruction { dst: 0, value: 0 }),
        /* 1 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 2 */ Instruction::Addi( AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Label_init:
        /* 3 */ Instruction::Immi(ImmiInstruction { value: 0, dst: 0 }),
        /* 4 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 5 */ Instruction::Addi( AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Label_cond:
        /* 6 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 0 }),
        /* 7 */ Instruction::Lt(LessThanInstruction { src1: 0, src2: 9 }),
        /* 8 */ Instruction::Br(BranchInstruction { address: 10, condition: 0 }),
        /* 9 */ Instruction::Jump(JumpInstruction { address: 18 }),
        // Label_body:
        /* 10 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 0, dst: 0 }),
        /* 11 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 1 }),
        /* 11 */ Instruction::Add(AddInstruction { src1: 0, src2: 1, dst: 0 }),
        /* 13 */ Instruction::Str(StoreRegisterInstruction{ base: 15, offset: 0, src: 0 }),
        // Label_post_op
        /* 14 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 1, dst: 0 }),
        /* 15 */ Instruction::Addi( AddImmiInstruction { src: 0, dst: 0, value: 1 }),
        /* 16 */ Instruction::Str(StoreRegisterInstruction{ base: 15, offset: 1, src: 0 }),
        /* 17 */ Instruction::Jump(JumpInstruction { address: 6 }),
        // Label_finish
        /* 18 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 2 }),
                 Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 0, dst: 0 }),
        /* 19 */ Instruction::Addi(AddImmiInstruction{ src: 0, value: 0, dst: 12 }),
        /* 20 */ Instruction::Ret(RetInstruction{}),
        // _Start:
        /* 21 */ Instruction::Immi(ImmiInstruction { dst: 0, value: 20 }),
        /* 22 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 23 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Call convention
        /* 24 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 25 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 26 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 1 }),
        /* 27 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 28 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 2 }),
        /* 29 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 30 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 3 }),
        /* 31 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 32 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 4 }),
        /* 33 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 34 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 5 }),
        /* 35 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 36 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 6 }),
        /* 37 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 38 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 7 }),
        /* 39 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 40 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 8 }),
        /* 41 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 42 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 9 }),
        /* 43 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 44 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 10 }),
        /* 45 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 46 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 11 }),
        /* 47 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // Pass argument
                 Instruction::Immi(ImmiInstruction{ dst:1, value: 3 }),
                 Instruction::Addi(AddImmiInstruction { src: 1, value: 0, dst: 9 }),
        // prepare for function call
        /* 48 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 13 }),
        /* 49 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 50 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 15 }),
        /* 51 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 52 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 15, value: 0 }),
        // Call function
        /* 53 */ Instruction::Jsr(JSRInstruction { adress: 0 }),
        // restore from function call
        /* 54 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 15 }),
        /* 55 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 56 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 13 }),
        /* 57 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        // Call convetion
        /* 58 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 11 }),
        /* 59 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 60 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 10 }),
        /* 61 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 62 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 9 }),
        /* 63 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 64 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 8 }),
        /* 65 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 66 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 7 }),
        /* 67 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 68 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 6 }),
        /* 69 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 70 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 5 }),
        /* 71 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 72 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 4 }),
        /* 73 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 74 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 3 }),
        /* 75 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 76 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 2 }),
        /* 77 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 78 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 1 }),
        /* 79 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 80 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 0 }),
        /* 81 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        // other operation
        /* 33 */ Instruction::Ldr(LoadRegisterInstruction { base: 15, offset: 0, dst: 0 }),
        /* 34 */ Instruction::Add(AddInstruction { src1: 0, src2: 12, dst: 0}),
        /* 35 */ Instruction::Str(StoreRegisterInstruction { base: 15, offset: 0, src: 0 })
    ];
    virtual_machine.execute_with_instruction(instructions, 22);
}

fn run_fib_recursion() {
    let mut virtual_machine = vm::VM::new();
    let instructions = vec![
        // _f
        /* 0 */ Instruction::Eqi(EqualImmiInstruction { src: 9, value: 0 }),
        /* 1 */ Instruction::Br(BranchInstruction { address: 5, condition: 0 }),
        /* 2 */ Instruction::Eqi(EqualImmiInstruction { src: 9, value: 1 }),
        /* 3 */ Instruction::Br(BranchInstruction { address: 5, condition: 0 }),
        /* 4 */ Instruction::Jump(JumpInstruction{ address: 7 }),
        // _f_base_case:
        /* 5 */ Instruction::Immi(ImmiInstruction { dst: 12, value: 1 }),
        /* 6 */ Instruction::Ret(RetInstruction{}),
        // _f_general_case:
        // call conventional for f(n-1)
        /* 7 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 8 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 9 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 1 }),
        /* 10 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 11 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 2 }),
        /* 12 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 13 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 3 }),
        /* 14 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 15 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 4 }),
        /* 16 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 17 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 5 }),
        /* 18 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 19 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 6 }),
        /* 20 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 21 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 7 }),
        /* 22 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 23 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 8 }),
        /* 24 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 25 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 9 }),
        /* 26 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 27 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 10 }),
        /* 28 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 29 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 11 }),
        /* 30 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // prepare for function call
        /* 31 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 13 }),
        /* 32 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 33 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 15 }),
        /* 34 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 35 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 15, value: 0 }),
        // pass arugment to next functuon call
        /* 36 */ Instruction::Subi(SubiInstruction { src:9, dst:9, value:1 }),
        // function call
        /* 37 */ Instruction::Jsr(JSRInstruction { adress: 0 }),
        // restore from function call
        /* 38 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 15 }),
        /* 39 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 40 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 13 }),
        /* 41 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 2 }),
        // Call convetion
        /* 42 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 11 }),
        /* 43 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 44 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 10 }),
        /* 45 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 46 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 9 }),
        /* 47 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 48 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 8 }),
        /* 49 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 50 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 7 }),
        /* 51 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 52 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 6 }),
        /* 53 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 54 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 5 }),
        /* 55 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 56 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 4 }),
        /* 57 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 58 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 3 }),
        /* 59 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 60 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 2 }),
        /* 61 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 62 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 1 }),
        /* 63 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 64 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 0 }),
        // restore f(n-1) in r0
        /* 66 */  Instruction::Addi(AddImmiInstruction{ src: 12, dst: 0, value: 0}),
        // call convenction for f(n-2)
        /* 67 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 68 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 69 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 1 }),
        /* 70 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 71 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 2 }),
        /* 72 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 73 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 3 }),
        /* 74 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 75 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 4 }),
        /* 76 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 77 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 5 }),
        /* 78 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 79 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 6 }),
        /* 80 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 81 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 7 }),
        /* 82 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 83 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 8 }),
        /* 84 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 85 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 9 }),
        /* 86 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 87 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 10 }),
        /* 88 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 89 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 11 }),
        /* 90 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // prepare for function call
        /* 91 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 13 }),
        /* 92 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 93 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 15 }),
        /* 94 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 95 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 15, value: 0 }),
        // pass arugment to next functuon call
        /* 96 */ Instruction::Subi(SubiInstruction { src:9, dst:9, value:2 }),
        // function call
        /* 97 */ Instruction::Jsr(JSRInstruction { adress: 0 }),
        // restore from function call
        /* 98 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 15 }),
        /* 99 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 100 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 13 }),
        /* 101 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 2 }),
        // Call convetion
        /* 102 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 11 }),
        /* 103 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 104 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 10 }),
        /* 105 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 106 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 9 }),
        /* 106 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 107 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 8 }),
        /* 108 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 109 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 7 }),
        /* 110 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 111 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 6 }),
        /* 112 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 113 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 5 }),
        /* 114 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 115 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 4 }),
        /* 116 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 117 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 3 }),
        /* 118 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 119 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 2 }),
        /* 120 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 121 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 1 }),
        /* 122 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 123 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 0 }),
        // store f(n-2) in r1
        /* 125 */  Instruction::Addi(AddImmiInstruction{ src: 12, dst: 1, value: 0}),
        // return f(n-1) + f(n-2)
        /* 126 */ Instruction::Add(AddInstruction { src1: 1, src2: 0, dst: 12 }),
        /* 127 */ Instruction::Ret(RetInstruction{}),
        // __Start:
        // call convenction for f(3)
        /* 128 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 0 }),
        /* 129 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 130 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 1 }),
        /* 131 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 132 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 2 }),
        /* 133 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 134 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 3 }),
        /* 135 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 136 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 4 }),
        /* 137 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 138 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 5 }),
        /* 139 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 140 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 6 }),
        /* 141 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 142 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 7 }),
        /* 143 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 144 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 8 }),
        /* 145 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 146 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 9 }),
        /* 147 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 148 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 10 }),
        /* 149 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 150 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 11 }),
        /* 151 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        // prepare for function call
        /* 152 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 13 }),
        /* 153 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 154 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 15 }),
        /* 155 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 14, value: 1 }),
        /* 156 */ Instruction::Addi(AddImmiInstruction { src: 14, dst: 15, value: 0 }),
        // pass arugment to f(3)
        /* 156 */ Instruction::Immi(ImmiInstruction {dst: 9, value: 2}),
        // function call
        /* 157 */ Instruction::Jsr(JSRInstruction { adress: 0 }),
        // restore from function call
        /* 158 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 15 }),
        /* 159 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 160 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: -1, dst: 13 }),
        /* 161 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 2 }),
        // Call convetion
        /* 162 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 11 }),
        /* 163 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 164 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 10 }),
        /* 165 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 166 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 9 }),
        /* 167 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 168 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 8 }),
        /* 169 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 170 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 7 }),
        /* 171 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 172 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 6 }),
        /* 173 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 174 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 5 }),
        /* 175 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 176 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 4 }),
        /* 177 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 178 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 3 }),
        /* 179 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 190 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 2 }),
        /* 181 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 182 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 1 }),
        /* 183 */ Instruction::Subi(SubiInstruction { src: 14, dst: 14, value: 1 }),
        /* 184 */ Instruction::Ldr(LoadRegisterInstruction { base: 14, offset: 0, dst: 0 }),
        // store f(3) in a
        /* 185 */ Instruction::Str(StoreRegisterInstruction { base: 14, offset: 0, src: 12 }),

    ];
    virtual_machine.execute_with_instruction(instructions, 128);
}

fn main() {
    run_fib_recursion();
}