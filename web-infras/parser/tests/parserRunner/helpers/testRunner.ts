import { readFile, writeFile } from "fs/promises";
import { ExpectPassTestCase, ExpectFailedTestCase, TestCaseResult, UpdateTestCaseResult } from "../type";
import { transformSyntaxKindToLiteral } from "./transform";
import { parse } from "@/src/index";
import { ParserConfig } from "@/src/parser/config";

/**
 * Try to parse a code string, return format string if no parse
 * error, return null if parse error.
 * @param code
 */
function tryParseCodeStringIntoASTString(code: string, config?: ParserConfig): string | Error {
  try {
    const ast = parse(code, config);
    transformSyntaxKindToLiteral(ast);
    return JSON.stringify(ast, null, 4);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return e;
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
  if (typeof resultASTString === "object" || expectASTString !== resultASTString) {
    return {
      kind: "ExpectPassButFailed",
      filePath: testCase.jsFilePath,
      fileId: testCase.fileId,
      reason: typeof resultASTString === "object" ? "Parse Error" : "Diff Error",
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
 * @returns
 */
export async function runExpectFailedTestCase(testCase: ExpectFailedTestCase): Promise<TestCaseResult> {
  const codeBuffer = await readFile(testCase.jsFilePath);
  const resultASTString = tryParseCodeStringIntoASTString(codeBuffer.toString(), testCase.config);
  if (typeof resultASTString !== "object") {
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
 * @returns
 */
export async function runUpdateExpectPassTestCase(
  testCase: ExpectPassTestCase,
): Promise<UpdateTestCaseResult> {
  const codeBuffer = await readFile(testCase.jsFilePath);
  const resultASTString = tryParseCodeStringIntoASTString(codeBuffer.toString(), testCase.config);
  if (typeof resultASTString === "object") {
    return {
      kind: "ExpectPassButFailed",
      filePath: testCase.jsFilePath,
      fileId: testCase.fileId,
      reason: "Parser Failed",
    };
  }
  await writeFile(testCase.jsonFilePath, resultASTString);
  return {
    kind: "ExpectPass",
    fileId: testCase.fileId,
    filePath: testCase.jsFilePath,
  };
}

/**
 *
 */
export async function runUpdateExpectFailedTestCase(
  testCase: ExpectFailedTestCase,
): Promise<UpdateTestCaseResult> {
  const codeBuffer = await readFile(testCase.jsFilePath);
  const resultASTString = tryParseCodeStringIntoASTString(codeBuffer.toString(), testCase.config);
  if (typeof resultASTString === "string") {
    return {
      kind: "ExpectFailedButPass",
      fileId: testCase.fileId,
      filePath: testCase.jsFilePath,
      reason: "",
    };
  }
  await writeFile(testCase.outputFilePath, resultASTString.message);
  return {
    kind: "ExpectPass",
    fileId: testCase.fileId,
    filePath: testCase.jsFilePath,
  };
}
