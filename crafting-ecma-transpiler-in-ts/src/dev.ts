import { createLexer } from "@/src/lexer";
import { SyntaxKinds, SytaxKindsMapLexicalLiteral  } from "@/src/common";
import { createParser } from "@/src/parser";
import { transformSyntaxKindToLiteral } from  "../tests/transform";
import fs from 'fs';
import path from "path";
import { performance } from "node:perf_hooks";
const code = fs.readFileSync(path.join(__dirname, "react.development.js"), "utf-8").toString();
console.log("=================================");
console.log("Test JavaScript Code:");
console.log(code);
console.log("=================================");
console.log("=================================");
console.log("============ lexer ==============");
console.log("=================================");

const lexer = createLexer(code);
while(lexer.getToken() != SyntaxKinds.EOFToken) {
    console.log( SytaxKindsMapLexicalLiteral[lexer.getToken()], lexer.getSourceValue());
    lexer.nextToken();
}

console.log("=================================");
console.log("============ Parser =============");
console.log("=================================");
const ast = createParser(code).parse();
transformSyntaxKindToLiteral(ast);
console.log(JSON.stringify(ast, null, 4));