import { SyntaxKinds, LexicalLiteral, KeywordLiteralMapSyntaxKind } from "web-infra-common";
import { SourcePosition, cloneSourcePosition, createSourcePosition } from "web-infra-common";
import { ErrorMessageMap } from "./error";
import { performance } from "node:perf_hooks";
/**
 * Context for lexer
 * @member {string} code
 * 
 * 
 */
interface Context {
    // code need to tokenize
    code: string;
    // current pos information
    pos: number;
    currentLine: number;
    currentLineStart: number;
    lastTokenEndSourcePosition: SourcePosition;
    // current token and token's information
    sourceValue: string;
    token: SyntaxKinds | null;
    startPosition: SourcePosition;
    endPosition: SourcePosition;
    // stack for tokenize template literal
    templateStringStackCounter: Array<number>;
    escFlag: boolean;
    // (TODO_MAYBE_REMOVE): for measure performance
    time: number;
    skipTime: number;
}

type TokenContext = { 

}

function createContext(code: string): Context {
    return {
        code,
        pos: 0, currentLine: 1, currentLineStart: 0, lastTokenEndSourcePosition: createSourcePosition(),
        sourceValue: "", token: null, startPosition: createSourcePosition(), endPosition: createSourcePosition(),
        templateStringStackCounter: [],
        escFlag: false,
        time: 0, skipTime: 0
    }
}

function cloneContext(source: Context): Context {
    return {
        ...source,
        startPosition: cloneSourcePosition(source.startPosition),
        endPosition: cloneSourcePosition(source.endPosition),
        templateStringStackCounter: [...source.templateStringStackCounter],
    }
}

interface Lexer {
    getSourceValue: () => string;
    getBeforeValue: () => string;
    getStartPosition: () => SourcePosition;
    getEndPosition: () => SourcePosition;
    getToken: () => SyntaxKinds;
    nextToken: () => SyntaxKinds;
    lookahead: () => {
        kind: SyntaxKinds,
        start: SourcePosition,
        end: SourcePosition,
        flag: boolean,
        value: string,
    };
    // API for line terminator
    getLineTerminatorFlag: () => boolean,
    // API for read regexliteral
    readRegex: () => { pattern: string, flag: string };
    // Temp api for performance measure
    getTime: () => number;
    getSkipTime: () => number;
}

const nonIdentifierStartSet = new Set([ 
    ...LexicalLiteral.punctuators,
    ...LexicalLiteral.operator, 
    ...LexicalLiteral.newLineChars, 
    ...LexicalLiteral.whiteSpaceChars
]);

const nonIdentifierStarMap: {[key: string]: number} = {};

for(const item of [
    ...LexicalLiteral.punctuators,
    ...LexicalLiteral.operator, 
    ...LexicalLiteral.newLineChars, 
    ...LexicalLiteral.whiteSpaceChars
]) {
    nonIdentifierStarMap[item] = 1;
}

const KeywordLiteralSet = new Set([
    ...LexicalLiteral.keywords,
    ...LexicalLiteral.BooleanLiteral,
    ...LexicalLiteral.NullLiteral,
    ...LexicalLiteral.UndefinbedLiteral,
])

const changeLineRegex = /\n/;

export function createLexer(code: string): Lexer {
    let context = createContext(code);
    /**
     * Public Api for getting change line flag of current token.
     * @returns {boolean}
     */
    function getLineTerminatorFlag(): boolean {
        const lastEndIndex = context.lastTokenEndSourcePosition.index;
        const curStartIndex = context.startPosition.index;
        return changeLineRegex.test(context.code.slice(lastEndIndex, curStartIndex));
    }
    /**
     * Public Api for getting space and changeline value before
     * current token and previous token.
     * @returns {string}
     */
    function getBeforeValue(): string {
        const lastEndIndex = context.lastTokenEndSourcePosition.index;
        const curStartIndex = context.startPosition.index;
        return context.code.slice(lastEndIndex, curStartIndex);
    }
    function getSourceValue() {
        return context.sourceValue;
    }
    function getStartPosition() {
        return context.startPosition;
    }
    function getEndPosition() {
        return context.endPosition;
    }
    function getToken() {
        if(context.token === null) {
            context.token = lex();
        }
        return context.token;
    }
    function nextToken() {
        context.token = lex();
        return context.token;
    }
    function lookahead() {
        const lastContext = cloneContext(context);
        const meta = {
            kind: nextToken(),
            start: getStartPosition(),
            end: getEndPosition(),
            flag: getLineTerminatorFlag(),
            value: getSourceValue(),
        };
        context = lastContext;
        return meta;
    }
    return {
        getSourceValue,
        getBeforeValue,
        getStartPosition,
        getEndPosition,
        getToken,
        getLineTerminatorFlag,
        nextToken,
        lookahead,
        readRegex,
        getTime() {
            return context.time;
        },
        getSkipTime() {
            return context.skipTime;
        }
    }
    /**
     * Start reading a token, because token contain row and col 
     * information, so we need to record the current pos as start
     * mark.
     * @returns {void}
     */
    function startToken(): void {
        context.escFlag = false;
        context.startPosition = {
            row: context.currentLine,
            col: context.pos - context.currentLineStart + 1,
            index: context.pos,
        }
    }
    /**
     * 
     * @param kind 
     * @param value 
     * @returns 
     */
    function finishToken(kind: SyntaxKinds, value: string): SyntaxKinds {
        context.token = kind;
        context.sourceValue = value;
        context.lastTokenEndSourcePosition = context.endPosition;
        context.endPosition = {
            row: context.currentLine,
            col: context.pos - context.currentLineStart + 1,
            index: context.pos,
        }
        return kind;
    }
    /**
     * 
     */
    function skipWhiteSpaceChangeLine() {
        // TODO: consider the needing of `beforeValue`(only used for parse JSXText)
        // context.beforeValue = "";
        // const start = context.sourcePosition.index;
        let s = performance.now();
        loop: while(context.pos < code.length) {
            switch(context.code[context.pos]) {
                case '\n': 
                    context.pos ++;
                    context.currentLineStart = context.pos;
                    context.currentLine ++;
                    break;
                case " ":
                case "\t":
                    context.pos ++;
                    break;
                default:
                    break loop;
            }
        }
        // context.beforeValue = context.code.slice(start, context.sourcePosition.index);
        context.skipTime += performance.now() - s;
    }
    /**
     * 
     * @param {number} offset 
     * @returns {boolean}
     */
    function isDigital(offset : number = 0): boolean {
        const code = context.code[context.pos + offset].charCodeAt(0);
        return code >= 48 && code <= 57;
    }
    /**
     * 
     */
    function isHex(): boolean {
        const code = context.code[context.pos].charCodeAt(0);
        return (
            (code >= 48 && code <= 57) ||
            (code >= 97 && code <= 102) ||
            (code >= 65 && code <= 70 )
        );
    }
    /**
     * 
     */
    function isBinary() {
        const code = context.code[context.pos];
        return (
            code === "0" || code === "1"
        );
    }
    function isOct() {
        const code = context.code[context.pos].charCodeAt(0);
        return (
            (code >= 48 && code <= 56)
        );
    }
    /**
     * 
     */
    function isIdentifierStartChar() {
        // return !nonIdentifierStartSet.has(context.code[context.pos]);
    }
    /**
     * lexicalError is used for tokenizer unexecpt char happended. ex: string start with " can't find end ""
     * @param {string} content - error message
     * @returns {Error} - a error object
     */
    function lexicalError(content: string): Error {
        return new Error(`[Error]: Lexical Error, ${content}, start position is (${context.startPosition.row}, ${context.startPosition.col})`);
    }
    /**
     * 
     * @returns {SyntaxKinds}
     */
    function lex(): SyntaxKinds {
        skipWhiteSpaceChangeLine();
        const char = context.code[context.pos];
        startToken();
        if(!char) {
            return finishToken(SyntaxKinds.EOFToken, "eof");
        }
        switch(char) {
            /** ==========================================
             *              Punctuators
             *  ==========================================
             */
            case "{":
                context.pos ++;
                context.templateStringStackCounter.push(-1);
                return finishToken(SyntaxKinds.BracesLeftPunctuator, "{");
            case "}":
                const result = context.templateStringStackCounter.pop();
                if(result && result > 0) {
                    return readTemplateMiddleORTail();
                }
                context.pos ++;
                return finishToken(SyntaxKinds.BracesRightPunctuator, "}");
            case "[":
                context.pos ++;
                return finishToken(SyntaxKinds.BracketLeftPunctuator, "[");
            case "]":
                context.pos ++;
                return finishToken(SyntaxKinds.BracketRightPunctuator,"]");
            case "(":
                context.pos ++;
                return finishToken(SyntaxKinds.ParenthesesLeftPunctuator, "(");
            case ")":
                context.pos ++;
                return finishToken(SyntaxKinds.ParenthesesRightPunctuator, ")");
            case ":":
                context.pos ++;
                return finishToken(SyntaxKinds.ColonPunctuator, ":");
            case ";":
                context.pos ++;
                return finishToken(SyntaxKinds.SemiPunctuator, ";");
            /** ==========================================
             *                Operators
             *  ==========================================
             */
            case ",":
                // ','
                context.pos ++;
                return finishToken(SyntaxKinds.CommaToken, ",");
            case "+": {
                // '+', '+=', '++' 
                const next = context.code[context.pos +1];
                switch (next) {
                    case "=":
                        context.pos += 2;
                        return finishToken(SyntaxKinds.PlusAssignOperator, "+=");
                    case "+":
                        context.pos += 2;
                        return finishToken(SyntaxKinds.IncreOperator, "++");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.PlusOperator, "+");
                }
            }
            case "-": {
                // '-', '-=', '--'
                const next = context.code[context.pos +1];
                switch (next) {
                    case "=":
                        context.pos += 2;
                        return finishToken(SyntaxKinds.MinusAssignOperator, "-=");
                    case "-":
                        context.pos += 2;
                        return finishToken(SyntaxKinds.DecreOperator, "--");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.MinusOperator, "-");
                }
            }
            case "*": {
                // '*' , '**', '*=', '**=', 
                const next = context.code[context.pos + 1];
                switch (next) {
                    case "=":
                        context.pos += 2;
                        return finishToken(SyntaxKinds.MultiplyAssignOperator, "*=");
                    case "*": {
                        const nextNext = context.code[context.pos + 2];
                        if(nextNext === "=") {
                            context.pos += 3;
                            return finishToken(SyntaxKinds.ExponAssignOperator, "**=");
                        }
                        context.pos += 2;
                        return finishToken(SyntaxKinds.ExponOperator, "**");
                    }
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.MultiplyOperator, "*");
                }
            }
            case "%": {
                // '%', '%='
                const next = context.code[context.pos + 1];
                switch(next) {
                    case "=":
                        context.pos += 2;
                        return finishToken(SyntaxKinds.ModAssignOperator, "%=");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.ModOperator, "%");
                }
            }
            case ">": {
                // '>', '>>', '>>>' '>=', ">>=",  ">>>="
                const next = context.code[context.pos + 1];
                switch (next) {
                    case ">": {
                        const nextNext = context.code[context.pos +2];
                        switch (nextNext) {
                            case ">": {
                                const nextNextNext = context.code[context.pos + 3];
                                switch(nextNextNext) {
                                    case "=": 
                                        // >>>=
                                        context.pos += 4;
                                        return finishToken(SyntaxKinds.BitwiseRightShiftFillAssginOperator, ">>>=");
                                    default:
                                        // >>>
                                        context.pos += 3;
                                        return finishToken(SyntaxKinds.BitwiseRightShiftFillOperator, ">>>");
                                }
                            }
                            case "=":
                                // >>=
                                context.pos += 3;
                                return finishToken(SyntaxKinds.BitwiseRightShiftAssginOperator, ">>=");
                            default:
                                // >>
                                context.pos += 2;
                                return finishToken(SyntaxKinds.BitwiseRightShiftOperator, ">>");
                        }
                    }
                    case "=": 
                        // >=
                        context.pos += 2;
                        return finishToken(SyntaxKinds.GeqtOperator, ">=");
                    default: 
                        // >
                        context.pos += 1;
                        return finishToken(SyntaxKinds.GtOperator, ">");
                }
            }
            case "<": {
                // '<', '<<', '<=', '<<=', "</"
                const next = context.code[context.pos + 1];
                switch (next) {
                    case "<": {
                        const nextNext = context.code[context.pos +2];
                        switch (nextNext) {
                            case "=":
                                // <<=
                                context.pos += 3;
                                return finishToken(SyntaxKinds.BitwiseLeftShiftAssginOperator, "<<=");
                            default:
                                // <<
                                context.pos += 2;
                                return finishToken(SyntaxKinds.BitwiseLeftShiftOperator, "<<");
                        }
                    }
                    case "=": 
                        // <=
                        context.pos += 2;
                        return finishToken(SyntaxKinds.LeqtOperator, "<=");
                    case "/":
                        context.pos += 2;
                        return finishToken(SyntaxKinds.JSXCloseTagStart, "</");
                    default: 
                        // <
                        context.pos += 1;
                        return finishToken(SyntaxKinds.LtOperator, "<");
                }
            }
            case '=': {
                // '=', '==', '===', '=>'
                const next = context.code[context.pos+1];
                switch (next) {
                    case "=": {
                        const nextNext = context.code[context.pos +2];
                        switch (nextNext) {
                            case "=": 
                                context.pos += 3;
                                return finishToken(SyntaxKinds.StrictEqOperator, "===");
                            default:
                                context.pos += 2;
                                return finishToken(SyntaxKinds.EqOperator, "==");
                        }
                    }
                    case ">":
                        context.pos +=2;
                        return finishToken(SyntaxKinds.ArrowOperator, "=>");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.AssginOperator, "=");
                }
            }
            case "!": {
                // '!', '!=', '!=='
                const next = context.code[context.pos+1];
                switch (next) {
                    case "=": {
                        const nextNext = context.code[context.pos +2];
                        switch (nextNext) {
                            case "=": 
                                context.pos += 3;
                                return finishToken(SyntaxKinds.StrictNotEqOperator, "!==");
                            default:
                                context.pos += 2;
                                return finishToken(SyntaxKinds.NotEqOperator, "!=");
                        }
                    }
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.LogicalNOTOperator, "!");
                }
            }
            case "&": {
                // '&', '&&', '&=', '&&='
                const next = context.code[context.pos+1];
                switch (next) {
                    case "&": {
                        const nextNext = context.code[context.pos + 2];
                        switch(nextNext) {
                            case "=": 
                                context.pos += 3;
                                return finishToken(SyntaxKinds.logicalANDAssginOperator, "&&=");
                            default: 
                                context.pos += 2;
                                return finishToken(SyntaxKinds.LogicalANDOperator, "&&");
                        }
                    }
                    case "=":
                        context.pos += 2;
                        return finishToken(SyntaxKinds.BitwiseANDAssginOperator, "&=");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.BitwiseANDOperator, "&");
                }
            }
            case "|": {
                // '|', "||", '|=', '||='
                const next = context.code[context.pos+1];
                switch (next) {
                    case "|": {
                        const nextNext = context.code[context.pos + 2];
                        switch(nextNext) {
                            case "=": 
                                context.pos += 3;
                                return finishToken(SyntaxKinds.LogicalORAssignOperator, "||=");
                            default: 
                                context.pos += 2;
                                return finishToken(SyntaxKinds.LogicalOROperator, "||");
                        }
                    }
                    case "=":
                        context.pos += 2;
                        return finishToken(SyntaxKinds.BitwiseORAssginOperator, "|=");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.BitwiseOROperator, "|");
                }
            }
            case "?": {
                // '?', '?.' '??'
                const next = context.code[context.pos+1];
                switch (next) {
                    case ".": 
                        context.pos += 2;
                        return finishToken(SyntaxKinds.QustionDotOperator, "?.");
                    case "?": 
                        context.pos += 2;
                        return finishToken(SyntaxKinds.NullishOperator, "??");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.QustionOperator, "?");
                }
            }
            case "^": {
                // '^', '^='
                const next = context.code[context.pos+1];
                switch (next) {
                    case "=": 
                        context.pos += 2;
                        return finishToken(SyntaxKinds.BitwiseXORAssginOperator, "^=");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.BitwiseXOROperator, "^");
                }
            }
            case "~": {
                const next = context.code[context.pos+1];
                switch (next) {
                    case "=": 
                        context.pos += 2;
                        return finishToken(SyntaxKinds.BitwiseNOTAssginOperator, "~=");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.BitwiseNOTOperator, "~");
                }
            }
            case "/": {
                // '/' '// comment' '/* comments */'
                const next = context.code[context.pos + 1];
                switch (next) {
                    case "/": 
                        // start with "//"
                        return readComment();
                    case "*": 
                        // start with "/*"
                        return readCommentBlock();
                    case "=":
                        // start with "/="
                        context.pos += 2;
                        return finishToken(SyntaxKinds.DivideAssignOperator, "/=");
                    case ">": 
                        // start with "/>"
                        context.pos += 2;
                        return finishToken(SyntaxKinds.JSXSelfClosedToken, "/>");
                    default:
                        // just "/"
                        context.pos += 1;
                        return finishToken(SyntaxKinds.DivideOperator, "/");
                }
            }
            case ".": {
                // '.', '...', 'float-literal', Sub State Machine 2
                const next = context.code[context.pos + 1];
                const nextNext = context.code[context.pos + 2];
                if(next === "." && nextNext === ".") {
                    context.pos += 3;
                    return finishToken(SyntaxKinds.SpreadOperator, "...");
                }
                if(isDigital(1)) {
                    return readDotStartFloat();
                }
                context.pos += 1;
                return finishToken(SyntaxKinds.DotOperator, ".");
            }
            case '#': {
                context.pos ++;
                const word = readWord();
                return finishToken(SyntaxKinds.PrivateName, word);
            }
            case '`': {
                return readTemplateHeadORNoSubstitution();
            }
            /** ==========================================
             *  Keyword, Id, Literal
             *   -> start from 0 ~ 9 , is number literal.
             *   -> start from " or ', is string
             *   -> oterview, read string literal
             *       ->  string maybe match the keyword or operator, or literal (bool)
             *       ->   id lterial
             *  ==========================================
             */
            case "0": case "1": case "2": case "3": case "4": case "5":
            case "6": case "7": case "8": case "9": {
                // Number Literal
                return readNumberLiteral();
            }
            case "\"": {
                // String Literal
                return readStringLiteral("\"");
            }
            case "'": {
                // String Literal
                return readStringLiteral("'");
            }
            default: {
                // Word -> Id or Keyword
                return readString();
            }
        }
    }
    /** ======================================
     *      State Machine
     *  ======================================
     */
    function readComment() {
        // eat '//'
        context.pos += 2;
        const startIndex = context.pos;
        while(context.pos < context.code.length) {
            if(context.code[context.pos] === "\n") {
                break;
            }
            context.pos ++;
        }
        return finishToken(SyntaxKinds.Comment, context.code.slice(startIndex, context.pos));
    }
    function readCommentBlock() {
        // eat '/*'
        context.pos += 2;
        const startIndex = context.pos;
        while(context.pos < context.code.length) {
            const char = context.code[context.pos];
            if(char === "\n") {
                context.pos ++;
                context.currentLine ++;
                context.currentLineStart = context.pos;
                continue;
            }
            if(context.code[context.pos] === "*") {
                if(context.code[context.pos +1] === "/") {
                    context.pos += 2;
                    break;
                }
            }
            context.pos ++;
        }
        if(context.pos === context.code.length) {
            throw new Error("todo error - unclose block comment error");
        }
        return finishToken(SyntaxKinds.BlockComment, context.code.slice(startIndex, context.pos));
    }
    function readDotStartFloat() {
        const startIndex = context.pos;
        // eat '.'
        context.pos += 1;
        while(context.pos < context.code.length) {
            if(!isDigital()) {
                break;
            }
            context.pos ++;
        }
        return finishToken(SyntaxKinds.NumberLiteral ,context.code.slice(startIndex, context.pos));
    }
    /** ================================================
     *     Template
     *  ================================================
     */
    function readTemplateHeadORNoSubstitution() {
        // eat '`'
        context.pos ++;
        const startIndex = context.pos;
        let isEscape = false;
        while(context.pos < context.code.length) {
            const current = context.code[context.pos];
            if(current === "\n") {
                context.pos ++;
                context.currentLine ++;
                context.currentLineStart = context.pos;
                continue;
            }
            if(!isEscape && current === "`") {
                const endIndex = context.pos;
                context.pos += 1;
                return  finishToken(SyntaxKinds.TemplateNoSubstitution, context.code.slice(startIndex, endIndex));
            }
            if(current === "$") {
                if(context.code[context.pos + 1] === "{") {
                    const endIndex = context.pos;
                    context.pos += 2;
                    context.templateStringStackCounter.push(1);
                    return  finishToken(SyntaxKinds.TemplateHead, context.code.slice(startIndex, endIndex));
                }
            }
            isEscape = current === "\\" && !isEscape;
            context.pos ++;
        }
        throw new Error("todo error - not close template head or no subsitude");
    }
    function readTemplateMiddleORTail() {
        // eat `
        context.pos ++;
        const startIndex = context.pos;
        let isEscape = false;
        while(context.pos < context.code.length) {
            const current = context.code[context.pos];
            if(current === "\n") {
                context.pos ++;
                context.currentLine ++;
                context.currentLineStart = context.pos;
                continue;
            }
            if(!isEscape && current === "`") {
                const endIndex = context.pos;
                context.pos += 1;
                return  finishToken(SyntaxKinds.TemplateTail, context.code.slice(startIndex, endIndex));
            }
            if(!isEscape && current === "$") {
                if(context.code[context.pos + 1] === "{") {
                    const endIndex = context.pos;
                    context.pos += 2;
                    context.templateStringStackCounter.push(1);
                    return  finishToken(SyntaxKinds.TemplateMiddle, context.code.slice(startIndex, endIndex));
                }
            }
            isEscape = current === "\\" && !isEscape;
            context.pos ++;
        }
        throw new Error("todo error - not close template middle or tail");
    }
    /** ================================================
     *     Id, Literal, Keywords State Machine
     *  ================================================
     */
    function readNumberLiteral() {
        // Start With 0
        let char = context.code[context.pos];
        if(char === "0") {
            context.pos ++;
            const next =  context.code[context.pos];
            if(next === ".") {
                return readDotStartFloat();
            }
            if(next === "b" || next === "B") {
                context.pos ++;
                return readBinaryNumberLiteral();
            }
            if(next === "o" || next === "O") {
                context.pos ++;
                return readOctalNumberLiteral();
            }
            if(next === "x" || next === "X") {
                context.pos ++;
                return readHexNumberLiteral();
            }
            return finishToken(SyntaxKinds.NumberLiteral, "0");
        }
        // Start With Non 0
        let startIndex = context.pos;
        while(context.pos < context.code.length) {
            if(!isDigital()) {
                break;
            }
            context.pos ++;
        }
        let numberWord = context.code.slice(startIndex, context.pos);
        if(context.code[context.pos] === ".") {
            context.pos ++;
            startIndex = context.pos;
            while(context.pos < context.code.length) {
                if(!isDigital()) {
                    break;
                }
                context.pos ++;
            }
            const floatPart = context.code.slice(startIndex, context.pos);
            numberWord = `${numberWord}.${floatPart}`;
        }
        char = context.code[context.pos];
        if(char === "e" || char === "E") {
            startIndex = context.pos;
            context.pos ++;
            char = context.code[context.pos];
            if(char === "+" || char == "-") {
                context.pos ++;
            }
            while(context.pos < context.code.length) {
                if(!isDigital()) {
                    break;
                }
                context.pos ++;
            }
            const exponPart = context.code.slice(startIndex, context.pos);
            if(exponPart.length === 1) {
                throw new Error("todo error - expon length is 0");
            }
            numberWord += exponPart;
        }
        return finishToken(SyntaxKinds.NumberLiteral, numberWord);
    }
    function readBinaryNumberLiteral() {
        const startIndex = context.pos;
        let seprator = false;
        while(context.pos < context.code.length) {
            const char = context.code[context.pos];
            if(char === "_") {
                context.pos ++;
                seprator = true;
                continue;
            }else {
                seprator = false;
            }
            if(!isBinary()) {
                break;
            }
            context.pos ++;
        }
        if(seprator) {
            throw lexicalError(ErrorMessageMap.invalid_numeric_seperator);
        }
        return finishToken(SyntaxKinds.NumberLiteral, context.code.slice(startIndex, context.pos));
    }
    function readOctalNumberLiteral() {
        const startIndex = context.pos;
        let seprator = false;
        while(context.pos < context.code.length) {
            const char = context.code[context.pos];
            if(char === "_") {
                context.pos ++;
                seprator = true;
                continue;
            }else {
                seprator = false;
            }
            if(!isOct()) {
                break;
            }
            context.pos ++;
        }
        if(seprator) {
            throw lexicalError(ErrorMessageMap.invalid_numeric_seperator);
        }
        return finishToken(SyntaxKinds.NumberLiteral, context.code.slice(startIndex, context.pos));
    }
    function readHexNumberLiteral() {
        const startIndex = context.pos;
        let seprator = false;
        while(context.pos < context.code.length) {
            const char = context.code[context.pos];
            if(char === "_") {
                context.pos ++;
                seprator = true;
                continue;
            }else {
                seprator = false;
            }
            if(!isHex()) {
                break;
            }
            context.pos ++;
        }
        if(seprator) {
            throw lexicalError(ErrorMessageMap.invalid_numeric_seperator);
        }
        return finishToken(SyntaxKinds.NumberLiteral, context.code.slice(startIndex, context.pos));
    }
    function readStringLiteral(mode: "\"" | "\'") {
        // eat mode
        context.pos ++;
        let isEscape = false;
        const startIndex = context.pos;
        while(context.pos < context.code.length) {
            const char = context.code[context.pos];
            if(char === mode && !isEscape) {
                // eat mode
                break;
            }
            if(char === "\n" && !isEscape) {
                throw new Error("todo error - not close string literal");
            }
            // TODO: remove '\' from multiple line of string.
            isEscape = char === "\\" && !isEscape ;
            context.pos ++;
        }
        if(context.pos === context.code.length) {
            throw new Error("todo error - not close string literal");
        }
        context.pos ++
        return finishToken(SyntaxKinds.StringLiteral, context.code.slice(startIndex, context.pos-1));
    }
    function readString() {
        const word = readWord();
        if(KeywordLiteralSet.has(word)) {
            // @ts-ignore
            const keywordKind = KeywordLiteralMapSyntaxKind[word];
            if(context.escFlag) {
                context.escFlag = false;
                throw new Error("keyword can not have any escap unicode");
            }
            return finishToken(keywordKind as SyntaxKinds, word);
        }
        return finishToken(SyntaxKinds.Identifier, word);
    }
    function readWord() {
        let isEscape = false;
        // TODO: remove performance mesure once speed up lexer.
        let word = "";
        let startIndex = context.pos;
        const startTimeStamp = performance.now();
        while(context.pos < context.code.length) {
            const char = context.code[context.pos];
            if(char === "\\") {
                const next = context.code[context.pos+1];
                if(next === "u" || next === "U") {
                    context.escFlag = true;
                    word += context.code.slice(startIndex, context.pos);
                    word += readHexEscap();
                    startIndex = context.pos;
                    continue;
                }
                isEscape = !isEscape;
            }else {
                isEscape = false;
            }
            if(nonIdentifierStartSet.has(context.code[context.pos])) {
                break
            }
            context.pos ++;
        }
        // TODO: remove performance mesure once speed up lexer.
        context.time += performance.now() - startTimeStamp ;
        word += context.code.slice(startIndex, context.pos);
        return word;
    }
    function readHexEscap() {
        // eat \u \U
        context.pos += 2;
        const startIndex = context.pos;
        while(context.pos < context.code.length) {
            if(!isHex()) {
                break;
            }
            context.pos++;
        }
        return String.fromCharCode(Number(`0x${context.code.slice(startIndex, context.pos)}`));
    }
    function readRegex(): { pattern: string, flag: string } {
        let pattern = "";
        let isEscape = false;
        let isInSet = false;
        let flag = "";
        let startIndex = context.pos;
        while(context.pos < context.code.length) {
            const char = context.code[context.pos];
            if(char === "/" && !isEscape && !isInSet) {
                break;
            }
            if(char === "[" && !isEscape) {
                isInSet = true;
                context.pos ++;
                continue;
            }
            if(char === "]" && !isEscape) {
                isInSet = false;
                context.pos ++;
                continue;
            }
            isEscape = char === "\\" && !isEscape;
            context.pos ++;
        }
        pattern = context.code.slice(startIndex, context.pos);
        // eat `/`
        context.pos ++;
        /** tokenize flag  */
        startIndex = context.pos;
        while(context.pos < context.code.length) {
            if(nonIdentifierStarMap[context.code[context.pos]]) {
                break;
            }
            context.pos ++;
        }
        flag = context.code.slice(startIndex, context.pos);
        if(context.pos === context.code.length) {
            throw new Error("todo error - not closed regex");
        }
        finishToken(SyntaxKinds.RegexLiteral, pattern + flag);
        return { pattern, flag };
    }
}