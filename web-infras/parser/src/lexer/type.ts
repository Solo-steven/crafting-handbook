import { cloneSourcePosition, createSourcePosition, SyntaxKinds } from "web-infra-common";
import { SourcePosition } from "web-infra-common";
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
 * ================= State =====================
 * state is used to perform operation as DFA (NFA
 * or regex), we could take state as input, other
 * operation could be a simple DFA.
 * =============================================
 */
export type LexerCursorState = {
  code: string;
  pos: number;
  currentLine: number;
  currentLineStart: number;
};
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
export type LexerState = {
  cursor: LexerCursorState;
  token: LexerTokenState;
  semantic: LexerSematicState;
};
export function createLexerState(code: string): LexerState {
  return {
    cursor: {
      code,
      pos: 0,
      currentLine: 1,
      currentLineStart: 0,
    },
    token: {
      value: "",
      kind: null,
      startPosition: createSourcePosition(),
      endPosition: createSourcePosition(),
      lastTokenEndPosition: createSourcePosition(),
    },
    semantic: {
      isKeywordContainUnicodeEscap: false,
      isTemplateLiteralBreakEscapRule: false,
    },
  };
}
export function cloneLexerState(target: LexerState): LexerState {
  return {
    cursor: { ...target.cursor },
    token: {
      ...target.token,
      startPosition: cloneSourcePosition(target.token.startPosition),
      endPosition: cloneSourcePosition(target.token.endPosition),
      lastTokenEndPosition: cloneSourcePosition(target.token.lastTokenEndPosition),
    },
    semantic: {
      ...target.semantic,
    },
  };
}
/**
 * ================= Context =====================
 * context is mean we those variable is used to behave
 * like PDA, which mean tokenize need operate with stack,
 * those variable usually need to set and use by the wrapper
 * that has context to operate.
 * ===============================================
 */
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
export type LexerContext = {
  template: LexerTemplateContext;
  jsx: LexerJSXContext;
  strictMode: LexerStrictModeContext;
};
export function createLexerContext(): LexerContext {
  return {
    template: { stackCounter: [] },
    jsx: {
      shouldTokenizeGtWithHigherPriority: false,
      shouldTokenizeStringLiteralAsJSXStringLiteral: false,
    },
    strictMode: {
      isInStrictMode: false,
    },
  };
}
export function cloneLexerContext(target: LexerContext): LexerContext {
  return {
    template: {
      stackCounter: [...target.template.stackCounter],
    },
    jsx: {
      ...target.jsx,
    },
    strictMode: {
      ...target.strictMode,
    },
  };
}
