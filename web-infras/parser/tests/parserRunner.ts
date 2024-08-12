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
  // === (feature) record to parent arrow scope.
  "/babel/es2022/class-properties/await-in-computed-property-in-params-of-async-arrow",
  // uncatgory
  "/babel/core/regression/use-strict-with-pre-semi",
  "/babel/core/regression/non-octal-float",
  "/babel/core/sourcetype-unambiguous/flow",
  "/babel/core/opts/allowAwaitOutsideFunction-true",
  "/babel/core/opts/allowNewTargetOutsideFunction-true",
  // (featture) ts or flow
  "/babel/estree/class-method/flow",
  "/babel/estree/class-method/typescript",
  "/babel/estree/class-private-property/flow",
  "/babel/estree/class-private-property/typescript",
  // (feature) decorator
  "/babel/estree/export/decorator-before-export",
  "/babel/es2022/class-static-block/invalid-legacy-decorators",
  "/babel/es2022/class-static-block/invalid-decorators",
  // (feature) import assertion, attribute
  "/babel/estree/dynamic-import/import-assertions",
  "/babel/estree/import-assertions/valid-syntax-with-attributes",
  "/babel/estree/import-attributes/valid-syntax-with-attributes",
  "/babel/estree/dynamic-import/import-attributes",
  // (feature?) async do plugin
  "/babel/comments/basic/async-do-expression",
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
  "/babel/core/categorized/invalid-fn-decl-inside-loop",
  "/babel/core/categorized/invalid-fn-decl-labeled-inside-if",
  "/babel/core/categorized/invalid-fn-decl-labeled-inside-loop",
  "/babel/core/uncategorised/465",
  // === (feature) tokenize a number can not be followed by a idstart
  "/babel/core/uncategorised/348",
  "/babel/core/uncategorised/358",
  "/babel/core/uncategorised/359",
  // === (feature) position of break and continue statement, multi default in switch
  "/babel/core/uncategorised/409",
  "/babel/core/uncategorised/411",
  "/babel/core/uncategorised/427",
  "/babel/core/uncategorised/457",
  "/babel/core/uncategorised/459",
  "/babel/core/uncategorised/455",
  "/babel/core/uncategorised/456",
  "/babel/core/uncategorised/460",
  "/babel/core/uncategorised/461",
  "/babel/core/uncategorised/462",
  "/babel/core/uncategorised/463",
  "/babel/core/uncategorised/464",
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
  // === (feature) html comment, hashtag comment
  "/esprima/comment/migrated_0036",
  "/esprima/comment/migrated_0038",
  "/esprima/comment/migrated_0039",
  "/esprima/comment/migrated_0040",
  "/esprima/comment/migrated_0041",
  "/esprima/comment/migrated_0042",
  "/babel/core/uncategorised/343",
  "/babel/core/uncategorised/538",
  "/babel/comments/html/first-line",
  "/babel/comments/interpreter-directive/interpreter-directive-import",
  "/babel/comments/interpreter-directive/interpreter-directive-object",
  // === (dunplicate construcotr)
  "/babel/es2015/uncategorised/125",
  // === (feature) regex content and flag check
  "/babel/es2024/regexp-unicode-sets/vu-error",
  "/babel/es2024/regexp-unicode-sets/uv-error",
  "/babel/es2015/regex/duplicate-flags",
  "/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-4-hex",
  "/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-var-hex",
  "/babel/core/uncategorised/108",
  "/babel/core/uncategorised/366",
  "/babel/core/uncategorised/380",
  "/babel/core/uncategorised/441",
  /**
   * Scope Id and reference feature
   */
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
  // === (feature) checking duplicate variable in block scope
  "/babel/es2018/object-rest-spread/11",
  "/babel/es2018/object-rest-spread/12",
  "/babel/es2018/object-rest-spread/13",
  "/babel/es2018/object-rest-spread/15",
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
