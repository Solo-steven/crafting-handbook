import path from "path";
import { readdir, stat } from "fs/promises";
import { ExpectPassTestCase, ExpectFailedTestCase, TestSuite, ExpectConfig } from "./type";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

const jsFileRegex = new RegExp(".*.js$");
/**
 *
 * @param jsRoot given js files dir root.
 * @param jsonRoot given json files dir root.
 * @param testCase
 */
async function recursivelyFindTestCase(
  jsDirPath: string,
  expectPassTestCases: Array<ExpectPassTestCase>,
  expectFailedTestCases: Array<ExpectFailedTestCase>,
  getFileIdCallback: (filePath: string) => string,
) {
  const allFilesInJsDir = await readdir(jsDirPath);
  const subDir: Array<Promise<unknown>> = [];
  for (const fileName of allFilesInJsDir) {
    const isDir = (await stat(path.join(jsDirPath, fileName))).isDirectory();
    if (isDir) {
      const nextJsDirPath = path.join(jsDirPath, fileName);
      subDir.push(
        recursivelyFindTestCase(nextJsDirPath, expectPassTestCases, expectFailedTestCases, getFileIdCallback),
      );
      continue;
    }
    if (!jsFileRegex.test(fileName)) {
      continue;
    }
    const jsFilePath = path.join(jsDirPath, fileName);
    const expectFilePath = path.join(jsDirPath, "expect.json");
    const expectFileString = await readFile(expectFilePath, { encoding: "utf-8" });
    const expectObj: ExpectConfig = JSON.parse(expectFileString);
    const fileNameWithoutExtend = fileName.split(".")[0];
    const fileNameRenameToOutputArray = fileNameWithoutExtend.split("/");
    fileNameRenameToOutputArray.pop();
    const fileNameRenameToOutput = fileNameRenameToOutputArray.join("/");
    const jsonFilePath = path.join(jsDirPath, `${fileNameRenameToOutput}/output.json`);
    if (expectObj.expect === "Failed") {
      expectFailedTestCases.push({
        jsFilePath,
        fileId: getFileIdCallback(jsDirPath),
        config: expectObj.config,
      });
    } else {
      expectPassTestCases.push({
        jsFilePath,
        jsonFilePath,
        fileId: getFileIdCallback(jsDirPath),
        isJsonFileExist: existsSync(jsonFilePath),
        config: expectObj.config,
      });
    }
  }
  await Promise.all(subDir);
}
/**
 * Main function for find all test case under `cases` and
 * `esprima` folder, using `recursivelyAddTestCase ` as
 * helper function
 * @returns
 */
export async function getTestSuite(): Promise<TestSuite> {
  // babel test case
  const babelJsRoot = path.join(__dirname, "../fixtures/babel");
  const babelTestCaseGetFileId = (filePath: string) => {
    const suffix = filePath.split(babelJsRoot)[1];
    return `/babel${suffix}`;
  };
  // model-checking test case
  const selfAddedJsRoot = path.join(__dirname, "../fixtures/self-added");
  const selfAddedTestCaseGetFileId = (filePath: string) => {
    const suffix = filePath.split(selfAddedJsRoot)[1];
    return `/self-added${suffix}`;
  };
  // esprima test case
  const esprimaJsRoot = path.join(__dirname, "../fixtures/esprima");
  const esprimaTestCaseGetFileId = (filePath: string) => {
    const suffix = filePath.split(esprimaJsRoot)[1];
    return `/esprima${suffix}`;
  };
  // uncatgory test case
  // const uncategoryJsonRoot = path.join(__dirname, "../fixtures/uncategory");
  // const uncategoryJsRoot = path.join(__dirname, "../../../../assets/js/parse/uncategory");
  // const uncategoryTestCaseGetFileId = (filePath: string) => {
  //   const suffix = filePath.split(uncategoryJsRoot)[1];
  //   return `/uncategory${suffix}`;
  // };

  const expectPassTestCases: Array<ExpectPassTestCase> = [];
  const expectFailedTestCases: Array<ExpectPassTestCase> = [];
  await Promise.all([
    recursivelyFindTestCase(babelJsRoot, expectPassTestCases, expectFailedTestCases, babelTestCaseGetFileId),
    recursivelyFindTestCase(
      selfAddedJsRoot,
      expectPassTestCases,
      expectFailedTestCases,
      selfAddedTestCaseGetFileId,
    ),
    recursivelyFindTestCase(
      esprimaJsRoot,
      expectPassTestCases,
      expectFailedTestCases,
      esprimaTestCaseGetFileId,
    ),
    // recursivelyFindTestCase(
    //   uncategoryJsRoot,
    //   uncategoryJsonRoot,
    //   expectPassTestCases,
    //   expectFailedTestCases,
    //   uncategoryTestCaseGetFileId,
    // ),
  ]);

  return { expectFailedTestCases, expectPassTestCases };
}
