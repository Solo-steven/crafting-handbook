import { ModuleId } from "@/src/depGraph";
import { RUNTIME_MODULE_EXPORT_REF, RUNTIME_MODULE_IMPORT_CALLEE, DUMMY_SOURCE_POSITION } from "./const";
import { moduleSourceToModuleId } from "./utils";
import {
  Identifier,
  Expression,
  Factory,
  SyntaxKinds,
  ExportDefaultDeclaration,
  ClassExpression,
  FunctionExpression,
  ExportNamedDeclarations,
  ExpressionStatement,
  ExportAllDeclaration,
  isStringLiteral,
  Program,
  ModuleItem,
} from "web-infra-common";

/**
 * Helper to create `_runtime_module_export.<rhs> = <id>` to replace export.
 * @returns
 */
function createRuntimeModuleExportAssignment(rhs: Identifier, id: Expression) {
  return Factory.createExpressionStatement(
    Factory.createAssignmentExpression(
      Factory.createMemberExpression(
        false,
        Factory.createIdentifier(
          RUNTIME_MODULE_EXPORT_REF,
          DUMMY_SOURCE_POSITION,
          DUMMY_SOURCE_POSITION,
          undefined,
          undefined,
        ),
        rhs,
        false,
        DUMMY_SOURCE_POSITION,
        DUMMY_SOURCE_POSITION,
      ),
      id,
      SyntaxKinds.AssginOperator,
      DUMMY_SOURCE_POSITION,
      DUMMY_SOURCE_POSITION,
    ),
    DUMMY_SOURCE_POSITION,
    DUMMY_SOURCE_POSITION,
  );
}
function handleDefaultExportDeclaration(node: ExportDefaultDeclaration) {
  switch (node.declaration.kind) {
    case SyntaxKinds.ClassDeclaration: {
      if (node.declaration.id) {
        return {
          nextItem: node.declaration,
          runtimeExport: createRuntimeModuleExportAssignment(
            Factory.createIdentifier(
              "default",
              DUMMY_SOURCE_POSITION,
              DUMMY_SOURCE_POSITION,
              undefined,
              undefined,
            ),
            node.declaration.id,
          ),
        };
      } else {
        const classExpr: ClassExpression = {
          ...node.declaration,
          kind: SyntaxKinds.ClassExpression,
        };
        return {
          nextItem: undefined,
          runtimeExport: createRuntimeModuleExportAssignment(
            Factory.createIdentifier(
              "default",
              DUMMY_SOURCE_POSITION,
              DUMMY_SOURCE_POSITION,
              undefined,
              undefined,
            ),
            classExpr,
          ),
        };
      }
    }
    case SyntaxKinds.FunctionDeclaration: {
      const functionExpr: FunctionExpression = {
        ...node.declaration,
        kind: SyntaxKinds.FunctionExpression,
      };
      if (functionExpr.name) {
        return {
          nextItem: node.declaration,
          runtimeExport: createRuntimeModuleExportAssignment(
            Factory.createIdentifier(
              "default",
              DUMMY_SOURCE_POSITION,
              DUMMY_SOURCE_POSITION,
              undefined,
              undefined,
            ),
            node.declaration.name,
          ),
        };
      } else {
        return {
          nextItem: undefined,
          runtimeExport: createRuntimeModuleExportAssignment(
            Factory.createIdentifier(
              "default",
              DUMMY_SOURCE_POSITION,
              DUMMY_SOURCE_POSITION,
              undefined,
              undefined,
            ),
            functionExpr,
          ),
        };
      }
    }
    case SyntaxKinds.TSTypeAliasDeclaration:
    case SyntaxKinds.TSInterfaceDeclaration:
    case SyntaxKinds.TSEnumDeclaration:
    case SyntaxKinds.TSDeclareFunction: {
      throw new Error();
    }
    default: {
      return {
        nextItem: undefined,
        runtimeExport: createRuntimeModuleExportAssignment(
          Factory.createIdentifier(
            "default",
            DUMMY_SOURCE_POSITION,
            DUMMY_SOURCE_POSITION,
            undefined,
            undefined,
          ),
          node.declaration,
        ),
      };
    }
  }
}

function handleExportNameDeclaration(node: ExportNamedDeclarations) {
  if (node.declaration) {
    switch (node.declaration.kind) {
      case SyntaxKinds.VariableDeclaration: {
        // not implement yet.
        throw new Error();
      }
      case SyntaxKinds.FunctionDeclaration: {
        return {
          nextItem: node.declaration,
          runtimeExport: createRuntimeModuleExportAssignment(node.declaration.name, node.declaration.name),
        };
      }
      case SyntaxKinds.ClassDeclaration: {
        const name = node.declaration.id!;
        return {
          nextItem: node.declaration,
          runtimeExport: createRuntimeModuleExportAssignment(name, name),
        };
      }
      default: {
        // unreach
        throw new Error();
      }
    }
  } else if (node.source) {
    // not implement yet.
    throw new Error();
  }
  const runtimeExports: ExpressionStatement[] = [];
  for (const specifier of node.specifiers) {
    runtimeExports.push(
      createRuntimeModuleExportAssignment(
        (specifier.local ? specifier.local : specifier.exported) as Identifier,
        specifier.exported,
      ),
    );
  }
  return {
    nextItem: undefined,
    runtimeExport: runtimeExports,
  };
}

function handleExportAllDeclaration(node: ExportAllDeclaration, moduleIds: ModuleId[]) {
  const runtimeModuleImport = Factory.createCallExpression(
    Factory.createIdentifier(
      RUNTIME_MODULE_IMPORT_CALLEE,
      DUMMY_SOURCE_POSITION,
      DUMMY_SOURCE_POSITION,
      undefined,
      undefined,
    ),
    [
      Factory.createStringLiteral(
        moduleSourceToModuleId(node.source.value, moduleIds),
        DUMMY_SOURCE_POSITION,
        DUMMY_SOURCE_POSITION,
      ),
    ],
    undefined,
    false,
    DUMMY_SOURCE_POSITION,
    DUMMY_SOURCE_POSITION,
  );
  if (node.exported) {
    if (isStringLiteral(node.exported)) {
      // TODO
      throw new Error();
    }
    /**
     * ```
     * export * as React from "./some"
     * ```
     * ```
     *  _runtime_module_export.React = _runtime_module_import("./some");
     * ```
     */
    return {
      nextItem: undefined,
      runtimeExport: createRuntimeModuleExportAssignment(node.exported, runtimeModuleImport),
    };
  } else {
    return {
      nextItem: undefined,
      /**
       * ```
       * export * from "./some"
       * ```
       * ```
       *  _runtime_module_export = {
       *    ..._runtime_module_export,
       *    ..._runtime_module_import("./some")
       *  }
       * ```
       */
      runtimeExport: Factory.createAssignmentExpression(
        Factory.createIdentifier(
          RUNTIME_MODULE_EXPORT_REF,
          DUMMY_SOURCE_POSITION,
          DUMMY_SOURCE_POSITION,
          undefined,
          undefined,
        ),
        Factory.createObjectExpression(
          [
            Factory.createSpreadElement(
              Factory.createIdentifier(
                RUNTIME_MODULE_EXPORT_REF,
                DUMMY_SOURCE_POSITION,
                DUMMY_SOURCE_POSITION,
                undefined,
                undefined,
              ),
              DUMMY_SOURCE_POSITION,
              DUMMY_SOURCE_POSITION,
            ),
            Factory.createSpreadElement(runtimeModuleImport, DUMMY_SOURCE_POSITION, DUMMY_SOURCE_POSITION),
          ],
          false,
          DUMMY_SOURCE_POSITION,
          DUMMY_SOURCE_POSITION,
        ),
        SyntaxKinds.AssginOperator,
        DUMMY_SOURCE_POSITION,
        DUMMY_SOURCE_POSITION,
      ),
    };
  }
}

export function exportDeclarationTransformer(program: Program, moduleIds: ModuleId[]) {
  const nextBody: ModuleItem[] = [];
  const runtimeModulePolyfill: ModuleItem[] = [];
  for (const item of program.body) {
    switch (item.kind) {
      case SyntaxKinds.ExportDefaultDeclaration: {
        const defaultExport = item as ExportDefaultDeclaration;
        const { nextItem, runtimeExport } = handleDefaultExportDeclaration(defaultExport);
        if (nextItem) {
          nextBody.push(nextItem);
        }
        runtimeModulePolyfill.push(runtimeExport);
        break;
      }
      case SyntaxKinds.ExportAllDeclaration: {
        const allExport = item as ExportAllDeclaration;
        const { runtimeExport } = handleExportAllDeclaration(allExport, moduleIds);
        runtimeModulePolyfill.push(runtimeExport);
        break;
      }
      case SyntaxKinds.ExportNamedDeclaration: {
        const namedExport = item as ExportNamedDeclarations;
        const { nextItem, runtimeExport } = handleExportNameDeclaration(namedExport);
        if (nextItem) {
          nextBody.push(nextItem);
        }
        runtimeModulePolyfill.push(...(Array.isArray(runtimeExport) ? runtimeExport : [runtimeExport]));
        break;
      }
      default: {
        nextBody.push(item);
        break;
      }
    }
  }
  program.body = [...nextBody, ...runtimeModulePolyfill];
  return;
}
