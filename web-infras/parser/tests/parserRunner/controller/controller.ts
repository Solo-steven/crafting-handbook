import { ChildProcess, fork } from "node:child_process";
import path from "node:path";
import { getTestSuiteIterator } from "../helpers/getTestCase";
import {
  TestCase,
  TestCaseIterator,
  TestCaseResult,
  PassTestCaseResult,
  FailedTestCasesResult,
  SkipTestCaseResult,
  TimeoutTestCaseResult,
} from "../type";

const WORKER_NUM = 5;

async function createChildPorcessController(
  iter: TestCaseIterator,
  processes: Array<ChildProcess>,
  index: number,
  passResult: Array<PassTestCaseResult>,
  failedResult: Array<FailedTestCasesResult>,
  skipResult: Array<SkipTestCaseResult>,
  timeoutResult: Array<TimeoutTestCaseResult>,
) {
  let childProcess: ChildProcess = processes[index];
  async function waitForTestCaseResult(testCase: TestCase): Promise<TestCaseResult> {
    return new Promise((resolve) => {
      childProcess.send(testCase);
      let flag = false;
      let timerId: NodeJS.Timeout | null = null;
      childProcess.on("message", (testCaseResult: TestCaseResult) => {
        flag = true;
        if (timerId) clearTimeout(timerId);
        resolve(testCaseResult);
        return;
      });
      // for timeout
      timerId = setTimeout(() => {
        if (flag === false) {
          resolve({
            kind: "Timeout",
            fileId: testCase.fileId,
            filePath: testCase.jsFilePath,
          });
        }
      }, 5000);
    });
  }
  // eslint-disable-next-line no-constant-condition
  while (1) {
    const testCase = iter.next();
    if (testCase === undefined) {
      childProcess.removeAllListeners();
      childProcess.kill();
      break;
    }
    const result = await waitForTestCaseResult(testCase);
    childProcess.removeAllListeners();
    switch (result.kind) {
      case "Timeout": {
        timeoutResult.push(result);
        childProcess.kill();
        processes[index] = fork(path.join(__dirname, "worker.ts"));
        childProcess = processes[index];
        break;
      }
      case "Skip": {
        skipResult.push(result);
        break;
      }
      case "ExpectPass":
      case "ExpectFailed": {
        passResult.push(result);
        break;
      }
      default: {
        failedResult.push(result);
        break;
      }
    }
  }
}

export async function startController() {
  const testCaseIter = await getTestSuiteIterator();
  const processes: Array<ChildProcess> = [];
  for (let i = 0; i < WORKER_NUM; ++i) {
    processes.push(fork(path.join(__dirname, "worker.ts")));
  }
  const passResult: Array<PassTestCaseResult> = [];
  const failedResult: Array<FailedTestCasesResult> = [];
  const skipResult: Array<SkipTestCaseResult> = [];
  const timeoutResult: Array<TimeoutTestCaseResult> = [];
  const promises = processes.map((_, index) =>
    createChildPorcessController(
      testCaseIter,
      processes,
      index,
      passResult,
      failedResult,
      skipResult,
      timeoutResult,
    ),
  );
  await Promise.all(promises);

  return {
    passResult,
    failedResult,
    skipResult,
    timeoutResult,
  };
}
