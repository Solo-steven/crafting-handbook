import path from "path";
import { readdir, stat } from "fs/promises";
import { ExpectPassTestCase, ExpectFailedTestCase, TestSuite } from "./type";

// eslint-disable-next-line no-useless-escape
const jsFileRegex = new RegExp(".*.js$");
const invalidFileReg = new RegExp("invalid");
/**
 *
 * @param jsRoot given js files dir root.
 * @param jsonRoot given json files dir root.
 * @param testCase
 */
async function recursivelyFindTestCase(
  jsDirPath: string,
  jsonDirPath: string,
  expectPassTestCases: Array<ExpectPassTestCase>,
  expectFailedTestCases: Array<ExpectFailedTestCase>,
) {
  const [jsFilesInJsDir, jsonFilesInJsonDir] = await Promise.all([readdir(jsDirPath), readdir(jsonDirPath)]);
  const subDir: Array<Promise<unknown>> = [];
  for (const jsFileName of jsFilesInJsDir) {
    const isDir = (await stat(path.join(jsDirPath, jsFileName))).isDirectory();
    if (isDir) {
      const nextJsDirPath = path.join(jsDirPath, jsFileName);
      const nextJsonDirPath = path.join(jsonDirPath, jsFileName);
      subDir.push(
        recursivelyFindTestCase(nextJsDirPath, nextJsonDirPath, expectPassTestCases, expectFailedTestCases),
      );
      continue;
    }
    if (!jsFileRegex.test(jsFileName)) {
      continue;
    }
    const fileName = jsFileName.split(".")[0];
    const jsFilePath = path.join(jsDirPath, jsFileName);
    const jsonFilePath = path.join(jsonDirPath, `${fileName}.json`);
    if (invalidFileReg.test(jsFilePath)) {
      expectFailedTestCases.push({
        jsFilePath,
        fileId: jsFilePath,
      });
      continue;
    }
    expectPassTestCases.push({
      jsFilePath,
      jsonFilePath,
      fileId: jsFilePath,
      isJsonFileExist: jsonFilesInJsonDir.filter((file) => file === `${fileName}.json`).length > 0,
    });
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
  const babelJsonRoot = path.join(__dirname, "../fixtures/babel");
  const babelJsRoot = path.join(__dirname, "../../../../assets/js/parse/babel");
  const modelCheckingJsonRoot = path.join(__dirname, "../fixtures/model-checking");
  const modelCheckingJsRoot = path.join(__dirname, "../../../../assets/js/parse/model-checking");
  const esprimaJsonRoot = path.join(__dirname, "../fixtures/esprima");
  const esprimaJsRoot = path.join(__dirname, "../../../../assets/js/parse/esprima");
  const uncategoryJsonRoot = path.join(__dirname, "../fixtures/uncategory");
  const uncategoryJsRoot = path.join(__dirname, "../../../../assets/js/parse/uncategory");

  const expectPassTestCases: Array<ExpectPassTestCase> = [];
  const expectFailedTestCases: Array<ExpectPassTestCase> = [];
  await Promise.all([
    recursivelyFindTestCase(babelJsRoot, babelJsonRoot, expectPassTestCases, expectFailedTestCases),
    recursivelyFindTestCase(
      modelCheckingJsRoot,
      modelCheckingJsonRoot,
      expectPassTestCases,
      expectFailedTestCases,
    ),
    recursivelyFindTestCase(esprimaJsRoot, esprimaJsonRoot, expectPassTestCases, expectFailedTestCases),
    recursivelyFindTestCase(uncategoryJsRoot, uncategoryJsonRoot, expectPassTestCases, expectFailedTestCases),
  ]);

  return { expectFailedTestCases, expectPassTestCases };
}
