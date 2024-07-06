import { getTestSuite } from "./helper/getTestCase";
import { runTestSuit } from "./helper/testRunner";
import { FailedTestCasesResult, TestResult } from "./helper/type";

const isUpdate = Boolean(process.env.TEST_UPDATE) || false;
// const gate = Number(process.env.TEST_GATE) || .95;
// const isCI = Boolean(process.env.TEST_CI) || false;

function getFailedKindCount(failedTestCases: Array<FailedTestCasesResult>) {
    let expectFailedButPass: Array<FailedTestCasesResult> = [];
    let expectPassButFailed: Array<FailedTestCasesResult> = [];
    for(const testCase of failedTestCases) {
        if(testCase.kind === "ExpectFailedButPass") {
            expectFailedButPass.push(testCase)
        }else {
            expectPassButFailed.push(testCase)
        }
    }
    return { expectFailedButPass, expectPassButFailed };
}

function report(testResult: TestResult) {
    const allTestCaseCount = Object.values(testResult).reduce((count, results) => count + results.length, 0);
    console.log("======================================");
    console.log(`== Pass Test Case : ${testResult.passResult.length} / ${allTestCaseCount}`);
    console.log(`== Skip Test Case : ${testResult.skipResult.length} / ${allTestCaseCount}`);
    console.log(`== Failed Test Case : ${testResult.failedResult.length} / ${allTestCaseCount}`);
    const { expectFailedButPass, expectPassButFailed } = getFailedKindCount(testResult.failedResult);
    console.log(`|---> Expect Failed But Pass : ${expectFailedButPass.length}`);
    for(const failedcase of expectFailedButPass) {
        console.log(`  |---> File: ${failedcase.fileId}`)
    }
    console.log(`|---> Expect Pass But Failed : ${expectPassButFailed.length}`);
    for(const failedcase of expectPassButFailed) {
        console.log(`  |---> File: ${failedcase.fileId}`)
    }
    console.log("======================================");
}

async function main() {
    const testSuite = await getTestSuite();
    const testResult = await runTestSuit(testSuite, isUpdate);
    report(testResult);
}
main();