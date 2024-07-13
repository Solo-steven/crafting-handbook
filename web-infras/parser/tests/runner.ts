import { getTestSuite } from "./helper/getTestCase";
import { runTestSuit } from "./helper/testRunner";
import { FailedTestCasesResult, TestResult } from "./helper/type";
import { run3partyTestCase } from "./helper/3partyTestRunner";

const isUpdate = Boolean(process.env.TEST_UPDATE) || false;
const isVerbose = Boolean(process.env.TEST_VERBOSE) || false;
// const gate = Number(process.env.TEST_GATE) || .95;
// const isCI = Boolean(process.env.TEST_CI) || false;

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

function report(testResult: TestResult) {
  const allTestCaseCount = Object.values(testResult).reduce((count, results) => count + results.length, 0);
  console.log("======================================");
  console.log(`== Ignore Test Case: ${TempIgnoreCases.size} / ${allTestCaseCount}`);
  console.log(`== Pass Test Case : ${testResult.passResult.length} / ${allTestCaseCount}`);
  console.log(`== Skip Test Case : ${testResult.skipResult.length} / ${allTestCaseCount}`);
  if (isVerbose) {
    for (const skipCase of testResult.skipResult) {
      console.log(`  |---> File: ${skipCase.fileId}`);
    }
  }
  const { expectFailedButPass, expectPassButFailed } = getFailedKindCount(testResult.failedResult);
  console.log(
    `== Failed Test Case : ${expectFailedButPass.length + expectPassButFailed.length} / ${allTestCaseCount}`,
  );
  console.log(`|==> Expect Failed But Pass : ${expectFailedButPass.length}`);
  if (isVerbose) {
    for (const failedcase of expectFailedButPass) {
      console.log(`  |---> File: ${failedcase.fileId}`);
    }
  }
  console.log(`|---> Expect Pass But Failed : ${expectPassButFailed.length}`);
  if (isVerbose) {
    for (const failedcase of expectPassButFailed) {
      console.log(`  |---> File ${(failedcase as any).reason}: ${failedcase.fileId}`);
    }
  }
  console.log("======================================");
}

async function main() {
  const testSuite = await getTestSuite();
  const testResult = await runTestSuit(testSuite, isUpdate);
  report(testResult);
  run3partyTestCase();
}
main();

const TempIgnoreCases: Set<string> = new Set([
  /** Pending Problems */
  //  ==== strict mode problem
  "/esprima/ES6/arrow-function/invalid-param-strict-mode.js",
  "/esprima/declaration/function/invalid-strict-labelled-function-declaration.js",
  // yield predi followed argument (in skip test case)
  // "/esprima/ES6/yield/ternary-yield.js",
  //  ==== unicode and excap char problem
  "/esprima/ES6/template-literals/invalid-escape.js",
  "/esprima/ES6/template-literals/invalid-hex-escape-sequence.js",
  "/esprima/ES6/template-literals/invalid_octal-literal.js",
  "/esprima/ES6/template-literals/invalid_strict-octal-literal.js",
]);
