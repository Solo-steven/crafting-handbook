import chalk from "chalk";
import { startController } from "./controller/controller";
import {
  FailedTestCasesResult,
  SkipTestCaseResult,
  PassTestCaseResult,
  TestCaseResultSuite,
  UpdateTestCaseResultSuite,
} from "./type";
import { startUpdateController } from "./updateController/controller";

const isUpdate = Boolean(process.env.TEST_UPDATE) || false;
const isVerbose = Boolean(process.env.TEST_VERBOSE) || false;
// const gate = Number(process.env.TEST_GATE) || .95;
const isCI = Boolean(process.env.TEST_CI) || false;

const TempIgnoreCases: Set<string> = new Set([
  /**
   * Hard to do it
   */
  // === (feature) use strict active timing.
  "/babel/core/regression/use-strict-with-pre-semi",
  // === (feature) regex content and flag check
  "/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-4-hex",
  "/esprima/expression/primary/literal/regular-expression/u-flag-invalid-range-var-hex",
  // === (lone surrofate)
  "/babel/es2022/module-string-names/export-name-has-lone-surrogate",
  "/esprima/ES6/identifier/invalid_lone_surrogate",
  // === (sematnic regex)
  "/esprima/expression/primary/literal/regular-expression/migrated_0006",
  "/babel/core/escape-keyword/used-as-property",
  /**
   * Experimental Feature
   */
  // (featture) ts or flow
  "/babel/estree/class-method/typescript",
  "/babel/estree/class-private-property/typescript",
  // (feature?) async do plugin
  "/babel/comments/basic/async-do-expression",
  /**
   * Relative easy
   */
  // === (feature) ban async of
  "/babel/es2021/for-async-of/forbidden",
]);

function getFailedKindCount(failedTestCases: Array<FailedTestCasesResult>) {
  const expectFailedButPass: Array<FailedTestCasesResult> = [];
  const expectPassButFailed: Array<FailedTestCasesResult> = [];
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

/**
 * Return boolean value indicate is test pass or not.
 * @param {TestCaseResultSuite} testResult
 * @returns {boolean}
 */
function reportTestSuit(testResult: TestCaseResultSuite): boolean {
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
  if (isVerbose || isCI) {
    for (const failedcase of expectFailedButPass) {
      console.log(`  |---> File: ${failedcase.fileId}`);
    }
  }
  console.log(` |--> Expect Pass But Failed : ${expectPassButFailed.length}`);
  if (isVerbose || isCI) {
    for (const failedcase of expectPassButFailed) {
      if (failedcase.kind === "ExpectPassButFailed")
        console.log(`  |---> File ${failedcase.reason}: ${failedcase.fileId}`);
    }
  }
  console.log(
    `== ${chalk.red("Timeout Test Case")} : ${testResult.timeoutResult.length} / ${allTestCaseCount}`,
  );
  if (isVerbose || isCI) {
    for (const failedcase of testResult.timeoutResult) console.log(`  |---> File ${failedcase.fileId}`);
  }
  return (
    testResult.timeoutResult.length === 0 &&
    expectFailedButPass.length === 0 &&
    expectPassButFailed.length === 0
  );
}
export default async function runParserTestCase() {
  if (isUpdate) {
    const resultSuite = await startUpdateController();
    return () => reportUpdateTestSuit(resultSuite);
  }
  const resultSuite = await startController();
  return () => reportTestSuit(resultSuite);
}

/**
 * Return boolean value indicate is test pass or not.
 * @param {UpdateTestCaseResultSuite} testSuite
 * @returns
 */
function reportUpdateTestSuit(testSuite: UpdateTestCaseResultSuite) {
  const allTestCaseCount = Object.values(testSuite).reduce((count, results) => count + results.length, 0);
  console.log(chalk.bold("=========== Parser Test Case ==========="));
  console.log(`== Ignore Test Case: ${TempIgnoreCases.size} / ${allTestCaseCount}`);
  console.log(
    `== ${chalk.green("Pass Update Test Case")} : ${testSuite.passResult.length} / ${allTestCaseCount}`,
  );
  console.log(
    `== ${chalk.red("Failed Update Test Case")} : ${testSuite.failedResult.length} / ${allTestCaseCount}`,
  );
  if (isVerbose) {
    for (const failedcase of testSuite.failedResult) {
      console.log(`  |---> File: ${failedcase.fileId}`);
    }
  }
  console.log(
    `== ${chalk.red("Timeout During Update Test Case")} : ${testSuite.timeoutResult.length} / ${allTestCaseCount}`,
  );
  return testSuite.failedResult.length === 0 && testSuite.timeoutResult.length === 0;
}
