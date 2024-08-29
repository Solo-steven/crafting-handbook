## Structure of this folder

This folder test case is test the `await` keyword use as identifier in 
1. functional Context
    - `async context`
    - `not async context`

2. source  with 
    - `script` mode, 
    - `strict` mode in script
    - `module` mode

3. the location of await keyword can divide into  part 
    - `func-expr-name` 
    - `func-expr-param-lhs`
    - `func-expr-param-lhs-pat`: like `{await}, {await: await}`
    - `func-expr-param-rhs`
    - `func-expr-param-rhs-pat`: like `{ name = await}`
    - `func-expr-body`
    - `func-declar-name` 
    - `func-declar-param-lhs`
    - `func-declar-param-rhs`
    - `func-declar-body`
    - `func-arrow-param-lhs` 
    - `func-arrow-param-rhs` 
    - `func-arrow-body`
    - `class-body`,
    - `class-compute-name`

So the enum will following below format:
```
(location(12)) * (source-type(3)) * (context(2)) * (parent-context(2)) 
```
