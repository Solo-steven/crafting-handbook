import { SyntaxKinds, SytaxKindsMapLexicalLiteral } from "web-infra-common";
import { Generator } from "@/src/generator";
/**
 * Write a syntax token, token kind can not be
 * - AST node
 * - Literal
 * - Comment
 */
export function writeToken(this: Generator, tokenKind: SyntaxKinds) {
  if (tokenKind > 10107) {
    throw new Error();
  }
  const literal = SytaxKindsMapLexicalLiteral[tokenKind];
  this.code += literal;
  return;
}
/**
 * Write a space in current level, one level is 2 space.
 */
export function writePrefixSpace(this: Generator) {
  for (let i = 0; i < this.spaceLevel * 2; ++i) {
    this.code += " ";
  }
}
/**
 * Write a line terminator.
 */
export function writeLineTerminator(this: Generator) {
  this.code += "\n";
}
/**
 * Enter another space for print.
 */
export function enterSpaceBlock(this: Generator) {
  this.spaceLevel++;
}
/**
 * Exit space scope.
 */
export function exitSpaceBlock(this: Generator) {
  this.spaceLevel--;
}
/**
 * Write something with `()` paran.
 */
export function writeWithParan(this: Generator, callback: () => void) {
  this.writeToken(SyntaxKinds.ParenthesesLeftPunctuator);
  callback();
  this.writeToken(SyntaxKinds.ParenthesesRightPunctuator);
}
/**
 * Write something with `{}` wrapper.
 * - changeline: add line terminator after `{`.
 */
export function writeWithBraces(this: Generator, changeLine: boolean, callback: () => void) {
  this.writeToken(SyntaxKinds.BracesLeftPunctuator);
  if (changeLine) {
    this.writeLineTerminator();
  }
  this.enterSpaceBlock();
  callback();
  this.exitSpaceBlock();
  if (changeLine) {
    this.writePrefixSpace();
  }
  this.writeToken(SyntaxKinds.BracesRightPunctuator);
}
/**
 * Write a contextual keyword, basicly mean anything.
 */
export function writeRawString(this: Generator, keyword: string) {
  this.code += keyword;
}
/**
 * Write a space.
 */
export function writeSpace(this: Generator) {
  this.code += " ";
}
