import { Program } from "web-infra-common";
import { Generator } from "./generator";

export function generate(program: Program) {
  const generator = new Generator();
  generator.genProgram(program);
  return generator.code;
}
