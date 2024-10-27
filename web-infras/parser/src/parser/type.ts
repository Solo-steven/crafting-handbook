import { Keywords, LexicalLiteral, SourcePosition, SyntaxKinds } from "web-infra-common";
import { Token } from "../lexer/type";

export type ExpectToken = Omit<Token, "kind" | "startPosition" | "endPosition"> & {
  start: SourcePosition;
  end: SourcePosition;
};

export const IdentiferWithKeyworArray = [SyntaxKinds.Identifier, ...Keywords];
export const PreserveWordSet = new Set(LexicalLiteral.preserveword);
export const BindingIdentifierSyntaxKindArray = [
  SyntaxKinds.Identifier,
  SyntaxKinds.AwaitKeyword,
  SyntaxKinds.YieldKeyword,
  SyntaxKinds.LetKeyword,
];
export const KeywordSet = new Set([
  ...LexicalLiteral.keywords,
  ...LexicalLiteral.BooleanLiteral,
  ...LexicalLiteral.NullLiteral,
  ...LexicalLiteral.UndefinbedLiteral,
]);

export interface ASTArrayWithMetaData<T> {
  nodes: Array<T>;
  start: SourcePosition;
  end: SourcePosition;
}
