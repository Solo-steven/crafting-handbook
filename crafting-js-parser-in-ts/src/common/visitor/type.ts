import { ModuleItem } from "../ast";

export type Visitor = {[key: number ]: (node: ModuleItem) => void }