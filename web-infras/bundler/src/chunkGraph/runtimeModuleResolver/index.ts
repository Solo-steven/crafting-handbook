/**
 * When bundling multiple module into a chunk, we need to concate multiple
 * module where are import each other with a graph relation, and import and
 * export need to be solve (replace or flating) into a single chunk.
 *
 * There we concate the modules by wrap each module into a function, lower the
 * module scope into function scope and using a runtime polyfill to replace
 * import and export syntax in module, if you familier with webpack, it actually
 * is same way webpack handle module export and import.
 */
import { Factory, StatementListItem } from "web-infra-common";
import { generate } from "web-infra-generator";
import { Chunk } from "@/src/chunkGraph/type";
import { DepGraph, ModuleId } from "@/src/depGraph";
import { exportDeclarationTransformer } from "./exportDeclarationTransformer";
import { importDeclarationTransformer } from "./importDeclarationTransformer";
import { moduleSourceToModuleId } from "./utils";
import {
  DUMMY_SOURCE_POSITION,
  RUNTIME_MODULE_EXPORT_REF,
  RUNTIME_MODULE_IMPORT_CALLEE,
  RUNTIME_MODULE_MAP,
  RUNTIME_MODULE_BOOTSTRAP_TEMPLATE,
} from "./const";

function createRuntimeModule(body: StatementListItem[]) {
  return Factory.createArrowExpression(
    false,
    Factory.createFunctionBody(body, DUMMY_SOURCE_POSITION, DUMMY_SOURCE_POSITION),
    [
      Factory.createIdentifier(
        RUNTIME_MODULE_IMPORT_CALLEE,
        DUMMY_SOURCE_POSITION,
        DUMMY_SOURCE_POSITION,
        undefined,
        undefined,
      ),
      Factory.createIdentifier(
        RUNTIME_MODULE_EXPORT_REF,
        DUMMY_SOURCE_POSITION,
        DUMMY_SOURCE_POSITION,
        undefined,
        undefined,
      ),
    ],
    undefined,
    undefined,
    false,
    DUMMY_SOURCE_POSITION,
    DUMMY_SOURCE_POSITION,
  );
}

function createRuntimeModuleMap(moduleMap: Record<ModuleId, StatementListItem[]>) {
  const map = Factory.createObjectExpression([], false, DUMMY_SOURCE_POSITION, DUMMY_SOURCE_POSITION);
  for (const [id, body] of Object.entries(moduleMap)) {
    map.properties.push(
      Factory.createObjectProperty(
        Factory.createStringLiteral(id, DUMMY_SOURCE_POSITION, DUMMY_SOURCE_POSITION),
        createRuntimeModule(body),
        false,
        false,
        DUMMY_SOURCE_POSITION,
        DUMMY_SOURCE_POSITION,
      ),
    );
  }
  return Factory.createVariableDeclaration(
    [
      Factory.createVariableDeclarator(
        Factory.createIdentifier(
          RUNTIME_MODULE_MAP,
          DUMMY_SOURCE_POSITION,
          DUMMY_SOURCE_POSITION,
          undefined,
          undefined,
        ),
        map,
        DUMMY_SOURCE_POSITION,
        DUMMY_SOURCE_POSITION,
      ),
    ],
    "var",
    DUMMY_SOURCE_POSITION,
    DUMMY_SOURCE_POSITION,
  );
}

export function renderRuntimeModuleTemplate(entry: string, chunk: Chunk, depGraph: DepGraph) {
  const moduleRecord = chunk.moduleIds.reduce(
    (record, id) => {
      record[id] = depGraph.moduleMap[id].ast.body as StatementListItem[];
      return record;
    },
    {} as Record<ModuleId, StatementListItem[]>,
  );
  const moduleMapObjectExpressionStatement = createRuntimeModuleMap(moduleRecord);
  const mapCode = generate(
    Factory.createProgram([moduleMapObjectExpressionStatement], DUMMY_SOURCE_POSITION, DUMMY_SOURCE_POSITION),
  );
  return `${mapCode}\n${RUNTIME_MODULE_BOOTSTRAP_TEMPLATE}\n${RUNTIME_MODULE_IMPORT_CALLEE}("${moduleSourceToModuleId(entry, chunk.moduleIds)}")`;
}

export function runtimeModulize(chunk: Chunk, depGraph: DepGraph) {
  for (const moduleId of chunk.moduleIds) {
    const program = depGraph.moduleMap[moduleId].ast;
    importDeclarationTransformer(program, chunk.moduleIds);
    exportDeclarationTransformer(program, chunk.moduleIds);
  }
}
