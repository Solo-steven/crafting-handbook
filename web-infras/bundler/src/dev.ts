import { createGraph } from "@/src/depGraph";
import { buildChunks, renderChunks } from "@/src/chunkGraph";

async function main() {
  const config = {
    entry: "./dev/src/index.js",
    output: "./dev/dist",
  };
  const depGraph = await createGraph(config);
  console.log(depGraph);
  const chunks = buildChunks(depGraph, config);
  await renderChunks(config, chunks, depGraph);
}

main();
