mod test_utils;
use test_utils::{get_assets_folder_root_path, get_tests_folder_root_path, test_convert};
/// Get a path to `assets/c` in the repo
fn get_c_code_folder_path() -> String {
    String::from(
        get_assets_folder_root_path()
            .join("c/ir_convert/fun-call/")
            .as_os_str()
            .to_str()
            .unwrap(),
    )
}
/// Gte a path the ir result `./test/ir_convert`.
fn get_ir_test_result_folder_path() -> String {
    String::from(
        get_tests_folder_root_path()
            .join("ir_convert/fun-call/")
            .as_os_str()
            .to_str()
            .unwrap(),
    )
}
generate_converter_cases!(
    (basic_type_return_expr, "basic_type_return_expr"),
    (fib_array_dp, "fib_array_dp"),
    (fib_tail_call, "fib_tail_call"),
    (
        pointer_type_basic_type_return,
        "pointer_type_basic_type_return"
    ),
    (struct_type_return_expr, "struct_type_return_expr"),
    (void_return_expr, "void_return_expr"),
    (
        call_by_function_pointer_in_structure,
        "call_by_function_pointer_in_structure"
    ),
    (call_by_function_pointer, "call_by_function_pointer")
);
#[test]
fn test_pointer_to_pointer_basic_type_return() {
    //test_file_name("pointer_to_pointer_basic_type_return")
}
#[test]
fn test_struct_type_return_with_pointer() {
    // test_file_name("struct_type_return_with_pointer")
}
