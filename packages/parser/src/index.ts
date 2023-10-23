import { createParser } from "@/src/parser";
import { createLexer } from "@/src/lexer";
import { SyntaxKinds } from "emcakit-jscommon";

export function parse(code: string) {
    const parser = createParser(code);
    return parser.parse();
}
export function tokenize(code: string) {
    const lexer = createLexer(code);
    const tokens = [];
    while(1) {
        const token = lexer.nextToken();
        tokens.push(token);
        if(token === SyntaxKinds.EOFToken) {
            break;
        }
    }
    return tokens;
}
