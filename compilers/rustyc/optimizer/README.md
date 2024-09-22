# RustyC IR 

This crate contain IR definition of RustyC, IR Converter and Optimizer.


### IR Structure



### Test Runner Structure

Since we need traversal all folder for reading C code of test case, i create a custom test runner that
can traverse folder and test all test structure according to folder structure.

In the other hand, because some of test case need using function to create IR for optimizer, IR optimizer
test runner still using rust build-in test runner.


