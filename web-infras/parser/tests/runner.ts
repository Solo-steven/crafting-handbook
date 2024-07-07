import { createParser } from "@/src/parser";
import { getTestSuite } from "./helper/getTestCase";
import { runTestSuit } from "./helper/testRunner";
import { FailedTestCasesResult, TestResult } from "./helper/type";

const isUpdate = Boolean(process.env.TEST_UPDATE) || false;
// const gate = Number(process.env.TEST_GATE) || .95;
// const isCI = Boolean(process.env.TEST_CI) || false;

function getFailedKindCount(failedTestCases: Array<FailedTestCasesResult>) {
  let expectFailedButPass: Array<FailedTestCasesResult> = [];
  let expectPassButFailed: Array<FailedTestCasesResult> = [];
  for (const testCase of failedTestCases) {
    if (testCase.kind === "ExpectFailedButPass") {
      expectFailedButPass.push(testCase);
    } else {
      expectPassButFailed.push(testCase);
    }
  }
  return { expectFailedButPass, expectPassButFailed };
}

function report(testResult: TestResult) {
  const allTestCaseCount = Object.values(testResult).reduce(
    (count, results) => count + results.length,
    0,
  );
  console.log("======================================");
  console.log(
    `== Pass Test Case : ${testResult.passResult.length} / ${allTestCaseCount}`,
  );
  console.log(
    `== Skip Test Case : ${testResult.skipResult.length} / ${allTestCaseCount}`,
  );
  console.log(
    `== Failed Test Case : ${testResult.failedResult.length} / ${allTestCaseCount}`,
  );
  const { expectFailedButPass, expectPassButFailed } = getFailedKindCount(
    testResult.failedResult,
  );
  console.log(`|---> Expect Failed But Pass : ${expectFailedButPass.length}`);
  for (const failedcase of expectFailedButPass) {
    console.log(`  |---> File: ${failedcase.fileId}`);
  }
  console.log(`|---> Expect Pass But Failed : ${expectPassButFailed.length}`);
  for (const failedcase of expectPassButFailed) {
    console.log(`  |---> File ${(failedcase as any).reason}: ${failedcase.fileId}`);
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

const thirdPartyTestCase = [
  {
    title: "Jquery uncompressed",
    url: "https://code.jquery.com/jquery-3.7.1.js",
    code: "",
    pass: false,
  },
  {
    title: "react development",
    url: "https://unpkg.com/react@18/umd/react.development.js",
    code: "",
    pass: false,
  },
  {
    title: "react dom development",
    url: "https://unpkg.com/react-dom@18/umd/react-dom.development.js",
    code: "",
    pass: false,
  },
  {
    title: "vue esm brower prod min",
    url: "https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.4/vue.esm-browser.prod.min.js",
    code: "",
    pass: false,
  },
];

async function run3partyTestCase() {
  await Promise.all(
    thirdPartyTestCase.map(async (testCase) => {
      const code = await fetch(testCase.url).then((resp) => resp.text());
      testCase.code = code;
    }),
  );
  console.log("==========================================");
  for (const testCode of thirdPartyTestCase) {
    try {
      const parser = createParser(testCode.code);
      parser.parse();
      testCode.pass = true;
      console.log(`|${testCode.title}|: parse PASS.`);
    } catch (e) {
      testCode.pass = false;
      console.log(`|${testCode.title}|: parse FAILED.`);
    }
  }
  console.log("==========================================");
}

const TempIgnoreCases: Array<String> = [
  /** Pending Problems */
  //  ==== strict mode problem
  "esprima/ES6/arrow-function/invalid-param-strict-mode.js",
  "esprima/declaration/function/invalid-strict-labelled-function-declaration.js",
  // yield predi followed argument
  "esprima/ES6/yield/ternary-yield.js",
  //  ==== unicode and excap char problem
  "esprima/ES6/template-literals/invalid-escape.js",
  "esprima/ES6/template-literals/invalid-hex-escape-sequence.js",
  "esprima/ES6/template-literals/invalid_octal-literal.js",
  "esprima/ES6/template-literals/invalid_strict-octal-literal.js",
  //  ==== other
  "esprima/ES6/arrow-function/invalid-non-arrow-param-followed-by-arrow.js",
  // ==== dev pss, test failed ?
  "esprima/expression/binary/multiline_string_literal.js",
];
