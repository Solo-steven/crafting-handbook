import { readFile } from "fs/promises";
import { ExpectPassTestCase, ExpectFailedTestCase, TestCaseResult } from "./type";
import { transformSyntaxKindToLiteral } from "./transform";
import { parse } from "@/src/index";
import { ParserConfig } from "@/src/parser/config";

/**
 * Try to parse a code string, return format string if no parse
 * error, return null if parse error.
 * @param code
 * @returns {string | null} return null if parse failed.
 */
function tryParseCodeStringIntoASTString(code: string, config?: ParserConfig): string | null {
  try {
    const ast = parse(code, config);
    transformSyntaxKindToLiteral(ast);
    return JSON.stringify(ast, null, 4);
  } catch {
    return null;
  }
}
/**
 * Run a test case expect to be pass
 * @param testCase
 * @returns testCaseResult
 */
export async function runExpectPassTestCase(testCase: ExpectPassTestCase) {
  if (!testCase.isJsonFileExist) {
    return {
      kind: "Skip",
      fileId: testCase.fileId,
      filePath: testCase.jsFilePath,
    };
  }
  const [codeBuffer, astBuffer] = await Promise.all([
    readFile(testCase.jsFilePath),
    readFile(testCase.jsonFilePath),
  ]);
  const resultASTString = tryParseCodeStringIntoASTString(codeBuffer.toString(), testCase.config);
  const expectASTString = astBuffer.toString();
  if (resultASTString === null || expectASTString !== resultASTString) {
    return {
      kind: "ExpectPassButFailed",
      filePath: testCase.jsFilePath,
      fileId: testCase.fileId,
      reason: resultASTString === null ? "Parse Error" : "Diff Error",
    };
  }
  return {
    kind: "ExpectPass",
    fileId: testCase.fileId,
    filePath: testCase.jsFilePath,
  };
}
/**
 * Run a test case expect to be failed.
 * @param testCase
 * @param passResult
 * @param failedResult
 * @returns
 */
export async function runExpectFailedTestCase(testCase: ExpectFailedTestCase): Promise<TestCaseResult> {
  const codeBuffer = await readFile(testCase.jsFilePath);
  const resultASTString = tryParseCodeStringIntoASTString(codeBuffer.toString(), testCase.config);
  if (resultASTString !== null) {
    return {
      kind: "ExpectFailedButPass",
      filePath: testCase.jsFilePath,
      fileId: testCase.fileId,
    };
  }
  return {
    fileId: testCase.fileId,
    filePath: testCase.jsFilePath,
    kind: "ExpectFailed",
  };
}
/**
 * Update a test case expect to be pass
 * @param testCase
 * @param passResult
 * @param failedResult
 * @returns
 */
// async function updateTestCase(
//   testCase: ExpectPassTestCase,
//   passResult: Array<PassTestCaseResult>,
//   failedResult: Array<FailedTestCasesResult>,
// ) {
//   const codeBuffer = await readFile(testCase.jsFilePath);
//   const resultASTString = tryParseCodeStringIntoASTString(codeBuffer.toString(), testCase.config);
//   if (resultASTString === null) {
//     failedResult.push({
//       kind: "ExpectPassButFailed",
//       filePath: testCase.jsFilePath,
//       fileId: testCase.fileId,
//       reason: "Parser Failed",
//     });
//     return;
//   }
//   await writeFile(testCase.jsonFilePath, resultASTString);
//   passResult.push({
//     kind: "ExpectPass",
//     fileId: testCase.fileId,
//     filePath: testCase.jsFilePath,
//   });
// }
/**
 * Run given test suit and return test result.
 * @param testSuite
 * @param isUpdate
 * @returns
 */
// export async function runTestSuit(testSuite: TestSuite, isUpdate: boolean): Promise<TestResult> {
//   const { expectFailedTestCases, expectPassTestCases } = testSuite;
//   const passResult: Array<PassTestCaseResult> = [];
//   const failedResult: Array<FailedTestCasesResult> = [];
//   const skipResult: Array<SkipTestCaseResult> = [];
//   await Promise.all(
//     isUpdate
//       ? [...expectPassTestCases.map((testCase) => updateTestCase(testCase, passResult, failedResult))]
//       : [
//           ...expectPassTestCases.map((testCase) =>
//             runExpectPassTestCase(testCase, passResult, failedResult, skipResult),
//           ),
//           ...expectFailedTestCases.map((testCase) =>
//             runExpectFailedTestCase(testCase, passResult, failedResult),
//           ),
//         ],
//   );
//   return {
//     passResult,
//     failedResult,
//     skipResult: isUpdate
//       ? expectFailedTestCases.map((testCase) => ({
//           fileId: testCase.fileId,
//           filePath: testCase.jsFilePath,
//         }))
//       : skipResult,
//   };
// }
