import fs from "node:fs/promises";
import path from "node:path";
import type { BundlerConfig } from "@/src/config";
import { DepGraph, ModuleId } from "@/src/depGraph";
import { resolvePath } from "@/src/utils/resolvePath";
import type { Chunk } from "@/src/chunkGraph/type";
import { renderRuntimeModuleTemplate, runtimeModulize } from "@/src/chunkGraph/runtimeModuleResolver";
/**
 *
 * @param entry
 * @param graph
 * @returns
 */
function getReverseDFSOrdering(entry: ModuleId, graph: DepGraph): ModuleId[] {
  const orders: ModuleId[] = [];
  const mark: Record<ModuleId, boolean> = {};
  function dfsVisit(current: ModuleId) {
    if (mark[current] === true) return;
    const deps = graph.moduleMap[current].importer;
    mark[current] = true;
    for (const dep of deps) {
      dfsVisit(dep);
    }
    orders.push(current);
  }
  dfsVisit(entry);
  return orders;
}

export function buildChunks(graph: DepGraph, config: BundlerConfig): Chunk[] {
  const configs = [config];
  const chunks: Array<Chunk> = [];
  for (const config of configs) {
    const entryAbsolutPath = resolvePath(config.entry, process.cwd());
    const reverseTopoOrders = getReverseDFSOrdering(entryAbsolutPath, graph);
    chunks.push({
      moduleIds: reverseTopoOrders,
    });
  }
  return chunks;
}

export async function renderChunks(config: BundlerConfig, chunks: Chunk[], graph: DepGraph) {
  let index = 0;
  for (const chunk of chunks) {
    runtimeModulize(chunk, graph);
    const code = renderRuntimeModuleTemplate(config.entry, chunk, graph);
    const outputAbsolutePath = path.resolve(resolvePath(config.output, process.cwd()), `output_${index}.js`);
    await fs.writeFile(outputAbsolutePath, code);
    index++;
  }
}
