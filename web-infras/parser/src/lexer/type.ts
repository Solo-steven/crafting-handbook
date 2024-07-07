import { SyntaxKinds} from "web-infra-common";
import { SourcePosition } from "web-infra-common";

export type LexerCursorContext = {
    code: string;
    pos: number;
    currentLine: number;
    currentLineStart: number;
}
/**
 * Base Property of a token, without 
 * contextual information (which only
 * needed in some condition).
 */
export interface Token {
    kind: SyntaxKinds;
    value: string;
    startPosition: SourcePosition;
    endPosition: SourcePosition,
};
/**
 * Lookahead Token Property, contain more
 * property than base token property.
 */
export type LookaheadToken = {
    kind: SyntaxKinds;
    value: string;
    startPosition: SourcePosition;
    endPosition: SourcePosition,
    lineTerminatorFlag: boolean;
}
/**
 * Lexer context store for tokenize, have 
 * basic property needed and some of property
 * like line terminator flag and before value
 * is lazy compute.
 */
export type LexerTokenContext = {
    kind: SyntaxKinds | null;
    value: string;
    startPosition: SourcePosition;
    endPosition: SourcePosition,
    lastTokenEndPosition: SourcePosition; 
};

export type LexerTemplateContext = {
    stackCounter: Array<number>;
}

export type LexerEscFlagContext = {
    flag: boolean;
}