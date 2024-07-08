import { readFile, writeFile } from "fs/promises";
import {
  PassTestCaseResult,
  FailedTestCasesResult,
  SkipTestCaseResult,
  ExpectPassTestCase,
  ExpectFailedTestCase,
  TestSuite,
  TestResult,
} from "./type";
import { createParser } from "@/src/parser";
import { transformSyntaxKindToLiteral } from "./transform";

/**
 * Try to parse a code string, return format string if no parse
 * error, return null if parse error.
 * @param code
 * @returns {string | null} return null if parse failed.
 */
function tryParseCodeStringIntoASTString(code: string): string | null {
  try {
    const ast = createParser(code).parse();
    transformSyntaxKindToLiteral(ast);
    return JSON.stringify(ast, null, 4);
  } catch (e) {
    return null;
  }
}
/**
 * Run a test case expect to be pass
 * @param testCase
 * @param passResult
 * @param failedResult
 * @param skipResult
 * @returns
 */
async function runExpectPassTestCase(
  testCase: ExpectPassTestCase,
  passResult: Array<PassTestCaseResult>,
  failedResult: Array<FailedTestCasesResult>,
  skipResult: Array<SkipTestCaseResult>,
) {
  if (!testCase.isJsonFileExist) {
    skipResult.push({
      fileId: testCase.fileId,
      filePath: testCase.jsFilePath,
    });
    return;
  }
  const [codeBuffer, astBuffer] = await Promise.all([
    readFile(testCase.jsFilePath),
    readFile(testCase.jsonFilePath),
  ]);
  const resultASTString = tryParseCodeStringIntoASTString(codeBuffer.toString());
  const expectASTString = astBuffer.toString();
  if (resultASTString === null || expectASTString !== resultASTString) {
    failedResult.push({
      kind: "ExpectPassButFailed",
      filePath: testCase.jsFilePath,
      fileId: testCase.fileId,
      reason: resultASTString === null ? "Parse Error" : "Diff Error",
    });
    return;
  }
  passResult.push({
    fileId: testCase.fileId,
    filePath: testCase.jsFilePath,
    kind: "ExpectPass",
  });
}
/**
 * Run a test case expect to be failed.
 * @param testCase
 * @param passResult
 * @param failedResult
 * @returns
 */
async function runExpectFailedTestCase(
  testCase: ExpectFailedTestCase,
  passResult: Array<PassTestCaseResult>,
  failedResult: Array<FailedTestCasesResult>,
) {
  const codeBuffer = await readFile(testCase.jsFilePath);
  const resultASTString = tryParseCodeStringIntoASTString(codeBuffer.toString());
  if (resultASTString !== null) {
    failedResult.push({
      kind: "ExpectFailedButPass",
      filePath: testCase.jsFilePath,
      fileId: testCase.fileId,
    });
    return;
  }
  passResult.push({
    fileId: testCase.fileId,
    filePath: testCase.jsFilePath,
    kind: "ExpectFailed",
  });
}
/**
 * Update a test case expect to be pass
 * @param testCase
 * @param passResult
 * @param failedResult
 * @returns
 */
async function updateTestCase(
  testCase: ExpectPassTestCase,
  passResult: Array<PassTestCaseResult>,
  failedResult: Array<FailedTestCasesResult>,
) {
  const codeBuffer = await readFile(testCase.jsFilePath);
  const resultASTString = tryParseCodeStringIntoASTString(codeBuffer.toString());
  if (resultASTString === null) {
    failedResult.push({
      kind: "ExpectPassButFailed",
      filePath: testCase.jsFilePath,
      fileId: testCase.fileId,
      reason: "Parser Failed",
    });
    return;
  }
  await writeFile(testCase.jsonFilePath, resultASTString);
  passResult.push({
    kind: "ExpectPass",
    fileId: testCase.fileId,
    filePath: testCase.jsFilePath,
  });
}
/**
 * Run given test suit and return test result.
 * @param testSuite
 * @param isUpdate
 * @returns
 */
export async function runTestSuit(
  testSuite: TestSuite,
  isUpdate: boolean,
): Promise<TestResult> {
  const { expectFailedTestCases, expectPassTestCases } = testSuite;
  const passResult: Array<PassTestCaseResult> = [];
  const failedResult: Array<FailedTestCasesResult> = [];
  const skipResult: Array<SkipTestCaseResult> = [];
  await Promise.all(
    isUpdate
      ? [
          ...expectPassTestCases.map((testCase) =>
            updateTestCase(testCase, passResult, failedResult),
          ),
        ]
      : [
          ...expectPassTestCases.map((testCase) =>
            runExpectPassTestCase(testCase, passResult, failedResult, skipResult),
          ),
          ...expectFailedTestCases.map((testCase) =>
            runExpectFailedTestCase(testCase, passResult, failedResult),
          ),
        ],
  );
  return {
    passResult,
    failedResult,
    skipResult: isUpdate
      ? expectFailedTestCases.map((testCase) => ({
          fileId: testCase.fileId,
          filePath: testCase.jsFilePath,
        }))
      : skipResult,
  };
}
