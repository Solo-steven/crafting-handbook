import { createLexer } from "@/src/lexer";
import { SyntaxKinds, SytaxKindsMapLexicalLiteral  } from "@/src/common";
import { createParser } from "@/src/parser";
import { transformSyntaxKindToLiteral } from  "../tests/transform";
import fs from 'fs';
import path from "path";
import { performance } from "node:perf_hooks";
const code = fs.readFileSync(path.join(__dirname, "jquery.min.js"), "utf-8").toString();
const formatCode = fs.readFileSync(path.join(__dirname, "jquery.min.format.js"), "utf-8").toString();
// console.log("=================================");
// console.log("Test JavaScript Code:");
// console.log(code);
// console.log("=================================");
// console.log("=================================");
// console.log("============ lexer ==============");
// console.log("=================================");

function writeToToken(code: string, fileName: string) {
    const lexer = createLexer(code);
    let fileString = ""
    while(lexer.getToken() != SyntaxKinds.EOFToken) {
        fileString += `${SytaxKindsMapLexicalLiteral[lexer.getToken()]}, ${lexer.getSourceValue()}\n`; 
        lexer.nextToken();
    }
    fs.writeFileSync(fileName, fileString, { flag: "w" });
}

writeToToken(formatCode, path.join(__dirname, "format.txt"))
writeToToken(code, path.join(__dirname, "min.txt"))


// const lexer = createLexer(code);
// while(lexer.getToken() != SyntaxKinds.EOFToken) {
//     console.log( SytaxKindsMapLexicalLiteral[lexer.getToken()], lexer.getSourceValue());
//     lexer.nextToken();
// }

console.log("=================================");
console.log("============ Parser =============");
console.log("=================================");
const ast = createParser(code).parse();
transformSyntaxKindToLiteral(ast);
console.log(JSON.stringify(ast, null, 4));