import path from "node:path";

export type AbsolutePath = string;
// type RelativePath = string;
export type SystemPath = string;

export function resolvePath(pth: SystemPath, currentModDirPath: AbsolutePath): AbsolutePath {
  if (pth.startsWith("./")) {
    return path.resolve(currentModDirPath, pth);
  }
  return pth;
}
