import { createSourcePosition } from "web-infra-common";

export const DUMMY_SOURCE_POSITION = createSourcePosition();
export const RUNTIME_MODULE_IMPORT_CALLEE = "_runtime_module_import";
export const RUNTIME_MODULE_EXPORT_REF = "_runtime_module_export";
export const RUNTIME_MODULE_MAP = "_runtime_module_map";
export const RUNTIME_MODULE_CACHE = "_runtime_module_cache";
export const RUNTIME_MODULE_BOOTSTRAP_TEMPLATE = `
var ${RUNTIME_MODULE_CACHE} = {};
var ${RUNTIME_MODULE_IMPORT_CALLEE} = (source) => {
  const runtimeCache = ${RUNTIME_MODULE_CACHE}[source];
  if(runtimeCache) {
    return runtimeCache;
  }
  const ${RUNTIME_MODULE_EXPORT_REF} = {} 
  ${RUNTIME_MODULE_MAP}[source](${RUNTIME_MODULE_IMPORT_CALLEE}, ${RUNTIME_MODULE_EXPORT_REF});
  ${RUNTIME_MODULE_CACHE}[source] = ${RUNTIME_MODULE_EXPORT_REF};
  return ${RUNTIME_MODULE_EXPORT_REF};
}`;
