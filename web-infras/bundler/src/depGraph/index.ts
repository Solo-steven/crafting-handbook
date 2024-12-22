import { readFile } from "fs/promises";
import { BundlerConfig } from "@/src/config";
import { Program } from "web-infra-common";
import { parse } from "web-infra-parser";
import { getImporterSource } from "../utils/importVisitor";
import { resolvePath, AbsolutePath } from "@/src/utils/resolvePath";

export type ModuleId = AbsolutePath;

export interface Module {
  // absolute path of module
  id: ModuleId;
  // JS ast
  ast: Program;
  // all the file this module import
  importer: AbsolutePath[];
}

export interface DepGraph {
  moduleMap: { [key: ModuleId]: Module };
}

function createModule(id: string, ast: Program, importer: AbsolutePath[]): Module {
  return { id, ast, importer };
}
export async function createGraph(config: BundlerConfig): Promise<DepGraph> {
  const entryAbsolutPath = resolvePath(config.entry, process.cwd());
  const queue: Array<AbsolutePath> = [entryAbsolutPath];
  const graph: DepGraph = {
    moduleMap: {},
  };
  while (queue.length > 0) {
    const modAbsolutePath = queue.pop()!;
    if (graph.moduleMap[modAbsolutePath]) {
      continue;
    }
    const fileString = (await readFile(modAbsolutePath)).toString();
    const ast = parse(fileString, { sourceType: "module" });
    const importerSystemPaths = getImporterSource(ast);
    const modDirabsolutePath = modAbsolutePath.split("/").slice(0, -1).join("/");
    const importerAbsolutePaths = importerSystemPaths.map((importerSystemPath) =>
      resolvePath(importerSystemPath, modDirabsolutePath),
    );
    graph.moduleMap[modAbsolutePath] = createModule(modAbsolutePath, ast, importerAbsolutePaths);
    queue.push(...importerAbsolutePaths);
  }
  return graph;
}
