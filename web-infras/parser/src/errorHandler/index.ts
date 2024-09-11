/**
 * Error handler to record a recoverable error and print it
 * as a format message
 */
import { SourcePosition } from "web-infra-common";
import { SyntaxError, SyntaxErrorHandler } from "./type";

export function createErrorHandler(code: string): SyntaxErrorHandler {
  const errors: Array<SyntaxError> = [];
  function pushSyntaxErrors(...syntaxErrors: Array<SyntaxError>) {
    errors.push(...syntaxErrors);
  }
  function haveError() {
    return errors.length > 0;
  }
  function formatErrorString() {
    let formatString = "";
    for (const err of errors) {
      formatString += printError(err);
    }
    return formatString;
  }
  function printError(error: SyntaxError) {
    const [lineStart, lineEnd] = getLineStartAndEnd(error.position);
    const arrayLen = error.position.index - lineStart - 1 >= 0 ? error.position.index - lineStart - 1 : 0;
    return `[SyntaxError]: ${error.message} (${error.position.row},${error.position.col})\n${error.position.row}|${code.slice(lineStart, lineEnd)}\n |${printSpace(arrayLen)}^\n`;
  }
  function getLineStartAndEnd(position: SourcePosition) {
    let lineStart = 0;
    for (lineStart = position.index - 1; lineStart > 0; --lineStart) {
      if (code[lineStart] === "\n") {
        break;
      }
    }
    let lineEnd = 0;
    for (lineEnd = position.index + 1; lineEnd < code.length; ++lineEnd) {
      if (code[lineEnd] === "\n") {
        break;
      }
    }
    return [lineStart === 0 ? lineStart : lineStart + 1, lineEnd];
  }
  function printSpace(len: number): string {
    return new Array(len)
      .fill(0)
      .map(() => " ")
      .join("");
  }
  return {
    pushSyntaxErrors,
    haveError,
    formatErrorString,
  };
}
