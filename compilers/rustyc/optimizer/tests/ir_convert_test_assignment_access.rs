mod test_utils;
use test_utils::{get_assets_folder_root_path, get_tests_folder_root_path, test_convert};
/// Get a path to `assets/c` in the repo
fn get_c_code_folder_path() -> String {
    String::from(
        get_assets_folder_root_path()
            .join("c/ir_convert/assignment-and-access/")
            .as_os_str()
            .to_str()
            .unwrap(),
    )
}
/// Gte a path the ir result `./test/ir_convert`.
fn get_ir_test_result_folder_path() -> String {
    String::from(
        get_tests_folder_root_path()
            .join("ir_convert/assignment-and-access/")
            .as_os_str()
            .to_str()
            .unwrap(),
    )
}
generate_converter_cases!(
    (basic_type_assignment, "basic_type_assignment"),
    (basic_type_pointer_expr, "basic_type_pointer_expr"),
    (
        basic_type_pointer_to_pointer_assignment,
        "basic_type_pointer_to_pointer_assignment"
    ),
    (
        basic_type_pointer_to_pointer_expr,
        "basic_type_pointer_to_pointer_expr"
    ),
    (struct_type_assignment, "struct_type_assignment"),
    (struct_type_expr, "struct_type_expr"),
    (
        struct_type_pointer_assignment,
        "struct_type_pointer_assignment"
    ),
    (struct_type_pointer_expr, "struct_type_pointer_expr"),
    (struct_nested_assignment, "struct_nested_assignment"),
    (struct_nested_expr, "struct_nested_expr"),
    (
        struct_nested_pointer_assignment,
        "struct_nested_pointer_assignment"
    )
);
