import { createLexer } from "@/src/lexer";
import { SyntaxKinds, SytaxKindsMapLexicalLiteral, ModuleItem } from "ecmakit-jscommon";
import { createParser } from "@/src/parser";
import { transformSyntaxKindToLiteral } from  "../tests/transform";
import fs from 'fs';
import path from "path";
const code = fs.readFileSync(path.join(__dirname, "test.js"), "utf-8").toString();

// printLexer(code);
printParser(code);

function printLexer(code: string) {
    console.log("=================================");
    console.log("=================================");
    console.log("============ lexer ==============");
    console.log("=================================");
    
    const lexer = createLexer(code);
    while(lexer.getToken() != SyntaxKinds.EOFToken) {
        console.log( lexer.getToken(), SytaxKindsMapLexicalLiteral[lexer.getToken()], lexer.getSourceValue(), lexer.getStartPosition(), lexer.getEndPosition());
        lexer.nextToken();
    }
    console.log( SytaxKindsMapLexicalLiteral[lexer.getToken()], lexer.getSourceValue(), lexer.getStartPosition(), lexer.getEndPosition());
    
}
function printParser(code: string) {
    console.log("=================================");
    console.log("============ Parser =============");
    console.log("=================================");
    const ast = createParser(code).parse();
    transformSyntaxKindToLiteral(ast);
    console.log(JSON.stringify(ast, null, 4));
}
