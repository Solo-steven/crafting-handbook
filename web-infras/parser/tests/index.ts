import runLexerTestCases from "./lexerRunner";
import runParserTestCases from "./parserRunner";

async function main() {
  const lexerReport = await runLexerTestCases();
  const parserReport = await runParserTestCases();
  lexerReport();
  parserReport();
}

main();
