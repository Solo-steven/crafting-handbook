import { createParser } from "@/src/parser";
import { createLexer } from "@/src/lexer";
import { Token } from "@/src/lexer/type";
import { SyntaxKinds } from "web-infra-common";
import { ParserConfig } from "./parser/config";

export function parse(code: string, config?: ParserConfig) {
  const parser = createParser(code, config);
  return parser.parse();
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
