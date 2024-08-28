import { ParserConfig } from "@/src/parser/config";

export interface ExpectConfig {
  expect: "Failed" | "Pass";
  config?: ParserConfig;
}
/**
 * A Test Case that expect to be pass
 */
export interface ExpectPassTestCase {
  kind: "ExpectPassTestCase";
  jsFilePath: string;
  jsonFilePath: string;
  isJsonFileExist: boolean;
  fileId: string;
  config?: ParserConfig;
}
/**
 * A Test Case that expect to be failed
 */
export interface ExpectFailedTestCase {
  kind: "ExpectFailedTestCase";
  jsFilePath: string;
  fileId: string;
  config?: ParserConfig;
}

export type TestCase = ExpectFailedTestCase | ExpectPassTestCase;

export type TestCaseIterator = { next: () => TestCase | undefined };

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
      reason: string | Error;
    }
);
/**
 * A test case result is skip.
 */
export interface SkipTestCaseResult {
  kind: "Skip";
  fileId: string;
  filePath: string;
}
/**
 * A test case result is timeout
 */
export interface TimeoutTestCaseResult {
  kind: "Timeout";
  fileId: string;
  filePath: string;
}

export type TestCaseResult =
  | PassTestCaseResult
  | FailedTestCasesResult
  | SkipTestCaseResult
  | TimeoutTestCaseResult;

export type TestCaseResultSuite = {
  passResult: Array<PassTestCaseResult>;
  failedResult: Array<FailedTestCasesResult>;
  skipResult: Array<SkipTestCaseResult>;
  timeoutResult: Array<TimeoutTestCaseResult>;
};

/**
 * A update Test Case Result Suite
 */

export type UpdatePassTestCaseResult = PassTestCaseResult;

export type UpdateTimeoutTestCaseResult = TimeoutTestCaseResult;

export type UpdateFailedTestCaseResult = {
  kind: "ExpectPassButFailed";
  reason: string | Error;
  fileId: string;
  filePath: string;
};

export type UpdateTestCaseResult =
  | UpdatePassTestCaseResult
  | UpdateTimeoutTestCaseResult
  | UpdateFailedTestCaseResult;

export type UpdateTestCaseResultSuite = {
  passResult: Array<UpdatePassTestCaseResult>;
  failedResult: Array<UpdateFailedTestCaseResult>;
  timeoutResult: Array<UpdateTimeoutTestCaseResult>;
};
