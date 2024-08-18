# Web Infra Parser
JS parser written in Typescript.

## JS Test Fixture Folder structure
- `esprima` folder: test case from `esprima/test/fixture` folder in repo, skip following test case:
    - `tokenize`: move to token folder
    - `tolerant-parse`: not in scope.
    - `invalid-syntax`: WIP.

- `babel` folder : test case from `babel-parser/tests/fixtures` folder in babel monorepo, skip following test case:
    - `typescript`: TS not in current scope.
    - `estree/typescript`: TS not in current scope.
    - `jsx`: WIP
    - `estree/JSX`: WIP.
    - `comment/decorators`: WIP
    - `flow`: Flow is not support.
    - `core/scope`: Sematic Scope Not in current scope.
    - `esprima`: Duplicate to esprima.
    - `tokens`: should move to token folder.
    - `es2022/top-level-await-unambiguous`: Will not support.
    - `annex-b`, `tokens`, `v8intrinsic`, `experimental`, `placeholders`: WIP.
- `model-checking` folder : some test case I hand write after reading spec, trying to enum all possible case accroding to production rules.
- `uncategory` folder: other test cases.