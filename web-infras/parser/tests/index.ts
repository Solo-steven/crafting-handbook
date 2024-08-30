import runParserTestCases from "./parserRunner";
import run3partyTestCase from "./3partyTestRunner";
import chalk from "chalk";

async function main() {
  const [parserReport, thirdPartyReport] = await Promise.all([runParserTestCases(), run3partyTestCase()]);
  const parseTestCaseResult = parserReport();
  const thirdPartyTestCaseResult = thirdPartyReport();
  const isPass = parseTestCaseResult && thirdPartyTestCaseResult;
  if (isPass) {
    console.log(chalk.bold(chalk.green("================ Test Case Pass !!! ================")));
  } else {
    console.log(chalk.bold(chalk.red("================ Test Case Failed !!! ================")));
  }
  return process.exit(isPass ? 0 : 1);
}

main();
