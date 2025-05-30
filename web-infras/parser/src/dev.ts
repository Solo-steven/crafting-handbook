import { createLexer } from "@/src/lexer";
import { SyntaxKinds, SytaxKindsMapLexicalLiteral } from "web-infra-common";
import { parse } from "@/src/index";
import { transformSyntaxKindToLiteral } from "../tests/parserRunner/helpers/transform";
import fs from "fs";
import path from "path";
import { ParserPlugin } from "./parser/config";
import { createErrorHandler } from "./errorHandler";
// import { ParserPlugin } from "./parser/config";
const code = fs.readFileSync(path.join(__dirname, "test.ts")).toString();
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printLexer(code: string) {
  console.log("=================================");
  console.log("=================================");
  console.log("============ lexer ==============");
  console.log("=================================");

  const lexer = createLexer(code, createErrorHandler(code));
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
  const ast = parse(code, { sourceType: "module", plugins: [ParserPlugin.TypeScript] });
  transformSyntaxKindToLiteral(ast);
  const astJsonString = JSON.stringify(ast, null, 4);
  fs.writeFileSync("./test.json", astJsonString);
  console.log(JSON.stringify(ast, null, 4));
  return 0;
}
