import { tokenize } from "@/src/index";
import path from "path";
import { readdir, readFile, writeFile } from "fs/promises";
import { SytaxKindsMapLexicalLiteral } from "web-infra-common";
import chalk from "chalk";

const jsFileRegex = new RegExp(".*.js$");

type TestCase = {
  jsFilePath: string;
  jsonFilePath: string;
  fileId: string;
  isExisted: boolean;
};

type Result = {
  pass: string[];
  failed: string[];
  write: string[];
};

async function getTestCases(): Promise<Array<TestCase>> {
  const tokenizeJsonRoot = path.join(__dirname, "./fixtures/tokenize");
  const tokenizeJsRoot = path.join(__dirname, "../../../assets/js/tokenize");
  const [jsFiles, jsonFiles] = await Promise.all([readdir(tokenizeJsRoot), readdir(tokenizeJsonRoot)]);
  const testCases: Array<TestCase> = [];
  for (const jsFileName of jsFiles) {
    if (!jsFileRegex.test(jsFileName)) {
      continue;
    }
    const fileName = jsFileName.split(".")[0];
    const jsFilePath = path.join(tokenizeJsRoot, jsFileName);
    const jsonFilePath = path.join(tokenizeJsonRoot, `${fileName.split(".")[0]}.json`);
    testCases.push({
      jsFilePath,
      jsonFilePath,
      fileId: `/tokenize/${jsFileName}`,
      isExisted: jsonFiles.filter((p) => p === `${fileName.split(".")[0]}.json`).length > 0,
    });
  }
  return testCases;
}

async function runTestCases(testCases: Array<TestCase>): Promise<Result> {
  const result: Result = {
    pass: [],
    failed: [],
    write: [],
  };
  for (const testCase of testCases) {
    const [codeString, jsonString] = await Promise.all([
      readFile(testCase.jsFilePath, { encoding: "utf-8" }),
      testCase.isExisted ? readFile(testCase.jsonFilePath, { encoding: "utf-8" }) : Promise.resolve(),
    ]);
    const tokens = tokenize(codeString).map((token) => ({
      ...token,
      kind: SytaxKindsMapLexicalLiteral[token.kind],
    }));
    const tokensString = JSON.stringify(tokens, null, 4);
    if (jsonString) {
      if (tokensString === jsonString) {
        result.pass.push(testCase.fileId);
      } else {
        // console.log(jsonString, tokensString);
        result.failed.push(testCase.fileId);
      }
    } else {
      await writeFile(testCase.jsonFilePath, tokensString);
      result.write.push(testCase.fileId);
    }
  }
  return result;
}

export default async function runLexerTestCases() {
  const testCases = await getTestCases();
  const result = await runTestCases(testCases);
  const allTestCaseCount = result.failed.length + result.pass.length + result.write.length;
  return () => {
    console.log(chalk.bold(`=========== Lexer Test Case ===========`));
    console.log(`|---> ${chalk.green("Pass Cases")}: ${result.pass.length} / ${allTestCaseCount}`);
    console.log(`|---> ${chalk.red("Failed Cases")}: ${result.failed.length} / ${allTestCaseCount}`);
    for (const fileId of result.failed) {
      console.log(`  | --> ${chalk.red(fileId)}`);
    }
  };
}
