import { SourcePosition } from "web-infra-common";
import { Token } from "../lexer/type";

export type ExpectToken = Omit<Token, "kind" | "startPosition" | "endPosition"> & {
  start: SourcePosition;
  end: SourcePosition;
};
/**
 * Function Scope structure, Being used for determinate
 * current structure context for async, generator, in-
 * parameter and in strict mode.
 * @member {"FunctionContext"} type - type enum string.
 * @member {boolean} isAsync
 * @member {boolean} isGenerator
 * @member {boolean} inParameter
 * @member {boolean} inStrict
 */
export interface FunctionContext {
  type: "FunctionContext";
  isAsync: boolean;
  isGenerator: boolean;
  inParameter: boolean;
  isSimpleParameter: boolean;
  inStrict: boolean;
}
/**
 * Simple scope structure for block statement.
 * @member {"BlockStatement"} type - type enum string.
 */
export interface BlockContext {
  type: "BlockContext";
}
/**
 * Scope structure for function body and block statement,
 * just a conbinmation of function scope and block scope.
 */
export type ScopeContext = FunctionContext | BlockContext;
