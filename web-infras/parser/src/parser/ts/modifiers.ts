import { SyntaxKinds, NumericLiteralKinds } from "web-infra-common";
import { ErrorMessageMap } from "@/src/parser/error";
import { Parser } from "@/src/parser";
import { ModifierState, IdentiferWithKeyworArray } from "@/src/parser/type";
/**
 * Parse all possible modifier, including TS and JS modifier, There we including the generator
 * mark as modifier. pattern:
 * ```
 * [(
 *    'static' | '*' | 'get' | 'set' |
 *    'declare'  | 'private' | "protected" | 'public' | 'readonly' | 'abstract' | 'accessor'
 * )]*
 * ```
 * When a IdenfiierName is following by another start of ClassElementName or start of static block,
 * this IdentifierName should be test as modifier.
 *
 * ### Semantic check
 * This function only raise error for
 *
 * - duplicate modifier.
 * - order of modifier.
 * - object property can not have ts modifier
 *
 * Other error like abtract method should not have implement body ..etc, we should check those error
 * later after parse body.
 *
 * ### Why need `forObjectProperty` parameter
 * Why not just use lexicalRecorder method `isDirectToClassScope` to test is in class or not ?
 * because if class property have a init is object expression, the property definition of object
 * expression is direct to class scope.
 * ```
 * class SomeClass {
 *   someProperty = {
 *     private id,
 *   }
 * }
 * ```
 */
export function parsePropertyModifier(this: Parser, forObjectProperty: boolean) {
  const state: ModifierState = {
    isAsync: false,
    isGenerator: false,
    isStatic: false,
    type: "method",
    accessibility: null,
    readonly: false,
    abstract: false,
    declare: false,
    isAccessor: false,
  };
  // TODO: check double condition and order
  loop: while (
    (this.match(SyntaxKinds.Identifier) && !this.getEscFlag()) ||
    this.match(SyntaxKinds.MultiplyOperator)
  ) {
    if (this.match(SyntaxKinds.MultiplyOperator)) {
      this.nextToken();
      state.isGenerator = true;
      continue;
    }
    const [shouldContinue, lineBreak] = this.isLookAheadCanStartPropertyName();
    if (!shouldContinue) {
      break;
    }
    switch (this.getSourceValue()) {
      case "async": {
        const shouldBreakLoop = this.staticSemanticAsyncModifier(state, lineBreak, forObjectProperty);
        if (shouldBreakLoop) break loop;
        break;
      }
      case "set": {
        const shouldBreakLoop = this.staticSemanticGetSetModifier(state, lineBreak, forObjectProperty, "set");
        if (shouldBreakLoop) break loop;
        break;
      }
      case "get": {
        const shouldBreakLoop = this.staticSemanticGetSetModifier(state, lineBreak, forObjectProperty, "get");
        if (shouldBreakLoop) break loop;
        break;
      }
      case "static": {
        const shouldBreakLoop = this.staticSemanticStaticModifier(state, lineBreak, forObjectProperty);
        if (shouldBreakLoop) break loop;
        break;
      }
      case "private": {
        const shouldBreakLoop = this.staticSemanticAccessiBilityModifier(
          state,
          lineBreak,
          forObjectProperty,
          "private",
        );
        if (shouldBreakLoop) break loop;
        break;
      }
      case "protected": {
        const shouldBreakLoop = this.staticSemanticAccessiBilityModifier(
          state,
          lineBreak,
          forObjectProperty,
          "protected",
        );
        if (shouldBreakLoop) break loop;
        break;
      }
      case "public": {
        const shouldBreakLoop = this.staticSemanticAccessiBilityModifier(
          state,
          lineBreak,
          forObjectProperty,
          "public",
        );
        if (shouldBreakLoop) break loop;
        break;
      }
      case "accessor": {
        const shouldBreakLoop = this.staticSemanticAccessorModifier(state, lineBreak, forObjectProperty);
        if (shouldBreakLoop) break loop;
        break;
      }
      case "abstract": {
        const shouldBreakLoop = this.staticSemanticAbstractModifier(state, lineBreak, forObjectProperty);
        if (shouldBreakLoop) break loop;
        break;
      }
      case "declare": {
        const shouldBreakLoop = this.staticSemanticDeclareModifier(state, lineBreak, forObjectProperty);
        if (shouldBreakLoop) break loop;
        break;
      }
      case "readonly": {
        const shouldBreakLoop = this.staticSemanticReadonlyModifier(state, lineBreak, forObjectProperty);
        if (shouldBreakLoop) break loop;
        break;
      }
      default: {
        // possible to be like
        // static a
        // static
        break loop;
      }
    }
    this.nextToken();
  }
  return state;
}
/**
 * Test is lookahead token is
 *
 * - start of ClassElemenetName.
 * - start of Static block.
 * - In the middle of modifier.
 *
 * return true if next token can seem as above condition,
 * otherwise return false to indicate current token should
 * be take as start of ClassElement.
 * @param this
 * @returns
 */
export function isLookAheadCanStartPropertyName(this: Parser): [boolean, boolean] {
  const { kind, lineTerminatorFlag } = this.lookahead();
  switch (kind) {
    case SyntaxKinds.MultiplyOperator: // In the middle of modifier
    case SyntaxKinds.BracketLeftPunctuator: // Start of static block
    case SyntaxKinds.BracesLeftPunctuator: // start of computed class element name
    case SyntaxKinds.StringLiteral: // start of property name
    case SyntaxKinds.PrivateName: // start of property name
      return [true, lineTerminatorFlag];
    default: {
      // start of property name (keyword take as identifier name in property name )
      if (NumericLiteralKinds.includes(kind) || IdentiferWithKeyworArray.includes(kind)) {
        return [true, lineTerminatorFlag];
      }
    }
  }
  return [false, lineTerminatorFlag];
}
/**
 * Syntax and Semantic check for `async` Modifier
 * - Check Duplication of `async`.
 */
export function staticSemanticAsyncModifier(
  this: Parser,
  modifiers: ModifierState,
  lineBreak: boolean,
  _forObjectProperty: boolean,
) {
  if (lineBreak) {
    return true;
  }
  if (modifiers.isAsync) {
    this.raiseError(
      ErrorMessageMap.ts_1030_modifier_already_seen.replace("{}", "async"),
      this.getStartPosition(),
    );
    return false;
  }
  modifiers.isAsync = true;
  return false;
}
/**
 * Syntax and Semantic check for `get`, `set` modifier
 * - Check Duplication of `set` and `get`. (get and set can not show at the sametime).
 */
export function staticSemanticGetSetModifier(
  this: Parser,
  modifiers: ModifierState,
  _lineBreak: boolean,
  _forObjectProperty: boolean,
  type: "get" | "set",
) {
  if (modifiers.type !== "method") {
    this.raiseError(
      ErrorMessageMap.ts_1030_modifier_already_seen.replace("{}", "accessor"),
      this.getStartPosition(),
    );
    return false;
  }
  modifiers.type = type;
  return false;
}
/**
 * Syntax and Semantic check for `static` modifier.
 * - Check Duplication of `static`.
 */
export function staticSemanticStaticModifier(
  this: Parser,
  modifiers: ModifierState,
  _lineBreak: boolean,
  _forObjectProperty: boolean,
) {
  if (modifiers.isAsync) {
    this.raiseError(ErrorMessageMap.ts_invalid_modifier_error, this.getStartPosition());
  }
  if (modifiers.isStatic) {
    this.raiseError(
      ErrorMessageMap.ts_1030_modifier_already_seen.replace("{}", "static"),
      this.getStartPosition(),
    );
    return false;
  }
  modifiers.isStatic = true;
  return false;
}
/**
 * Syntax and Semantic check for `private`, `protected`, `private` modifier.
 * - Check Duplication of `private`, `protected`, `private`.
 * - Object literal can not use this modifier.
 */
export function staticSemanticAccessiBilityModifier(
  this: Parser,
  modifiers: ModifierState,
  lineBreak: boolean,
  forObjectProperty: boolean,
  accessibility: "public" | "private" | "protected",
) {
  if (lineBreak) return true;
  if (forObjectProperty) {
    this.raiseError(
      ErrorMessageMap.ts_1042_modifier_cannot_be_used_here.replace("{}", accessibility),
      this.getStartPosition(),
    );
    return false;
  }
  if (modifiers.accessibility !== null) {
    this.raiseError(
      ErrorMessageMap.ts_1030_modifier_already_seen.replace("{}", accessibility),
      this.getStartPosition(),
    );
    return false;
  }
  modifiers.accessibility = accessibility;
  return false;
}
/**
 * Syntax and Semantic check for `accessor` modifier.
 * - Check Duplication of `accessor`.
 * - Object literal can not use this modifier.
 */
export function staticSemanticAccessorModifier(
  this: Parser,
  modifiers: ModifierState,
  lineBreak: boolean,
  forObjectProperty: boolean,
) {
  if (lineBreak) return true;
  if (forObjectProperty) {
    this.raiseError(
      ErrorMessageMap.ts_1042_modifier_cannot_be_used_here.replace("{}", "accessor"),
      this.getStartPosition(),
    );
    return false;
  }
  if (modifiers.isAccessor) {
    this.raiseError(
      ErrorMessageMap.ts_1030_modifier_already_seen.replace("{}", "accessor"),
      this.getStartPosition(),
    );
  }
  modifiers.isAccessor = true;
  return false;
}
/**
 * Syntax and Semantic check for `abstract` modifier.
 * - Check Duplication of `abstract`.
 * - Object literal can not use this modifier.
 */
export function staticSemanticAbstractModifier(
  this: Parser,
  modifiers: ModifierState,
  lineBreak: boolean,
  forObjectProperty: boolean,
) {
  if (lineBreak) return true;
  if (forObjectProperty) {
    this.raiseError(
      ErrorMessageMap.ts_1042_modifier_cannot_be_used_here.replace("{}", "abstract"),
      this.getStartPosition(),
    );
    return false;
  }
  if (modifiers.abstract) {
    this.raiseError(
      ErrorMessageMap.ts_1030_modifier_already_seen.replace("{}", "abstract"),
      this.getStartPosition(),
    );
  }
  modifiers.abstract = true;
  return false;
}
/**
 * Syntax and Semantic check for `declare` modifier.
 * - Check Duplication of `delcare`.
 * - Object literal can not use this modifier.
 */
export function staticSemanticDeclareModifier(
  this: Parser,
  modifiers: ModifierState,
  lineBreak: boolean,
  forObjectProperty: boolean,
) {
  if (lineBreak) return true;
  if (forObjectProperty) {
    this.raiseError(
      ErrorMessageMap.ts_1042_modifier_cannot_be_used_here.replace("{}", "declare"),
      this.getStartPosition(),
    );
    return false;
  }
  if (modifiers.declare) {
    this.raiseError(
      ErrorMessageMap.ts_1030_modifier_already_seen.replace("{}", "declare"),
      this.getStartPosition(),
    );
  }
  modifiers.declare = true;
  return false;
}
/**
 * Syntax and Semantic check for `readonly` modifier.
 * - Check Duplication of `readonly`.
 * - Object literal can not use this modifier.
 */
export function staticSemanticReadonlyModifier(
  this: Parser,
  modifiers: ModifierState,
  lineBreak: boolean,
  forObjectProperty: boolean,
) {
  if (lineBreak) return true;
  if (forObjectProperty) {
    this.raiseError(
      ErrorMessageMap.ts_1042_modifier_cannot_be_used_here.replace("{}", "readonly"),
      this.getStartPosition(),
    );
    return false;
  }
  if (modifiers.readonly) {
    this.raiseError(
      ErrorMessageMap.ts_1030_modifier_already_seen.replace("{}", "readonly"),
      this.getStartPosition(),
    );
  }
  modifiers.readonly = true;
  return false;
}
