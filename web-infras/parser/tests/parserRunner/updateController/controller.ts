import { ChildProcess, fork } from "node:child_process";
import path from "node:path";
import { getTestSuiteIterator } from "../helpers/getTestCase";
import {
  TestCase,
  TestCaseIterator,
  UpdateTestCaseResult,
  UpdatePassTestCaseResult,
  UpdateFailedTestCaseResult,
  UpdateTimeoutTestCaseResult,
  UpdateTestCaseResultSuite,
} from "../type";

const WORKER_NUM = 5;

async function createChildPorcessController(
  iter: TestCaseIterator,
  processes: Array<ChildProcess>,
  index: number,
  suite: UpdateTestCaseResultSuite,
) {
  let childProcess: ChildProcess = processes[index];
  async function waitForTestCaseResult(testCase: TestCase): Promise<UpdateTestCaseResult> {
    return new Promise((resolve) => {
      childProcess.send(testCase);
      let flag = false;
      let timerId: NodeJS.Timeout | null = null;
      childProcess.on("message", (testCaseResult: UpdateTestCaseResult) => {
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
    if (testCase.kind === "ExpectFailedTestCase") {
      continue;
    }
    const result = await waitForTestCaseResult(testCase);
    childProcess.removeAllListeners();
    switch (result.kind) {
      case "Timeout": {
        suite.timeoutResult.push(result);
        childProcess.kill();
        processes[index] = fork(path.join(__dirname, "worker.ts"));
        childProcess = processes[index];
        break;
      }
      case "ExpectPass":
      case "ExpectFailed" /** expect failed should be unreach */: {
        suite.passResult.push(result);
        break;
      }
      default: {
        suite.failedResult.push(result);
        break;
      }
    }
  }
}

export async function startUpdateController() {
  const testCaseIter = await getTestSuiteIterator();
  const processes: Array<ChildProcess> = [];
  for (let i = 0; i < WORKER_NUM; ++i) {
    processes.push(fork(path.join(__dirname, "worker.ts")));
  }
  const passResult: Array<UpdatePassTestCaseResult> = [];
  const failedResult: Array<UpdateFailedTestCaseResult> = [];
  const timeoutResult: Array<UpdateTimeoutTestCaseResult> = [];
  const suite: UpdateTestCaseResultSuite = {
    passResult,
    failedResult,
    timeoutResult,
  };
  const promises = processes.map((_, index) =>
    createChildPorcessController(testCaseIter, processes, index, suite),
  );
  await Promise.all(promises);

  return suite;
}
