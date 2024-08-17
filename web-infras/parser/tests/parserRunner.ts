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
  /**
   * Hard to do it
   */
  // === (feature) tokenze ?.3 vs ?.
  "/babel/es2020/optional-chaining/conditional-decimal",
  // === (feature) use strict active timing.
  "/babel/core/regression/use-strict-with-pre-semi",
  // === (feature) regex content and flag check
  "/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-4-hex",
  "/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-var-hex",
  /**
   * Experimental Feature
   */
  // (featture) ts or flow
  "/babel/estree/class-method/flow",
  "/babel/estree/class-method/typescript",
  "/babel/estree/class-private-property/flow",
  "/babel/core/sourcetype-unambiguous/flow",
  "/babel/estree/class-private-property/typescript",
  // (feature) decorator
  "/babel/estree/export/decorator-before-export",
  "/babel/es2022/class-static-block/invalid-legacy-decorators",
  "/babel/es2022/class-static-block/invalid-decorators",
  // (feature?) async do plugin
  "/babel/comments/basic/async-do-expression",
  /**
   * Relative easy
   */
  // === (feature) record to parent arrow scope.
  "/babel/es2022/class-properties/await-in-computed-property-in-params-of-async-arrow",
  // === (feature) ban async of
  "/babel/es2021/for-async-of/forbidden",
  // === (feature) tokenize ??=
  "/babel/es2021/logical-assignment-operator/qq-equals",
  // === (feature) tokenize a number can not be followed by a idstart
  "/babel/core/uncategorised/348",
  "/babel/core/uncategorised/358",
  "/babel/core/uncategorised/359",
  // === (feature) html comment.
  "/esprima/comment/migrated_0036",
  "/esprima/comment/migrated_0038",
  "/esprima/comment/migrated_0039",
  "/esprima/comment/migrated_0040",
  "/esprima/comment/migrated_0041",
  "/esprima/comment/migrated_0042",
  "/babel/core/uncategorised/343",
  "/babel/core/uncategorised/538",
  "/babel/comments/html/first-line",
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
