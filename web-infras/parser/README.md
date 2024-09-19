# Web Infra Parser
JS/JSX parser written in Typescript.

## JS Test Fixture Folder structure
- `esprima` folder: test case from `esprima/test/fixture` folder in repo, skip following test case:
    - `tokenize`: move to token folder
    - `tolerant-parse`: not in scope.
    - `invalid-syntax`: WIP.
- `babel` folder : test case from `babel-parser/tests/fixtures` folder in babel monorepo, skip following test case:
    - `esprima`: Duplicate to esprima.
    - `tokens`: should move to token folder.
    - `typescript`: TS not in current scope.
    - `estree/typescript`: TS not in current scope.
    - `jsx/errors/_no-plugin-ts-*`: TS not in current scope.
    - `flow`: Flow is not gonna support.
    - `/babel/estree/class-private-property/flow`: Flow is not gonna support.
    - `/babel/core/sourcetype-unambiguous/flow`: Flow is not gonna support.
    - `/babel/estree/class-method/flow`: Flow is not gonna support
    - `es2022/top-level-await-unambiguous`: unambiguous syntax is not gonna support.
    - `annex-b`, `v8intrinsic`, `experimental`, `placeholders`: WIP.
- `self-added` folder : some test case I hand write after reading spec.