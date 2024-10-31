import * as AST from "@/src/ast/index";
import { SyntaxKinds } from "@/src/kind";
import { SourcePosition } from "@/src/position";

export function createVariableDeclaration(
  declarations: AST.VariableDeclaration["declarations"],
  variant: AST.VariableDeclaration["variant"],
  start: SourcePosition,
  end: SourcePosition,
): AST.VariableDeclaration {
  return {
    kind: SyntaxKinds.VariableDeclaration,
    variant,
    declarations,
    start,
    end,
  };
}
export function createVariableDeclarator(
  id: AST.VariableDeclarator["id"],
  init: AST.VariableDeclarator["init"],
  start: SourcePosition,
  end: SourcePosition,
): AST.VariableDeclarator {
  return {
    kind: SyntaxKinds.VariableDeclarator,
    id,
    init,
    start,
    end,
  };
}

export function createFunctionBody(
  body: Array<AST.StatementListItem>,
  start: SourcePosition,
  end: SourcePosition,
): AST.FunctionBody {
  return {
    kind: SyntaxKinds.FunctionBody,
    body,
    start,
    end,
  };
}
export function createFunction(
  name: AST.Function["name"],
  body: AST.Function["body"],
  params: AST.Function["params"],
  typeParameters: AST.Function["typeParameters"],
  returnType: AST.Function["returnType"],
  generator: AST.Function["generator"],
  async: AST.Function["async"],
  start: SourcePosition,
  end: SourcePosition,
): AST.Function {
  return {
    name,
    generator,
    async,
    body,
    params,
    typeParameters,
    returnType,
    start,
    end,
  };
}
export function transFormFunctionToFunctionExpression(func: AST.Function): AST.FunctionExpression {
  return {
    kind: SyntaxKinds.FunctionExpression,
    ...func,
  } as AST.FunctionExpression;
}
export function transFormFunctionToFunctionDeclaration(func: AST.Function): AST.FunctionDeclaration {
  return {
    kind: SyntaxKinds.FunctionDeclaration,
    ...func,
  } as AST.FunctionDeclaration;
}

export function createDecorator(
  expr: AST.Decorator["expression"],
  start: SourcePosition,
  end: SourcePosition,
): AST.Decorator {
  return {
    kind: SyntaxKinds.Decorator,
    expression: expr,
    start,
    end,
  };
}
export function createClass(
  name: AST.Class["id"],
  superClass: AST.Class["superClass"],
  body: AST.Class["body"],
  decorators: AST.Class["decorators"],
  start: SourcePosition,
  end: SourcePosition,
): AST.Class {
  return {
    id: name,
    superClass,
    body,
    start,
    end,
    decorators,
  };
}
export function createClassBody(
  body: AST.ClassBody["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ClassBody {
  return {
    kind: SyntaxKinds.ClassBody,
    body,
    start,
    end,
  };
}
export function createClassProperty(
  key: AST.ClassProperty["key"],
  value: AST.ClassProperty["value"],
  computed: AST.ClassProperty["computed"],
  isStatic: AST.ClassProperty["static"],
  abstract: AST.ClassAccessorProperty["abstract"],
  decorators: AST.Class["decorators"],
  optional: AST.ClassProperty["optional"],
  typeAnnotation: AST.ClassProperty["typeAnnotation"],
  accessibility: AST.ClassProperty["accessibility"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ClassProperty {
  return {
    kind: SyntaxKinds.ClassProperty,
    computed,
    static: isStatic,
    key,
    value,
    decorators,
    optional,
    abstract,
    accessibility,
    typeAnnotation,
    start,
    end,
  };
}
export function createClassAccessorProperty(
  key: AST.ClassProperty["key"],
  value: AST.ClassProperty["value"],
  computed: AST.ClassProperty["computed"],
  isStatic: AST.ClassProperty["static"],
  abstract: AST.ClassAccessorProperty["abstract"],
  decorators: AST.Class["decorators"],
  typeAnnotation: AST.ClassAccessorProperty["typeAnnotation"],
  accessibility: AST.ClassAccessor["accessibility"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ClassAccessorProperty {
  return {
    kind: SyntaxKinds.ClassAccessorProperty,
    computed,
    static: isStatic,
    abstract,
    key,
    value,
    decorators,
    typeAnnotation,
    accessibility,
    start,
    end,
  };
}
export function createClassMethodDefintion(
  key: AST.ClassMethodDefinition["key"],
  body: AST.ClassMethodDefinition["body"],
  params: AST.ClassMethodDefinition["params"],
  typeParameters: AST.ClassMethodDefinition["typeParameters"],
  returnType: AST.ClassMethodDefinition["returnType"],
  async: AST.ClassMethodDefinition["async"],
  generator: AST.ClassMethodDefinition["generator"],
  computed: AST.ClassMethodDefinition["computed"],
  isStatic: AST.ClassMethodDefinition["static"],
  decorators: AST.Class["decorators"],
  optional: AST.ClassMethodDeclaration["optional"],
  accessibility: AST.ClassMethodDeclaration["accessibility"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ClassMethodDefinition {
  return {
    kind: SyntaxKinds.ClassMethodDefinition,
    async,
    generator,
    computed,
    static: isStatic,
    key,
    params,
    typeParameters,
    returnType,
    optional,
    accessibility,
    body,
    decorators,
    start,
    end,
  };
}
export function createClassMethodDeclaration(
  key: AST.ClassMethodDeclaration["key"],
  params: AST.ClassMethodDeclaration["params"],
  typeParameters: AST.ClassMethodDeclaration["typeParameters"],
  returnType: AST.ClassMethodDeclaration["returnType"],
  async: AST.ClassMethodDeclaration["async"],
  generator: AST.ClassMethodDeclaration["generator"],
  computed: AST.ClassMethodDeclaration["computed"],
  abstract: AST.ClassMethodDeclaration["abstract"],
  isStatic: AST.ClassMethodDeclaration["static"],
  decorators: AST.Class["decorators"],
  optional: AST.ClassMethodDeclaration["optional"],
  accessibility: AST.ClassMethodDeclaration["accessibility"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ClassMethodDeclaration {
  return {
    kind: SyntaxKinds.ClassMethodDeclaration,
    async,
    generator,
    computed,
    static: isStatic,
    abstract,
    key,
    params,
    typeParameters,
    returnType,
    optional,
    accessibility,
    decorators,
    start,
    end,
  };
}
export function createClassConstructor(
  key: AST.ClassConstructor["key"],
  body: AST.ClassConstructor["body"],
  params: AST.ClassConstructor["params"],
  returnType: AST.ClassConstructor["returnType"],
  accessibility: AST.ClassMethodDeclaration["accessibility"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ClassConstructor {
  return {
    kind: SyntaxKinds.ClassConstructor,
    key,
    body,
    params,
    returnType,
    accessibility,
    start,
    end,
  };
}
export function createClassAccessor(
  key: AST.ClassAccessor["key"],
  body: AST.ClassAccessor["body"],
  params: AST.ClassAccessor["params"],
  typeParameters: AST.ClassAccessor["typeParameters"],
  returnType: AST.ClassAccessor["returnType"],
  accessibility: AST.ClassMethodDeclaration["accessibility"],
  type: AST.ClassAccessor["type"],
  isStatic: AST.ClassAccessor["static"],
  computed: AST.ClassAccessor["computed"],
  decorators: AST.Class["decorators"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ClassAccessor {
  return {
    kind: SyntaxKinds.ClassAccessor,
    key,
    params,
    typeParameters,
    returnType,
    accessibility,
    body,
    type,
    static: isStatic,
    computed,
    decorators,
    start,
    end,
  };
}
export function createTSAbstractClassAccessorDeclaration(
  key: AST.TSAbstractClassAccessorDeclaration["key"],
  params: AST.TSAbstractClassAccessorDeclaration["params"],
  typeParameters: AST.TSAbstractClassAccessorDeclaration["typeParameters"],
  returnType: AST.TSAbstractClassAccessorDeclaration["returnType"],
  accessibility: AST.TSAbstractClassAccessorDeclaration["accessibility"],
  type: AST.TSAbstractClassAccessorDeclaration["type"],
  isStatic: AST.TSAbstractClassAccessorDeclaration["static"],
  computed: AST.TSAbstractClassAccessorDeclaration["computed"],
  decorators: AST.TSAbstractClassAccessorDeclaration["decorators"],
  start: SourcePosition,
  end: SourcePosition,
): AST.TSAbstractClassAccessorDeclaration {
  return {
    kind: SyntaxKinds.TSAbstractClassAccessorDeclaration,
    key,
    params,
    type,
    typeParameters,
    returnType,
    accessibility,
    static: isStatic,
    computed,
    decorators,
    start,
    end,
  };
}

export function createClassStaticBlock(
  body: AST.ClassStaticBlock["body"],
  start: SourcePosition,
  end: SourcePosition,
): AST.ClassStaticBlock {
  return {
    kind: SyntaxKinds.ClassStaticBlock,
    body,
    start,
    end,
  };
}
export function transFormClassToClassExpression(classNode: AST.Class): AST.ClassExpression {
  return {
    kind: SyntaxKinds.ClassExpression,
    ...classNode,
  };
}
export function transFormClassToClassDeclaration(classNode: AST.Class): AST.ClassDeclaration {
  return {
    kind: SyntaxKinds.ClassDeclaration,
    ...classNode,
  };
}
