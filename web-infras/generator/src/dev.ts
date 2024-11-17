import { parse } from "web-infra-parser";
import { Generator } from "@/src/generator";
const ast = parse("function a(c) { const cc = 10+c; return cc; }");
const generator = new Generator();

generator.genProgram(ast);

console.log(generator.code);
