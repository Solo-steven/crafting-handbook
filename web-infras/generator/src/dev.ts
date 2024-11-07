import { parse } from "web-infra-parser";
import { Generaotr } from "@/src/index";
const ast = parse("function a(c) { const cc = 10+c; return cc; }");
const generator = new Generaotr();

generator.genProgram(ast);

console.log(generator.code);
