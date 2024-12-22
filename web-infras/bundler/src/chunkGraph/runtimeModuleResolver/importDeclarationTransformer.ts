import { ModuleId } from "@/src/depGraph";
import { moduleSourceToModuleId } from "./utils";
import {
  createSourcePosition,
  Factory,
  ImportDeclaration,
  isStringLiteral,
  ModuleItem,
  ObjectPattern,
  Program,
  SyntaxKinds,
  VariableDeclarator,
} from "web-infra-common";

const DUMMY_SOURCE_POSITION = createSourcePosition();
const RUNTIME_MODULE_IMPORT_CALLEE = "_runtime_module_import";

function handleImportDeclararation(node: ImportDeclaration, moduleIds: ModuleId[]) {
  const declarators: VariableDeclarator[] = [];
  function createRuntimeModuleCallExpression() {
    return Factory.createCallExpression(
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
  }
  let destructurePattern: ObjectPattern | null = null;
  function getDestructurePattern() {
    if (destructurePattern === null) {
      destructurePattern = Factory.createObjectPattern(
        [],
        undefined,
        undefined,
        DUMMY_SOURCE_POSITION,
        DUMMY_SOURCE_POSITION,
      );
    }
    return destructurePattern;
  }
  for (const specifier of node.specifiers) {
    switch (specifier.kind) {
      case SyntaxKinds.ImportSpecifier: {
        const imported = isStringLiteral(specifier.imported)
          ? Factory.createIdentifier(
              specifier.imported.value,
              DUMMY_SOURCE_POSITION,
              DUMMY_SOURCE_POSITION,
              undefined,
              undefined,
            )
          : specifier.imported;
        getDestructurePattern().properties.push(
          Factory.createObjectPatternProperty(
            imported,
            specifier.local ?? undefined,
            false,
            specifier.local === null,
            DUMMY_SOURCE_POSITION,
            DUMMY_SOURCE_POSITION,
          ),
        );
        break;
      }
      case SyntaxKinds.ImportNamespaceSpecifier: {
        const name = specifier.imported;
        if (isStringLiteral(name)) {
          throw new Error();
        }
        declarators.push(
          Factory.createVariableDeclarator(
            name,
            createRuntimeModuleCallExpression(),
            DUMMY_SOURCE_POSITION,
            DUMMY_SOURCE_POSITION,
          ),
        );
        break;
      }
      case SyntaxKinds.ImportDefaultSpecifier: {
        const name = specifier.imported;
        const memberExpression = Factory.createMemberExpression(
          false,
          createRuntimeModuleCallExpression(),
          Factory.createIdentifier(
            "default",
            DUMMY_SOURCE_POSITION,
            DUMMY_SOURCE_POSITION,
            undefined,
            undefined,
          ),
          false,
          DUMMY_SOURCE_POSITION,
          DUMMY_SOURCE_POSITION,
        );
        declarators.push(
          Factory.createVariableDeclarator(
            name,
            memberExpression,
            DUMMY_SOURCE_POSITION,
            DUMMY_SOURCE_POSITION,
          ),
        );
        break;
      }
    }
  }
  if (destructurePattern) {
    declarators.push(
      Factory.createVariableDeclarator(
        destructurePattern,
        createRuntimeModuleCallExpression(),
        DUMMY_SOURCE_POSITION,
        DUMMY_SOURCE_POSITION,
      ),
    );
  }
  return Factory.createVariableDeclaration(declarators, "var", DUMMY_SOURCE_POSITION, DUMMY_SOURCE_POSITION);
}

export function importDeclarationTransformer(program: Program, moduleIds: ModuleId[]) {
  const nextBody: ModuleItem[] = [];
  for (const item of program.body) {
    if (item.kind === SyntaxKinds.ImportDeclaration) {
      const variableDeclar = handleImportDeclararation(item as ImportDeclaration, moduleIds);
      nextBody.push(variableDeclar);
      continue;
    }
    nextBody.push(item);
  }
  program.body = nextBody;
  return;
}
