import {
  Visitor,
  visitNode,
  SyntaxKinds,
  Program,
  ModuleItem,
  ExportDefaultDeclaration,
  ExportNamedDeclarations,
} from "web-infra-common";

/**
 * Remove All the import declaration of program
 */
export function removeAllImportDeclaration(program: Program) {
  const removeImportDeclarationTable: Visitor = {
    [SyntaxKinds.Program]: (node, _) => {
      const nextBody = [];
      for (const item of node.body) {
        if (item.kind === SyntaxKinds.ImportDeclaration) {
          continue;
        }
        nextBody.push(item);
      }
      node.body = nextBody;
    },
  };
  visitNode(program, removeImportDeclarationTable);
  return;
}

export function removeModuleRelativeItem(program: Program) {
  const visitor: Visitor = {
    [SyntaxKinds.Program]: (node, _) => {
      const nextBody: ModuleItem[] = [];
      for (const item of node.body) {
        switch (item.kind) {
          case SyntaxKinds.ImportDeclaration: {
            continue;
          }
          case SyntaxKinds.ExportAllDeclaration: {
            continue;
          }
          case SyntaxKinds.ExportDefaultDeclaration: {
            const defaultItem = item as ExportDefaultDeclaration;
            nextBody.push(defaultItem.declaration);
            continue;
          }
          case SyntaxKinds.ExportNamedDeclaration: {
            const nameDeclarItem = item as ExportNamedDeclarations;
            if (nameDeclarItem.declaration) {
              nextBody.push(nameDeclarItem.declaration);
              continue;
            }
          }
        }
        nextBody.push(item);
        continue;
      }
      node.body = nextBody;
    },
  };
  visitNode(program, visitor);
  return;
}
