import { SyntaxKinds, LexicalLiteral, KeywordLiteralMapSyntaxKind } from "emcakit-jscommon";
import { SourcePosition, cloneSourcePosition, createSourcePosition } from "emcakit-jscommon";
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
    start: number;
    end: number;
    currentLine: number;
    currentLineStart: number;
    // current token and token's information
    sourceValue: string;
    token: SyntaxKinds | null;
    startPosition: SourcePosition;
    endPosition: SourcePosition;
    // stack for tokenize template literal
    templateStringStackCounter: Array<number>;
    // (TODO_MAYBE_REMOVE): for line terminate handle and JSXText reading
    changeLineFlag: boolean;
    spaceFlag: boolean;
    escFlag: boolean;
    beforeValue: string;
    // (TODO_MAYBE_REMOVE): for measure performance
    time: number;
    skipTime: number;
}

function createContext(code: string): Context {
    return {
        code,
        pos: 0, currentLine: 0, currentLineStart: 0, start: 0, end: 0,
        sourceValue: "", token: null, startPosition: createSourcePosition(), endPosition: createSourcePosition(),
        templateStringStackCounter: [],
        changeLineFlag: false, spaceFlag: false, escFlag: false, beforeValue: "",
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

export function createLexer(code: string): Lexer {
    let context = createContext(code);
    /**
     * Public Api for getting change line flag of current token.
     * @returns {boolean}
     */
    function getLineTerminatorFlag(): boolean {
        return context.changeLineFlag;
    }
    /**
     * Public Api for getting space and changeline value before
     * current token and previous token.
     * @returns {string}
     */
    function getBeforeValue(): string {
        return context.beforeValue;
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
        context.startPosition = {
            index: context.pos,
            col: context.pos - context.currentLineStart,
            row: context.currentLine
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
        context.endPosition = {
            index: context.pos,
            col: context.pos - context.currentLineStart,
            row: context.currentLine
        }
        return kind;
    }
    /**
     * 
     */
    function skipWhiteSpaceChangeLine() {
        context.changeLineFlag = false;
        // TODO: consider the needing of `beforeValue`(only used for parse JSXText)
        // context.beforeValue = "";
        // const start = context.sourcePosition.index;
        let s = performance.now();
        loop: while(context.pos < code.length) {
            switch(context.code[context.pos]) {
                case '\n': 
                    context.changeLineFlag = true;
                    context.pos ++;
                    context.currentLineStart = context.pos;
                    context.currentLine ++;
                    break;
                case " ":
                case "\t":
                    context.spaceFlag = true;
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
        const code = context.code[context.pos + offset].charCodeAt(offset);
        return code >= 48 && code <= 57;
        
    }
    /**
     * 
     */
    function isHex() {
        const code = context.code[context.pos].charCodeAt(0);
        return (
            (code >= 48 && code <= 57) ||
            (code >= 97 && code <= 122) ||
            (code >= 65 && code <= 90 )
        );
    }
    /**
     * 
     */
    function isIdentifierStartChar() {
        return !nonIdentifierStartSet.has(context.code[context.pos]);
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
                    case "+":
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
                        return finishToken(SyntaxKinds.BitwiseNOTAssginOperator, "^=");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.BitwiseNOTOperator, "^");
                }
            }
            case "~": {
                const next = context.code[context.pos+1];
                switch (next) {
                    case "=": 
                        context.pos += 2;
                        return finishToken(SyntaxKinds.BitwiseXORAssginOperator, "~=");
                    default:
                        context.pos += 1;
                        return finishToken(SyntaxKinds.BitwiseXOROperator, "~");
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
            isEscape = current === "\\";
            if(isEscape) {
                context.pos ++;
                continue;
            }
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
            isEscape = current === "\\" && !isEscape;
            if(isEscape) {
                context.pos ++;
                continue;
            }
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
            if(current === "$") {
                if(context.code[context.pos + 1] === "{") {
                    const endIndex = context.pos;
                    context.pos += 2;
                    context.templateStringStackCounter.push(1);
                    return  finishToken(SyntaxKinds.TemplateMiddle, context.code.slice(startIndex, endIndex));
                }
            }
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
        const char = context.code[context.pos];
        if(char === "0") {
            context.pos ++;
            const next =  context.code[context.pos];
            if(next === ".") {
                return readDotStartFloat();
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
        const intPart = context.code.slice(startIndex, context.pos);
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
            return finishToken(SyntaxKinds.NumberLiteral, `${intPart}.${floatPart}`);
        }
        return finishToken(SyntaxKinds.NumberLiteral, intPart);
    }
    // function readBinaryNumberLiteral() {
    //     const startIndex = context.sourcePosition.index;
    //     let seprator = false;
    //     while(startWithSet(LexicalLiteral.binaryChar)) {
    //         if(startWith("_")) {
    //             seprator = true;
    //         }else {
    //             seprator = false;
    //         }
    //         context.sourcePosition.index ++;
    //     }
    //     if(seprator) {
    //         throw lexicalError(ErrorMessageMap.invalid_numeric_seperator);
    //     }
    //     const word = context.code.slice(startIndex, context.sourcePosition.index);
    //     return finishToken(SyntaxKinds.NumberLiteral, word);
    // }
    // function readOctalNumberLiteral() {
    //     const startIndex = context.sourcePosition.index;
    //     let seprator = false;
    //     while(startWithSet(LexicalLiteral.octalChars)) {
    //         if(startWith("_")) {
    //             seprator = true;
    //         }else {
    //             seprator = false;
    //         }
    //         context.sourcePosition.index ++;
    //     }
    //     if(seprator) {
    //         throw lexicalError(ErrorMessageMap.invalid_numeric_seperator);
    //     }
    //     const word = context.code.slice(startIndex, context.sourcePosition.index);
    //     return finishToken(SyntaxKinds.NumberLiteral, word);
    // }
    // function readHexNumberLiteral() {
    //     const startIndex = context.sourcePosition.index;
    //     let seprator = false;
    //     while(startWithSet(LexicalLiteral.hexChars)) {
    //         if(startWith("_")) {
    //             seprator = true;
    //         }else {
    //             seprator = false;
    //         }
    //         context.sourcePosition.index ++;
    //     }
    //     if(seprator) {
    //         throw lexicalError(ErrorMessageMap.invalid_numeric_seperator);
    //     }
    //     const word = context.code.slice(startIndex, context.sourcePosition.index);
    //     return finishToken(SyntaxKinds.NumberLiteral, word);   
    // }
    function readStringLiteral(mode: "\"" | "\'") {
        // eat mode
        context.pos ++;
        let isEscape = false;
        const startIndex = context.pos;
        while(context.pos < context.code.length) {
            const char = context.code[context.pos];
            if(char === mode && !isEscape) {
                // eat mode
                context.pos ++
                break;
            }
            if(char === "\n" && !isEscape) {
                context.pos ++;
                context.currentLine ++;
                context.currentLineStart = context.pos;
                break;
            }
            // TODO: remove '\' from multiple line of string.
            isEscape = char === "\\" && !isEscape ;
            context.pos ++;
        }
        if(context.pos === context.code.length) {
            throw new Error("todo error - not close string literal");
        }
        return finishToken(SyntaxKinds.StringLiteral, context.code.slice(startIndex, context.pos));
    }
    function readString() {
        const word = readWord();
        // @ts-ignore
        const keywordKind = KeywordLiteralMapSyntaxKind[word];
        if(keywordKind) {
            if(context.escFlag) {
                context.escFlag = false;
                throw new Error("keyword can not have any escap unicode");
            }
            return finishToken(keywordKind as SyntaxKinds, word);
        }
        return finishToken(SyntaxKinds.Identifier, word);
    }
    function readWord() {
        const startIndex = context.pos;
        let isEscape = false;
        // TODO: remove performance mesure once speed up lexer.
        const startTimeStamp = performance.now();
        while(context.pos < context.code.length) {
            const char = context.code[context.pos];
            if(char === "\\") {
                const next = context.code[context.pos+1];
                if(next === "u" || next === "U") {
                    readHexEscap();
                    continue;
                }
                isEscape = !isEscape;
            }else {
                isEscape = false;
            }
            if(!isIdentifierStartChar()) {
                break
            }
            context.pos ++;
        }
        // TODO: remove performance mesure once speed up lexer.
        context.time += performance.now() - startTimeStamp ;
        return context.code.slice(startIndex, context.pos);
    }
    function readHexEscap() {
        // eat \u \U
        context.pos += 2;
        while(context.pos < context.code.length) {
            if(!isHex()) {
                break;
            }
            context.pos++;
        }
        // TODO: return decoded unicode string
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
        // eat /
        context.pos ++;
        /** tokenize flag  */
        startIndex = context.pos;
        while(context.pos < context.code.length) {
            if(!isIdentifierStartChar()) {
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