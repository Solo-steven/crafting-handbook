import runLexerTestCases from "./lexerRunner";
import runParserTestCases from "./parserRunner";
import run3partyTestCase from "./3partyTestRunner";

async function main() {
  const [lexerReport, parserReport, thirdPartyReport] = await Promise.all([
    runLexerTestCases(),
    runParserTestCases(),
    run3partyTestCase(),
  ]);
  lexerReport();
  parserReport();
  thirdPartyReport();
}

main();
