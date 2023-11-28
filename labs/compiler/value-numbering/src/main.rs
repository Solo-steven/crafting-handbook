mod value_numbering;
use lab_shared_data_structure::create_graph::{create_fake_basic_block_1, create_fake_basic_block_2, create_fake_basic_block_3};
use value_numbering::{local_value_numbering, Table};


fn main() {
    let mut block = create_fake_basic_block_1();
    local_value_numbering(&mut block, &mut Table::new());
    println!("{:?}", block);
    let mut block2 = create_fake_basic_block_2();
    local_value_numbering(&mut block2, &mut Table::new());
    println!("{:?}", block2);

    // let mut block3 = create_fake_basic_block_3();
    // local_value_numbering(&mut block3, &mut Table::new());
    // println!("{:?}", block3)

}