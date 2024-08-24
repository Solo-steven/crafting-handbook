import { SyntaxKinds } from "web-infra-common";
import { SourcePosition } from "web-infra-common";

export type LexerCursorState = {
  code: string;
  pos: number;
  currentLine: number;
  currentLineStart: number;
};

/**
 * Base Property of a token, without
 * contextual information (which only
 * needed in some condition).
 */
export interface Token {
  kind: SyntaxKinds;
  value: string;
  startPosition: SourcePosition;
  endPosition: SourcePosition;
}
/**
 * Lookahead Token Property, contain more
 * property than base token property.
 */
export type LookaheadToken = {
  kind: SyntaxKinds;
  value: string;
  startPosition: SourcePosition;
  endPosition: SourcePosition;
  lineTerminatorFlag: boolean;
};
/**
 * Lexer context store for tokenize, have
 * basic property needed and some of property
 * like line terminator flag and before value
 * is lazy compute.
 */
export type LexerTokenState = {
  kind: SyntaxKinds | null;
  value: string;
  startPosition: SourcePosition;
  endPosition: SourcePosition;
  lastTokenEndPosition: SourcePosition;
};

export type LexerSematicState = {
  isTemplateLiteralBreakEscapRule: boolean;
  isKeywordContainUnicodeEscap: boolean;
};

// TODO: refactor lexer context into state and context
// export type LexerState = {
//   cursor: LexerCursorState;
//   token: LexerTokenState;
// }

export type LexerTemplateContext = {
  stackCounter: Array<number>;
};

export type LexerJSXContext = {
  shouldTokenizeStringLiteralAsJSXStringLiteral: boolean;
  shouldTokenizeGtWithHigherPriority: boolean;
};

export type LexerStrictModeContext = {
  isInStrictMode: boolean;
};
