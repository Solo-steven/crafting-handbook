import { TestCase } from "./type";
import { runExpectFailedTestCase, runExpectPassTestCase } from "./testRunner";

process.on("message", async (testCase: TestCase) => {
  if (testCase.kind === "ExpectPassTestCase") {
    const result = await runExpectPassTestCase(testCase);
    process.send!(result);
  } else {
    const result = await runExpectFailedTestCase(testCase);
    process.send!(result);
  }
});
