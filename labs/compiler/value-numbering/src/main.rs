mod create_graph;
mod value_numbering;
use create_graph::{create_fake_basic_block_1, create_fake_control_flow};
use value_numbering::{local_value_numbering, Table};


fn main() {
    let mut block = create_fake_basic_block_1();
    local_value_numbering(&mut block, &mut Table::new());
    println!("{:#?}", block);
}