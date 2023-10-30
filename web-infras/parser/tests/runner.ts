/* eslint-env node */
import path from "path";
import { readdir, stat, readFile, writeFile } from "fs/promises";
import { createParser } from "@/src/parser";
import { transformSyntaxKindToLiteral } from "./transform";
/**
 *  Env Variable
 */
const isUpdate = Boolean(process.env.TEST_UPDATE) || false;
const gate = Number(process.env.TEST_GATE) || .95;
const isCI = Boolean(process.env.TEST_CI) || false;
let CIPass = false;
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
    isExisted: boolean;
}
/**
 * 
 * @param jsRoot given js files dir root.
 * @param jsonRoot given json files dir root.
 * @param testCase 
 */
async function recursivelyFindTestCase(jsRoot: string, jsonRoot: string, testCase: Array<TestCase> ) {
    const [jsDir, jsonDir] = await Promise.all([readdir(jsRoot), readdir(jsonRoot)]);
    const subDir: Array<Promise<void>> = [];
    for(const jsFileName of jsDir) {
        const isDir = (await stat(path.join(jsRoot, jsFileName))).isDirectory();
        if(isDir) {
            subDir.push(recursivelyFindTestCase(path.join(jsRoot, jsFileName), path.join(jsonRoot, jsFileName), testCase));
            continue;
        }
        if(jsFileRegex.test(jsFileName)) {
            const fileName = jsFileName.split(".")[0];
            const jsPath =  path.join(jsRoot, jsFileName);
            const jsonPath = path.join(jsonRoot, `${fileName}.json`);
            testCase.push({
                jsPath,
                jsonPath,
                fileName: jsPath,
                isExisted: jsonDir.filter(file => file === `${fileName}.json`).length > 0 
            })  
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
async function findAllTestCase(): Promise<Array<TestCase>> {
    const modelCheckingJsonRoot = path.join(__dirname, "model-checking");
    const modelCheckingJsRoot = path.join(__dirname, "../../../assets/parse/model-checking");
    const esprimaJsonRoot = path.join(__dirname, "esprima");
    const esprimaJsRoot = path.join(__dirname, "../../../assets/parse/esprima");
    const uncategoryJsonRoot = path.join(__dirname, "uncategory");
    const uncategoryJsRoot = path.join(__dirname, "../../../assets/parse/uncategory");
    const testCases: Array<TestCase> = []
    await Promise.all(
        [
            recursivelyFindTestCase(modelCheckingJsRoot, modelCheckingJsonRoot, testCases),
            recursivelyFindTestCase(esprimaJsRoot, esprimaJsonRoot, testCases),
            recursivelyFindTestCase(uncategoryJsRoot, uncategoryJsonRoot, testCases),
        ]
    )

   return testCases
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
    // yield predi followed argument
    "esprima/ES6/yield/ternary-yield.js",
    //  ==== unicode and excap char problem
    "esprima/ES6/template-literals/invalid-escape.js",
    "esprima/ES6/template-literals/invalid-hex-escape-sequence.js",
    "esprima/ES6/template-literals/invalid_octal-literal.js",
    "esprima/ES6/template-literals/invalid_strict-octal-literal.js",
    //  ==== other
    "esprima/ES6/arrow-function/invalid-non-arrow-param-followed-by-arrow.js",
    // ==== dev pss, test failed ?
    "esprima/expression/binary/multiline_string_literal.js",
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
    const { isExisted } = testCase;
    try {
        const code = await readFile(testCase.jsPath);
        const astString = toASTString(code.toString());
        if(isExisted) {
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
        if(!testCase.isExisted && !isUpdate) {
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
    { title: "Jquery uncompressed", url: "https://code.jquery.com/jquery-3.7.1.js", code: "", pass: false, },
    { title: "react development", url: "https://unpkg.com/react@18/umd/react.development.js", code: "", pass: false,  },
    { title: "react dom development", url: "https://unpkg.com/react-dom@18/umd/react-dom.development.js", code: "", pass: false,  },
    { title: "vue esm brower prod min", url: "https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.4/vue.esm-browser.prod.min.js", code: "", pass: false}
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
            testCode.pass = true;
            console.log(`|${testCode.title}|: parse PASS.`);
        }catch(e) {
            testCode.pass = false;
            console.log(`|${testCode.title}|: parse FAILED.`);
        }
    }
    console.log("==========================================");
}

function report() {
    for(const testCase of passTestCases) {
        console.log((`|PASS|: ${testCase.fileName}`));
    }
    for(const testCase of skipTestCases) {
        console.log((`|Skip|: ${testCase.fileName}`));
        console.log((`  |----> ${testCase.result}`));
    }
    for(const testCase of updateTestCases) {
        console.log((`|Update|: ${testCase.fileName}`));
    }
    for(const testCase of expectFailedTestCase) {
        console.log((`|Expect Failed|: ${testCase.fileName}`));
        console.log((`  |----> ${testCase.result}`));
    }
    for(const testCase of expectFaildButPassCase) {
        console.log((`|Expect Failed But Pass|: ${testCase}`));
    }
    for(const testCase of failedTestCases) {
        console.log((`|Failed|: ${testCase.fileName}`));
        console.log((`  |----> ${testCase.result}`));
    }
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
    console.log("\n==========================================================");
    let passCount = 0;
    for(const testCode of thirdPartyTestCase) {
        if(testCode.pass) {
            console.log(`|${testCode.title}|: parse PASS.`);
            passCount ++;
        }else {
            console.log(`|${testCode.title}|: parse FAILED.`);
        }
    }
    console.log("===========================================================");
    if(isCI) {
        CIPass = allTestCaseCount === (passTestCases.length + expectFailedTestCase.length + expectFaildButPassCase.length + skipTestCases.length);
        CIPass &&= (passCount === thirdPartyTestCase.length)
    }
}
/**
 * Script Entry point
 */
async function main() {
    try{
        await runerAllTestCase();
        await run3partyTestCase();
        report();
    } catch(e) {
        throw new Error(`[Runtime Error]: ${e?.toString()}.`)
    }
    if(isCI && !CIPass) {
        if(!CIPass)
         throw new Error("[Some Test Case Failed]: please take look at test result.");
    }
}
main();