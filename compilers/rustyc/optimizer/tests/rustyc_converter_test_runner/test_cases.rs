use crate::TestCase;
use std::fs::read_dir;
use std::path::PathBuf;

fn dfs_find_test_cases_from_root(root: PathBuf, test_cases: &mut Vec<TestCase>) {
    if !root.is_dir() {
        panic!("[Internal Error]: The given root is not a dir. {:?}", root);
    }
    // already test root is dir or not, so we could unwrap.
    let files = read_dir(&root).unwrap();
    let c_file_path = root.clone().join("input.c");
    let output_file_path = root.clone().join("output.txt");
    let is_leaf_node = c_file_path.exists() && output_file_path.exists();
    if is_leaf_node {
        test_cases.push(TestCase {
            c_file_path,
            output_file_path,
        })
    } else {
        for pth in files {
            match pth {
                Ok(entry) => {
                    let entry_path = entry.path();
                    if entry_path.exists() && entry_path.is_dir() {
                        dfs_find_test_cases_from_root(entry_path, test_cases);
                    }
                }
                Err(_) => {}
            }
        }
    }
}

/// ### Read test case from given root
/// Test case file structure must be like following:
/// ```markdown
/// -- name_of_test_case
///   -> input.c
///   -> output.txt
/// ```
/// folder could be nested, but all the test case must be leaf node
/// of file structure.
pub fn read_test_cases_from_root(root: PathBuf) -> Vec<TestCase> {
    let mut test_cases = Vec::new();
    dfs_find_test_cases_from_root(root, &mut test_cases);
    test_cases
}
