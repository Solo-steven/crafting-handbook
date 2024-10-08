import { createParser } from "@/src/parser";
import { createLexer } from "@/src/lexer";
import { Token } from "@/src/lexer/type";
import { SyntaxKinds } from "web-infra-common";
import { ParserUserConfig } from "./parser/config";
import { createErrorHandler } from "./errorHandler";

export function parse(code: string, config?: ParserUserConfig) {
  const errorHandler = createErrorHandler(code);
  const parser = createParser(code, errorHandler, config);
  const program = parser.parse();
  if (errorHandler.haveError()) {
    throw new Error(errorHandler.formatErrorString());
  }
  return program;
}
export function tokenize(code: string): Array<Token> {
  const lexer = createLexer(code);
  const tokens: Array<Token> = [];
  // eslint-disable-next-line no-constant-condition
  while (1) {
    const tokenKind = lexer.getTokenKind();
    tokens.push({
      kind: tokenKind,
      value: lexer.getSourceValue(),
      startPosition: lexer.getStartPosition(),
      endPosition: lexer.getEndPosition(),
    });
    if (tokenKind === SyntaxKinds.EOFToken) {
      break;
    }
    lexer.nextToken();
  }
  return tokens;
}
