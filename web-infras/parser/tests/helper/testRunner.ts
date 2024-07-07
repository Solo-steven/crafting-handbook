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
 *
 * @param code
 * @returns
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
