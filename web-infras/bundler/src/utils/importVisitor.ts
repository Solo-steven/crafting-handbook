import { Visitor, visitNode, SyntaxKinds, Program } from "web-infra-common";

/**
 * Get all the dep(importer) of current module
 */
export function getImporterSource(program: Program) {
  const sources: string[] = [];
  const importerVisitorTable: Visitor = {
    [SyntaxKinds.ImportDeclaration]: (node, _) => {
      sources.push(node.source.value);
    },
  };
  visitNode(program, importerVisitorTable);
  return sources;
}
