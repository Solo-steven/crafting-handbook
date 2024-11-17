import { ModuleId } from "@/src/depGraph";

export function moduleSourceToModuleId(source: string, moduleIds: ModuleId[]) {
  for (const id of moduleIds) {
    if (source.startsWith("./")) {
      if (id.endsWith(source.slice(2))) {
        return id;
      }
    } else {
      if (id === source) {
        return id;
      }
    }
  }
  // unreach;
  throw new Error();
}
