import * as AST from "@/src/ast/index";
import { SyntaxKinds } from "@/src/kind";
import { SourcePosition } from "@/src/position";

export function createAssignmentPattern(
  left: AST.AssignmentPattern["left"],
  right: AST.AssignmentPattern["right"],
  typeAnnotation: AST.AssignmentPattern["typeAnnotation"],
  optional: AST.AssignmentPattern["optional"],
  start: SourcePosition,
  end: SourcePosition,
): AST.AssignmentPattern {
  return {
    kind: SyntaxKinds.AssignmentPattern,
    left,
    right,
    typeAnnotation,
    optional,
    start,
    end,
  };
}
export function createArrayPattern(
  elements: AST.ArrayPattern["elements"],
  typeAnnotation: AST.ArrayPattern["typeAnnotation"],
  optional: AST.ArrayPattern["optional"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ArrayPattern {
  return {
    kind: SyntaxKinds.ArrayPattern,
    elements,
    start,
    typeAnnotation,
    optional,
    end,
  };
}
export function createObjectPattern(
  properties: AST.ObjectPattern["properties"],
  typeAnnotation: AST.ObjectPattern["typeAnnotation"],
  optional: AST.ObjectPattern["optional"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ObjectPattern {
  return {
    kind: SyntaxKinds.ObjectPattern,
    properties,
    typeAnnotation,
    optional,
    start,
    end,
  };
}
export function createObjectPatternProperty(
  key: AST.ObjectPatternProperty["key"],
  value: AST.ObjectPatternProperty["value"],
  computed: AST.ObjectPatternProperty["computed"],
  shorted: AST.ObjectPatternProperty["shorted"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ObjectPatternProperty {
  return {
    kind: SyntaxKinds.ObjectPatternProperty,
    computed,
    shorted,
    key,
    value,
    start,
    end,
  };
}
export function createRestElement(
  argument: AST.RestElement["argument"],
  typeAnnotation: AST.RestElement["typeAnnotation"],
  optional: AST.RestElement["optional"],
  start: SourcePosition,
  end: SourcePosition,
): AST.RestElement {
  return {
    kind: SyntaxKinds.RestElement,
    argument,
    typeAnnotation,
    optional,
    start,
    end,
  };
}
