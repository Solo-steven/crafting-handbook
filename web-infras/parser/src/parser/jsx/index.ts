/** ================================================================================
 *  Parse JSX
 *  entry point: https://facebook.github.io/jsx/
 * ==================================================================================
 */

import {
  JSXElement,
  JSXFragment,
  SyntaxKinds,
  Factory,
  cloneSourcePosition,
  JSXOpeningElement,
  JSXClosingElement,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXAttribute,
  JSXSpreadAttribute,
  JSXExpressionContainer,
} from "web-infra-common";
import { ParserPlugin } from "@/src/parser/config";
import { Parser } from "@/src/parser";
import { ErrorMessageMap } from "@/src/parser/error";
import { IdentiferWithKeyworArray } from "@/src/parser/type";

/**
 * Parse JSX Element or JSX Fragment
 * ```
 * PrimaryExpression := JSXElement
 *                   := JSXFragment
 * ```
 */
export function parseJSXElementOrJSXFragment(this: Parser, inJSXChildren: boolean): JSXElement | JSXFragment {
  if (!this.requirePlugin(ParserPlugin.JSX)) {
    this.raiseError(ErrorMessageMap.babel_error_need_enable_jsx, this.getStartPosition());
  }
  const lookaheadToken = this.lookahead();
  if (lookaheadToken.kind !== SyntaxKinds.GtOperator) {
    return this.parseJSXElement(inJSXChildren);
  } else {
    return this.parseJSXFragment(inJSXChildren);
  }
}
/**
 * Parse JSX Element
 * ```
 * JSXElement := JSXOpeningElement JSXChildren JSXClosingElement
 *            := JSXOpeningElement
 * ```
 * @returns {JSXElement}
 */
export function parseJSXElement(this: Parser, inJSXChildren: boolean): JSXElement {
  const opeingElement = this.parseJSXOpeingElement(inJSXChildren);
  if (opeingElement.selfClosing) {
    return Factory.createJSXElement(
      opeingElement,
      null,
      [],
      cloneSourcePosition(opeingElement.start),
      cloneSourcePosition(opeingElement.end),
    );
  }
  const children = this.parseJSXChildren();
  const closingElement = this.parseJSXClosingElement(inJSXChildren);
  this.staticSematicEarlyErrorForJSXElement(opeingElement, closingElement);
  return Factory.createJSXElement(
    opeingElement,
    closingElement,
    children,
    cloneSourcePosition(opeingElement.start),
    cloneSourcePosition(opeingElement.end),
  );
}
export function staticSematicEarlyErrorForJSXElement(
  this: Parser,
  openingElement: JSXOpeningElement,
  closingElement: JSXClosingElement,
) {
  const openElementSourceText = this.lexer.getSourceValueByIndex(
    openingElement.name.start.index,
    openingElement.name.end.index,
  );
  const closeElementSourceText = this.lexer.getSourceValueByIndex(
    closingElement.name.start.index,
    closingElement.name.end.index,
  );
  if (openElementSourceText !== closeElementSourceText) {
    throw new Error();
  }
}
/**
 * Parse JSXOpeingElement
 * ```
 * JSXOpeningElement := `<` JSXElementName JSXAtrributes `>`
 *                   := `<` JSXElementName JSXAtrributes `/>`
 * ```
 * @returns {JSXOpeningElement}
 */
export function parseJSXOpeingElement(this: Parser, inJSXChildren: boolean): JSXOpeningElement {
  const { start } = this.expect(SyntaxKinds.LtOperator);
  const lastLexerJSXEndTagContext = this.lexer.getJSXGtContext();
  this.lexer.setJSXGtContext(true);
  const name = this.parseJSXElementName();
  const attributes = this.parseJSXAttributes();
  this.lexer.setJSXGtContext(lastLexerJSXEndTagContext);
  if (this.match(SyntaxKinds.GtOperator)) {
    const end = this.getEndPosition();
    this.nextTokenInJSXChildren(true);
    return Factory.createJSXOpeningElement(name, attributes, false, start, end);
  }
  if (this.match(SyntaxKinds.JSXSelfClosedToken)) {
    const end = this.getEndPosition();
    this.nextTokenInJSXChildren(inJSXChildren);
    return Factory.createJSXOpeningElement(name, attributes, true, start, end);
  }
  // for  `/ >`
  if (this.match(SyntaxKinds.DivideOperator) && this.lookahead().kind === SyntaxKinds.GtOperator) {
    this.nextToken();
    const end = this.getEndPosition();
    this.nextTokenInJSXChildren(inJSXChildren);
    return Factory.createJSXOpeningElement(name, attributes, true, start, end);
  }
  throw this.createUnexpectError();
}
/**
 * Parse name of jsx element or jsx fragment
 * ```
 * JSXElementName := JSXIdentifier
 *                := JSXMemberExpression
 *                := JSXNamespaceName
 * ```
 * @returns {JSXIdentifier | JSXMemberExpression | JSXNamespacedName}
 */
export function parseJSXElementName(this: Parser): JSXIdentifier | JSXMemberExpression | JSXNamespacedName {
  let name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName = this.parseJSXIdentifier();
  if (this.match(SyntaxKinds.ColonPunctuator)) {
    this.nextToken();
    const subName = this.parseJSXIdentifier();
    name = Factory.createJSXNamespacedName(
      name,
      subName,
      cloneSourcePosition(name.start),
      cloneSourcePosition(subName.end),
    );
  } else if (this.match(SyntaxKinds.DotOperator)) {
    while (this.match(SyntaxKinds.DotOperator) && !this.match(SyntaxKinds.EOFToken)) {
      this.nextToken();
      const property = this.parseJSXIdentifier();
      name = Factory.createJSXMemberExpression(
        name,
        property,
        cloneSourcePosition(name.start),
        cloneSourcePosition(property.end),
      );
    }
  }
  return name;
}
/**
 * Parse JSX Attributes.
 * ```
 * JSXAttributes := JSXAttributes JSXAttribute
 *               := JSXAttributes JSXSpreadAttribute
 *               := JSXAttribute
 *               := JSXSpreadAttribute
 * JSXAttribute  := JSXAttributeName '=' StringLiteral
 *               := JSXAttributeName '=' JSXExpressionContainer (expression can not be null)
 *               := JSXAttributeName '=' JSXElement
 *               := JSxAttributeName '=' JSXFragment
 *               := JSXAttrbuteName
 * JSXSpreadAttribute := '{''...' AssignmentExpression '}'
 * JSXAttributeName := JSXIdentifier
 *                  := JSXNamespaceName
 * ```
 * @returns {Array<JSXAttribute | JSXSpreadAttribute>}
 */
export function parseJSXAttributes(this: Parser): Array<JSXAttribute | JSXSpreadAttribute> {
  const attribute: Array<JSXAttribute | JSXSpreadAttribute> = [];
  while (
    !this.match(SyntaxKinds.EOFToken) &&
    !this.match(SyntaxKinds.GtOperator) &&
    !this.match(SyntaxKinds.JSXSelfClosedToken) &&
    !(this.match(SyntaxKinds.DivideOperator) && this.lookahead().kind === SyntaxKinds.GtOperator)
  ) {
    // parse spread
    if (this.match(SyntaxKinds.BracesLeftPunctuator)) {
      this.nextToken();
      this.expect(SyntaxKinds.SpreadOperator);
      const expression = this.parseAssignmentExpressionAllowIn();
      this.expect(SyntaxKinds.BracesRightPunctuator);
      attribute.push(
        Factory.createJSXSpreadAttribute(
          expression,
          cloneSourcePosition(expression.start),
          cloneSourcePosition(expression.end),
        ),
      );
      continue;
    }
    // parse name
    let name: JSXIdentifier | JSXNamespacedName = this.parseJSXIdentifier();
    if (this.match(SyntaxKinds.ColonPunctuator)) {
      this.nextToken();
      const subName = this.parseJSXIdentifier();
      name = Factory.createJSXNamespacedName(
        name,
        subName,
        cloneSourcePosition(name.start),
        cloneSourcePosition(subName.end),
      );
    }
    // parse value
    if (this.match(SyntaxKinds.AssginOperator)) {
      this.lexer.setJSXStringContext(true);
      this.nextToken();
      this.lexer.setJSXStringContext(false);
      if (this.match(SyntaxKinds.StringLiteral)) {
        const value = this.parseStringLiteral();
        attribute.push(
          Factory.createJSXAttribute(
            name,
            value,
            cloneSourcePosition(name.start),
            cloneSourcePosition(value.end),
          ),
        );
        continue;
      }
      if (this.match(SyntaxKinds.BracesLeftPunctuator)) {
        const expression = this.parseJSXExpressionContainer(false);
        if (!expression.expression) {
          throw new Error("right hand side of jsx attribute must have expression if start with `{`");
        }
        attribute.push(
          Factory.createJSXAttribute(
            name,
            expression,
            cloneSourcePosition(name.start),
            cloneSourcePosition(expression.end),
          ),
        );
        continue;
      }
      const element = this.parseJSXElementOrJSXFragment(false);
      attribute.push(
        Factory.createJSXAttribute(
          name,
          element,
          cloneSourcePosition(name.start),
          cloneSourcePosition(element.end),
        ),
      );
    } else {
      attribute.push(
        Factory.createJSXAttribute(
          name,
          null,
          cloneSourcePosition(name.start),
          cloneSourcePosition(name.end),
        ),
      );
    }
  }
  return attribute;
}
/**
 * Parse JSX Children
 * ```
 * JSXChildren := JSXChildren JSXChild
 *             := JSXChild
 * JSXChild    := JSXText
 *             := JSXExpressionContainer
 *             := JSXElement
 *             := JSXFragment
 *             := JSXSpreadChild
 * JSXSpreadChild := {'...AssignmentExpression '}'
 * ```
 * @returns {Array<JSXText | JSXExpressionContainer | JSXElement | JSXFragment | JSXSpreadChild>}
 */
export function parseJSXChildren(this: Parser): JSXElement["children"] {
  const children: JSXElement["children"] = [];
  while (!this.match(SyntaxKinds.JSXCloseTagStart) && !this.match(SyntaxKinds.EOFToken)) {
    if (this.match(SyntaxKinds.LtOperator)) {
      children.push(this.parseJSXElementOrJSXFragment(true));
      continue;
    }
    if (this.match(SyntaxKinds.BracesLeftPunctuator)) {
      if (this.lookahead().kind == SyntaxKinds.SpreadOperator) {
        this.expect(SyntaxKinds.BracesLeftPunctuator);
        this.expect(SyntaxKinds.SpreadOperator);
        const expression = this.parseAssignmentExpressionAllowIn();
        this.expect(SyntaxKinds.BracesRightPunctuator);
        children.push(
          Factory.createJSXSpreadChild(
            expression,
            cloneSourcePosition(expression.start),
            cloneSourcePosition(expression.end),
          ),
        );
        continue;
      }
      children.push(this.parseJSXExpressionContainer(true));
      continue;
    }
    children.push(this.parseJSXText());
  }
  return children;
}
/**
 * Parse JSX expression container
 * ```
 * JSXExpressionContainer = '{' AssignmentExpression '}'
 * ```
 * @returns {JSXExpressionContainer}
 */
export function parseJSXExpressionContainer(this: Parser, inJSXChildren: boolean): JSXExpressionContainer {
  const { start } = this.expect(SyntaxKinds.BracesLeftPunctuator);
  const expression = this.match(SyntaxKinds.BracesRightPunctuator)
    ? null
    : this.parseAssignmentExpressionAllowIn();
  const { end } = this.expectInJSXChildren(SyntaxKinds.BracesRightPunctuator, inJSXChildren);
  return Factory.createsJSXExpressionContainer(expression, start, end);
}
/**
 * Parse Closing Element of JSXElement
 * ```
 * JSXClosingElement := '</' JSXElementName '>'
 * ```
 * @returns {JSXClosingElement}
 */
export function parseJSXClosingElement(this: Parser, inJSXChildren: boolean): JSXClosingElement {
  const { start } = this.expect(SyntaxKinds.JSXCloseTagStart);
  const lastLexerJSXEndTagContext = this.lexer.getJSXGtContext();
  this.lexer.setJSXGtContext(true);
  const name = this.parseJSXElementName();
  const { end } = this.expectInJSXChildren(SyntaxKinds.GtOperator, inJSXChildren);
  this.lexer.setJSXGtContext(lastLexerJSXEndTagContext);
  return Factory.createJSXClosingElement(name, start, end);
}
/**
 *
 * @returns {JSXIdentifier}
 */
export function parseJSXIdentifier(this: Parser): JSXIdentifier {
  // eslint-disable-next-line prefer-const
  let { start, end } = this.expect(IdentiferWithKeyworArray);
  // eslint-disable-next-line no-constant-condition
  while (1) {
    if (this.match(SyntaxKinds.MinusOperator)) {
      end = this.getEndPosition();
      this.nextToken();
    } else {
      break;
    }
    if (this.match(IdentiferWithKeyworArray)) {
      end = this.getEndPosition();
      this.nextToken();
    } else {
      break;
    }
  }
  const value = this.lexer.getSourceValueByIndex(start.index, end.index);
  return Factory.createJSXIdentifier(value, start, end);
}
export function parseJSXText(this: Parser) {
  const { start, end, value } = this.expect(SyntaxKinds.JSXText);
  return Factory.createJSXText(value, start, end);
}
/**
 * Parse JSXFragment
 * ```
 * JSXFragment := `<``/>` JSXChildern `</``>`
 * ```
 * @returns {JSXFragment}
 */
export function parseJSXFragment(this: Parser, inJSXChildren: boolean): JSXFragment {
  const { start: openingStart } = this.expect(SyntaxKinds.LtOperator);
  const { end: openingEnd } = this.expectInJSXChildren(SyntaxKinds.GtOperator, true);
  const children = this.parseJSXChildren();
  const { start: closingStart } = this.expect(SyntaxKinds.JSXCloseTagStart);
  const { end: closingEnd } = this.expectInJSXChildren(SyntaxKinds.GtOperator, inJSXChildren);
  return Factory.createJSXFragment(
    Factory.createJSXOpeningFragment(openingStart, openingEnd),
    Factory.createJSXClosingFragment(closingStart, closingEnd),
    children,
    cloneSourcePosition(openingStart),
    cloneSourcePosition(closingEnd),
  );
}
export function expectInJSXChildren(this: Parser, kind: SyntaxKinds, inJSXChildren: boolean) {
  if (this.match(kind)) {
    const metaData = {
      value: this.getSourceValue(),
      start: this.getStartPosition(),
      end: this.getEndPosition(),
    };
    if (inJSXChildren) {
      this.lexer.nextTokenInJSXChildrenContext();
    } else {
      this.lexer.nextToken();
    }
    return metaData;
  }
  throw this.createUnexpectError();
}
export function nextTokenInJSXChildren(this: Parser, inJSXChildren: boolean) {
  if (inJSXChildren) {
    this.lexer.nextTokenInJSXChildrenContext();
  } else {
    this.lexer.nextToken();
  }
}
