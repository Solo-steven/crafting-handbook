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
  // === (bug) 100% syntax problem
  "/babel/es2018/async-generators/for-await-async-of",
  // === production rule problem
  "/babel/es2015/generators/invalid-hanging",
  "/babel/es2015/generators/invalid-sloppy-function",
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
  "/babel/es2015/uncategorised/42.js",
  "/babel/es2015/uncategorised/3.js",
  "/babel/core/uncategorised/84.js",
  "/babel/core/uncategorised/83.js",
  "/babel/core/uncategorised/82.js",
  "/babel/core/uncategorised/355.js",
  "/babel/core/uncategorised/356.js",
  "/babel/core/uncategorised/543.js",
  "/babel/core/uncategorised/551.js",
  "/babel/core/uncategorised/553.js",
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
  // === (feature) Checking ***esc char*** in string and identifier and template string
  "/esprima/es2018/template-literal-revision/not-escape-8",
  "/esprima/es2018/template-literal-revision/not-escape-9",
  "/esprima/es2018/template-literal-revision/not-escape-hex",
  "/esprima/ES6/identifier/invalid-hex-escape-sequence",
  "/esprima/ES6/template-literals/invalid-escape",
  "/esprima/ES6/template-literals/invalid-hex-escape-sequence",
  // === (feature) html comment, hashtag comment
  "/esprima/comment/migrated_0036",
  "/esprima/comment/migrated_0038",
  "/esprima/comment/migrated_0039",
  "/esprima/comment/migrated_0040",
  "/esprima/comment/migrated_0041",
  "/esprima/comment/migrated_0042",
  "/babel/core/uncategorised/343.js",
  "/babel/core/uncategorised/538.js",
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



  // // other strict mode problem
  // "/esprima/declaration/function/invalid-strict-labelled-function-declaration.js",
  // // ===  duplicate Proto check on onject.
  // "/babel/es2015/uncategorised/invalid_349.js",
  // // === number literal non stop problem
  // "/babel/es2015/uncategorised/invalid_201.js",
  // "/babel/es2015/uncategorised/invalid_205.js",
  // // === duplicate of `constructor` in class problem
  // "/babel/es2015/uncategorised/invalid_125.js",
  // //  ==== unicode and excap char im template problem
  // "/esprima/ES6/template-literals/invalid-escape.js",
  // "/esprima/ES6/template-literals/invalid-hex-escape-sequence.js",
  // "/esprima/ES6/template-literals/invalid_octal-literal.js",
  // "/esprima/ES6/template-literals/invalid_strict-octal-literal.js",
  // "/babel/es2015/uncategorised/invalid_339.js",
  // "/babel/es2015/uncategorised/invalid_290.js",
  // "/babel/es2015/uncategorised/invalid_219.js",
  // "/babel/es2015/uncategorised/invalid_217.js",
  // "/babel/es2015/uncategorised/invalid_218.js",
  // "/babel/es2015/uncategorised/invalid_216.js",
  // // ==== unicde problem (unicode id start, id continue)
  // "/babel/core/uncategorised/19.js",
  // "/babel/es2015/uncategorised/invalid_327.js",
  // "/babel/es2015/uncategorised/319.js",
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
    passResult, 
    failedResult: [...expectFailedButPass, ...expectPassButFailed],
    skipResult,
  })
}

function getTestCaseSet(testResult: TestResult) {
  return {
    pass: new Set(testResult.passResult.map((result) => result.fileId)),
    failed: new Set(testResult.failedResult.map((result) => result.fileId)),
    skip: new Set(testResult.skipResult.map((result) => result.fileId)),
  };
}

async function compareReport(testResult: TestResult) {
  const lastTestResult: TestResult = JSON.parse(await readFile("./result.json", { encoding: "utf-8" }));
  const lastSet = getTestCaseSet(lastTestResult);
  const curSet = getTestCaseSet(testResult);
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
  }
}

async function stroeResult(testResult: TestResult) {
  await writeFile("./result.json", JSON.stringify(testResult, null, 2));
}

export default async function runParserTestCases() {
  const testSuite = await getTestSuite();
  const testResult = await runTestSuit(testSuite, isUpdate);
  return async () => {
    await report(testResult);
   // await compareReport(testResult);
  };
}
