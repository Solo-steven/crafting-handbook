mod des;

use crate::des::*;

fn main() {
    for i in (28-1)..28 {
        println!("{}, {}", i, 28-i);
    }
    for i in (56-1)..56 {
        println!("{} {}", i, 56-i+28);
    }
    let mut key:[u8;56] = [
        1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1,
        1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1
    ];
    shfit_key(&mut key, 1);
    helper_bit_key_to_hex(&collapse_key(&key));
}
