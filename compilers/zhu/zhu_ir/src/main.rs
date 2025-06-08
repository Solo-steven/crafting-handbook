pub mod builder;
pub mod entities;
pub mod formatter;
pub mod frontend;
pub mod pass;

use pass::analysis::cfg::cfg_anylysis;
use pass::analysis::rpo::revrese_post_order_analysis;
use pass::opt::lcm::lcm_opt;

use crate::pass::opt::lcm::later::later_expression_anaylsis;
use crate::pass::opt::lcm::used_expr::used_expression_anaylsis;
use formatter::format;
use frontend::parse;
use pass::FormatTable;

use crate::pass::opt::lcm::postponable_expr::postponable_expression_anaylsis;

fn main() {
    let source = "
func anticipate_exprs (reg0: i16, reg1: i16) {
block0:
  jump block1
block1:
  jump block2
block2:
  reg2 = add reg1 reg0
  jump block3
block3:
  jump block4
block4:
  brif reg0 block5 block6
block5:
  ret
block6:
  jump block2
}
";
    let anticipate_oscillate = "
func anticipate_oscillate (reg0: i16, reg1: i16) {
block0:
  reg2 = addi reg0 10
  jump block1
block1:
  reg3 = add reg2 reg1
  jump block2
block2:
  brif reg0 block3 block4
block3:
  reg4 = add reg2 reg1
  ret
block4:
  ret
}
";
    let lcm_complex_example = "
func lcm_complex_example (reg0: u8) {
block0:
  jump block1
block1:
  reg1 = addi reg0 10
  jump block2
block2:
  brif reg0 block3 block6
block3:
  jump block4
block4:
  brif reg0 block3 block5
block5:
  jump block8
block6:
  reg2 = add reg0 reg1
  jump block7
block7:
  jump block8
block8:
  reg3 = add reg0 reg1
  jump block9
block9:
  ret
}
";
    //     let lcm_complex_example = "
    // func lcm_complex_example (reg0: u8) {
    // block0:
    //   jump block1
    // block1:
    //   reg1 = addi reg0 10
    //   jump block2
    // block2:
    //   brif reg0 block3 block7
    // block3:
    //   jump block4
    // block4:
    //   brif reg0 block3 block5
    // block5:
    //   jump block6
    // block6:
    //   jump block10
    // block7:
    //   reg2 = add reg0 reg1
    //   jump block8
    // block8:
    //   jump block9
    // block9:
    //   jump block10
    // block10:
    //   reg3 = add reg0 reg1
    //   jump block11
    // block11:
    //   ret
    // }
    // ";
    let mut module = parse(lcm_complex_example);
    println!("{}", format(&module).as_str());
    let module_id = module.get_module_id_by_symbol("lcm_complex_example").unwrap();
    let func_id = module_id.to_func_id();
    let func = module.get_mut_function(func_id).unwrap();
    let cfg = cfg_anylysis(func);
    let rpo = revrese_post_order_analysis(&cfg);
    // let dom = domtree_analysis(&func, &cfg);
    lcm_opt(&cfg, &rpo, func);
    //
    // let func = module.get_function(func_id).unwrap();
    // println!("{}", anticipate_expr.format_table(func, &module));
    // println!("{}", will_be_available_expr.format_table(func, &module));
    // println!("{}", earliest_expr.format_table(func, &module));
    // println!("{}", postponable_expr.format_table(func, &module));
    // println!("{}", later_expr.format_table(func, &module));
    // println!("{}", used_expr.format_table(func, &module));

    println!("{}", format(&module).as_str());
}
