import { SyntaxKinds, LexicalLiteral, KeywordLiteralMapSyntaxKind } from "@/src/common/kind";
import { SourcePosition, cloneSourcePosition, createSourcePosition } from "@/src/common/position";
import { ErrorMessageMap } from "./error";
interface Context {
    code: string;
    sourcePosition: SourcePosition;
    sourceValue: string;
    token: SyntaxKinds | null;

    startPosition: SourcePosition;
    endPosition: SourcePosition;

    templateStringStackCounter: Array<number>;

    changeLineFlag: boolean;
    spaceFlag: boolean;
    escFlag: boolean;
}

function cloneContext(source: Context): Context {
    return {
        ...source,
        sourcePosition: cloneSourcePosition(source.sourcePosition),
        startPosition: cloneSourcePosition(source.startPosition),
        endPosition: cloneSourcePosition(source.endPosition),
        templateStringStackCounter: [...source.templateStringStackCounter],
    }
}

interface Lexer {
    getSourceValue: () => string;
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
}

const stopSet = [ 
    ...LexicalLiteral.punctuators,
    ...LexicalLiteral.operator, 
    ...LexicalLiteral.newLineChars, 
    ...LexicalLiteral.whiteSpaceChars
]


const KeywordLiteralSet = new Set([
    ...LexicalLiteral.keywords,
    ...LexicalLiteral.BooleanLiteral,
    ...LexicalLiteral.NullLiteral,
    ...LexicalLiteral.UndefinbedLiteral
]);

export function createLexer(code: string): Lexer {
/**
 *  Public API
 */
    let context: Context = {
        code,
        sourcePosition: createSourcePosition(),
        sourceValue: "",
        token: null,
        startPosition: createSourcePosition(),
        endPosition: createSourcePosition(),
        templateStringStackCounter: [],
        changeLineFlag: false,
        spaceFlag: false,
        escFlag: false
    };
    function getLineTerminatorFlag() {
        return context.changeLineFlag;
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
        getStartPosition,
        getEndPosition,
        getToken,
        getLineTerminatorFlag,
        nextToken,
        lookahead,
        readRegex,
    }
/**
 *  Private utils function 
 */
    function startToken() {
        context.startPosition = cloneSourcePosition(context.sourcePosition);
    }
    function finishToken(kind: SyntaxKinds, value: string): SyntaxKinds {
        context.token = kind;
        context.sourceValue = value;
        context.endPosition = cloneSourcePosition(context.sourcePosition);
        return kind;
    }
    function getChar(n = 1): string {
        if(n < 1) {
            throw new Error(`[Error]: param 'n' at get function need to >= 1. but now get ${n}.`)
        }
        if(context.sourcePosition.index >= context.code.length) {
            return "";
        }
        return context.code.slice(context.sourcePosition.index, context.sourcePosition.index + n);
    }
    function eatChar(n = 1): string {
        if(n < 1) {
            throw new Error(`[Error]: param 'n' at eat function need to >= 1. but now get ${n}.`)
        }
        const char = getChar(n);
        for(const ch of char) {
            if(ch === "\n") {
                context.sourcePosition.row ++;
                context.sourcePosition.col = 0;
            } else {
                context.sourcePosition.col ++;
            }
            context.sourcePosition.index ++;
        }
        return char;
    }
    function startWith(char: string): boolean {
        return context.code.startsWith(char, context.sourcePosition.index)
    }
    function startWithSet(chars: Array<string>): boolean {
        for(const value of chars) {
            if(value.length === 0) {
                throw new Error(`[Error]: is function can't access empty string.`);
            }
            if(context.code.startsWith(value, context.sourcePosition.index)) {
                return true;
            }
        }
        return false;
    }
    function eof() {
        return getChar() === "";
    }
    function skipWhiteSpaceChangeLine() {
        context.changeLineFlag = false;
        while(
            !eof() && ( startWith("\n") || startWith('\t') || startWith(" "))
        ) {
            if(startWith("\n")) {
                context.changeLineFlag = true;
                eatChar();
                continue;
            }
            if(startWith('\t') || startWith(" ")) {
                context.spaceFlag = true;
                eatChar();
                continue;
            }
            eatChar();
        }
    }
/**
 * Main Worker Logic 
 */
    function lex(): SyntaxKinds {
        skipWhiteSpaceChangeLine();
        const char = getChar();
        startToken();
        switch(char) {
            case "":
                return finishToken(SyntaxKinds.EOFToken, "eof");
            /** ==========================================
             *              Punctuators
             *  ==========================================
             */
            case "{":
                eatChar();
                context.templateStringStackCounter.push(-1);
                return finishToken(SyntaxKinds.BracesLeftPunctuator, "{");
            case "}":
                const result = context.templateStringStackCounter.pop();
                if(result && result > 0) {
                    return readTemplateMiddleORTail();
                }
                eatChar();
                return finishToken(SyntaxKinds.BracesRightPunctuator, "}");
            case "[":
                eatChar();
                return finishToken(SyntaxKinds.BracketLeftPunctuator, "[");
            case "]":
                eatChar();
                return finishToken(SyntaxKinds.BracketRightPunctuator,"]");
            case "(":
                eatChar();
                return finishToken(SyntaxKinds.ParenthesesLeftPunctuator, "(");
            case ")":
                eatChar();
                return finishToken(SyntaxKinds.ParenthesesRightPunctuator, ")");
            case ":":
                eatChar();
                return finishToken(SyntaxKinds.ColonPunctuator, ":");
            case ";":
                eatChar();
                return finishToken(SyntaxKinds.SemiPunctuator, ";");
            /** ==========================================
             *                Operators
             *  ==========================================
             */
            case "+": {
                // '+', '+=', '++' 
                return readPlusStart();
            }
            case "-": {
                // '-', '-=', '--'
                return readMinusStart();
            }
            case "*": {
                // '*' , '**', '*=', '**=', 
                return readMultiplyStart();
            }
            case "%": {
                // '%', '%='
                return readModStart();
            }
            case "/": {
                // '/' '// comment' '/* comments */'
                return readSlashStart();
            }
            case ">": {
                // '>', '>>', '>>>' '>=', ">>=",  ">>>="
                return readGTStart();
            }
            case "<": {
                // '<', '<<', '<=', '<<='
                return readLTStart();
            }
            case '=': {
                // '=', '==', '===', 
                return readAssignStart();
            }
            case "!": {
                // '!', '!=', '!=='
                return readExclamationStart();
            }
            case ",": {
                // ','
                eatChar();
                return finishToken(SyntaxKinds.CommaToken, ",");
            }
            case "&": {
                // '&', '&&', '&=', '&&='
                return readANDStart();
            }
            case "|": {
                // '|', "||", '|=', '||='
                return readORStart();
            }
            case "?": {
                // '?', '?.' '??'
                return readQustionStart();
            }
            case "^": {
                // '^', '^='
                return readUpArrowStart();
            }
            case "~": {
                return readTildeStart();
            }
            case ".": {
                // '.', '...', 'float-literal', Sub State Machine 2
                return readDotStart();
            }
            case '`': {
                return readTemplateHeadORNoSubstitution();
            }
            case '#': {
                return readPrivateName();
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
            case "\"":
            case "'": {
                // String Literal
                return readStringLiteral();
            }
            default: {
                // Word -> Id or Keyword
                return readString();
            }
        }
    }
    /**
     * sunStateMachineError is used for return a format error to developer that Sub State Machine
     * expect start chars that is not show in current code string.
     * @param {string} name - name of sub state machine
     * @param {string} char - chars that sub state machine is expected
     * @returns {Error} - a error object
     */
    function subStateMachineError(name: string, char: string): Error {
        return new Error(`[Error]: ${name} state machine should only be called when currnet position is ${char}. but current position is ${getChar()}`);
    }
    /**
     * lexicalError is used for tokenizer unexecpt char happended. ex: string start with " can't find end ""
     * @param {string} content - error message
     * @returns {Error} - a error object
     */
    function lexicalError(content: string): Error {
        return new Error(`[Error]: Lexical Error, ${content}, start position is (${context.startPosition.row}, ${context.startPosition.col}), end position is ${context.sourcePosition.row}, ${context.sourcePosition.col}`);
    }
    /** ======================================
     *      Operators State Machine
     *  ======================================
     */
    function readPlusStart() {
        // read any token start with '+', '+=', '++'
        // MUST call when current char is '+'
        if(!startWith("+")) {
            throw subStateMachineError("readPlusStart", "+")
        }
        if(startWith("+=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.PlusAssignOperator, "+=");
        }
        if(startWith("++")) {
            eatChar(2);
            return finishToken(SyntaxKinds.IncreOperator, "++");
        }
        eatChar();
        return finishToken(SyntaxKinds.PlusOperator, "+");
    }
    function readMinusStart() {
        // read any token start with '-', '-=', '--'
        // MUST call when current char is '-'
        if(!startWith("-")) {
            throw subStateMachineError("readMinusStart", "-");
        }
        if(startWith("-=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.MultiplyAssignOperator, "-=");
        }
        if(startWith("--")) {
            eatChar(2);
            return finishToken(SyntaxKinds.DecreOperator, "--");
        }
        eatChar();
        return finishToken(SyntaxKinds.MinusOperator,"-");
    }
    function readMultiplyStart() {
        // read any token start with '*', '*=', '**', '**='
        // MUST call when current char is '*'
        if(!startWith("*")) {
            throw subStateMachineError("readMutiplyStart", "*");
        }
        if(startWith("**=")) {
            eatChar(3);
            return finishToken(SyntaxKinds.ExponAssignOperator, "**=");
        }
        if(startWith("**")) {
            eatChar(2);
            return finishToken(SyntaxKinds.ExponOperator, "**");
        }
        if(startWith("*=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.MultiplyAssignOperator,"*=");
        }
        eatChar();
        return finishToken(SyntaxKinds.MultiplyOperator, "*");
    }
    function readSlashStart() {
        // read any token start with '/', '/=', 'single-line-comment', 'block-comment'
        // MUST call when current char is '/'
        if(!startWith("/")) {
            throw subStateMachineError("readSlashStart", "/");
        }
        if(startWith("//")) {
            return readComment();
        }
        if(startWith("/*")) {
            return readCommentBlock();
        }
        if(startWith("/=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.DivideAssignOperator, "//");
        }
        eatChar();
        return finishToken(SyntaxKinds.DivideOperator, "/");
    }
    function readComment() {
        if(!startWith("//")) {
            throw subStateMachineError("readComment", "//");
        }
        // eat '//'
        eatChar(2);
        let comment = "";
        while(!startWith("\n") && !eof()) {
            comment += eatChar();
        }
        return finishToken(SyntaxKinds.Comment, comment);
    }
    function readCommentBlock() {
        if(!startWith("/*")) {
            throw new Error(``);
        }
        // Eat '/*'
        eatChar(2);
        let comment = "";
        while(!startWith("*/") && !eof()) {
            comment += eatChar();
        }
        if(eof()) {
            // lexical error, no close */ to comment.
            throw lexicalError("block comment can't find close '*/'");
        }
        // eat '*/'
        eatChar(2);
        return finishToken(SyntaxKinds.BlockComment, comment);
    }
    function readModStart() {
        // read any token start with '%', '%='
        // MUST call when current char is '%'
        if(!startWith("%")) {
            throw subStateMachineError("readModStart", "%");
        }
        if(startWith("%=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.ModAssignOperator,"%=");
        }
        eatChar();
        return finishToken(SyntaxKinds.ModOperator, "%");
    }
    function readGTStart() {
        // read any token start with '>', '>=', '>>', '>>=', '>>>', '>>>='
        // MUST call when current char is '>'
        if(!startWith(">")) {
            throw subStateMachineError("readGTStart", ">");
        }
        if(startWith(">>>=")) {
            eatChar(4);
            finishToken(SyntaxKinds.BitwiseRightShiftFillAssginOperator, ">>>=");
        }
        if(startWith(">>>")) {
            eatChar(3);
            return finishToken(SyntaxKinds.BitwiseRightShiftFillOperator, ">>>");
        }
        if(startWith(">>=")) {
            eatChar(3);
            return finishToken(SyntaxKinds.BitwiseRightShiftAssginOperator, ">>=");
        }
        if(startWith(">>")) {
            eatChar(2);
            return finishToken(SyntaxKinds.BitwiseRightShiftOperator, ">>")
        }
        if(startWith(">=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.GeqtOperator, ">=");
        }
        eatChar();
        return finishToken(SyntaxKinds.GtOperator, ">");
    }
    function readLTStart() {
        // read any token start with '<', '<=', '<<', '<<='
        // MUST call when current char is '<'
        if(!startWith("<")) {
            throw subStateMachineError("readLTStart", "<");
        }
        if(startWith("<<=")) {
            eatChar(3);
            return finishToken(SyntaxKinds.BitwiseLeftShiftAssginOperator, "<<=");
        }
        if(startWith("<<")) {
            eatChar(2);
            return finishToken(SyntaxKinds.BitwiseLeftShiftOperator, "<<");
        }
        if(startWith("<=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.LeqtOperator, "<=");
        }
        eatChar();
        return finishToken(SyntaxKinds.LtOperator, "<");
    }
    function readAssignStart() {
        // [READ]: '=', '==', '==='
        // [MUST]: call when current char is '=' 
        if(!startWith("=")) {
            throw subStateMachineError("readAssginStart", "=");
        }
        if(startWith("===")) {
            eatChar(3);
            return finishToken(SyntaxKinds.StrictEqOperator, "===");
        }
        if(startWith("==")) {
            eatChar(2);
            return finishToken(SyntaxKinds.EqOperator, "==");
        }
        if(startWith("=>")) {
            eatChar(2);
            return finishToken(SyntaxKinds.ArrowOperator, "=>");
        }
        eatChar();
        return finishToken(SyntaxKinds.AssginOperator, "=");
    }
    function readExclamationStart() {
        // [READ]: '!', '!=', '!=='
        // [MUST]: call when current char is '!'
        if(!startWith("!")) {
            throw subStateMachineError("readExclamationStart", "!");
        }
        if(startWith("!==")) {
            eatChar(3);
            return finishToken(SyntaxKinds.StrictNotEqOperator, "!==");
        }
        if(startWith("!=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.NotEqOperator, "!=");
        }
        eatChar();
        return finishToken(SyntaxKinds.LogicalNOTOperator, "!");
    }
    function readANDStart() {
        // [READ]: '&', '&&', '&=', '&&='
        // [MUST]: call when current char is '&' 
        if(!startWith("&")) {
            throw subStateMachineError("readANDStart", "&");
        }
        if(startWith("&&=")) {
            eatChar(3);
            return finishToken(SyntaxKinds.logicalANDAssginOperator, "&&=");
        }
        if(startWith("&&")) {
            eatChar(2);
            return finishToken(SyntaxKinds.LogicalANDOperator, "&&");
        }
        if(startWith("&=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.BitwiseANDAssginOperator, "&=");
        }
        eatChar();
        return finishToken(SyntaxKinds.BitwiseANDOperator, "&");
    }
    function readORStart() {
        // [READ]: '|', '||', '|=', '||='
        // [MUST]: call when current char is '|' 
        if(!startWith("|")) {
            throw subStateMachineError("readORStart", "|");
        }
        if(startWith("||=")) {
            eatChar(3);
            return finishToken(SyntaxKinds.LogicalORAssignOperator,"||=");
        }
        if(startWith("|=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.BitwiseORAssginOperator,"|=");
        }
        if(startWith("||")) {
            eatChar(2);
            return finishToken(SyntaxKinds.LogicalOROperator,"||");
        }
        eatChar();
        return finishToken(SyntaxKinds.BitwiseOROperator,"|");
    }
    function readQustionStart() {
        // [READ]: '?', '?.' '??'
        // [MUST]: call when current char is '?'
        if(!startWith("?")) {
            throw subStateMachineError("readQustionStart", "?");
        } 
        if(startWith("?.")) {
            eatChar(2);
            return finishToken(SyntaxKinds.QustionDotOperator,"?.");
        }
        if(startWith("??")) {
            eatChar(2);
            return finishToken(SyntaxKinds.NullishOperator, "??");
        }
        eatChar();
        return finishToken(SyntaxKinds.QustionOperator, "?");
    }
    function readDotStart() {
        // [READ]: '.', '...'
        // [MUST]: call when current char is '.'
        if(!startWith(".")) {
            throw subStateMachineError("readDotStart", ".");
        } 
        if(startWith("...")) {
            eatChar(3);
            return finishToken(SyntaxKinds.SpreadOperator, "...");
        }
        if(startWith(".")) {
            eatChar();
            if(startWithSet(LexicalLiteral.numberChars)) {
                let floatWord = "";
                while(startWithSet(LexicalLiteral.numberChars) && !eof()) {
                    floatWord += eatChar();
                }
                return finishToken(SyntaxKinds.NumberLiteral, `.${floatWord}`);
            }
            return finishToken(SyntaxKinds.DotOperator, ".");
        }
        // TODO not . , ...
        throw new Error();
    }
    function readTildeStart() {
        // [READ]: '^', '^='
        // [MUST]: call when current char is '^'
        if(!startWith("~")) {
            throw subStateMachineError("readTildeStart", "~");
        } 
        if(startWith("~=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.BitwiseXORAssginOperator, "~=");
        }
        eatChar();
        return finishToken(SyntaxKinds.BitwiseXOROperator, "~");
    }
    function readUpArrowStart() {
        // [READ]: '~', '~='
        // [MUST]: call when current char is '~'
        if(!startWith("^")) {
            throw subStateMachineError("readUpArrowStart", "~");
        } 
        if(startWith("^=")) {
            eatChar(2);
            return finishToken(SyntaxKinds.BitwiseNOTAssginOperator, "^=");
        }
        eatChar();
        return finishToken(SyntaxKinds.BitwiseXOROperator, "^");
    }
    /** ================================================
     *     Template
     *  ================================================
     */
    function readTemplateHeadORNoSubstitution() {
        if(!startWith("`")) {
            throw subStateMachineError("readTemplateHeadORNoSubstitution", "`");
        }
        eatChar(1);
        let wordString = "";
        let isEscape = false;
        while(!(startWithSet(["${", "`"]) && !isEscape) && !eof() ) {
            isEscape = startWith("\\");
            wordString += eatChar();
        }
        if(eof()) {
            throw lexicalError("template string not closed with '`'");
        }
        if(startWith("${")) {
            eatChar(2);
            context.templateStringStackCounter.push(1);
            return  finishToken(SyntaxKinds.TemplateHead, wordString);
        }
        eatChar(1);
        return finishToken(SyntaxKinds.TemplateNoSubstitution, wordString);
    }
    function readTemplateMiddleORTail() {
        if(!startWith("}")) {
            throw subStateMachineError("readTemplateMiddleORTail", "}");
        }
        eatChar(1);
        let wordString = "";
        let isEscape = false;
        while(!(startWithSet(["${", "`"]) && !isEscape) && !eof() ) {
            isEscape = startWith("\\");
            wordString += eatChar();
        }
        if(eof()) {
            throw lexicalError("template string not closed with '`'");
        }
        context.sourceValue = wordString;
        if(startWith("${")) {
            context.templateStringStackCounter.push(1);
            eatChar(2);
            return  finishToken(SyntaxKinds.TemplateMiddle, wordString);
        }
        eatChar(1);
        return finishToken(SyntaxKinds.TemplateTail, wordString);
    }
    function readPrivateName() {
        if(!startWith("#")) {
            throw subStateMachineError("readPrivateName", "#");
        }
        eatChar(1);
        const word = readWord();
        return finishToken(SyntaxKinds.PrivateName, word);
    }

    /** ================================================
     *     Id, Literal, Keywords State Machine
     *  ================================================
     */
    function readNumberLiteral() {
        // Start With 0
        if(startWith("0")) {
            eatChar();
            let floatWord = "";
            if(startWith(".")) {
                eatChar();
                while(startWithSet(LexicalLiteral.numberChars)) {
                    floatWord += eatChar();
                }
                return finishToken(SyntaxKinds.NumberLiteral, `0.${floatWord}`);
            }
            if(!startWithSet(LexicalLiteral.nonDigitalPrefix)) {
                return finishToken(SyntaxKinds.NumberLiteral, `0`);
            }
            if(startWithSet(LexicalLiteral.binaryPrfix)) {
                eatChar();
                return readBinaryNumberLiteral();
            }
            if(startWithSet(LexicalLiteral.octalPrefix)) {
                eatChar();
                return readOctalNumberLiteral();
            }
            if(startWithSet(LexicalLiteral.hexPrefix)) {
                eatChar();
                return readHexNumberLiteral();
            }
            throw new Error(`[Error]: Not Support 0x 0b Number, (${getStartPosition().row}, ${getStartPosition().col})`)
        }
        // Start With Non 0
        const intStartIndex = context.sourcePosition.index;
        while(startWithSet(LexicalLiteral.numberChars) && !eof()) {
            eatChar();
        }
        // default case, start with int part and followed by
        // - float part
        // - expon part
        let numberWord = context.code.slice(intStartIndex, context.sourcePosition.index);
        if(startWith(".")) {
            eatChar();
            const floatWordStartIndex = context.sourcePosition.index;
            while(startWithSet(LexicalLiteral.numberChars) && !eof()) {
                eatChar();
            }
            const floatWord = context.code.slice(floatWordStartIndex, context.sourcePosition.index);
            numberWord = `${numberWord}.${floatWord}`;
        }
        if(startWithSet(["e", "E"])) {
            let exponWord = eatChar();;
            if(startWithSet(["+", "-"])) {
                exponWord += eatChar();
            }
            while(startWithSet(LexicalLiteral.numberChars)) {
                exponWord += eatChar();
            }
            if(exponWord.length === 1) {
                throw lexicalError(ErrorMessageMap.expon_number_must_have_expon_part);
            }
            return finishToken(SyntaxKinds.NumberLiteral, `${numberWord}${exponWord}`)
        }
        return finishToken(SyntaxKinds.NumberLiteral, numberWord);
    }
    function readBinaryNumberLiteral() {
        const startIndex = context.sourcePosition.index;
        let seprator = false;
        while(startWithSet(LexicalLiteral.binaryChar)) {
            if(startWith("_")) {
                seprator = true;
            }else {
                seprator = false;
            }
            eatChar();
        }
        if(seprator) {
            throw lexicalError(ErrorMessageMap.invalid_numeric_seperator);
        }
        const word = context.code.slice(startIndex, context.sourcePosition.index);
        return finishToken(SyntaxKinds.NumberLiteral, word);
    }
    function readOctalNumberLiteral() {
        const startIndex = context.sourcePosition.index;
        let seprator = false;
        while(startWithSet(LexicalLiteral.octalChars)) {
            if(startWith("_")) {
                seprator = true;
            }else {
                seprator = false;
            }
            eatChar();
        }
        if(seprator) {
            throw lexicalError(ErrorMessageMap.invalid_numeric_seperator);
        }
        const word = context.code.slice(startIndex, context.sourcePosition.index);
        return finishToken(SyntaxKinds.NumberLiteral, word);
    }
    function readHexNumberLiteral() {
        const startIndex = context.sourcePosition.index;
        let seprator = false;
        while(startWithSet(LexicalLiteral.hexChars)) {
            if(startWith("_")) {
                seprator = true;
            }else {
                seprator = false;
            }
            eatChar();
        }
        if(seprator) {
            throw lexicalError(ErrorMessageMap.invalid_numeric_seperator);
        }
        const word = context.code.slice(startIndex, context.sourcePosition.index);
        return finishToken(SyntaxKinds.NumberLiteral, word);   
    }
    function readStringLiteral() {
        let mode = "";
        if(startWith(`'`)) {
            mode = `'`;
        }else if(startWith(`"`)) {
            mode = `"`
        }else {
            throw new Error("There");
        }
        eatChar();
        let word = "";
        let isEscape = false;
        while(!(startWith(mode) && !isEscape ) && !eof()) {
            if(startWith("\n")) {
                if(!isEscape) {
                    throw lexicalError(`string literal start with ${mode} can not have changeline without \\ .`);
                }
                isEscape = false;
                eatChar();
                word = word.slice(0, word.length-1);
                continue;
            }
            if(startWith('\\')) {
                isEscape = !isEscape
            }else {
                isEscape = false;
            }
            word += eatChar()
        }
        if(eof()) {
            throw lexicalError(`string literal start with ${mode} can't find closed char`);
        }
        eatChar();
        return finishToken(SyntaxKinds.StringLiteral, word);
    }
    function readString() {
        const word = readWord()
        if(KeywordLiteralSet.has(word)) {
            if(context.escFlag) {
                context.escFlag = false;
                throw new Error("keyword can not have any escap unicode");
            }
            // @ts-ignore
            const keywordkind = KeywordLiteralMapSyntaxKind[word] as unknown as any;
            if(keywordkind == null) {
                throw new Error(`[Error]: Keyword ${word} have no match method to create token`);
            }
            return finishToken(keywordkind as SyntaxKinds, word);
        }
        return finishToken(SyntaxKinds.Identifier, word);
    }
    function readWord() {
        let isEscape = false;
        let word = "";
        while(!startWithSet(stopSet) && !eof()) {
            if(startWith("\\u") || startWith("\\U")) {
                word += readHexEscap();
            }
            if(startWith("\\")) {
                isEscape = !isEscape;
            }else {
                isEscape = false;
            }
            word += eatChar();
        }
        return word;
    }
    function readHexEscap() {
        if(startWith("\\u") || startWith("\\U")) {
            eatChar(2);
            context.escFlag = true;
            const hexStart = context.sourcePosition.index;
            while(startWithSet(LexicalLiteral.hexChars) && !eof()) {
                eatChar();
            }
            const hexString = context.code.slice(hexStart, context.sourcePosition.index);
            return String.fromCodePoint(Number(`0x${hexString}`));
        }
        // error;
        throw new Error("");
    }
    function readRegex(): { pattern: string, flag: string } {
        let pattern = "";
        let isEscape = false;
        let isInSet = false;
        while(!(startWith("/") && !isEscape && !isInSet )&& !eof()) {
            if(startWith("[")) {
                isInSet = true;
            }
            if(startWith("]")) {
                isInSet = false;
            }
            if(startWith("\\")) {
                if(isEscape) {
                    isEscape = false;
                }else {
                    isEscape = true;
                }
            }else {
                isEscape = false;
            }
            pattern += eatChar();
        }
        eatChar();
        let flag = "";
        while(
            !startWithSet(stopSet)
            && !eof()
        ) {
            flag += eatChar();
        }
        finishToken(SyntaxKinds.RegexLiteral, pattern + flag);
        return { pattern, flag };
    }
}