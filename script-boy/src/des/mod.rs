mod table;
use table::*;

pub fn  initial_permutation(plain_text: &[u8;64]) -> [u8;64] {
    let mut code : [u8;64] = [1;64];
    for index in 0..64 {
        let ip_table_index = IP_TABLE[index]-1;
        let plain_text_code = plain_text[ip_table_index as usize];
        code[index] = plain_text_code;
    }
    return code;
}

pub fn generate_keys(original_key: &[u8;64]) -> [[u8;48]; 16] {
    let mut keys: [[u8;48]; 16] = [[0;48];16];
    let mut current_key = initial_mapping_key(original_key);
    for time in 0..16 {
        shfit_key(&mut current_key, SHFIT_TABLE[time]);
        keys[time] = collapse_key(&current_key);
    }
    return keys;
}

fn initial_mapping_key(original_key: &[u8;64]) -> [u8;56] {
    let mut code : [u8;56] = [1;56];
    for index in 0..56 {
        let kp_index = KP_TABLE[index]-1;
        let original_key_code = original_key[kp_index as usize];
        code[index] = original_key_code
    }
    return code;
}

pub fn collapse_key(key:&[u8;56] ) ->  [u8;48] {
    let mut collapsed_key: [u8;48] = [0;48];
    for index in 0..48 {
        let cp_index = CP_TABLE[index]-1;
        collapsed_key[index] = key[cp_index as usize];
    }
    return collapsed_key;
}

pub fn shfit_key(key: &mut [u8;56], shfit_bit: u8) {
    // lower part shift
    for index in (28-shfit_bit)..28 {
        key[index as usize] = key[(28-1-index) as usize]
    }
    for index in 0..(28- shfit_bit) {
        key[index as usize] = key[(index+shfit_bit) as usize];
    }
    // highter part shift
    for index in (56-shfit_bit)..56 {
        key[index as usize] = key[(56-1-index + 28) as usize]
    }
    for index in 28..(56- shfit_bit) {
        key[index as usize] = key[(index+shfit_bit) as usize];
    }
}

pub fn helper_bit_key_to_hex(key: &[u8;48]) {
    let mut index: usize = 0;
    let mut hex_code: [u8;12] = [0;12];
    loop {
        if index >= 48  {
            break;
        }
        let mut hex_value = 0;
        hex_value += key[index] * 2 * 2 * 2;
        hex_value += key[index+1] * 2 * 2;
        hex_value += key[index+2] * 2 ;
        hex_value += key[index+3] ;
        hex_code[(index/4) as usize] = hex_value;
        index += 4;
    }
}
