import { readFile, writeFile } from "fs/promises";
import { getTestSuite } from "./helper/getTestCase";
import { runTestSuit } from "./helper/testRunner";
import { FailedTestCasesResult, SkipTestCaseResult, TestResult } from "./helper/type";
import chalk from "chalk";
import { execSync } from "child_process";

const isUpdate = Boolean(process.env.TEST_UPDATE) || false;
const isVerbose = Boolean(process.env.TEST_VERBOSE) || false;
// const gate = Number(process.env.TEST_GATE) || .95;
// const isCI = Boolean(process.env.TEST_CI) || false;

const TempIgnoreCases: Set<string> = new Set([
  // // === 100% syntax problem
  // "/babel/es2018/async-generators/for-await-async-of.js",
  // // html comment
  // "/babel/core/uncategorised/343.js",
  // "/babel/core/uncategorised/538.js",
  // // other strict mode problem
  // "/esprima/declaration/function/invalid-strict-labelled-function-declaration.js",
  // // ===  duplicate Proto check on onject.
  // "/babel/es2015/uncategorised/invalid_349.js",
  // // === legacy `00` as number literal problem
  // "/babel/es2015/uncategorised/42.js",
  // "/babel/es2015/uncategorised/3.js",
  // "/babel/core/uncategorised/84.js",
  // "/babel/core/uncategorised/83.js",
  // "/babel/core/uncategorised/82.js",
  // "/babel/core/uncategorised/355.js",
  // "/babel/core/uncategorised/356.js",
  // "/babel/core/uncategorised/543.js",
  // "/babel/core/uncategorised/551.js",
  // "/babel/core/uncategorised/553.js",
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
  // // === production rule problem
  // "/babel/es2015/generators/invalid-hanging.js",
  // "/babel/es2015/generators/invalid-sloppy-function.js",
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

function filterSkipTestCase(skipTestCases: Array<SkipTestCaseResult>) {
  const ignoreSet = new Set(TempIgnoreCases);
  return skipTestCases.filter(testCase => !ignoreSet.has(testCase.fileId));
}

function report(testResult: TestResult) {
  const allTestCaseCount = Object.values(testResult).reduce((count, results) => count + results.length, 0);
  const skipResult = filterSkipTestCase(testResult.skipResult);
  console.log(chalk.bold("=========== Parser Test Case ==========="));
  console.log(`== Ignore Test Case: ${TempIgnoreCases.size} / ${allTestCaseCount}`);
  console.log(`== Skip Test Case : ${skipResult.length} / ${allTestCaseCount}`);
  if (isVerbose) {
    for (const skipCase of skipResult) {
      console.log(`  |---> File: ${skipCase.fileId}`);
    }
  }
  console.log(`== ${chalk.green("Pass Test Case")} : ${testResult.passResult.length} / ${allTestCaseCount}`);
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
}

function getTestCaseSet(testResult: TestResult) {
  return {
    pass: new Set(testResult.passResult.map(result => result.fileId)),
    failed: new Set(testResult.failedResult.map(result => result.fileId)),
    skip: new Set(testResult.skipResult.map(result => result.fileId)),
  }
}

async function compareReport(testResult: TestResult) {
    const lastTestResult: TestResult = JSON.parse(await readFile("./result.json", { encoding: "utf-8" }));
    const lastSet = getTestCaseSet(lastTestResult);
    const curSet = getTestCaseSet(testResult);
    const moreFailed = [];
    for(const val of curSet.failed) {
      if(!(lastSet.failed.has(val))) {
        moreFailed.push(val);
      }
    }
    if(moreFailed.length > 0) {
      console.log(chalk.bold("=========== Regression Parser Test Case ==========="));
      console.log(`== ${chalk.red("More Failed Test Case")} : ${moreFailed.length}`);
      for (const failedcase of moreFailed) {
        console.log(`  |---> File: ${failedcase}`);
      }
    }
    console.log(lastSet.failed.size, curSet.failed.size)
}

async function stroeResult(testResult: TestResult) {
  await writeFile("./result.json", JSON.stringify(testResult, null, 2));
}

export default async function runParserTestCases() {
  const testSuite = await getTestSuite();
  const testResult = await runTestSuit(testSuite, isUpdate);
   //  await stroeResult(testResult);
  return async () => {
    report(testResult);
    await compareReport(testResult);
  };
}
