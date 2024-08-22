import { createLexer } from "@/src/lexer";
import { SyntaxKinds, SytaxKindsMapLexicalLiteral, ModuleItem } from "web-infra-common";
import { createParser } from "@/src/parser";
import { transformSyntaxKindToLiteral } from "../tests/helper/transform";
import fs from "fs";
import path from "path";
const code = fs.readFileSync(path.join(__dirname, "test.js")).toString();
// console.log(code);
// const writePath = path.join(__dirname, "test.json");

// for(const symbol of code) console.log("SYM:",symbol);

// console.log(code.includes("𞸀"), code.indexOf("𞸀"), code.length, "𞸀".length, code[code.indexOf("𞸀")] === "𞸀", IdContinueRegex.test("𞸀"), XContinueRegex.test(code[4]),   String.fromCodePoint("𞸀".charCodeAt(0)) === "𞸀", code.indexOf("𞸀"), code[4])
// IdContinueRegex

// import chalk from 'chalk';

// const log = console.log;

// // Combine styled and normal strings
// log(chalk.blue('Hello') + ' World' + chalk.red('!'));

// printLexer(code);
printParser(code);

function printLexer(code: string) {
  console.log("=================================");
  console.log("=================================");
  console.log("============ lexer ==============");
  console.log("=================================");

  const lexer = createLexer(code);
  while (lexer.getTokenKind() != SyntaxKinds.EOFToken) {
    console.log(
      lexer.getTokenKind(),
      SytaxKindsMapLexicalLiteral[lexer.getTokenKind()],
      lexer.getSourceValue().charCodeAt(0),
      lexer.getStartPosition(),
      lexer.getEndPosition(),
    );
    lexer.nextToken();
  }
  console.log(
    SytaxKindsMapLexicalLiteral[lexer.getTokenKind()],
    lexer.getSourceValue(),
    lexer.getStartPosition(),
    lexer.getEndPosition(),
  );
}
function printParser(code: string) {
  const ast = createParser(code, { sourceType: "module", plugins: ["jsx"] }).parse();
  transformSyntaxKindToLiteral(ast);
  console.log(JSON.stringify(ast, null, 4));
  return 0;
}
