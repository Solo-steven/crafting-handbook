import { TestCase } from "../type";
import { runExpectFailedTestCase, runExpectPassTestCase } from "../helpers/testRunner";

const isCI = Boolean(process.env.TEST_CI) || false;

process.on("message", async (testCase: TestCase) => {
  if (testCase.kind === "ExpectPassTestCase") {
    const result = await runExpectPassTestCase(testCase);
    if (isCI) {
      console.log("Finish Test Case:", testCase.fileId);
    }
    process.send!(result);
  } else {
    const result = await runExpectFailedTestCase(testCase);
    if (isCI) {
      console.log("Finish Test Case:", testCase.fileId);
    }
    process.send!(result);
  }
});
