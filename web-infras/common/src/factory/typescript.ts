import * as AST from "@/src/ast/index";
import { SyntaxKinds } from "@/src/kind";
import { SourcePosition } from "@/src/position";

export function createTSStringKeyword(start: SourcePosition, end: SourcePosition): AST.TSStringKeyword {
  return {
    kind: SyntaxKinds.TSStringKeyword,
    start,
    end,
  };
}

export function createTSNumberKeyword(start: SourcePosition, end: SourcePosition): AST.TSNumberKeyword {
  return {
    kind: SyntaxKinds.TSNumberKeyword,
    start,
    end,
  };
}

export function createTSBigintKeyword(start: SourcePosition, end: SourcePosition): AST.TSBigIntKeyword {
  return {
    kind: SyntaxKinds.TSBigIntKeyword,
    start,
    end,
  };
}

export function createTSBoolKeyword(start: SourcePosition, end: SourcePosition): AST.TSBooleanKeyword {
  return {
    kind: SyntaxKinds.TSBooleanKeyword,
    start,
    end,
  };
}

export function createTSNullKeyword(start: SourcePosition, end: SourcePosition): AST.TSNullKeyword {
  return {
    kind: SyntaxKinds.TSNullKeyword,
    start,
    end,
  };
}

export function createTSUndefinedKeyword(start: SourcePosition, end: SourcePosition): AST.TSUndefinedKeyword {
  return {
    kind: SyntaxKinds.TSUndefinedKeyword,
    start,
    end,
  };
}

export function createTSSymbolKeyword(start: SourcePosition, end: SourcePosition): AST.TSSymbolKeyword {
  return {
    kind: SyntaxKinds.TSSymbolKeyword,
    start,
    end,
  };
}

export function createTSAnyKeyword(start: SourcePosition, end: SourcePosition): AST.TSAnyKeyword {
  return {
    kind: SyntaxKinds.TSAnyKeyword,
    start,
    end,
  };
}

export function createTSNeverKeyword(start: SourcePosition, end: SourcePosition): AST.TSUndefinedKeyword {
  return {
    kind: SyntaxKinds.TSUndefinedKeyword,
    start,
    end,
  };
}

export function createTSUnknowKeyword(start: SourcePosition, end: SourcePosition): AST.TSUnknowKeyword {
  return {
    kind: SyntaxKinds.TSUnknowKeyword,
    start,
    end,
  };
}

export function createTSTypeAnnotation(
  typeAnnotation: AST.TSTypeNode,
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypeAnnotation {
  return {
    kind: SyntaxKinds.TSTypeAnnotation,
    typeAnnotation,
    start,
    end,
  };
}

export function createTSTypePredicate(
  parameterName: AST.TSTypePredicate["parameterName"],
  asserts: AST.TSTypePredicate["asserts"],
  typeAnnotation: AST.TSTypePredicate["typeAnnotation"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypePredicate {
  return {
    kind: SyntaxKinds.TSTypePredicate,
    parameterName,
    asserts,
    typeAnnotation,
    start,
    end,
  };
}

export function createTSCallSignatureDeclaration(
  parameters: AST.TSCallSignatureDeclaration["parameters"],
  returnType: AST.TSCallSignatureDeclaration["returnType"],
  typeParameters: AST.TSCallSignatureDeclaration["typeParameters"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSCallSignatureDeclaration {
  return {
    kind: SyntaxKinds.TSCallSignatureDeclaration,
    parameters,
    returnType,
    typeParameters,
    start,
    end,
  };
}

export function createTSConstructSignatureDeclaration(
  parameters: AST.TSConstructSignatureDeclaration["parameters"],
  returnType: AST.TSConstructSignatureDeclaration["returnType"],
  typeParameters: AST.TSConstructSignatureDeclaration["typeParameters"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSConstructSignatureDeclaration {
  return {
    kind: SyntaxKinds.TSConstructSignatureDeclaration,
    parameters,
    returnType,
    typeParameters,
    start,
    end,
  };
}

export function createTSPropertySignature(
  key: AST.TSPropertySignature["key"],
  computed: AST.TSPropertySignature["computed"],
  optional: AST.TSPropertySignature["optional"],
  typeAnnotation: AST.TSPropertySignature["typeAnnotation"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSPropertySignature {
  return {
    kind: SyntaxKinds.TSPropertySignature,
    key,
    computed,
    optional,
    typeAnnotation,
    start,
    end,
  };
}

export function createTSMethodSignature(
  key: AST.TSMethodSignature["key"],
  computed: AST.TSMethodSignature["computed"],
  optional: AST.TSMethodSignature["optional"],
  parameters: AST.TSMethodSignature["parameters"],
  returnType: AST.TSMethodSignature["returnType"],
  typeParameters: AST.TSMethodSignature["typeParameters"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSMethodSignature {
  return {
    kind: SyntaxKinds.TSMethodSignature,
    key,
    computed,
    optional,
    parameters,
    returnType,
    typeParameters,
    start,
    end,
  };
}

export function createTSTypeReference(
  typeName: AST.TSEntityName,
  typeArguments: AST.TSTypeReference["typeArguments"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypeReference {
  return {
    kind: SyntaxKinds.TSTypeReference,
    typeName,
    typeArguments,
    start,
    end,
  };
}

export function createTSQualifiedName(
  left: AST.TSEntityName,
  right: AST.Identifier,
  start: SourcePosition,
  end: SourcePosition,
): AST.TSQualifiedName {
  return {
    kind: SyntaxKinds.TSQualifiedName,
    left,
    right,
    start,
    end,
  };
}

export function createTSTypeAliasDeclaration(
  name: AST.TSTypeAliasDeclaration["name"],
  typeAnnotation: AST.TSTypeAliasDeclaration["typeAnnotation"],
  typeParameters: AST.TSTypeAliasDeclaration["typeParameters"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypeAliasDeclaration {
  return {
    kind: SyntaxKinds.TSTypeAliasDeclaration,
    name,
    typeAnnotation,
    typeParameters,
    start,
    end,
  };
}

export function createTSInterfaceBody(
  body: AST.TSInterfaceBody["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSInterfaceBody {
  return {
    kind: SyntaxKinds.TSInterfaceBody,
    body,
    start,
    end,
  };
}

export function createTSInterface(
  name: AST.TSInterfaceDeclaration["name"],
  typeParameters: AST.TSInterfaceDeclaration["typeParameters"],
  extendsTypes: AST.TSInterfaceDeclaration["extends"],
  body: AST.TSInterfaceDeclaration["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSInterfaceDeclaration {
  return {
    kind: SyntaxKinds.TSInterfaceDeclaration,
    name,
    typeParameters,
    extends: extendsTypes,
    body,
    start,
    end,
  };
}

export function createTSInterfaceHeritage(
  typeName: AST.TSEntityName,
  typeArguments: AST.TSTypeReference["typeArguments"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSInterfaceHeritage {
  return {
    kind: SyntaxKinds.TSInterfaceHeritage,
    typeName,
    typeArguments,
    start,
    end,
  };
}

export function createTSTypeParameterInstantiation(
  params: Array<AST.TSTypeNode>,
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypeParameterInstantiation {
  return {
    kind: SyntaxKinds.TSTypeParameterInstantiation,
    params,
    start,
    end,
  };
}

export function createTSTypeParameterDeclaration(
  params: Array<AST.TSTypeParameter>,
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypeParameterDeclaration {
  return {
    kind: SyntaxKinds.TSTypeParameterDeclaration,
    params,
    start,
    end,
  };
}

export function createTSTypeParameter(
  constraint: AST.TSTypeNode | undefined,
  defaultType: AST.TSTypeNode | undefined,
  name: AST.Identifier,
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypeParameter {
  return {
    kind: SyntaxKinds.TSTypeParameter,
    constraint,
    default: defaultType,
    name,
    start,
    end,
  };
}

export function createTSConditionType(
  checkType: AST.TSConditionalType["checkType"],
  extendType: AST.TSConditionalType["extendType"],
  trueType: AST.TSConditionalType["trueType"],
  falseType: AST.TSConditionalType["falseType"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSConditionalType {
  return {
    kind: SyntaxKinds.TSConditionalType,
    checkType,
    extendType,
    trueType,
    falseType,
    start,
    end,
  };
}

export function createTSUnionType(
  types: Array<AST.TSTypeNode>,
  start: SourcePosition,
  end: SourcePosition,
): AST.TSUnionType {
  return {
    kind: SyntaxKinds.TSUnionType,
    types,
    start,
    end,
  };
}

export function createTSIntersectionType(
  types: Array<AST.TSTypeNode>,
  start: SourcePosition,
  end: SourcePosition,
): AST.TSIntersectionType {
  return {
    kind: SyntaxKinds.TSIntersectionType,
    types,
    start,
    end,
  };
}

export function createTSTypeQuery(
  exprName: AST.TSTypeQuery["exprName"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypeQuery {
  return {
    kind: SyntaxKinds.TSTypeQuery,
    exprName,
    start,
    end,
  };
}

export function createTSTypeOperator(
  typeAnnotation: AST.TSTypeOperator["typeAnnotation"],
  operator: AST.TSTypeOperator["operator"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypeOperator {
  return {
    kind: SyntaxKinds.TSTypeOperator,
    typeAnnotation,
    operator,
    start,
    end,
  };
}

export function createTSArrayType(
  elementType: AST.TSArrayType["elementType"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSArrayType {
  return {
    kind: SyntaxKinds.TSArrayType,
    elementType,
    start,
    end,
  };
}

export function createTSIndexedAccessType(
  indexedType: AST.TSIndexedAccessType["indexedType"],
  objectType: AST.TSIndexedAccessType["objectType"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSIndexedAccessType {
  return {
    kind: SyntaxKinds.TSIndexedAccessType,
    indexedType,
    objectType,
    start,
    end,
  };
}

export function createTSFunctionType(
  returnType: AST.TSFunctionType["returnType"],
  parameters: AST.TSFunctionType["parameters"],
  typeParameters: AST.TSFunctionType["typeParameters"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSFunctionType {
  return {
    kind: SyntaxKinds.TSFunctionType,
    returnType,
    parameters,
    typeParameters,
    start,
    end,
  };
}

export function createTSConstrcutorType(
  returnType: AST.TSConstrcutorType["returnType"],
  parameters: AST.TSConstrcutorType["parameters"],
  typeParameters: AST.TSConstrcutorType["typeParameters"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSConstrcutorType {
  return {
    kind: SyntaxKinds.TSConstructorType,
    returnType,
    parameters,
    typeParameters,
    start,
    end,
  };
}

export function createTSTupleType(
  elementTypes: AST.TSTupleType["elementTypes"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTupleType {
  return {
    kind: SyntaxKinds.TSTupleType,
    elementTypes,
    start,
    end,
  };
}

export function createTSLiteralType(
  literal: AST.TSLiteralType["literal"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSLiteralType {
  return {
    kind: SyntaxKinds.TSLiteralType,
    literal,
    start,
    end,
  };
}

export function createTSVoidKeyword(start: SourcePosition, end: SourcePosition): AST.TSVoidKeyword {
  return {
    kind: SyntaxKinds.TSVoidKeyword,
    start,
    end,
  };
}

export function createTSInstantiationExpression(
  expression: AST.TSInstantiationExpression["expression"],
  typeArguments: AST.TSInstantiationExpression["typeArguments"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSInstantiationExpression {
  return {
    kind: SyntaxKinds.TSInstantiationExpression,
    expression,
    typeArguments,
    start,
    end,
  };
}

export function createTSTypeAssertionExpression(
  expression: AST.TSTypeAssertionExpression["expression"],
  typeAnnotation: AST.TSTypeAssertionExpression["typeAnnotation"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSTypeAssertionExpression {
  return {
    kind: SyntaxKinds.TSTypeAssertionExpression,
    expression,
    typeAnnotation,
    start,
    end,
  };
}

export function createTSAsExpression(
  expression: AST.TSAsExpression["expression"],
  typeAnnotation: AST.TSAsExpression["typeAnnotation"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSAsExpression {
  return {
    kind: SyntaxKinds.TSAsExpression,
    expression,
    typeAnnotation,
    start,
    end,
  };
}

export function createTSSatisfiesExpression(
  expression: AST.TSSatisfiesExpression["expression"],
  typeAnnotation: AST.TSSatisfiesExpression["typeAnnotation"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSSatisfiesExpression {
  return {
    kind: SyntaxKinds.TSSatisfiesExpression,
    expression,
    typeAnnotation,
    start,
    end,
  };
}

export function createTSNonNullExpression(
  expression: AST.TSNonNullExpression["expression"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSNonNullExpression {
  return {
    kind: SyntaxKinds.TSNonNullExpression,
    expression,
    start,
    end,
  };
}

export function createTSEnumDeclaration(
  id: AST.TSEnumDeclaration["id"],
  body: AST.TSEnumDeclaration["body"],
  isConst: AST.TSEnumDeclaration["isConst"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSEnumDeclaration {
  return {
    kind: SyntaxKinds.TSEnumDeclaration,
    id,
    isConst,
    body,
    start,
    end,
  };
}

export function createTSEnumBody(
  members: AST.TSEnumBody["members"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSEnumBody {
  return {
    kind: SyntaxKinds.TSEnumBody,
    members,
    start,
    end,
  };
}

export function createTSEnumMember(
  id: AST.TSEnumMember["id"],
  computed: AST.TSEnumMember["computed"],
  init: AST.TSEnumMember["init"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSEnumMember {
  return {
    kind: SyntaxKinds.TSEnumMember,
    computed,
    id,
    init,
    start,
    end,
  };
}

export function createTSDeclarFunction(
  name: AST.TSDeclareFunction["name"],
  returnType: AST.TSDeclareFunction["returnType"],
  params: AST.TSDeclareFunction["params"],
  typeParameters: AST.TSDeclareFunction["typeParameters"],
  generator: AST.TSDeclareFunction["generator"],
  async: AST.TSDeclareFunction["async"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSDeclareFunction {
  return {
    kind: SyntaxKinds.TSDeclareFunction,
    name,
    params,
    returnType,
    typeParameters,
    generator,
    async,
    start,
    end,
  };
}
