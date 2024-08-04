import { createLexer } from "@/src/lexer";
import { SyntaxKinds, SytaxKindsMapLexicalLiteral, ModuleItem } from "web-infra-common";
import { createParser } from "@/src/parser";
import { transformSyntaxKindToLiteral } from "../tests/transform";
import fs from "fs";
import path from "path";
const code = fs.readFileSync(path.join(__dirname, "test.js"), "utf-8").toString();

const writePath = path.join(__dirname, "test.json");

// import chalk from 'chalk';

// const log = console.log;

// // Combine styled and normal strings
// log(chalk.blue('Hello') + ' World' + chalk.red('!'));

printLexer(code);
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
      lexer.getSourceValue(),
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
  const ast = createParser(code, { allowAwaitOutsideFunction: true }).parse();
  transformSyntaxKindToLiteral(ast);
  console.log(JSON.stringify(ast, null, 4));
  return 0;
}
