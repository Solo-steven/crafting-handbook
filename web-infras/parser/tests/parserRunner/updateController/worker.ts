import { TestCase } from "../type";
import { runUpdateExpectFailedTestCase, runUpdateExpectPassTestCase } from "../helpers/testRunner";

process.on("message", async (testCase: TestCase) => {
  if (testCase.kind === "ExpectPassTestCase") {
    const result = await runUpdateExpectPassTestCase(testCase);
    process.send!(result);
  } else {
    const result = await runUpdateExpectFailedTestCase(testCase);
    process.send!(result);
  }
});
