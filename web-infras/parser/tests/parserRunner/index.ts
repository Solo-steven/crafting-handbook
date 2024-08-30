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
  // === (TO BE VERIFY)
  "/esprima/statement/if/migrated_0003",
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
  "/babel/estree/class-method/flow",
  "/babel/estree/class-method/typescript",
  "/babel/estree/class-private-property/flow",
  "/babel/core/sourcetype-unambiguous/flow",
  "/babel/estree/class-private-property/typescript",
  // (feature?) async do plugin
  "/babel/comments/basic/async-do-expression",
  /**
   * Relative easy
   */
  // === (feature) ban async of
  "/babel/es2021/for-async-of/forbidden",
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
  if (isVerbose) {
    for (const failedcase of expectFailedButPass) {
      console.log(`  |---> File: ${failedcase.fileId}`);
    }
  }
  console.log(` |--> Expect Pass But Failed : ${expectPassButFailed.length}`);
  if (isVerbose) {
    for (const failedcase of expectPassButFailed) {
      if (failedcase.kind === "ExpectPassButFailed")
        console.log(`  |---> File ${failedcase.reason}: ${failedcase.fileId}`);
    }
  }
  console.log(
    `== ${chalk.red("Timeout Test Case")} : ${testResult.timeoutResult.length} / ${allTestCaseCount}`,
  );
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
