use std::alloc::{Layout, alloc, dealloc};

extern "C" {
    pub fn log_number(number: usize) ;
    pub fn js_function(ptr: *const u8, len: usize);
}

fn log_number_saft_wrapper(number: usize) {
    unsafe { log_number(number) }
}


macro_rules! memory_operation_failed {
    ($msg: expr) => {
        panic!("[RUST Failed]:{:?}", $msg)
    };
}
#[export_name = "alloc_memory"]
pub fn alloc_memory(size: usize, align: usize) -> *mut u8 {
    if let Ok(layout) = Layout::from_size_align(size, align) {
        unsafe{
            let ptr =  alloc(layout);
            return ptr;
        }
    }
    memory_operation_failed!("alloc memory failed")
}

#[export_name = "dealloc_memory"]
pub fn dealloc_memory(ptr: *mut u8, size: usize, align: usize) {
    if let Ok(layout) = Layout::from_size_align(size, align) {
        unsafe{
            dealloc(ptr, layout);
        }
        return;
    }
    memory_operation_failed!("dealloc memory failed")
}

pub fn function_take_string_reference(value_string : String) -> i32 {
    // do nothing
    match value_string.as_str() {
        "string-value-from-js" => {
            log_number_saft_wrapper(100)
        }
        _ => {
            log_number_saft_wrapper(10000);
        }
    }
    1
}
#[export_name = "function_call_js_with_string"]
pub fn function_call_js_with_string() {
    unsafe {
        let value = "Test string from rust";
        js_function(value.as_ptr(), value.len());
    }
}

#[export_name = "function_take_string_reference"]
pub fn function_take_string_reference_wrap(offset: usize, len: usize) {
    // get string from memory
    let arg0 = unsafe {
        let slice = ::std::slice::from_raw_parts(offset as *const u8, len);
        ::std::str::from_utf8_unchecked(slice)
    };
    // TODO: should i drop memory there ?
    // pass string to origin function
    function_take_string_reference(String::from(arg0));
}