/* eslint-env node */
import path from "path";
import { readdir, stat, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { createParser } from "@/src/parser";
import { transformSyntaxKindToLiteral } from "./transform";
/**
 *  Env Variable
 */
const isUpdate = Boolean(process.env.TEST_UPDATE) || false;
const gate = Number(process.env.TEST_GATE) || .95;
// eslint-disable-next-line no-useless-escape
const jsFileRegex = new RegExp('.*\.js$');
// eslint-disable-next-line no-useless-escape
const jsonFileRegex = new RegExp('.*\.json$');
const invalidFileReg = new RegExp('invalid');
/**
 * Test structure for test case.
 * @property {string} jsPath  absolute path for js file in current os file system
 * @property {string} jsonPath absolute path for json file in current os file system
 * @property {string} fileName part of file path start with /cases/ and /esprima/ dir
 */
interface TestCase {
    jsPath: string;
    jsonPath: string;
    fileName: string;
}
/**
 * Helper function for `findAllTestCase`, using recurion to find all test case 
 * under given root dir.
 * @param {string} dirPath 
 * @param {string} prefixFileName 
 * @param {string} casesPath 
 * @param {string} shouldNotExistPath 
 */
async function recursivelyAddTestCase(dirPath: string, prefixFileName: string, casesPath: Array<TestCase>, shouldNotExistPath: Array<string>){
    const filesPaths = await readdir(dirPath);
    const subDir: Array<Promise<void>> = [];
    for(const filePath of filesPaths) {
        const isDir = (await stat(path.join(dirPath, filePath))).isDirectory();
        if(isDir) {
            subDir.push(recursivelyAddTestCase(path.join(dirPath, filePath), path.join(prefixFileName, filePath), casesPath, shouldNotExistPath));
            continue;
        }
        if(jsFileRegex.test(filePath)) {
            const fileName = filePath.split(".")[0];
            casesPath.push({
                jsPath: path.join(dirPath, filePath),
                jsonPath: existsSync(path.join(dirPath, `${fileName}.json`)) ? path.join(dirPath,`${fileName}.json`) : "",
                fileName: path.join(prefixFileName, filePath)
            })
        }
        if(jsonFileRegex.test(filePath)) {
            continue;
        }
        shouldNotExistPath.push(filePath);
    }
    await Promise.all(subDir);
}
/**
 * Main function for find all test case under `cases` and 
 * `esprima` folder, using `recursivelyAddTestCase ` as 
 * helper function
 * @returns 
 */
async function findAllTestCase(): Promise<Array<TestCase>> {
    const casesRoot = path.join(__dirname, "cases");
    const fixtureRoot = path.join(__dirname, "esprima");
    const babelRoot = path.join(__dirname, "babel");
    const testCasesPaths: Array<TestCase> = []
    const shouldNotExistedFilePath: Array<string> = [];
    await Promise.all(
        [
            recursivelyAddTestCase(casesRoot, "cases", testCasesPaths, shouldNotExistedFilePath),
            recursivelyAddTestCase(fixtureRoot, "esprima", testCasesPaths, shouldNotExistedFilePath),
            recursivelyAddTestCase(babelRoot, "babel", testCasesPaths, shouldNotExistedFilePath),
        ]
    )
   return testCasesPaths;
}
/**
 *  Result structure of every test case, 
 *  @property {string} fileName, is file path start with cases` and `fixture` folder.
 *  @property {string} result is used when failed.
 */
interface Result {
    fileName: string;
    result: string;
}
const failedTestCases: Array<Result> = [];
const expectFailedTestCase: Array<Result> = [];
const expectFaildButPassCase: Array<string> = []
const skipTestCases: Array<Result> = [];
const passTestCases: Array<Result> = [];
const updateTestCases: Array<Result> = [];
const TempIgnoreCases: Array<String> = [
    /** Pending Problems */
    //  ==== strict mode problem
    "esprima/ES6/arrow-function/invalid-param-strict-mode.js",
    "esprima/declaration/function/invalid-strict-labelled-function-declaration.js",
    // strict mode generator problem
    "esprima/ES6/yield/invalid-yield-generator-strict-function-expression.js",
    "esprima/ES6/yield/invalid-yield-generator-strict-function-parameter.js",
    "esprima/ES6/yield/invalid-yield-strict-array-pattern.js",
    "esprima/ES6/yield/invalid-yield-strict-arrow-parameter-name.js",
    "esprima/ES6/yield/invalid-yield-strict-binding-element.js",
    "esprima/ES6/yield/invalid-yield-strict-catch-parameter.js",
    "esprima/ES6/yield/invalid-yield-strict-formal-parameter.js",
    "esprima/ES6/yield/invalid-yield-strict-function-declaration.js",
    "esprima/ES6/yield/invalid-yield-strict-function-expression.js",
    "esprima/ES6/yield/invalid-yield-strict-identifier.js",
    "esprima/ES6/yield/invalid-yield-strict-lexical-declaration.js",
    "esprima/ES6/yield/invalid-yield-strict-rest-parameter.js",
    "esprima/ES6/yield/invalid-yield-strict-variable-declaration.js",
    // yield predi followed argument
    "esprima/ES6/yield/ternary-yield.js",
    //  ==== unicode and excap char problem
    "esprima/ES6/template-literals/invalid-escape.js",
    "esprima/ES6/template-literals/invalid-hex-escape-sequence.js",
    "esprima/ES6/template-literals/invalid_octal-literal.js",
    "esprima/ES6/template-literals/invalid_strict-octal-literal.js",
    "esprima/es2020/importmeta/invalid-unicode-escape-import.module.js",
    "esprima/es2020/importmeta/unicode-escape-meta.module.js",
    //  ==== other
    "esprima/es2018/dynamic-import/invalid-new-import-call.js",
    "esprima/ES6/arrow-function/invalid-non-arrow-param-followed-by-arrow.js",
    // ==== Label Statement Problem
];
/**
 * Helper function that parse code string and
 * transform to more readable ast format string
 * @param {string} code 
 * @returns {string} 
 */
function toASTString(code: string): string {
    const ast = createParser(code.toString()).parse();
    transformSyntaxKindToLiteral(ast);
    return JSON.stringify(ast, null, 4);
}
/**
 * Helper function for running a test case if js path and json path all are exsited.
 * if test case pass, add to pass array.
 * if test failed, add to failed array.
 * @param {TestCase} testCase 
 */
async function runTestCase(testCase: TestCase) {
    if(!testCase.fileName || !testCase.jsPath || !testCase.jsonPath) {
        throw new Error(`[Internal Error]: Something wrong happend in test runner.Please report to github`);
    }
    const [code, expectAST] = await Promise.all([
        readFile(testCase.jsPath),
        readFile(testCase.jsonPath),
    ]);
    try {
        const codeString = code.toString();
        const astString = toASTString(codeString);
        const expectASTString = expectAST.toString();
        if(astString === expectASTString) {
            const index = TempIgnoreCases.findIndex((ignoreTestCase) => testCase.fileName === ignoreTestCase);
            if(index !== -1) {
                expectFaildButPassCase.push(testCase.fileName);
            }
            passTestCases.push({
                fileName: testCase.fileName,
                result: "",
            });
        }else {
            failedTestCases.push({
                fileName: testCase.fileName,
                result: "{ Diff Error }",
            });
        }
    } catch(e) {
        const index = TempIgnoreCases.find((ignoreTestCase) => testCase.fileName === ignoreTestCase);
        console.log(index);
        if(typeof(index) === "number" && index !== -1 ) {
            expectFaildButPassCase.push(testCase.fileName)
            return;
        }
        failedTestCases.push({
            fileName: testCase.fileName,
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            result: `{ Compiler Error }: ${e?.toString()} `
        })
    }
}
/**
 *  Helperfunction for running a test case that should be 
 *  invalid.
 *  if it throw a parse error, add to pass arrray
 *  if it shows no error, add to failed array.
 *  @param {TestCase} testCase
 */
async function runInvalidTestCase(testCase: TestCase) {
    try {
        const code = await readFile(testCase.jsPath);
        toASTString(code.toString());
        const index = TempIgnoreCases.findIndex((ignoreTestCase) => testCase.fileName === ignoreTestCase);
        if(typeof(index) === "number" && index !== -1 ) {
            expectFailedTestCase.push({
                fileName: testCase.fileName,
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                result:  "This case should failed",
            })
            return;
        }else {
            failedTestCases.push({
                fileName: testCase.fileName,
                result: "This case should failed",
            })
        }
    } catch(e) {
        const index = TempIgnoreCases.findIndex((ignoreTestCase) => testCase.fileName === ignoreTestCase);
        if(index !== -1) {
            expectFaildButPassCase.push(testCase.fileName);
        }
        passTestCases.push({
            fileName: testCase.fileName,
            result: ``
        })
    }
}
/**
 * Helper function for runnung a test case and update json file
 * if update success, add to update array
 * if failed, add to failed array.
 * @param {TestCase} testCase 
 */
async function updateTestCase(testCase: TestCase) {
    let isExisted = true;
    if(!testCase.jsonPath) {
        isExisted = false
        testCase.jsonPath = testCase.jsPath.split(".")[0] + ".json";
    }
    try {
        const code = await readFile(testCase.jsPath);
        const astString = toASTString(code.toString());
        if(testCase.jsonPath && isExisted) {
            const existedASTString = await readFile(testCase.jsonPath);
            if(existedASTString.toString() === astString) {
                passTestCases.push({
                    fileName: testCase.fileName,
                    result: "",
                })
                return;
            }
        }
        await writeFile(testCase.jsonPath, astString, { flag: isExisted ? "w" : "wx" });
        updateTestCases.push({
            fileName: testCase.fileName,
            result: "",
        })
    } catch(e) {
        const index = TempIgnoreCases.findIndex((ignoreTestCase) => testCase.fileName === ignoreTestCase);
        if(typeof(index) === "number" && index !== -1 ) {
            expectFailedTestCase.push({
                fileName: testCase.fileName,
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                result: `{ Compiler Error }: ${e?.toString()} `
            })
            return;
        }
        failedTestCases.push({
            fileName: testCase.fileName,
            result: `{ Compiler Error When Update Case }(${e?.toString()})`
        })
    }
}
async function runerAllTestCase() {
    const testCases = await findAllTestCase();
    await Promise.all(testCases.map((testCase) => {
        if(invalidFileReg.test(testCase.fileName)) {
            return runInvalidTestCase(testCase);
        }
        if(isUpdate) {
            return updateTestCase(testCase);
        }
        // pass test case.
        if(!testCase.jsonPath && !isUpdate) {
            skipTestCases.push({
                fileName: testCase.fileName,
                result: `Skip because ${testCase.fileName} does not has corresponse json file.`
            })
            return;
        }
        // run test case
        if(testCase.fileName && testCase.jsPath && testCase.fileName) {
            return runTestCase(testCase);
        }
    }));
}
const thirdPartyTestCase = [
    { title: "Jquery uncompressed", url: "https://code.jquery.com/jquery-3.7.1.js", code: "" },
    { title: "react development", url: "https://unpkg.com/react@18/umd/react.development.js", code: "" },
    { title: "react dom development", url: "https://unpkg.com/react-dom@18/umd/react-dom.development.js", code: "" },
]

async function run3partyTestCase() {
    await Promise.all(thirdPartyTestCase.map(async (testCase) => {
        const code = await fetch(testCase.url).then(resp => resp.text());
        testCase.code = code;
    }));
    console.log("==========================================");
    for(const testCode of thirdPartyTestCase) {
        try{
            const parser = createParser(testCode.code);
            parser.parse();
            console.log(`|${testCode.title}|: parse PASS.`);
        }catch(e) {
            console.log(`|${testCode.title}|: parse FAILED.`);
        }
    }
    console.log("==========================================");
}

function report() {
    // for(const testCase of passTestCases) {
    //     console.log((`|PASS|: ${testCase.fileName}`));
    // }
    // for(const testCase of skipTestCases) {
    //     console.log((`|Skip|: ${testCase.fileName}`));
    //     console.log((`  |----> ${testCase.result}`));
    // }
    // for(const testCase of updateTestCases) {
    //     console.log((`|Update|: ${testCase.fileName}`));
    // }
    // for(const testCase of expectFailedTestCase) {
    //     console.log((`|Expect Failed|: ${testCase.fileName}`));
    //     console.log((`  |----> ${testCase.result}`));
    // }
    // for(const testCase of expectFaildButPassCase) {
    //     console.log((`|Expect Failed But Pass|: ${testCase}`));
    // }
    // for(const testCase of failedTestCases) {
    //     console.log((`|Failed|: ${testCase.fileName}`));
    //     console.log((`  |----> ${testCase.result}`));
    // }
    const allTestCaseCount = failedTestCases.length + skipTestCases.length + passTestCases.length + updateTestCases.length + expectFailedTestCase.length + expectFaildButPassCase.length;
    const passRate = passTestCases.length / allTestCaseCount;
    const failedRate = failedTestCases.length / allTestCaseCount;
    const updateRate = updateTestCases.length / allTestCaseCount;
    console.log("\n==========================================================\n");
    console.log(`Pass rate: ${passTestCases.length} / ${allTestCaseCount}(${passRate})`);
    console.log(`Update rate: ${updateTestCases.length} / ${allTestCaseCount}(${updateRate})`);
    console.log(`Failed rate : ${failedTestCases.length} / ${allTestCaseCount}(${failedRate})`);
    console.log(`Skip rate: ${skipTestCases.length} / ${allTestCaseCount}`);
    console.log(`Expect Failed rate: ${expectFailedTestCase.length} /${allTestCaseCount} `);
    console.log(`Expect Failed But Passed rate: ${expectFaildButPassCase.length} /${allTestCaseCount}`)
    console.log("\n==========================================================\n");
}
/**
 * Script Entry point
 */
runerAllTestCase()
    .then(async () => {
        report();
        await run3partyTestCase();
    })
    .catch(console.log);