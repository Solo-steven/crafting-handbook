#[test]
fn test_basic_type_access_int() {
    
}

#[test]
fn test_basic_access_float() {

}
#[test]
fn test_simple_pointer_access() {

}
#[test]
fn test_pointer_to_pointer_access() {
    
}

#[test]
fn test_complex_struct_access() {

}

#[cfg(test)]
fn test_struct_access_by_member_and_dereference() {
    let linvess_code = "
    int main() {
        int a = 0, b = 8;
        a = a +b ;
        if (a > 2) {
            b = a;
        }else {
            a =b;
        }
        int c = a;
    }
    ";
}
