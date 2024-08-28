import { ExpectPassTestCase } from "../type";
import { runUpdateExpectPassTestCase } from "../helpers/testRunner";

process.on("message", async (testCase: ExpectPassTestCase) => {
  const result = await runUpdateExpectPassTestCase(testCase);
  process.send!(result);
});
