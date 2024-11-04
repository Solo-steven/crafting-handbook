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
    - `estree/class-private-property/flow`: Flow is not gonna support.
    - `core/sourcetype-unambiguous/flow`: Flow is not gonna support.
    - `estree/class-method/flow`: Flow is not gonna support
    - `es2022/top-level-await-unambiguous`: unambiguous syntax is not gonna support.
    - `babel/comments/basic/async-do-expression`: async do is not gonna support.
    - `annex-b`, `v8intrinsic`, `experimental`, `placeholders`: WIP.
- `self-added` folder : some test case I hand write after reading spec.

## Some Ignore Test Case

Ignore those edge case, just too lazy to implement.

- `/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-4-hex`
- `/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-var-hex`
- `/babel/es2022/module-string-names/export-name-has-lone-surrogate`
- `/esprima/ES6/identifier/invalid_lone_surrogate`

