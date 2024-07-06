mod test_utils;
use test_utils::{get_assets_folder_root_path, get_tests_folder_root_path, test_convert};
/// Get a path to `assets/c` in the repo
fn get_c_code_folder_path() -> String {
    String::from(
        get_assets_folder_root_path().join("c/ir_convert/expr/").as_os_str().to_str().unwrap()
    )
}
/// Gte a path the ir result `./test/ir_convert`.
fn get_ir_test_result_folder_path() -> String {
    String::from(
        get_tests_folder_root_path().join("ir_convert/expr/").as_os_str().to_str().unwrap()
    )
}

generate_converter_cases!(
    (cast_basic_type_expr, "cast_basic_type_expr"),
    (size_of_array_basic_type_expr, "sizeof_array_basic_type_expr"),
    (should_cast_basic_type_implicitly, "should_cast_basic_type_implicitly"),
    (assignment_expr, "assignment_expr")
);