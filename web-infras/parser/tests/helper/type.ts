/**
 * A Test Case that expect to be pass
 */
export interface ExpectPassTestCase {
  jsFilePath: string;
  jsonFilePath: string;
  isJsonFileExist: boolean;
  fileId: string;
}
/**
 * A Test Case that expect to be failed
 */
export interface ExpectFailedTestCase {
  jsFilePath: string;
  fileId: string;
}
/**
 * A Test suit, contain two kind of test case
 * - expect to pass: array of ExpectPassTestCase
 * - expect to failed: array of ExpectFailedTestCase
 */
export interface TestSuite {
  expectPassTestCases: Array<ExpectPassTestCase>;
  expectFailedTestCases: Array<ExpectFailedTestCase>;
}
/**
 * A test case result is pass.
 */
export type PassTestCaseResult = {
  kind: "ExpectFailed" | "ExpectPass";
  fileId: string;
  filePath: string;
};
/**
 * A test case result is failed.
 */
export type FailedTestCasesResult = {
  fileId: string;
  filePath: string;
} & (
  | {
      kind: "ExpectFailedButPass";
    }
  | {
      kind: "ExpectPassButFailed";
      reason: string;
    }
);
/**
 * A test case result is skip.
 */
export interface SkipTestCaseResult {
  fileId: string;
  filePath: string;
}
/**
 * A Test Result from Test suit
 */
export type TestResult = {
  passResult: Array<PassTestCaseResult>;
  failedResult: Array<FailedTestCasesResult>;
  skipResult: Array<SkipTestCaseResult>;
};
