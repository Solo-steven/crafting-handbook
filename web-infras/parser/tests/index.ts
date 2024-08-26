import runParserTestCases from "./parserRunner";
import run3partyTestCase from "./3partyTestRunner";

async function main() {
  const [parserReport, thirdPartyReport] = await Promise.all([runParserTestCases(), run3partyTestCase()]);
  parserReport();
  thirdPartyReport();
  return;
}

main();
