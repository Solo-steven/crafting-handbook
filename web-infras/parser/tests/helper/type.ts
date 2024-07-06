/**
 * 
 */
export interface ExpectPassTestCase {
    jsFilePath: string;
    jsonFilePath: string;
    isJsonFileExist: boolean;
    fileId: string;
}
/**
 * 
 */
export interface ExpectFailedTestCase {
    jsFilePath: string;
    fileId: string;
}
/**
 * 
 */
export interface TestSuite {
    expectPassTestCases: Array<ExpectPassTestCase>,
    expectFailedTestCases: Array<ExpectFailedTestCase>,
}
/**
 * 
 */
export type PassTestCaseResult =  {
    kind: "ExpectFailed" |"ExpectPass",
    fileId: string,
    filePath: string,
};
/**
 * 
 */
export type FailedTestCasesResult  = {
    fileId: string;
    filePath: string;
} & ({
        kind: "ExpectFailedButPass"
    } | {
        kind: "ExpectPassButFailed",
        reason: string;
    }
)
/**
 * 
 */
export interface SkipTestCaseResult  {
    fileId: string;
    filePath: string
}
/**
 * 
 */
export type TestResult = {
    passResult: Array<PassTestCaseResult>,
    failedResult: Array<FailedTestCasesResult>,
    skipResult: Array<SkipTestCaseResult>,

}
