import { readFile, writeFile } from "fs/promises";
import { getTestSuite } from "./helper/getTestCase";
import { runTestSuit } from "./helper/testRunner";
import { FailedTestCasesResult, PassTestCaseResult, SkipTestCaseResult, TestResult } from "./helper/type";
import chalk from "chalk";

const isUpdate = Boolean(process.env.TEST_UPDATE) || false;
const isVerbose = Boolean(process.env.TEST_VERBOSE) || false;
// const gate = Number(process.env.TEST_GATE) || .95;
// const isCI = Boolean(process.env.TEST_CI) || false;

const TempIgnoreCases: Set<string> = new Set([
  // === (feature) ban async of
  "/babel/es2021/for-async-of/forbidden",
  // === (feature) tokenize ??=
  "/babel/es2021/logical-assignment-operator/qq-equals",
  // === (feature) tokenze ?.3 vs ?.
  "/babel/es2020/optional-chaining/conditional-decimal",
  // === (To be verify) production rule problem (function can not in for loop ..etc)
  "/babel/es2015/generators/invalid-hanging",
  "/babel/es2015/generators/invalid-sloppy-function",
  "/babel/es2017/async-functions/invalid-inside-loop",
  "/babel/es2017/async-functions/invalid-generator-inside-loop",
  "/babel/es2015/uncategorised/331",
  "/esprima/statement/if/invalid-function-declaration1",
  "/esprima/statement/if/invalid-function-declaration3",
  "/esprima/statement/while/invalid-decl-async-fun",
  "/esprima/ES6/for-of/invalid-decl-cls",
  // === ?? dev success, but test failed
  "/esprima/expression/primary/literal/string/migrated_0017",
  "/esprima/expression/binary/multiline_string_literal",
  // ==== (feature) bigint literal problem
  "/babel/es2020/bigint/invalid-decimal",
  "/babel/es2020/bigint/invalid-e",
  "/babel/es2020/bigint/invalid-non-octal-decimal-int",
  "/babel/es2020/bigint/invalid-octal-legacy",
  "/babel/es2020/bigint/decimal-as-property-name",
  "/babel/es2020/bigint/hex-as-property-name",
  "/babel/estree/bigInt/basic",
  "/babel/es2020/bigint/valid-binary",
  "/babel/es2020/bigint/valid-hex",
  "/babel/es2020/bigint/valid-large",
  "/babel/es2020/bigint/valid-octal-new",
  "/babel/es2020/bigint/valid-small",
  // === (feature) legacy 00 problem
  "/babel/es2015/uncategorised/42",
  "/babel/es2015/uncategorised/3",
  "/babel/core/uncategorised/84",
  "/babel/core/uncategorised/83",
  "/babel/core/uncategorised/82",
  "/babel/core/uncategorised/355",
  "/babel/core/uncategorised/356",
  "/babel/core/uncategorised/543",
  "/babel/core/uncategorised/551",
  "/babel/core/uncategorised/553",
  "/babel/es2021/numeric-separator/valid-non-octal-fragments",
  "/babel/es2021/numeric-separator/valid-non-octal-exponents",
  "/esprima/expression/primary/literal/numeric/migrated_0018",
  "/esprima/expression/primary/literal/numeric/migrated_0019",
  "/esprima/expression/primary/literal/numeric/migrated_0020",
  "/esprima/expression/primary/literal/numeric/migrated_0021",
  "/esprima/expression/primary/literal/numeric/migrated_0022",
  "/esprima/expression/primary/literal/numeric/migrated_0023",
  "/esprima/expression/primary/literal/numeric/migrated_0024",
  "/esprima/ES6/arrow-function/migrated_0011",
  "/esprima/ES6/octal-integer-literal/migrated_0000",
  "/babel/es2015/regression/11183",
  // === (feature) Checking **unicode** in string and identifier and template string.
  "/babel/es2021/numeric-separator/invalid-unicode-2",
  "/babel/es2021/numeric-separator/invalid-hex",
  "/babel/es2021/numeric-separator/invalid-unicode",
  "/babel/es2021/numeric-separator/invalid-unicode-5",
  "/babel/es2021/numeric-separator/invalid-unicode-6",
  "/babel/es2021/numeric-separator/template-with-invalid-numeric-separator-in-code-point",
  "/esprima/es2018/template-literal-revision/not-escape-unicode",
  "/esprima/es2018/template-literal-revision/not-escape-unicode-code-point",
  "/esprima/es2018/template-literal-revision/span-not-escape-unicode",
  "/esprima/ES6/identifier/invalid_escaped_surrogate_pairs",
  "/esprima/ES6/identifier/invalid_id_smp",
  "/esprima/ES6/identifier/invalid_lone_surrogate",
  "/esprima/ES6/identifier/escaped_math_alef",
  "/esprima/ES6/identifier/escaped_math_dal_part",
  "/esprima/ES6/identifier/escaped_math_kaf_lam",
  "/esprima/ES6/identifier/escaped_math_zain_start",
  "/esprima/ES6/template-literals/octal-literal",
  "/esprima/ES6/template-literals/strict-octal-literal",
  "/babel/es2015/identifiers/invalid-escape-seq-null",
  "/babel/es2022/module-string-names/export-name-has-lone-surrogate",
  "/babel/es2015/template/error-after-newline",
  "/babel/es2015/uncategorised/216",
  "/babel/es2015/uncategorised/217",
  "/babel/es2015/uncategorised/218",
  "/babel/es2015/uncategorised/219",
  "/babel/es2015/uncategorised/220",
  "/babel/es2015/uncategorised/290",
  "/babel/es2015/uncategorised/319",
  "/babel/es2015/uncategorised/326",
  "/babel/es2015/uncategorised/327",
  "/esprima/expression/primary/keyword/invalid-escaped-null",
  // === (feature) Checking ***esc char*** in string and identifier and template string
  "/esprima/es2018/template-literal-revision/not-escape-8",
  "/esprima/es2018/template-literal-revision/not-escape-9",
  "/esprima/es2018/template-literal-revision/not-escape-hex",
  "/esprima/ES6/identifier/invalid-hex-escape-sequence",
  "/esprima/ES6/template-literals/invalid-escape",
  "/esprima/ES6/template-literals/invalid-hex-escape-sequence",
  "/babel/es2015/uncategorised/339",
  "/esprima/expression/primary/literal/string/invalid_escaped_hex",
  "/esprima/expression/primary/literal/string/invalid_hex",
  "/esprima/expression/primary/literal/regular-expression/migrated_0006",
  // === (feature) html comment, hashtag comment
  "/esprima/comment/migrated_0036",
  "/esprima/comment/migrated_0038",
  "/esprima/comment/migrated_0039",
  "/esprima/comment/migrated_0040",
  "/esprima/comment/migrated_0041",
  "/esprima/comment/migrated_0042",
  "/babel/core/uncategorised/343",
  "/babel/core/uncategorised/538",
  // === (feature) implement sourceType
  "/esprima/es2020/import.meta/log",
  "/esprima/es2020/import.meta/log-module",
  "/esprima/ES6/identifier/invalid_expression_await",
  "/esprima/ES6/identifier/invalid_function_await",
  "/esprima/ES6/identifier/invalid_var_await",
  "/esprima/ES6/identifier/module_await",
  "/esprima/ES6/program/script/invalid-export-declaration",
  "/esprima/ES6/program/script/invalid-import-declaration",
  "/esprima/ES6/program/module/invalid-with",
  "/esprima/ES6/program/module/invalid-delete",
  "/babel/es2015/destructuring/binding-arguments-module",
  "/babel/es2020/import-meta/error-in-script",
  "/babel/es2015/uncategorised/367",
  "/babel/es2015/uncategorised/365",
  "/babel/es2015/uncategorised/363",
  "/babel/es2015/uncategorised/361",
  "/babel/es2015/uncategorised/334",
  "/babel/es2015/uncategorised/359",
  "/babel/es2022/top-level-await-module/export-default",
  "/babel/es2022/top-level-await-module/for-await",
  "/babel/es2022/top-level-await-module/inside-block",
  "/babel/es2022/top-level-await-module/inside-property-key",
  "/babel/es2022/top-level-await-module/top-level",
  // === (feature) top level await
  "/babel/es2017/async-functions/allow-await-outside-function",
  // === (feature) duplicate proto property
  "/esprima/ES6/object-initialiser/invalid-proto-getter-literal-identifier",
  "/esprima/ES6/object-initialiser/invalid-proto-identifier-literal",
  "/esprima/ES6/object-initialiser/invalid-proto-identifiers",
  "/esprima/ES6/object-initialiser/invalid-proto-literal-identifier",
  "/esprima/ES6/object-initialiser/invalid-proto-literals",
  "/esprima/ES6/object-initialiser/invalid-proto-setter-literal-identifier",
  "/babel/es2015/duplicate-proto/in-new-expression",
  "/babel/es2015/duplicate-proto/with-assignment-expression",
  "/babel/es2015/duplicate-proto/without-assignment-expression",
  "/babel/es2017/async-call/parenthesized-argument-object-double-proto",
  "/babel/es2015/uncategorised/349",
  // === (dunplicate construcotr)
  "/babel/es2015/uncategorised/125",
  // === (feature) duplicate among export declaration
  "/babel/es2015/modules/duplicate-export-default",
  "/babel/es2015/modules/duplicate-export-default-and-export-as-default",
  "/babel/es2015/modules/duplicate-named-export",
  "/babel/es2015/modules/duplicate-named-export-class-declaration",
  "/babel/es2015/modules/duplicate-named-export-destructuring-assignment",
  "/babel/es2015/modules/duplicate-named-export-destructuring",
  "/babel/es2015/modules/duplicate-named-export-destructuring2",
  "/babel/es2015/modules/duplicate-named-export-destructuring3",
  "/babel/es2015/modules/duplicate-named-export-destructuring4",
  "/babel/es2015/modules/duplicate-named-export-destructuring5",
  "/babel/es2015/modules/duplicate-named-export-destructuring6",
  "/babel/es2015/modules/duplicate-named-export-destructuring7",
  "/babel/es2015/modules/duplicate-named-export-destructuring8",
  "/babel/es2015/modules/duplicate-named-export-destructuring9",
  "/babel/es2015/modules/duplicate-named-export-destructuring10",
  "/babel/es2015/modules/duplicate-named-export-destructuring11",
  "/babel/es2015/modules/duplicate-named-export-destructuring12",
  "/babel/es2015/modules/duplicate-named-export-destructuring13",
  "/babel/es2015/modules/duplicate-named-export-destructuring14",
  "/babel/es2015/modules/duplicate-named-export-destructuring15",
  "/babel/es2015/modules/duplicate-named-export-destructuring16",
  "/babel/es2015/modules/duplicate-named-export-destructuring17",
  "/babel/es2015/modules/duplicate-named-export-destructuring18",
  "/babel/es2015/modules/duplicate-named-export-destructuring19",
  "/babel/es2015/modules/duplicate-named-export-function-declaration",
  "/babel/es2015/modules/duplicate-named-export-variable-declaration",
  "/babel/es2022/module-string-names/duplicate-exported-binding-check",
  // === (feature) parse class static block
  "/babel/es2022/class-static-block/await-binding-in-arrow-function-in-static-block copy",
  "/babel/es2022/class-static-block/await-binding-in-function-in-static-block",
  "/babel/es2022/class-static-block/await-binding-in-initializer-in-static-block",
  "/babel/es2022/class-static-block/basic",
  "/babel/es2022/class-static-block/directive-like-literal",
  "/babel/es2022/class-static-block/duplicate-function-var-name",
  "/babel/es2022/class-static-block/empty-statement",
  "/babel/es2022/class-static-block/lexical-scope",
  "/babel/es2022/class-static-block/multiple-static-block",
  "/babel/es2022/class-static-block/nested-control-flow",
  "/babel/es2022/class-static-block/re-declare-var",
  "/babel/es2022/class-static-block/super-property",
  // === (feature) class private name duplicate
  "/babel/es2022/class-private-names-duplicated/instance-field-instance-field",
  "/babel/es2022/class-private-names-duplicated/instance-field-instance-get",
  "/babel/es2022/class-private-names-duplicated/instance-field-instance-method",
  "/babel/es2022/class-private-names-duplicated/instance-field-instance-set",
  "/babel/es2022/class-private-names-duplicated/instance-field-static-field",
  "/babel/es2022/class-private-names-duplicated/instance-field-static-get",
  "/babel/es2022/class-private-names-duplicated/instance-field-static-method",
  "/babel/es2022/class-private-names-duplicated/instance-field-static-set",
  "/babel/es2022/class-private-names-duplicated/instance-get-instance-field",
  "/babel/es2022/class-private-names-duplicated/instance-get-instance-get",
  "/babel/es2022/class-private-names-duplicated/instance-get-instance-method",
  "/babel/es2022/class-private-names-duplicated/instance-get-static-field",
  "/babel/es2022/class-private-names-duplicated/instance-get-static-get",
  "/babel/es2022/class-private-names-duplicated/instance-get-static-method",
  "/babel/es2022/class-private-names-duplicated/instance-get-static-set",
  "/babel/es2022/class-private-names-duplicated/instance-method-instance-field",
  "/babel/es2022/class-private-names-duplicated/instance-method-instance-get",
  "/babel/es2022/class-private-names-duplicated/instance-method-instance-method",
  "/babel/es2022/class-private-names-duplicated/instance-method-instance-set",
  "/babel/es2022/class-private-names-duplicated/instance-method-static-field",
  "/babel/es2022/class-private-names-duplicated/instance-method-static-get",
  "/babel/es2022/class-private-names-duplicated/instance-method-static-method",
  "/babel/es2022/class-private-names-duplicated/instance-method-static-set",
  "/babel/es2022/class-private-names-duplicated/instance-set-instance-field",
  "/babel/es2022/class-private-names-duplicated/instance-set-instance-method",
  "/babel/es2022/class-private-names-duplicated/instance-set-instance-set",
  "/babel/es2022/class-private-names-duplicated/instance-set-static-field",
  "/babel/es2022/class-private-names-duplicated/instance-set-static-get",
  "/babel/es2022/class-private-names-duplicated/instance-set-static-method",
  "/babel/es2022/class-private-names-duplicated/instance-set-static-set",
  "/babel/es2022/class-private-names-duplicated/static-field-instance-field",
  "/babel/es2022/class-private-names-duplicated/static-field-instance-set",
  "/babel/es2022/class-private-names-duplicated/static-field-static-field",
  "/babel/es2022/class-private-names-duplicated/static-field-static-set",
  "/babel/es2022/class-private-names-duplicated/static-field-static-set",
  "/babel/es2022/class-private-names-duplicated/static-field-static-method",
  "/babel/es2022/class-private-names-duplicated/static-get-instance-field",
  "/babel/es2022/class-private-names-duplicated/static-get-instance-set",
  "/babel/es2022/class-private-names-duplicated/static-get-instance-method",
  "/babel/es2022/class-private-names-duplicated/static-get-static-field",
  "/babel/es2022/class-private-names-duplicated/static-get-static-method",
  "/babel/es2022/class-private-names-duplicated/static-get-static-get",
  "/babel/es2022/class-private-names-duplicated/static-method-instance-get",
  "/babel/es2022/class-private-names-duplicated/static-method-instance-field",
  "/babel/es2022/class-private-names-duplicated/static-method-instance-method",
  "/babel/es2022/class-private-names-duplicated/static-method-instance-set",
  "/babel/es2022/class-private-names-duplicated/static-method-static-get",
  "/babel/es2022/class-private-names-duplicated/static-method-static-method",
  "/babel/es2022/class-private-names-duplicated/static-method-static-set",
  "/babel/es2022/class-private-names-duplicated/static-set-instance-field",
  "/babel/es2022/class-private-names-duplicated/static-set-instance-get",
  "/babel/es2022/class-private-names-duplicated/static-set-instance-set",
  "/babel/es2022/class-private-names-duplicated/static-set-static-method",
  "/babel/es2022/class-private-names-duplicated/static-set-static-field",
  "/babel/es2022/class-private-names-duplicated/static-set-static-set",
  "/babel/es2022/class-private-names-duplicated/static-set-instance-method",
  "/babel/es2022/class-private-names-duplicated/static-method-static-field",
  "/babel/es2022/class-private-names-duplicated/static-get-instance-get",
  "/babel/es2022/class-private-names-duplicated/static-field-static-get",
  "/babel/es2022/class-private-names-duplicated/static-field-instance-method",
  "/babel/es2022/class-private-names-duplicated/static-field-instance-get",
  // === (feature) regex flag check
  "/babel/es2024/regexp-unicode-sets/vu-error",
  "/babel/es2024/regexp-unicode-sets/uv-error",
  "/babel/es2015/regex/duplicate-flags",
  "/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-4-hex",
  "/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-var-hex",
  // === (feature) checking duplicate variable in block scope
  "/babel/es2018/object-rest-spread/11",
  "/babel/es2018/object-rest-spread/12",
  "/babel/es2018/object-rest-spread/13",
  "/babel/es2018/object-rest-spread/15",
  // === (feature) class scope for yield and await expression.
  "/babel/es2022/class-properties/await-in-computed-property-in-params-of-async-arrow",
  "/babel/es2022/class-properties/yield-in-class-property-in-generator",
  
]);

function getFailedKindCount(failedTestCases: Array<FailedTestCasesResult>) {
  let expectFailedButPass: Array<FailedTestCasesResult> = [];
  let expectPassButFailed: Array<FailedTestCasesResult> = [];
  for (const testCase of failedTestCases) {
    if (TempIgnoreCases.has(testCase.fileId)) {
      continue;
    }
    if (testCase.kind === "ExpectFailedButPass") {
      expectFailedButPass.push(testCase);
    } else {
      expectPassButFailed.push(testCase);
    }
  }
  return { expectFailedButPass, expectPassButFailed };
}

function filterTestCase(skipTestCases: Array<SkipTestCaseResult | PassTestCaseResult>) {
  const ignoreSet = TempIgnoreCases;
  return skipTestCases.filter((testCase) => !ignoreSet.has(testCase.fileId));
}

async function report(testResult: TestResult) {
  const allTestCaseCount = Object.values(testResult).reduce((count, results) => count + results.length, 0);
  const skipResult = filterTestCase(testResult.skipResult) as Array<SkipTestCaseResult>;
  console.log(chalk.bold("=========== Parser Test Case ==========="));
  console.log(`== Ignore Test Case: ${TempIgnoreCases.size} / ${allTestCaseCount}`);
  console.log(`== Skip Test Case : ${skipResult.length} / ${allTestCaseCount}`);
  if (isVerbose) {
    for (const skipCase of skipResult) {
      console.log(`  |---> File: ${skipCase.fileId}`);
    }
  }
  const passResult = filterTestCase(testResult.passResult) as Array<PassTestCaseResult>;
  console.log(`== ${chalk.green("Pass Test Case")} : ${passResult.length} / ${allTestCaseCount}`);
  const { expectFailedButPass, expectPassButFailed } = getFailedKindCount(testResult.failedResult);
  console.log(
    `== ${chalk.red("Failed Test Case")} : ${expectFailedButPass.length + expectPassButFailed.length} / ${allTestCaseCount}`,
  );
  console.log(` |--> Expect Failed But Pass : ${expectFailedButPass.length}`);
  if (isVerbose) {
    for (const failedcase of expectFailedButPass) {
      console.log(`  |---> File: ${failedcase.fileId}`);
    }
  }
  console.log(` |--> Expect Pass But Failed : ${expectPassButFailed.length}`);
  if (isVerbose) {
    for (const failedcase of expectPassButFailed) {
      console.log(`  |---> File ${(failedcase as any).reason}: ${failedcase.fileId}`);
    }
  }
  await stroeResult({
    failedResult: [...expectFailedButPass, ...expectPassButFailed],
    skipResult,
  });
}

function getTestCaseSet(testResult: Pick<TestResult, "failedResult" | "skipResult">) {
  return {
    failed: new Set(testResult.failedResult.map((result) => result.fileId)),
  };
}

async function compareReport(testResult: TestResult) {
  const lastTestResult: TestResult = JSON.parse(await readFile("./result.json", { encoding: "utf-8" }));
  const lastSet = getTestCaseSet(lastTestResult);
  const { expectFailedButPass, expectPassButFailed } = getFailedKindCount(testResult.failedResult);
  const curSet = getTestCaseSet({
    failedResult: [...expectFailedButPass, ...expectPassButFailed],
    skipResult: testResult.skipResult,
  });
  const moreFailed = [];
  for (const val of curSet.failed) {
    if (!lastSet.failed.has(val)) {
      moreFailed.push(val);
    }
  }
  if (moreFailed.length > 0) {
    console.log(chalk.bold("=========== Regression Parser Test Case ==========="));
    console.log(`== ${chalk.red("More Failed Test Case")} : ${moreFailed.length}`);
    for (const failedcase of moreFailed) {
      console.log(`  |---> File: ${failedcase}`);
    }
  } else {
    console.log(chalk.bold("=========== No Regression ==========="));
  }
}

async function stroeResult(testResult: Pick<TestResult, "failedResult" | "skipResult">) {
  console.log();
  await writeFile("./result.json", JSON.stringify(testResult, null, 2));
}

export default async function runParserTestCases() {
  const testSuite = await getTestSuite();
  const testResult = await runTestSuit(testSuite, isUpdate);
  return async () => {
    await report(testResult);
    await compareReport(testResult);
  };
}
