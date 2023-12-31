import { createParser } from "@/src/parser";
import { createLexer } from "@/src/lexer";
import { SyntaxKinds } from "web-infra-common";

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
    return [tokens, lexer.getTime(), lexer.getSkipTime()];
}

export function doNothing(code: string) {
    for(const ch of code) {
        if(ch == " ") {

        }
    }
}
