import {
  SyntaxKinds,
  LexicalLiteral,
  KeywordLiteralMapSyntaxKind,
  SourcePosition,
  cloneSourcePosition,
  createSourcePosition,
} from "web-infra-common";
import {
  LexerCursorContext,
  LexerEscFlagContext,
  LexerTemplateContext,
  LexerTokenContext,
  LookaheadToken,
} from "./type";
import { ErrorMessageMap } from "./error";
/**
 * Lexer Context.
 */
interface Context {
  // Cursot for char stream, `pos` is a pointer which point to current
  // char in source code.
  cursor: LexerCursorContext;
  // Token context stoe all relative info about a token, include
  // a kind, string value, position info, and other info we will
  // need for syntax check (like line terminator).
  tokenContext: LexerTokenContext;
  // Ad-hoc data structure for tokenize template literal.
  templateMeta: LexerTemplateContext;
  // Ad-hoc data structure for escap char when tokenize.
  escapeMeta: LexerEscFlagContext;
}
/**
 * Create a empty lexer context
 * @param {string} code
 * @returns {Context}
 */
function createContext(code: string): Context {
  return {
    cursor: { code, pos: 0, currentLine: 1, currentLineStart: 0 },
    tokenContext: {
      value: "",
      kind: null,
      startPosition: createSourcePosition(),
      endPosition: createSourcePosition(),
      lastTokenEndPosition: createSourcePosition(),
    },
    templateMeta: { stackCounter: [] },
    escapeMeta: { flag: false },
  };
}
/**
 * Clone a lexer context, used when need to lookahead
 * @param {Context} source
 * @returns {Context}
 */
function cloneContext(source: Context): Context {
  return {
    cursor: { ...source.cursor },
    tokenContext: {
      ...source.tokenContext,
      startPosition: cloneSourcePosition(source.tokenContext.startPosition),
      endPosition: cloneSourcePosition(source.tokenContext.endPosition),
      lastTokenEndPosition: cloneSourcePosition(source.tokenContext.lastTokenEndPosition),
    },
    templateMeta: { stackCounter: [...source.templateMeta.stackCounter] },
    escapeMeta: { ...source.escapeMeta },
  };
}

// interface Lexer {
//     getSourceValue: () => string;
//     getBeforeValue: () => string;
//     getStartPosition: () => SourcePosition;
//     getEndPosition: () => SourcePosition;
//     getToken: () => SyntaxKinds;
//     nextToken: () => SyntaxKinds;
//     lookahead: () => Context['tokenContext'];
//     // API for line terminator
//     getLineTerminatorFlag: () => boolean,
//     // API for read regexliteral
//     readRegex: () => { pattern: string, flag: string };
// }

const nonIdentifierStartSet = new Set([
  ...LexicalLiteral.punctuators,
  ...LexicalLiteral.operator,
  ...LexicalLiteral.newLineChars,
  ...LexicalLiteral.whiteSpaceChars,
]);

const nonIdentifierStarMap: { [key: string]: number } = {};

for (const item of [
  ...LexicalLiteral.punctuators,
  ...LexicalLiteral.operator,
  ...LexicalLiteral.newLineChars,
  ...LexicalLiteral.whiteSpaceChars,
]) {
  nonIdentifierStarMap[item] = 1;
}

const KeywordLiteralSet = new Set([
  ...LexicalLiteral.keywords,
  ...LexicalLiteral.BooleanLiteral,
  ...LexicalLiteral.NullLiteral,
  ...LexicalLiteral.UndefinbedLiteral,
]);

export function createLexer(code: string) {
  /**
   *
   */
  let context = createContext(code);

  /** ===========================================================
   *             Public API of Lexer
   *  ===========================================================
   */
  /**
   * Public Api for getting change line flag of current token.
   * @returns {boolean}
   */
  function getLineTerminatorFlag(): boolean {
    return /\n/.test(
      context.cursor.code.slice(
        context.tokenContext.lastTokenEndPosition.index,
        context.tokenContext.startPosition.index,
      ),
    );
  }
  /**
   * Public API for getting is current value contain esc flag.
   * - used by checking contextual keyword.
   * @returns {boolean}
   */
  function getEscFlag(): boolean {
    return context.escapeMeta.flag;
  }
  /**
   * Public API for getting token's string value
   * @returns {string}
   */
  function getSourceValue(): string {
    return context.tokenContext.value;
  }
  /**
   * Public API for getting string value which range from
   * last end token finish index and current token start index
   * - NOTE: this API only used for JSX parse
   * @returns {string}
   */
  function getBeforeValue(): string {
    return getSliceStringFromCode(
      context.tokenContext.lastTokenEndPosition.index,
      context.tokenContext.startPosition.index,
    );
  }
  /**
   * Public API for get source position of current token
   * @returns {SourcePosition}
   */
  function getStartPosition(): SourcePosition {
    return context.tokenContext.startPosition;
  }
  /**
   * Public API for get end position of current token
   * @returns {SourcePosition}
   */
  function getEndPosition(): SourcePosition {
    return context.tokenContext.endPosition;
  }
  /**
   * Public API for get current token kind.
   * @returns {SyntaxKinds}
   */
  function getTokenKind(): SyntaxKinds {
    if (context.tokenContext.kind === null) {
      context.tokenContext.kind = scan();
    }
    return context.tokenContext.kind;
  }
  /**
   * Public API for moving to next token.
   * @returns {void}
   */
  function nextToken(): void {
    scan();
  }
  /**
   * Public API for lookahead token.
   * @returns {LookaheadToken}
   */
  function lookahead(): LookaheadToken {
    // store last context
    const lastContext = cloneContext(context);
    nextToken();
    const lookaheadToken = {
      kind: context.tokenContext.kind!,
      value: context.tokenContext.value,
      startPosition: context.tokenContext.startPosition,
      endPosition: context.tokenContext.endPosition,
      lineTerminatorFlag: getLineTerminatorFlag(),
    };
    // resume last context
    context = lastContext;
    return lookaheadToken;
  }
  /**
   * Public API when parse detect current context is a regex, need
   * to read source code string as regex format instead of other
   * lexer rule.
   * @returns {}
   */
  function readRegex(): { pattern: string; flag: string } {
    let pattern = "";
    let isEscape = false;
    let isInSet = false;
    let flag = "";
    let startIndex = getCurrentIndex();
    while (!isEOF()) {
      const char = getChar();
      if (char === "/" && !isEscape && !isInSet) {
        break;
      }
      if (char === "[" && !isEscape) {
        isInSet = true;
        eatChar();
        continue;
      }
      if (char === "]" && !isEscape) {
        isInSet = false;
        eatChar();
        continue;
      }
      isEscape = char === "\\" && !isEscape;
      eatChar();
    }
    if (isEOF()) {
      throw lexicalError("regex unterminate stop");
    }
    pattern = getSliceStringFromCode(startIndex, getCurrentIndex());
    // eat `/`
    eatChar();
    /** tokenize flag  */
    startIndex = getCurrentIndex();
    while (!isEOF()) {
      const char = getChar();
      if (char && nonIdentifierStarMap[char]) {
        break;
      }
      eatChar();
    }
    flag = getSliceStringFromCode(startIndex, getCurrentIndex());
    finishToken(SyntaxKinds.RegexLiteral, pattern + flag);
    return { pattern, flag };
  }
  return {
    getTokenKind,
    getSourceValue,
    getBeforeValue,
    getStartPosition,
    getEndPosition,
    getLineTerminatorFlag,
    getEscFlag,
    nextToken,
    lookahead,
    readRegex,
  };
  /** ===========================================================
   *             Private API for Lexer
   *  ===========================================================
   */
  /**
   * Helper for create `SourcePosition` Object from
   * current cursor, uesed in `startToken` and `finishToken`
   * @returns {SourcePosition}
   */
  function creaetSourcePositionFromCursor(): SourcePosition {
    return {
      row: context.cursor.currentLine,
      col: context.cursor.pos - context.cursor.currentLineStart + 1,
      index: context.cursor.pos,
    };
  }
  /**
   * Start reading a token, because token contain row and col
   * information, so we need to record the current pos as start
   * mark.
   * @returns {void}
   */
  function startToken(): void {
    context.escapeMeta.flag = false;
    context.tokenContext.startPosition = creaetSourcePositionFromCursor();
  }
  /**
   * Private API for finish a token, store token relative data:
   *
   * 1. move current end position to last end position
   * 2. record current position as endSourcePotion.
   * 3. save value from start and end position
   *
   * - NOTE: something we don't want value is the string range from start index
   * of start position to end index of position is because this range have some
   * char we don't want, for example string literal's value slice by position will
   * be `"some-literal"` which contain start and end char of string.
   * @returns
   */
  function finishToken(kind: SyntaxKinds, value?: string): SyntaxKinds {
    context.tokenContext.kind = kind;
    context.tokenContext.lastTokenEndPosition = context.tokenContext.endPosition;
    context.tokenContext.endPosition = creaetSourcePositionFromCursor();
    context.tokenContext.value =
      value ??
      context.cursor.code.slice(
        context.tokenContext.startPosition.index,
        context.tokenContext.endPosition.index,
      );
    return kind;
  }
  /**
   * Private API for getting current char accroding to
   * the lexer cursor or get other char from current
   * pos (offset).
   * - NOTE: it will return undefined if reaching EOF.
   * @returns {string}
   */
  function getChar(step: number = 0): string | undefined {
    return context.cursor.code[context.cursor.pos + step];
  }
  /**
   * Private API for checking is current reach EOF or not,
   * must used by every loop which use to eat char.
   */
  function isEOF(): boolean {
    return getChar() === undefined;
  }
  /**
   * Private API for eatting current char, advance cursor with
   * one step default, or you can move more then one step
   * @return {void}
   */
  function eatChar(step: number = 1): void {
    context.cursor.pos += step;
  }
  /**
   * Private API for eatting current char, which must be a change
   * line char, not only adavnce one step, also change the cursor
   * data about line position
   * @return {void}
   */
  function eatChangeLine(): void {
    context.cursor.pos += 1;
    context.cursor.currentLineStart = context.cursor.pos;
    context.cursor.currentLine++;
  }
  /**
   * Private API called before `startToken`, skip all ignoreable char and
   * maintain cursor data when get a change line char
   * @return {void}
   */
  function skipWhiteSpaceChangeLine(): void {
    loop: while (context.cursor.pos < code.length) {
      let counter = 0;
      switch (getChar()) {
        case "\n":
          eatChangeLine();
          break;
        case " ":
        case "\t":
          eatChar();
          break;
        case "/": {
          const next = getChar(1);
          if (next === "/") {
            readComment();
            return skipWhiteSpaceChangeLine();
          }
          if (next === "*") {
            readCommentBlock();
            return skipWhiteSpaceChangeLine();
          }
          // fall thorugh
        }
        default:
          break loop;
      }
    }
  }
  /**
   * Private API for getting current index, used when tokenize literal,
   * for example, check a slice string in code contain some char or not
   * we need a start index and end index to get slice string
   * @return {number}
   */
  function getCurrentIndex(): number {
    return context.cursor.pos;
  }
  /**
   * Private API for getting slice string from code with start index and end index,
   * @return {string}
   */
  function getSliceStringFromCode(startIndex: number, endIndex: number): string {
    return context.cursor.code.slice(startIndex, endIndex);
  }
  /**
   * lexicalError is used for tokenizer unexecpt char happended. ex: string start with " can't find end ""
   * @param {string} content - error message
   * @returns {Error} - a error object
   */
  function lexicalError(content: string): Error {
    return new Error(
      `[Error]: Lexical Error, ${content}, start position is (${context.tokenContext.startPosition.row}, ${context.tokenContext.startPosition.col})`,
    );
  }
  /**
   * Main State machine for lexer, according to current char, transition
   * to other sub state mahine for reading token.
   * @returns {SyntaxKinds}
   */
  function scan(): SyntaxKinds {
    skipWhiteSpaceChangeLine();
    const char = getChar();
    startToken();
    if (!char) {
      return finishToken(SyntaxKinds.EOFToken);
    }
    switch (char) {
      /** ==========================================
       *              Punctuators
       *  ==========================================
       */
      case "{":
        context.templateMeta.stackCounter.push(-1);
        eatChar();
        return finishToken(SyntaxKinds.BracesLeftPunctuator);
      case "}":
        const result = context.templateMeta.stackCounter.pop();
        if (result && result > 0) {
          return readTemplateLiteral(SyntaxKinds.TemplateTail, SyntaxKinds.TemplateMiddle);
        }
        eatChar();
        return finishToken(SyntaxKinds.BracesRightPunctuator);
      case "[":
        eatChar();
        return finishToken(SyntaxKinds.BracketLeftPunctuator);
      case "]":
        eatChar();
        return finishToken(SyntaxKinds.BracketRightPunctuator);
      case "(":
        eatChar();
        return finishToken(SyntaxKinds.ParenthesesLeftPunctuator);
      case ")":
        eatChar();
        return finishToken(SyntaxKinds.ParenthesesRightPunctuator);
      case ":":
        eatChar();
        return finishToken(SyntaxKinds.ColonPunctuator);
      case ";":
        eatChar();
        return finishToken(SyntaxKinds.SemiPunctuator);
      /** ==========================================
       *                Operators
       *  ==========================================
       */
      case ",":
        eatChar();
        return finishToken(SyntaxKinds.CommaToken);
      case "+":
        // +, ++, +=
        return readPlusStart();
      case "-":
        // -, --, -=
        return readMinusStart();
      case "*":
        return readMulStart();
      case "%":
        return readModStart();
      case ">":
        return readGreaterStart();
      case "<":
        return readLessStart();
      case "=":
        // '=', '==', '===', '=>'
        return readEqualStart();
      case "!":
        // '!', '!=', '!=='
        return readNotStart();
      case "&":
        // '&', '&&', '&=', '&&='
        return readAndStart();
      case "|":
        // '|', "||", '|=', '||='
        return readOrStart();
      case "?":
        // '?', '?.' '??'
        return readQuestionStart();
      case "^":
        // '^', '^='
        return readBitwiseXORStart();
      case "~":
        // `~=`, `~`
        return readBitwiseNOTStart();
      case "/": {
        // '/' '// comment' '/* comments */'
        const next = getChar(1);
        switch (next) {
          // case "/":
          //   // start with "//"
          //   return readComment();
          // case "*":
          //   // start with "/*"
          //   return readCommentBlock();
          case "=":
            // start with "/="
            eatChar(2);
            return finishToken(SyntaxKinds.DivideAssignOperator, "/=");
          case ">":
            // start with "/>"
            eatChar(2);
            return finishToken(SyntaxKinds.JSXSelfClosedToken, "/>");
          default:
            // just "/"
            eatChar();
            return finishToken(SyntaxKinds.DivideOperator, "/");
        }
      }
      case ".":
        // '.', '...', 'float-literal'
        return readDotStart();
      /** ==========================================
       *  Keyword, Id, Literal
       *  ==========================================
       */
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": {
        // Number Literal
        return readNumberLiteral();
      }
      case '"': {
        // String Literal
        return readStringLiteral('"');
      }
      case "'": {
        // String Literal
        return readStringLiteral("'");
      }
      case "`": {
        // Template Literal
        return readTemplateLiteral(SyntaxKinds.TemplateNoSubstitution, SyntaxKinds.TemplateHead);
      }
      case "#": {
        eatChar();
        const word = readWordAsIdentifier();
        return finishToken(SyntaxKinds.PrivateName, word);
      }
      default: {
        // Word -> Id or Keyword
        return readIdentifierOrKeyword();
      }
    }
  }
  /** ===========================================================
   *                Operators Sub state mahcine
   *  ===========================================================
   */
  /**
   * Sub state machine called when current char is start with
   * `+`, read three token kind:
   * 1. `+`
   * 2. `++`
   * 3. `+=`
   * @returns {SyntaxKinds}
   */
  function readPlusStart(): SyntaxKinds {
    // must start with +
    eatChar();
    switch (getChar()) {
      // +=
      case "=":
        eatChar();
        return finishToken(SyntaxKinds.PlusAssignOperator);
      // ++
      case "+":
        eatChar();
        return finishToken(SyntaxKinds.IncreOperator);
      // +
      default:
        return finishToken(SyntaxKinds.PlusOperator);
    }
  }
  /**
   * Sub state machine called when current char start with `-`,
   * read three kind of token
   * 1. `-`
   * 2. `-=`
   * 3. `--`
   * @returns {SyntaxKinds}
   */
  function readMinusStart(): SyntaxKinds {
    // must start with `-`
    eatChar();
    switch (getChar()) {
      // -=
      case "=":
        eatChar();
        return finishToken(SyntaxKinds.MinusAssignOperator);
      // --
      case "-":
        eatChar();
        return finishToken(SyntaxKinds.DecreOperator);
      // -
      default:
        return finishToken(SyntaxKinds.MinusOperator);
    }
  }
  /**
   * Sub state machine called when current char start with `*`,
   * read four kind of token.
   * 1. `*`
   * 2. `**`
   * 3. `*=`
   * 4. `**=`
   */
  function readMulStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      // *=
      case "=":
        eatChar();
        return finishToken(SyntaxKinds.MultiplyAssignOperator);
      case "*": {
        eatChar();
        if (getChar() === "=") {
          eatChar();
          // **=
          return finishToken(SyntaxKinds.ExponAssignOperator);
        }
        // **
        return finishToken(SyntaxKinds.ExponOperator);
      }
      default:
        // *
        return finishToken(SyntaxKinds.MultiplyOperator);
    }
  }
  /**
   * Sub state mahcine called when current char is start with `%`,
   * read two kind of token
   * - `%`, `%=`
   */
  function readModStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      // %=
      case "=":
        eatChar();
        return finishToken(SyntaxKinds.ModAssignOperator);
      // %
      default:
        return finishToken(SyntaxKinds.ModOperator);
    }
  }
  /**
   * Sub state machine called when current char is `>`, read 6 kind of token
   * - '>', '>>', '>>>' '>=', ">>=",  ">>>="
   * @returns {SyntaxKinds}
   */
  function readGreaterStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      case ">": {
        eatChar();
        switch (getChar()) {
          case ">": {
            eatChar();
            switch (getChar()) {
              case "=":
                // >>>=
                eatChar();
                return finishToken(SyntaxKinds.BitwiseRightShiftFillAssginOperator);
              default:
                // >>>
                return finishToken(SyntaxKinds.BitwiseRightShiftFillOperator);
            }
          }
          case "=":
            // >>=
            eatChar();
            return finishToken(SyntaxKinds.BitwiseRightShiftAssginOperator);
          default:
            // >>
            return finishToken(SyntaxKinds.BitwiseRightShiftOperator);
        }
      }
      case "=":
        // >=
        eatChar();
        return finishToken(SyntaxKinds.GeqtOperator);
      default:
        // >
        return finishToken(SyntaxKinds.GtOperator);
    }
  }
  /**
   * Sun state machine called when current char is `<`, read 5 kind of token
   * - '<', '<<', '<=', '<<=', "</"
   * @returns {SyntaxKinds}
   */
  function readLessStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      case "<": {
        eatChar();
        switch (getChar()) {
          case "=":
            // <<=
            eatChar();
            return finishToken(SyntaxKinds.BitwiseLeftShiftAssginOperator);
          default:
            // <<
            return finishToken(SyntaxKinds.BitwiseLeftShiftOperator);
        }
      }
      case "=":
        // <=
        eatChar();
        return finishToken(SyntaxKinds.LeqtOperator);
      case "/":
        eatChar();
        return finishToken(SyntaxKinds.JSXCloseTagStart);
      default:
        // <
        return finishToken(SyntaxKinds.LtOperator);
    }
  }
  /**
   * Sub state machine called when current char is `=`, read four
   * kind of token,
   * - '=', '==', '===', '=>'
   * @returns {SyntaxKinds}
   */
  function readEqualStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      case "=": {
        eatChar();
        switch (getChar()) {
          case "=":
            eatChar();
            return finishToken(SyntaxKinds.StrictEqOperator);
          default:
            return finishToken(SyntaxKinds.EqOperator);
        }
      }
      case ">":
        eatChar();
        return finishToken(SyntaxKinds.ArrowOperator);
      default:
        return finishToken(SyntaxKinds.AssginOperator);
    }
  }
  /**
   * Sub state machine when current char is `!`, read three kind of token.
   * - '!', '!=', '!=='
   * @returns {SyntaxKinds}
   */
  function readNotStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      case "=": {
        eatChar();
        switch (getChar()) {
          case "=":
            eatChar();
            return finishToken(SyntaxKinds.StrictNotEqOperator);
          default:
            return finishToken(SyntaxKinds.NotEqOperator);
        }
      }
      default:
        return finishToken(SyntaxKinds.LogicalNOTOperator);
    }
  }
  /**
   * Sub state machine when current char is `&`, read four kind of token
   * - '&', '&&', '&=', '&&='
   * @returns {SyntaxKinds}
   */
  function readAndStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      case "&": {
        eatChar();
        switch (getChar()) {
          case "=":
            eatChar();
            return finishToken(SyntaxKinds.logicalANDAssginOperator);
          default:
            return finishToken(SyntaxKinds.LogicalANDOperator);
        }
      }
      case "=":
        eatChar();
        return finishToken(SyntaxKinds.BitwiseANDAssginOperator);
      default:
        return finishToken(SyntaxKinds.BitwiseANDOperator);
    }
  }
  /**
   * Sub state machine when current char is `|`, read four kind of token
   * - '|', "||", '|=', '||='
   * @returns {SyntaxKinds}
   */
  function readOrStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      case "|": {
        eatChar();
        switch (getChar()) {
          case "=":
            eatChar();
            return finishToken(SyntaxKinds.LogicalORAssignOperator);
          default:
            return finishToken(SyntaxKinds.LogicalOROperator);
        }
      }
      case "=":
        eatChar();
        return finishToken(SyntaxKinds.BitwiseORAssginOperator);
      default:
        return finishToken(SyntaxKinds.BitwiseOROperator);
    }
  }
  /**
   * Sub state machine when current char is `?`, read three kind of token:
   * - '?', '?.' '??'
   * @return {SyntaxKinds}
   */
  function readQuestionStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      case ".":
        eatChar();
        return finishToken(SyntaxKinds.QustionDotOperator);
      case "?":
        eatChar();
        return finishToken(SyntaxKinds.NullishOperator);
      default:
        return finishToken(SyntaxKinds.QustionOperator);
    }
  }
  /**
   * Sub state machine when current char is `^`, read two kind of token:
   * - '^', '^='
   * @return {SyntaxKinds}
   */
  function readBitwiseXORStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      case "=":
        eatChar();
        return finishToken(SyntaxKinds.BitwiseXORAssginOperator);
      default:
        return finishToken(SyntaxKinds.BitwiseXOROperator);
    }
  }
  /**
   * Sub state machine when current char is `~`, read two kind of token:
   * - `~=`, `~`
   * @return {SyntaxKinds}
   */
  function readBitwiseNOTStart(): SyntaxKinds {
    eatChar();
    switch (getChar()) {
      case "=":
        eatChar();
        return finishToken(SyntaxKinds.BitwiseNOTAssginOperator);
      default:
        return finishToken(SyntaxKinds.BitwiseNOTOperator);
    }
  }
  /**
   * Sub state machine when current char is `.`, read two kind of token:
   *  - '.', '...', 'float-literal'
   * @returns {SyntaxKinds}
   */
  function readDotStart(): SyntaxKinds {
    // '.', '...', 'float-literal',
    eatChar();
    switch (getChar()) {
      case ".": {
        eatChar();
        if (getChar() !== ".") {
          // should error: .. invalid
          throw new Error();
        }
        eatChar();
        return finishToken(SyntaxKinds.SpreadOperator);
      }
      default: {
        if (isDigital()) {
          return readDotStartDecimalLiteral();
        }
        return finishToken(SyntaxKinds.DotOperator);
      }
    }
  }
  function readComment() {
    // eat '//'
    eatChar(2);
    while (!isEOF()) {
      if (getChar() === "\n") {
        break;
      }
      eatChar();
    }
    return;
  }
  function readCommentBlock() {
    // eat /*
    let flag = false;
    eatChar(2);
    while (!isEOF()) {
      const char = getChar();
      if (char === "\n") {
        eatChangeLine();
        flag = true;
        continue;
      }
      if (char === "*") {
        if (getChar(1) === "/") {
          eatChar(2);
          return flag;
        }
      }
      eatChar();
    }
    // TODO: error message
    throw new Error();
  }
  /** ===========================================================
   *                Literal state mahcine
   *  ===========================================================
   */
  /**
   * Sub state mahcine for tokenize template literal, by product rule,
   * you can find tokenize `TemplateHead` and `TemplateNoSubstitution`
   * is smailer with `TemplateTail` and `TemplateMiddle`.
   *
   * - start with '`', meet '`'  => `TemplateNoSubstitution` or `TemplateTail`
   * - start with '`', meet '${' => `TemplateHead` or `TemplateMiddle`
   * @returns {SyntaxKinds}
   */
  function readTemplateLiteral(meetEnd: SyntaxKinds, meetMiddle: SyntaxKinds): SyntaxKinds {
    // eat '`'
    eatChar();
    let isEscape = false;
    while (!isEOF()) {
      const current = getChar();
      if (current === "\n") {
        eatChangeLine();
        continue;
      }
      if (!isEscape && current === "`") {
        eatChar();
        return finishToken(meetEnd);
      }
      if (!isEscape && current === "$") {
        if (getChar(1) === "{") {
          eatChar(2);
          context.templateMeta.stackCounter.push(1);
          return finishToken(meetMiddle);
        }
      }
      isEscape = current === "\\" && !isEscape;
      eatChar();
    }
    // TODO: error handle
    throw new Error("todo error - not close template head or no subsitude");
  }
  /**
   * Sub state machine for tokenize Number Literal, includeing following kind of
   * number literal
   *
   * - Digital Number Literal
   * - Binary Number Literal
   *
   *
   * Since Number literal has a lot of production rule, so it goona seperator into
   * serval state machine helper for reading part of literal.
   * -
   * @returns {SyntaxKinds}
   */
  function readNumberLiteral(): SyntaxKinds {
    let char = getChar();
    // Start With 0
    if (char === "0") {
      eatChar();
      const next = getChar();
      switch (next) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          return readLegacyOctNumberLiteralOrNonOctalDecimalIntegerLiteral();
        }
        case ".": {
          eatChar();
          return readDotStartDecimalLiteral();
        }
        case "b":
        case "B": {
          eatChar();
          return readNumberLiteralWithBase(isBinary);
        }
        case "o":
        case "O": {
          eatChar();
          return readNumberLiteralWithBase(isOct);
        }
        case "x":
        case "X": {
          eatChar();
          return readNumberLiteralWithBase(isHex);
        }
        default: {
          if (next !== "E" && next !== "e") {
            return finishToken(SyntaxKinds.DecimalLiteral);
          }
        }
      }
    }
    // Start With Non 0
    return readDecimalLiteral();
  }
  /**
   *
   */
  function readDecimalLiteral() {
    // Start With Non 0
    readDigitals();
    if (getChar() === ".") {
      eatChar();
      readDigitals();
    }
    const char = getChar();
    if (char === "e" || char === "E") {
      helperReadExponPartOfDecimalLiteral();
    }
    return finishToken(SyntaxKinds.DecimalLiteral);
  }
  function helperReadExponPartOfDecimalLiteral() {
    eatChar();
    const char = getChar();
    if (char === "+" || char == "-") {
      eatChar();
    }
    const startIndex = getCurrentIndex();
    readDigitals();
    const exponPart = context.cursor.code.slice(startIndex, context.cursor.pos);
    if (exponPart.length === 0) {
      // TODO: error handle
      throw new Error("todo error - expon length is 0");
    }
  }
  /**
   * Sub state machine helper, reading a number literal
   * start with `.`, only could be a digital float literal.
   * @returns {SyntaxKinds}
   */
  function readDotStartDecimalLiteral(): SyntaxKinds {
    readDigitals();
    const char = getChar();
    if (char === "e" || char === "E") {
      helperReadExponPartOfDecimalLiteral();
    }
    return finishToken(SyntaxKinds.DecimalLiteral);
  }
  /**
   * Sub State Mahcine Helper for reading a digital string.
   * @returns {void}
   */
  function readDigitals(): void {
    let seprator = false;
    let isStart = true;
    while (!isEOF()) {
      const char = getChar();
      if (char === "_") {
        if (isStart) {
          throw lexicalError("TODO: Can not start with _");
        }
        eatChar();
        if (seprator) {
          throw lexicalError("TODO: double __");
        }
        seprator = true;
        continue;
      }
      if (!isDigital()) {
        break;
      }
      seprator = false;
      isStart = false;
      eatChar();
    }
    if (seprator) {
      throw lexicalError(ErrorMessageMap.babel_error_a_numeric_separator_is_only_allowed_between_two_digits);
    }
  }
  /**
   * Sub state machine helper to read leegacy Oct number;
   * @returns
   */
  function readLegacyOctNumberLiteralOrNonOctalDecimalIntegerLiteral() {
    let isNonOctalDecimalIntegerLiteral = false;
    let isLastCharNumeric = false;
    loop: while (!isEOF()) {
      const char = getChar();
      switch (char) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7": {
          isLastCharNumeric = true;
          eatChar();
          break;
        }
        case "8":
        case "9": {
          isLastCharNumeric = true;
          isNonOctalDecimalIntegerLiteral = true;
          eatChar();
          break;
        }
        case "_": {
          if (!isLastCharNumeric) {
            throw new Error("There am I !!");
          }
          eatChar();
          readDigitals();
          break loop;
        }
        default: {
          break loop;
        }
      }
    }
    if (getChar() === ".") {
      eatChar();
      readDigitals();
    }
    const char = getChar();
    if (char === "e" || char === "E") {
      helperReadExponPartOfDecimalLiteral();
    }
    // should error if is legacy oct not have float or expon.
    return finishToken(
      isNonOctalDecimalIntegerLiteral
        ? SyntaxKinds.NonOctalDecimalLiteral
        : SyntaxKinds.LegacyOctalIntegerLiteral,
    );
  }
  /**
   * Sub state mahcine helper for checking is current char
   * is digital or not, it will also check EOF for us.
   * @returns {boolean}
   */
  function isDigital(): boolean {
    const char = getChar();
    if (char == undefined) {
      return false;
    }
    const code = char.charCodeAt(0);
    return code >= 48 && code <= 57;
  }
  /**
   * Sub state machine helperfor checking is current char
   * is hex number or not, it will also check EOF for us.
   * @returns {boolean}
   */
  function isHex(): boolean {
    const char = getChar();
    if (char == undefined) {
      return false;
    }
    const code = char.charCodeAt(0);
    return (code >= 48 && code <= 57) || (code >= 97 && code <= 102) || (code >= 65 && code <= 70);
  }
  /**
   * Sub state machine helperfor checking is current char
   * is binary number or not, it will also check EOF for us.
   * @returns {boolean}
   */
  function isBinary(): boolean {
    const code = getChar();
    return code === "0" || code === "1";
  }
  /**
   * Sub state machine helperfor checking is current char
   * is Oct number or not, it will also check EOF for us.
   * @returns {boolean}
   */
  function isOct(): boolean {
    const char = getChar();
    if (char == undefined) {
      return false;
    }
    const code = char.charCodeAt(0);
    return code >= 48 && code <= 55;
  }
  /**
   * Sub state machine helper for reading a different base number
   * literal, ECMAscript support
   * @param stopper determinate is current char is eatable.
   * @returns
   */
  function readNumberLiteralWithBase(stopper: () => boolean) {
    let seprator = false;
    let isStart = true;
    const startIndex = getCurrentIndex();
    while (!isEOF()) {
      const char = getChar();
      if (char === "_") {
        if (isStart) {
          throw lexicalError("TODO: Can not start with _");
        }
        eatChar();
        if (seprator) {
          throw lexicalError("TODO: double __");
        }
        seprator = true;
        continue;
      }
      if (!stopper()) {
        break;
      }
      seprator = false;
      isStart = false;
      eatChar();
    }
    if (seprator) {
      throw lexicalError(ErrorMessageMap.babel_error_a_numeric_separator_is_only_allowed_between_two_digits);
    }
    // ban `0x` or `0b`
    if (getSliceStringFromCode(startIndex, getCurrentIndex()).length === 0) {
      throw new Error("Number Literal Length can not be 0");
    }
    return finishToken(SyntaxKinds.DecimalLiteral);
  }
  /**
   * Sub state machine for reading a string literal, tokenize a string literal
   * with escape char and possible change line.
   * @param mode which char string literal is start with.
   * @returns {SyntaxKinds}
   */
  function readStringLiteral(mode: '"' | "'"): SyntaxKinds {
    // eat mode
    eatChar();
    const indexAfterStartMode = getCurrentIndex();
    let isEscape = false;
    while (!isEOF()) {
      const char = getChar();
      if (char === mode && !isEscape) {
        // eat node outside is because we want to
        // make value not including `"` or `'`
        break;
      }
      if (char === "\n" && !isEscape) {
        // TODO: error handle
        throw new Error(ErrorMessageMap.babel_error_unterminated_string_constant);
      }
      isEscape = char === "\\" && !isEscape;
      eatChar();
    }
    if (isEOF()) {
      // TODO: error handle
      throw new Error(ErrorMessageMap.babel_error_unterminated_string_constant);
    }
    // get end index before ending char ' or "
    const indexBeforeEndMode = getCurrentIndex();
    // eat mode
    eatChar();
    return finishToken(
      SyntaxKinds.StringLiteral,
      getSliceStringFromCode(indexAfterStartMode, indexBeforeEndMode),
    );
  }
  /** ===========================================================
   *         Identifier and Keywrod Sub state mahcine
   *  ===========================================================
   */
  /**
   * Sub state machine for tokenize a identifier or a keyword.
   * @returns {SyntaxKinds}
   */
  function readIdentifierOrKeyword(): SyntaxKinds {
    const word = readWordAsIdentifier();
    if (KeywordLiteralSet.has(word)) {
      // @ts-ignore
      const keywordKind = KeywordLiteralMapSyntaxKind[word];
      if (context.escapeMeta.flag) {
        // TODO: error handle
        throw new Error("keyword can not have any escap unicode");
      }
      return finishToken(keywordKind as SyntaxKinds, word);
    }
    return finishToken(SyntaxKinds.Identifier, word);
  }
  function readWordAsIdentifier() {
    let isEscape = false;
    let word = "";
    let startIndex = getCurrentIndex();
    while (!isEOF()) {
      const char = getChar();
      if (char === "\\") {
        const next = getChar(1);
        if (next === "u" || next === "U") {
          context.escapeMeta.flag = true;
          word += getSliceStringFromCode(startIndex, getCurrentIndex());
          word += readHexEscap();
          startIndex = getCurrentIndex();
          continue;
        }
        isEscape = !isEscape;
      } else {
        isEscape = false;
      }
      if (char && nonIdentifierStartSet.has(char)) {
        break;
      }
      eatChar();
    }
    word += getSliceStringFromCode(startIndex, getCurrentIndex());
    return word;
  }
  function readHexEscap() {
    // eat \u \U
    eatChar(2);
    const startIndex = getCurrentIndex();
    for (let i = 0; i < 4; ++i) {
      eatChar();
    }
    return String.fromCharCode(Number(`0x${getSliceStringFromCode(startIndex, getCurrentIndex())}`));
  }
}
