import { SyntaxKinds, LexicalLiteral, KeywordLiteralMapSyntaxKind, SourcePosition } from "web-infra-common";
import {
  LookaheadToken,
  createLexerState,
  createLexerContext,
  cloneLexerContext,
  cloneLexerState,
  LexerState,
  LexerContext,
} from "./type";
import {
  isCodePointLineTerminate,
  isIdentifierChar,
  isIdentifierStart,
  UnicodePoints,
} from "./unicode-helper";
import { ErrorMessageMap } from "./error";

const KeywordLiteralSet = new Set([
  ...LexicalLiteral.keywords,
  ...LexicalLiteral.BooleanLiteral,
  ...LexicalLiteral.NullLiteral,
  ...LexicalLiteral.UndefinbedLiteral,
]);

export function createLexer(code: string) {
  /**
   * state and context for lexer,
   * - state serve as input of DFA.
   * - context serve as stack in PDA, it will be set by parser.
   */
  let state = createLexerState(code);
  let context = createLexerContext();

  /** ===========================================================
   *             Public API of Lexer
   *  ===========================================================
   */
  /**
   * fork state and context of lexer, used by parser to try parse
   * some syntax.
   * @returns {[LexerState, LexerContext]}
   */
  function forkState(): [LexerState, LexerContext] {
    return [cloneLexerState(state), cloneLexerContext(context)];
  }
  /**
   * Restore lexer state and context, used by parser when failed on try parse
   * @param restoreState
   * @param restoreContext
   */
  function restoreState(restoreState: LexerState, restoreContext: LexerContext) {
    state = restoreState;
    context = restoreContext;
  }
  /**
   * Public Api for getting change line flag of current token.
   * @returns {boolean}
   */
  function getLineTerminatorFlag(): boolean {
    // eslint-disable-next-line no-control-regex
    return /[\n\u000D\u2028\u2029]/.test(
      state.cursor.code.slice(state.token.lastTokenEndPosition.index, state.token.startPosition.index),
    );
  }
  /**
   * Public API for getting is current value contain unicode flag.
   * - used by checking contextual keyword.
   * @returns {boolean}
   */
  function getEscFlag(): boolean {
    return state.semantic.isKeywordContainUnicodeEscap;
  }
  /**
   * Public API for getting is template literal contain
   * invalid char or not, when template is in tag expression,
   * it should not raise error.
   * @returns {boolean}
   */
  function getTemplateLiteralTag(): boolean {
    return state.semantic.isTemplateLiteralBreakEscapRule;
  }
  /**
   * Public API for getting token's string value.
   * @returns {string}
   */
  function getSourceValue(): string {
    return state.token.value;
  }
  function getSourceValueByIndex(start: number, end: number) {
    return getSliceStringFromCode(start, end);
  }
  /**
   * Public API for get source position of current token.
   * @returns {SourcePosition}
   */
  function getStartPosition(): SourcePosition {
    return state.token.startPosition;
  }
  /**
   * Public API for get end position of current token.
   * @returns {SourcePosition}
   */
  function getEndPosition(): SourcePosition {
    return state.token.endPosition;
  }
  /**
   * Public API for get end position of last token
   */
  function getLastTokenEndPositon(): SourcePosition {
    return state.token.lastTokenEndPosition;
  }
  /**
   * Public API for get current token kind.
   * @returns {SyntaxKinds}
   */
  function getTokenKind(): SyntaxKinds {
    if (state.token.kind === null) {
      state.token.kind = scan();
    }
    return state.token.kind;
  }
  /**
   * Public API for moving to next token.
   * @returns {void}
   */
  function nextToken(): void {
    scan();
  }
  /**
   * Public API like `readRegex`, tokenize as in JSX chilren context,
   * which should be a html string, unless meet `{` or `<` char.
   */
  function nextTokenInJSXChildrenContext(): void {
    scanInJSXChildrenContext();
  }
  /**
   * Public API set when read JSX attribute, a string literal of jsx attribute
   * can contain change line without `\` char.
   * @param {boolean} flag
   */
  function setJSXStringContext(flag: boolean): void {
    context.jsx.shouldTokenizeStringLiteralAsJSXStringLiteral = flag;
  }
  /**
   * Public API for getting JSX Gt Context Flag.
   * @returns {boolean}
   */
  function getJSXGtContext(): boolean {
    return context.jsx.shouldTokenizeGtWithHigherPriority;
  }
  /**
   * Public API for setting context to tokenize `>` as high priority,
   * since jsx end tag could be `>>`, `>>=`, `>>>`, `>>>=`, in those
   * case, we should tokenize `>` at first.
   * @param {boolean} flag
   */
  function setJSXGtContext(flag: boolean): void {
    context.jsx.shouldTokenizeGtWithHigherPriority = flag;
  }
  /**
   * Public API for lookahead token.
   * @returns {LookaheadToken}
   */
  function lookahead(): LookaheadToken {
    // store last context
    const lastContext = cloneLexerContext(context);
    const lastState = cloneLexerState(state);
    nextToken();
    const lookaheadToken = {
      kind: state.token.kind!,
      value: state.token.value,
      startPosition: state.token.startPosition,
      endPosition: state.token.endPosition,
      lineTerminatorFlag: getLineTerminatorFlag(),
    };
    // resume last context
    context = lastContext;
    state = lastState;
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
    let flag = "";
    const startIndex = getCurrentIndex();
    loop: while (!isEOF()) {
      const code = getCharCodePoint() as number;
      switch (code) {
        case UnicodePoints.Divide:
          break loop;
        // read set
        case UnicodePoints.BracketLeft: {
          readSetInRegexPattern();
          break;
        }
        // read escap
        case UnicodePoints.BackSlash: {
          readEscapSequenceInRegexPattern();
          break;
        }
        // change line
        case UnicodePoints.ChangeLine:
        case UnicodePoints.CR:
        case UnicodePoints.LS:
        case UnicodePoints.PS: {
          throw lexicalError(ErrorMessageMap.syntax_error_invalid_regular_expression_flags);
        }
        // other,
        default: {
          eatChar();
          break;
        }
      }
    }
    if (isEOF()) {
      throw lexicalError("regex unterminate stop");
    }
    pattern = getSliceStringFromCode(startIndex, getCurrentIndex());
    // eat `/`
    eatChar();
    /** tokenize flag  */
    flag = readFlagsInRegexLiteral();
    finishToken(SyntaxKinds.RegexLiteral, pattern + flag);
    return { pattern, flag };
  }
  /**
   * Private API helper for reading set regex pattern
   */
  function readSetInRegexPattern() {
    eatChar(); // eat [
    while (!isEOF()) {
      const code = getCharCodePoint() as number;
      if (code === UnicodePoints.BracketRight) {
        eatChar();
        break;
      }
      if (code === UnicodePoints.BackSlash) {
        readEscapSequenceInRegexPattern();
        continue;
      }
      eatChar();
    }
  }
  /**
   * Private API helper for reading escap sequence of regex
   * - the ecma def: #prod-RegularExpressionNonTerminator
   */
  function readEscapSequenceInRegexPattern() {
    eatChar(); // eat \
    const code = getCharCodePoint();
    switch (code) {
      case UnicodePoints.LowerCaseU: {
        readEscapeSequenceInStringLiteral();
        break;
      }
      case UnicodePoints.ChangeLine:
      case UnicodePoints.CR:
      case UnicodePoints.LS:
      case UnicodePoints.PS: {
        throw lexicalError(ErrorMessageMap.syntax_error_invalid_regular_expression_flags);
      }
      default: {
        eatChar();
      }
    }
  }
  /**
   * Private API helper for reading flag in regex, at the same time we
   * perform semantic checking
   * -
   * @returns
   */
  function readFlagsInRegexLiteral() {
    const startIndex = getCurrentIndex();
    const existFlagRecord: Record<string, number> = {
      d: 0,
      g: 0,
      i: 0,
      m: 0,
      s: 0,
      u: 0,
      v: 0,
      y: 0,
    };
    while (!isEOF()) {
      const code = getCharCodePoint() as number;
      if (!isIdentifierChar(code)) {
        break;
      }
      // validate flag
      switch (code) {
        case UnicodePoints.LowerCaseD: {
          existFlagRecord["d"]++;
          break;
        }
        case UnicodePoints.LowerCaseG: {
          existFlagRecord["g"]++;
          break;
        }
        case UnicodePoints.LowerCaseI: {
          existFlagRecord["i"]++;
          break;
        }
        case UnicodePoints.LowerCaseM: {
          existFlagRecord["m"]++;
          break;
        }
        case UnicodePoints.LowerCaseS: {
          existFlagRecord["s"]++;
          break;
        }
        case UnicodePoints.LowerCaseU: {
          existFlagRecord["u"]++;
          break;
        }
        case UnicodePoints.LowerCaseV: {
          existFlagRecord["v"]++;
          break;
        }
        case UnicodePoints.LowerCaseY: {
          existFlagRecord["y"]++;
          break;
        }
        default: {
          throw lexicalError(ErrorMessageMap.syntax_error_invalid_regular_expression_flags);
        }
      }
      for (const [_, value] of Object.entries(existFlagRecord)) {
        if (value >= 2) {
          throw lexicalError(ErrorMessageMap.syntax_error_invalid_regular_expression_flags);
        }
      }
      if (existFlagRecord["u"] + existFlagRecord["v"] === 2) {
        throw lexicalError(ErrorMessageMap.syntax_error_invalid_regular_expression_flags);
      }
      eatChar();
    }
    return getSliceStringFromCode(startIndex, getCurrentIndex());
  }
  /**
   *
   * @returns
   */
  function reLexGtRelateToken(allowAssign: boolean) {
    switch (state.token.kind) {
      // `>=` to `>`, `=`
      case SyntaxKinds.GeqtOperator: {
        if (!allowAssign) return;
        state.cursor.pos -= 2;
        startToken();
        eatChar();
        finishToken(SyntaxKinds.GtOperator);
        return;
      }
      // `>>` to `>`, `>`
      case SyntaxKinds.BitwiseRightShiftOperator: {
        state.cursor.pos -= 2;
        startToken();
        eatChar();
        finishToken(SyntaxKinds.GtOperator);
        return;
      }
      // `>>>` to `>`, `>>`
      case SyntaxKinds.BitwiseRightShiftFillOperator: {
        state.cursor.pos -= 3;
        startToken();
        eatChar();
        finishToken(SyntaxKinds.GtOperator);
        return;
      }
      // `>>=` to `>`, `>=`
      // case SyntaxKinds.BitwiseRightShiftAssginOperator: {
      //   state.cursor.pos -= 3;
      //   startToken();
      //   eatChar();
      //   finishToken(SyntaxKinds.GtOperator);
      //   return;
      // }
      // `>>>=`, to `>`, `>>=`
      // case SyntaxKinds.BitwiseRightShiftFillAssginOperator: {
      //   state.cursor.pos -= 4;
      //   startToken();
      //   eatChar();
      //   finishToken(SyntaxKinds.GtOperator);
      //   return;
      // }
      default: {
        return;
      }
    }
  }
  function reLexLtRelateToken() {
    switch (state.token.kind) {
      // `<<` to `<`, `<`
      case SyntaxKinds.BitwiseLeftShiftOperator: {
        state.cursor.pos -= 2;
        startToken();
        eatChar();
        finishToken(SyntaxKinds.LtOperator);
        return;
      }
      default: {
        return;
      }
    }
  }
  /**
   * Public API for sync the strict mode context with parser.
   * @param {boolean} strictMode
   */
  function setStrictModeContext(strictMode: boolean) {
    context.strictMode.isInStrictMode = strictMode;
  }
  return {
    getTokenKind,
    getSourceValue,
    getSourceValueByIndex,
    getStartPosition,
    getEndPosition,
    getLastTokenEndPositon,
    getLineTerminatorFlag,
    getEscFlag,
    getTemplateLiteralTag,
    nextToken,
    lookahead,
    readRegex,
    // only used by JSX
    nextTokenInJSXChildrenContext,
    setJSXStringContext,
    getJSXGtContext,
    setJSXGtContext,
    // only used by strict mode
    setStrictModeContext,
    // only used by TS
    reLexGtRelateToken,
    reLexLtRelateToken,
    forkState,
    restoreState,
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
      row: state.cursor.currentLine,
      col: state.cursor.pos - state.cursor.currentLineStart + 1,
      index: state.cursor.pos,
    };
  }
  /**
   * Start reading a token, because token contain row and col
   * information, so we need to record the current pos as start
   * mark.
   * @returns {void}
   */
  function startToken(): void {
    // state.semantic.isKeywordContainUnicodeEscap = false;
    // state.semantic.isTemplateLiteralBreakEscapRule = false;
    // state.semantic.isStringLiteralContainNonStrictEscap = false;
    state.token.startPosition = creaetSourcePositionFromCursor();
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
    state.token.kind = kind;
    state.token.lastTokenEndPosition = state.token.endPosition;
    state.token.endPosition = creaetSourcePositionFromCursor();
    state.token.value =
      value ?? state.cursor.code.slice(state.token.startPosition.index, state.token.endPosition.index);
    return kind;
  }
  /**
   * Private API for getting current char accroding to
   * the lexer cursor or get other char from current
   * pos (offset).
   * - NOTE: it will return undefined if reaching EOF.
   * @returns {string}
   */
  function getCharCodePoint(): number | undefined {
    return state.cursor.code.codePointAt(state.cursor.pos);
  }
  /**
   * Private API for getting current char accroding to
   * the lexer cursor or get other char from current
   * pos (offset).
   * - NOTE: it will return undefined if reaching EOF.
   * @returns {string}
   */
  function getNextCharCodePoint(): number | undefined {
    const curCodePoint = getCharCodePoint();
    if (!curCodePoint) return;
    const nextCharStep = curCodePoint > 0xffff ? 2 : 1;
    return state.cursor.code.codePointAt(state.cursor.pos + nextCharStep);
  }
  function getNextNextCharCodePoint(): number | undefined {
    const curCodePoint = getCharCodePoint();
    if (!curCodePoint) return;
    const nextCharStep = curCodePoint > 0xffff ? 2 : 1;
    const nextCodePoint = state.cursor.code.codePointAt(state.cursor.pos + nextCharStep);
    if (!nextCodePoint) return;
    const nextNextCharStep = nextCodePoint > 0xffff ? 2 : 1;
    return state.cursor.code.codePointAt(state.cursor.pos + nextCharStep + nextNextCharStep);
  }
  /**
   * Private API for checking is current reach EOF or not,
   * must used by every loop which use to eat char.
   */
  function isEOF(): boolean {
    return getCharCodePoint() === undefined;
  }
  /**
   * Private API for eatting current char, advance cursor with
   * one step default, or you can move more then one step
   * @return {void}
   */
  function eatChar(): void {
    const codePoint = getCharCodePoint() as number;
    state.cursor.pos += codePoint > 0xffff ? 2 : 1;
  }
  /**
   * Private API for eatting current char, advance cursor with
   * one step default, or you can move more then one step
   * @return {void}
   */
  function eatTwoChar(): void {
    eatChar();
    eatChar();
  }
  /**
   * Private API for eatting current char, which must be a change
   * line char, not only adavnce one step, also change the cursor
   * data about line position
   * @return {void}
   */
  function eatChangeLine(): void {
    eatChar();
    state.cursor.currentLineStart = state.cursor.pos;
    state.cursor.currentLine++;
  }
  /**
   * Private API called before `startToken`, skip all ignoreable char and
   * maintain cursor data when get a change line char
   * @return {void}
   */
  function skipWhiteSpaceChangeLine(): void {
    let haveChangeLine = state.cursor.pos === 0;
    while (!isEOF()) {
      switch (getCharCodePoint()) {
        case UnicodePoints.ChangeLine:
        case UnicodePoints.CR:
        case UnicodePoints.LS:
        case UnicodePoints.PS:
          eatChangeLine();
          haveChangeLine = true;
          break;
        case UnicodePoints.WhiteSpace:
        case UnicodePoints.NoBreakSpace:
        case UnicodePoints.Tab:
        case UnicodePoints.LineTabulation:
        case UnicodePoints.FromFeed:
        case "\u{2000}".codePointAt(0):
        case "\u{2001}".codePointAt(0):
        case "\u{2002}".codePointAt(0):
        case "\u{2003}".codePointAt(0):
        case "\u{2004}".codePointAt(0):
        case "\u{2005}".codePointAt(0):
        case "\u{2006}".codePointAt(0):
        case "\u{2007}".codePointAt(0):
        case "\u{2008}".codePointAt(0):
        case "\u{2009}".codePointAt(0):
        case "\u{200A}".codePointAt(0):
          eatChar();
          break;
        case UnicodePoints.HashTag: {
          const next = getNextCharCodePoint();
          if (next === UnicodePoints.Not) {
            readHashTahComment();
            break;
          }
          return;
        }
        case UnicodePoints.LessThen: {
          if (context.strictMode.isInStrictMode) {
            return;
          }
          const next = getNextCharCodePoint();
          if (next === UnicodePoints.Not) {
            eatTwoChar();
            const ahead = getCharCodePoint();
            const aheadNext = getNextCharCodePoint();
            if (ahead === UnicodePoints.Minus && aheadNext === UnicodePoints.Minus) {
              readComment();
              break;
            }
            // should error <! is a unexpect token
            throw new Error();
          }
          return;
        }
        case UnicodePoints.Divide: {
          const next = getNextCharCodePoint();
          if (next === UnicodePoints.Divide) {
            readComment();
            break;
          }
          if (next === UnicodePoints.Multi) {
            readCommentBlock();
            break;
          }
          return;
        }
        // HTML close comment
        case UnicodePoints.Minus: {
          if (context.strictMode.isInStrictMode) {
            return;
          }
          const next = getNextCharCodePoint();
          if (
            haveChangeLine &&
            next === UnicodePoints.Minus &&
            getNextNextCharCodePoint() === UnicodePoints.GreaterThen
          ) {
            eatChar();
            readComment();
            break;
          }
          return;
        }
        default:
          return;
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
    return state.cursor.pos;
  }
  /**
   * Private API for getting slice string from code with start index and end index,
   * @return {string}
   */
  function getSliceStringFromCode(startIndex: number, endIndex: number): string {
    return state.cursor.code.slice(startIndex, endIndex);
  }
  /**
   * lexicalError is used for tokenizer unexecpt char happended. ex: string start with " can't find end ""
   * @param {string} content - error message
   * @returns {Error} - a error object
   */
  function lexicalError(content: string): Error {
    return new Error(
      `[Error]: Lexical Error, ${content}, start position is (${state.token.startPosition.row}, ${state.token.startPosition.col})`,
    );
  }
  /**
   * Main State machine for lexer, according to current char, transition
   * to other sub state mahine for reading token.
   * @returns {SyntaxKinds}
   */
  function scan(): SyntaxKinds {
    skipWhiteSpaceChangeLine();
    const char = getCharCodePoint();
    startToken();
    switch (char) {
      case undefined: {
        return finishToken(SyntaxKinds.EOFToken);
      }
      /** ==========================================
       *              Punctuators
       *  ==========================================
       */
      case UnicodePoints.BracesLeft:
        context.template.stackCounter.push(-1);
        eatChar();
        return finishToken(SyntaxKinds.BracesLeftPunctuator);
      case UnicodePoints.BracesRight: {
        const result = context.template.stackCounter.pop();
        if (result && result > 0) {
          return readTemplateLiteral(SyntaxKinds.TemplateTail, SyntaxKinds.TemplateMiddle);
        }
        eatChar();
        return finishToken(SyntaxKinds.BracesRightPunctuator);
      }
      case UnicodePoints.BracketLeft:
        eatChar();
        return finishToken(SyntaxKinds.BracketLeftPunctuator);
      case UnicodePoints.BracketRight:
        eatChar();
        return finishToken(SyntaxKinds.BracketRightPunctuator);
      case UnicodePoints.ParenthesesLeft:
        eatChar();
        return finishToken(SyntaxKinds.ParenthesesLeftPunctuator);
      case UnicodePoints.ParenthesesRight:
        eatChar();
        return finishToken(SyntaxKinds.ParenthesesRightPunctuator);
      case UnicodePoints.Colon:
        eatChar();
        return finishToken(SyntaxKinds.ColonPunctuator);
      case UnicodePoints.Semi:
        eatChar();
        return finishToken(SyntaxKinds.SemiPunctuator);
      case UnicodePoints.AtSign:
        eatChar();
        return finishToken(SyntaxKinds.AtPunctuator);
      /** ==========================================
       *                Operators
       *  ==========================================
       */
      case UnicodePoints.Comma:
        eatChar();
        return finishToken(SyntaxKinds.CommaToken);
      case UnicodePoints.Plus:
        // +, ++, +=
        return readPlusStart();
      case UnicodePoints.Minus:
        // -, --, -=
        return readMinusStart();
      case UnicodePoints.Multi:
        return readMulStart();
      case UnicodePoints.Mod:
        return readModStart();
      case UnicodePoints.GreaterThen:
        return readGreaterStart();
      case UnicodePoints.LessThen:
        return readLessStart();
      case UnicodePoints.Equal:
        // '=', '==', '===', '=>'
        return readEqualStart();
      case UnicodePoints.Not:
        // '!', '!=', '!=='
        return readNotStart();
      case UnicodePoints.And:
        // '&', '&&', '&=', '&&='
        return readAndStart();
      case UnicodePoints.Or:
        // '|', "||", '|=', '||='
        return readOrStart();
      case UnicodePoints.Question:
        // '?', '?.' '??'
        return readQuestionStart();
      case UnicodePoints.BitwiseXor:
        // '^', '^='
        return readBitwiseXORStart();
      case UnicodePoints.BitwiseNot:
        // `~=`, `~`
        return readBitwiseNOTStart();
      case UnicodePoints.Divide: {
        eatChar();
        // '/' '// comment' '/* comments */'
        const next = getCharCodePoint();
        switch (next) {
          case UnicodePoints.Equal:
            // start with "/="
            eatChar();
            return finishToken(SyntaxKinds.DivideAssignOperator, "/=");
          case UnicodePoints.GreaterThen:
            // start with "/>"
            eatChar();
            return finishToken(SyntaxKinds.JSXSelfClosedToken, "/>");
          default:
            // just "/"
            return finishToken(SyntaxKinds.DivideOperator, "/");
        }
      }
      case UnicodePoints.Dot:
        // '.', '...', 'float-literal'
        return readDotStart();
      /** ==========================================
       *  Keyword, Id, Literal
       *  ==========================================
       */
      case UnicodePoints.Digital0:
      case UnicodePoints.Digital1:
      case UnicodePoints.Digital2:
      case UnicodePoints.Digital3:
      case UnicodePoints.Digital4:
      case UnicodePoints.Digital5:
      case UnicodePoints.Digital6:
      case UnicodePoints.Digital7:
      case UnicodePoints.Digital8:
      case UnicodePoints.Digital9: {
        // Number Literal
        const numberLieral = readNumberLiteral();
        if (isIdentifierNameStart()) {
          throw lexicalError(ErrorMessageMap.babel_error_Identifier_directly_after_number);
        }
        return numberLieral;
      }
      case UnicodePoints.DoubleQuote: {
        // String Literal
        return readStringLiteral("Double");
      }
      case UnicodePoints.SingleQuote: {
        // String Literal
        return readStringLiteral("Single");
      }
      case UnicodePoints.GraveAccent: {
        // Template Literal
        return readTemplateLiteral(SyntaxKinds.TemplateNoSubstitution, SyntaxKinds.TemplateHead);
      }
      case UnicodePoints.PoundSign: {
        eatChar();
        if (!isIdentifierNameStart()) {
          throw lexicalError(ErrorMessageMap.v8_error_invalid_unicode_escape_sequence);
        }
        const word = readWordAsIdentifier();
        return finishToken(SyntaxKinds.PrivateName, word);
      }
      default: {
        if (isIdentifierNameStart()) {
          return readIdentifierOrKeyword();
        }
        throw lexicalError(ErrorMessageMap.v8_error_invalid_unicode_escape_sequence);
      }
    }
  }
  /**
   * Like `readRegex`, this api using when tokenize the jsx children,
   * which is should be tokenize as HTML text util `{` or `<` char.
   * @returns
   */
  function scanInJSXChildrenContext() {
    let isJSXTextExist = false;
    skipWhiteSpaceChangeLine();
    startToken();
    loop: while (!isEOF()) {
      const code = getCharCodePoint();
      switch (code) {
        case undefined:
        case UnicodePoints.BracesLeft:
        case UnicodePoints.LessThen: {
          break loop;
        }
        default: {
          isJSXTextExist = true;
          eatChar();
        }
      }
    }
    if (!isJSXTextExist) {
      return scan();
    }
    return finishToken(SyntaxKinds.JSXText);
  }
  /**
   * Private API, return bool mean is current code
   * char is identifier start or not.
   * @returns {boolean}
   */
  function isIdentifierNameStart(): boolean {
    const code = getCharCodePoint();
    const next = getNextCharCodePoint();
    if (code && next) {
      if (code === UnicodePoints.BackSlash && next === UnicodePoints.LowerCaseU) {
        return true;
      }
    }
    return Boolean(code && isIdentifierStart(code));
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
    switch (getCharCodePoint()) {
      // +=
      case UnicodePoints.Equal:
        eatChar();
        return finishToken(SyntaxKinds.PlusAssignOperator);
      // ++
      case UnicodePoints.Plus:
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
    switch (getCharCodePoint()) {
      // -=
      case UnicodePoints.Equal:
        eatChar();
        return finishToken(SyntaxKinds.MinusAssignOperator);
      // --
      case UnicodePoints.Minus: {
        eatChar();
        return finishToken(SyntaxKinds.DecreOperator);
      }
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
    switch (getCharCodePoint()) {
      // *=
      case UnicodePoints.Equal:
        eatChar();
        return finishToken(SyntaxKinds.MultiplyAssignOperator);
      // **= or **
      case UnicodePoints.Multi: {
        eatChar();
        if (getCharCodePoint() === UnicodePoints.Equal) {
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
    switch (getCharCodePoint()) {
      // %=
      case UnicodePoints.Equal:
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
    if (context.jsx.shouldTokenizeGtWithHigherPriority) {
      return finishToken(SyntaxKinds.GtOperator);
    }
    switch (getCharCodePoint()) {
      case UnicodePoints.GreaterThen: {
        eatChar();
        switch (getCharCodePoint()) {
          case UnicodePoints.GreaterThen: {
            eatChar();
            switch (getCharCodePoint()) {
              case UnicodePoints.Equal:
                // >>>=
                eatChar();
                return finishToken(SyntaxKinds.BitwiseRightShiftFillAssginOperator);
              default:
                // >>>
                return finishToken(SyntaxKinds.BitwiseRightShiftFillOperator);
            }
          }
          case UnicodePoints.Equal:
            // >>=
            eatChar();
            return finishToken(SyntaxKinds.BitwiseRightShiftAssginOperator);
          default:
            // >>
            return finishToken(SyntaxKinds.BitwiseRightShiftOperator);
        }
      }
      case UnicodePoints.Equal:
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
    switch (getCharCodePoint()) {
      case UnicodePoints.LessThen: {
        eatChar();
        switch (getCharCodePoint()) {
          case UnicodePoints.Equal:
            // <<=
            eatChar();
            return finishToken(SyntaxKinds.BitwiseLeftShiftAssginOperator);
          default:
            // <<
            return finishToken(SyntaxKinds.BitwiseLeftShiftOperator);
        }
      }
      case UnicodePoints.Equal:
        // <=
        eatChar();
        return finishToken(SyntaxKinds.LeqtOperator);
      case UnicodePoints.Divide:
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
    switch (getCharCodePoint()) {
      case UnicodePoints.Equal: {
        eatChar();
        switch (getCharCodePoint()) {
          case UnicodePoints.Equal:
            eatChar();
            return finishToken(SyntaxKinds.StrictEqOperator);
          default:
            return finishToken(SyntaxKinds.EqOperator);
        }
      }
      case UnicodePoints.GreaterThen:
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
    switch (getCharCodePoint()) {
      case UnicodePoints.Equal: {
        eatChar();
        switch (getCharCodePoint()) {
          case UnicodePoints.Equal:
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
    switch (getCharCodePoint()) {
      case UnicodePoints.Ampersand: {
        eatChar();
        switch (getCharCodePoint()) {
          case UnicodePoints.Equal:
            eatChar();
            return finishToken(SyntaxKinds.logicalANDAssginOperator);
          default:
            return finishToken(SyntaxKinds.LogicalANDOperator);
        }
      }
      case UnicodePoints.Equal:
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
    switch (getCharCodePoint()) {
      case UnicodePoints.Or: {
        eatChar();
        switch (getCharCodePoint()) {
          case UnicodePoints.Equal:
            eatChar();
            return finishToken(SyntaxKinds.LogicalORAssignOperator);
          default:
            return finishToken(SyntaxKinds.LogicalOROperator);
        }
      }
      case UnicodePoints.Equal:
        eatChar();
        return finishToken(SyntaxKinds.BitwiseORAssginOperator);
      default:
        return finishToken(SyntaxKinds.BitwiseOROperator);
    }
  }
  /**
   * Sub state machine when current char is `?`, read three kind of token:
   * - '?', '?.' '??' `??=`
   * @return {SyntaxKinds}
   */
  function readQuestionStart(): SyntaxKinds {
    eatChar();
    switch (getCharCodePoint()) {
      case UnicodePoints.Dot: {
        const next = getNextCharCodePoint();
        if (next && next >= UnicodePoints.Digital0 && next <= UnicodePoints.Digital9) {
          return finishToken(SyntaxKinds.QustionOperator);
        }
        eatChar();
        return finishToken(SyntaxKinds.QustionDotOperator);
      }
      case UnicodePoints.Question:
        eatChar();
        switch (getCharCodePoint()) {
          case UnicodePoints.Equal: {
            eatChar();
            return finishToken(SyntaxKinds.NullishAssignOperator);
          }
          default: {
            return finishToken(SyntaxKinds.NullishOperator);
          }
        }
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
    switch (getCharCodePoint()) {
      case UnicodePoints.Equal:
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
    switch (getCharCodePoint()) {
      case UnicodePoints.Equal:
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
    switch (getCharCodePoint()) {
      case UnicodePoints.Dot: {
        eatChar();
        if (getCharCodePoint() !== UnicodePoints.Dot) {
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
    eatTwoChar();
    while (!isEOF()) {
      // Saft, since we called under isEOF.
      const code = getCharCodePoint() as number;
      if (isCodePointLineTerminate(code)) {
        break;
      }
      eatChar();
    }
    return;
  }
  function readCommentBlock() {
    // eat /*
    let flag = false;
    eatTwoChar();
    while (!isEOF()) {
      // Saft, since we called under isEOF.
      const code = getCharCodePoint() as number;
      if (isCodePointLineTerminate(code)) {
        eatChangeLine();
        flag = true;
        continue;
      }
      if (code === UnicodePoints.Multi) {
        const next = getNextCharCodePoint();
        if (next === UnicodePoints.Divide) {
          eatTwoChar();
          return flag;
        }
      }
      eatChar();
    }
    // TODO: error message
    throw new Error();
  }
  function readHashTahComment() {
    eatTwoChar(); // eat !#
    while (!isEOF()) {
      // Saft, since we called under isEOF.
      const code = getCharCodePoint() as number;
      if (isCodePointLineTerminate(code)) {
        break;
      }
      eatChar();
    }
    return;
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
    state.semantic.isTemplateLiteralBreakEscapRule = false;
    // eat '`'
    eatChar();
    while (!isEOF()) {
      // safe, since we call it under the isEOF.
      const code = getCharCodePoint() as number;
      switch (code) {
        // $ [lookahead ≠ {] or `${`
        case UnicodePoints.DollarSign: {
          eatChar();
          if (getCharCodePoint() === UnicodePoints.BracesLeft) {
            eatChar();
            context.template.stackCounter.push(1);
            return finishToken(meetMiddle);
          }
          break;
        }
        // ` char
        case UnicodePoints.GraveAccent: {
          eatChar();
          return finishToken(meetEnd);
        }
        // LineTerminatorSequence
        case UnicodePoints.ChangeLine:
        case UnicodePoints.LS:
        case UnicodePoints.PS: {
          eatChangeLine();
          break;
        }
        case UnicodePoints.CR: {
          eatChangeLine();
          const code = getCharCodePoint();
          if (code === UnicodePoints.ChangeLine) {
            eatChar();
          }
          break;
        }
        // \ TemplateEscapeSequence
        // \ NotEscapeSequence
        // LineContinuation (\ LineTerminatorSequence)
        case UnicodePoints.BackSlash: {
          readEscapeSequenceInTemplateLiteral();
          break;
        }
        // SourceCharacter but not one of ` or \ or $ or LineTerminator
        default: {
          eatChar();
        }
      }
    }
    // TODO: error handle
    throw new Error("todo error - not close template head or no subsitude");
  }
  /**
   * Private Helper to read the escap string in Template string.
   * @returns
   */
  function readEscapeSequenceInTemplateLiteral() {
    eatChar(); // eat \
    const code = getCharCodePoint();
    switch (code) {
      // LineContinuation
      case UnicodePoints.ChangeLine:
      case UnicodePoints.LS:
      case UnicodePoints.PS: {
        eatChangeLine();
        break;
      }
      case UnicodePoints.CR: {
        eatChangeLine();
        const code = getCharCodePoint();
        if (code === UnicodePoints.ChangeLine) {
          eatChar();
        }
        break;
      }
      case UnicodePoints.LowerCaseX: {
        eatChar();
        for (let i = 0; i < 2; ++i) {
          state.semantic.isTemplateLiteralBreakEscapRule ||= !isHex();
          eatChar();
        }
        return;
      }
      case UnicodePoints.LowerCaseU: {
        eatChar();
        try {
          readUnicodeEscapeSequence();
        } catch {
          state.semantic.isTemplateLiteralBreakEscapRule = true;
        }
        return;
      }
      // SingleEscapeCharacter
      case UnicodePoints.DoubleQuote:
      case UnicodePoints.SingleQuote: {
        eatChar();
        return;
      }
      case UnicodePoints.Digital0: {
        const next = getNextCharCodePoint();
        if (next) {
          const needTagged = next <= UnicodePoints.Digital9 && next >= UnicodePoints.Digital0;
          eatTwoChar();
          state.semantic.isTemplateLiteralBreakEscapRule = needTagged;
        } else {
          eatChar();
        }
        break;
      }
      // NonEscapeCharacter
      default: {
        if (code && code >= UnicodePoints.Digital1 && code <= UnicodePoints.Digital9) {
          state.semantic.isTemplateLiteralBreakEscapRule = true;
        }
        eatChar();
      }
    }
  }
  //  ===========================================================
  //       Numeric Literal State machine
  //  ===========================================================
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
    const code = getCharCodePoint();
    // Start With 0
    if (code === UnicodePoints.Digital0) {
      eatChar();
      const next = getCharCodePoint();
      switch (next) {
        case UnicodePoints.Digital0:
        case UnicodePoints.Digital1:
        case UnicodePoints.Digital2:
        case UnicodePoints.Digital3:
        case UnicodePoints.Digital4:
        case UnicodePoints.Digital5:
        case UnicodePoints.Digital6:
        case UnicodePoints.Digital7:
        case UnicodePoints.Digital8:
        case UnicodePoints.Digital9: {
          return readLegacyOctNumberLiteralOrNonOctalDecimalIntegerLiteral();
        }
        case UnicodePoints.Dot: {
          eatChar();
          return readDotStartDecimalLiteral();
        }
        case UnicodePoints.LowerCaseB:
        case UnicodePoints.UpperCaseB: {
          eatChar();
          return readNumberLiteralWithBase(
            isBinary,
            SyntaxKinds.BinaryIntegerLiteral,
            SyntaxKinds.BinaryBigIntegerLiteral,
          );
        }
        case UnicodePoints.LowerCaseO:
        case UnicodePoints.UpperCaseO: {
          eatChar();
          return readNumberLiteralWithBase(
            isOct,
            SyntaxKinds.OctalIntegerLiteral,
            SyntaxKinds.OctalBigIntegerLiteral,
          );
        }
        case UnicodePoints.LowerCaseX:
        case UnicodePoints.UpperCaseX: {
          eatChar();
          return readNumberLiteralWithBase(
            isHex,
            SyntaxKinds.HexIntegerLiteral,
            SyntaxKinds.HexBigIntegerLiteral,
          );
        }
        default: {
          if (next !== UnicodePoints.UpperCaseE && next !== UnicodePoints.LowerCaseE) {
            // just 0
            const isBigInt = getCharCodePoint() === UnicodePoints.LowerCaseN;
            if (isBigInt) {
              eatChar();
              return finishToken(SyntaxKinds.DecimalBigIntegerLiteral);
            }
            return finishToken(SyntaxKinds.DecimalLiteral);
          }
        }
      }
    }
    // Start With Non 0
    return readDecimalLiteral();
  }
  /**
   * Private API for reading a Decimal string, caller should
   * checking start with non 0.
   */
  function readDecimalLiteral() {
    // Start With Non 0
    readDigitals();
    let onlyInt = false;
    if (getCharCodePoint() === UnicodePoints.Dot) {
      onlyInt = true;
      eatChar();
      readDigitals();
    }
    const code = getCharCodePoint();
    if (code === UnicodePoints.LowerCaseE || code === UnicodePoints.UpperCaseE) {
      onlyInt = true;
      helperReadExponPartOfDecimalLiteral();
    }
    const isBigInt = getCharCodePoint() === UnicodePoints.LowerCaseN;
    if (isBigInt) {
      eatChar();
      if (onlyInt) {
        throw lexicalError(ErrorMessageMap.babel_error_invalid_bigIntLiteral);
      }
      return finishToken(SyntaxKinds.DecimalBigIntegerLiteral);
    }
    return finishToken(SyntaxKinds.DecimalLiteral);
  }
  function helperReadExponPartOfDecimalLiteral() {
    eatChar(); // eat e/E
    const code = getCharCodePoint();
    if (code === UnicodePoints.Plus || code === UnicodePoints.Minus) {
      eatChar();
    }
    const startIndex = getCurrentIndex();
    readDigitals();
    const exponPart = state.cursor.code.slice(startIndex, state.cursor.pos);
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
    const code = getCharCodePoint();
    if (code === UnicodePoints.LowerCaseE || code === UnicodePoints.UpperCaseE) {
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
      const code = getCharCodePoint() as number;
      if (code === UnicodePoints.Underscore) {
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
      const char = getCharCodePoint();
      switch (char) {
        case UnicodePoints.Digital0:
        case UnicodePoints.Digital1:
        case UnicodePoints.Digital2:
        case UnicodePoints.Digital3:
        case UnicodePoints.Digital4:
        case UnicodePoints.Digital5:
        case UnicodePoints.Digital6:
        case UnicodePoints.Digital7: {
          isLastCharNumeric = true;
          eatChar();
          break;
        }
        case UnicodePoints.Digital8:
        case UnicodePoints.Digital9: {
          isLastCharNumeric = true;
          isNonOctalDecimalIntegerLiteral = true;
          eatChar();
          break;
        }
        case UnicodePoints.Underscore: {
          if (!isLastCharNumeric || !isNonOctalDecimalIntegerLiteral) {
            throw lexicalError(ErrorMessageMap.error_legacy_octal_literals_contain_numeric_seperator);
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
    let haveFloatOrExpon = false;
    if (getCharCodePoint() === UnicodePoints.Dot) {
      haveFloatOrExpon = true;
      eatChar();
      readDigitals();
    }
    const code = getCharCodePoint();
    if (code === UnicodePoints.LowerCaseE || code === UnicodePoints.UpperCaseE) {
      haveFloatOrExpon = true;
      helperReadExponPartOfDecimalLiteral();
    }
    // should error if is legacy oct not have float or expon
    if (!isNonOctalDecimalIntegerLiteral && haveFloatOrExpon) {
      throw lexicalError(ErrorMessageMap.error_legacy_octal_literals_contain_float_or_expon);
    }
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
    const code = getCharCodePoint();
    if (code == undefined) {
      return false;
    }
    return code >= 48 && code <= 57;
  }
  /**
   * Sub state machine helperfor checking is current char
   * is hex number or not, it will also check EOF for us.
   * @returns {boolean}
   */
  function isHex(): boolean {
    const code = getCharCodePoint();
    if (code == undefined) {
      return false;
    }
    return (code >= 48 && code <= 57) || (code >= 97 && code <= 102) || (code >= 65 && code <= 70);
  }
  /**
   * Sub state machine helperfor checking is current char
   * is binary number or not, it will also check EOF for us.
   * @returns {boolean}
   */
  function isBinary(): boolean {
    const code = getCharCodePoint();
    return code === UnicodePoints.Digital0 || code === UnicodePoints.Digital1;
  }
  /**
   * Sub state machine helperfor checking is current char
   * is Oct number or not, it will also check EOF for us.
   * @returns {boolean}
   */
  function isOct(): boolean {
    const code = getCharCodePoint();
    if (code == undefined) {
      return false;
    }
    return code >= 48 && code <= 55;
  }
  /**
   * Sub state machine helper for reading a different base number
   * literal, ECMAscript support
   * @param stopper determinate is current char is eatable.
   * @returns
   */
  function readNumberLiteralWithBase(stopper: () => boolean, IntKind: SyntaxKinds, BigIntKind: SyntaxKinds) {
    let seprator = false;
    let isStart = true;
    const startIndex = getCurrentIndex();
    while (!isEOF()) {
      const code = getCharCodePoint() as number;
      if (code === UnicodePoints.Underscore) {
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
    const isBigInt = getCharCodePoint() === UnicodePoints.LowerCaseN;
    if (isBigInt) {
      eatChar();
      return finishToken(BigIntKind);
    }
    return finishToken(IntKind);
  }
  //  ===========================================================
  //       String Literal State machine
  //  ===========================================================
  /**
   * Sub state machine for reading a string literal, tokenize a string literal
   * with escape char and possible change line.
   * @param mode which char string literal is start with.
   * @returns {SyntaxKinds}
   */
  function readStringLiteral(mode: "Single" | "Double"): SyntaxKinds {
    if (context.jsx.shouldTokenizeStringLiteralAsJSXStringLiteral) {
      return readJSXStringLiteral(mode);
    }
    let isStringLiteralBreakStrictMode = false;
    // eat mode
    const modeInCodepoint = mode === "Single" ? UnicodePoints.SingleQuote : UnicodePoints.DoubleQuote;
    eatChar();
    const indexAfterStartMode = getCurrentIndex();
    loop: while (!isEOF()) {
      const code = getCharCodePoint() as number;
      switch (code) {
        case modeInCodepoint: {
          // eat node outside is because we want to
          // make value not including `"` or `'`
          break loop;
        }
        // for LF and CR.
        case UnicodePoints.ChangeLine:
        case UnicodePoints.CR: {
          throw lexicalError(ErrorMessageMap.error_line_terminator_in_string_literal);
        }
        case UnicodePoints.BackSlash: {
          if (readEscapeSequenceInStringLiteral()) {
            isStringLiteralBreakStrictMode ||= true;
          }
          break;
        }
        default: {
          eatChar();
          break;
        }
      }
    }
    if (isEOF()) {
      throw new Error(ErrorMessageMap.babel_error_unterminated_string_constant);
    }
    if (context.strictMode.isInStrictMode && isStringLiteralBreakStrictMode) {
      throw lexicalError(ErrorMessageMap.syntax_error_Octal_escape_sequences_are_not_allowed_in_strict_mode);
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
  /**
   * Reading escap string in string literal
   * - ecma spec: #prod-EscapeSequence
   * @returns
   */
  function readEscapeSequenceInStringLiteral(): boolean {
    eatChar(); // eat \
    const code = getCharCodePoint();
    switch (code) {
      // LineTerminatorSequence
      case UnicodePoints.ChangeLine:
      case UnicodePoints.LS:
      case UnicodePoints.PS: {
        eatChangeLine();
        break;
      }
      case UnicodePoints.CR: {
        eatChangeLine();
        const code = getCharCodePoint();
        if (code === UnicodePoints.ChangeLine) {
          eatChar();
        }
        break;
      }
      // SingleEscapeCharacter
      case UnicodePoints.DoubleQuote:
      case UnicodePoints.SingleQuote: {
        eatChar();
        return false;
      }
      // HexEscapeSequence
      case UnicodePoints.LowerCaseX: {
        eatChar();
        for (let i = 0; i < 2; ++i) {
          if (isHex()) eatChar();
          else {
            // should error
            throw lexicalError(ErrorMessageMap.v8_error_invalid_hexadecimal_escape_sequence);
          }
        }
        return false;
      }
      // 0 escape
      case UnicodePoints.Digital0: {
        const next = getNextCharCodePoint();
        if (next && !(next >= UnicodePoints.Digital0 && next <= UnicodePoints.Digital9)) {
          eatChar();
          return false;
        }
        // fall to legacy
      }
      // LegacyOctalEscapeSequence
      case UnicodePoints.Digital1:
      case UnicodePoints.Digital2:
      case UnicodePoints.Digital3:
      case UnicodePoints.Digital4:
      case UnicodePoints.Digital5:
      case UnicodePoints.Digital6:
      case UnicodePoints.Digital7: {
        /**
         * The condition could be more simple.
         */
        // 0 [lookahead ∈ { 8, 9 }]
        const next = getNextCharCodePoint();
        if (
          code === UnicodePoints.Digital0 &&
          next &&
          (next === UnicodePoints.Digital8 || next === UnicodePoints.Digital9)
        ) {
          eatChar();
          return true;
        }
        // NonZeroOctalDigit [lookahead ∉ OctalDigit]
        if (
          code > UnicodePoints.Digital0 &&
          code <= UnicodePoints.Digital8 &&
          next &&
          (next > UnicodePoints.Digital7 || next < UnicodePoints.Digital0)
        ) {
          eatChar();
          return true;
        }
        // ZeroToThree OctalDigit [lookahead ∉ OctalDigit]
        // ZeroToThree OctalDigit OctalDigit
        if (code >= UnicodePoints.Digital0 && code <= UnicodePoints.Digital3) {
          if (next && next <= UnicodePoints.Digital7 && next >= UnicodePoints.Digital0) {
            eatTwoChar();
            const nextNext = getCharCodePoint();
            if (nextNext && nextNext <= UnicodePoints.Digital7 && nextNext >= UnicodePoints.Digital0) {
              eatChar();
              return false;
            }
          } else {
            // should error, but actually unreach. since this part if handle
            // by `NonZeroOctalDigit [lookahead ∉ OctalDigit]` or  0 [lookahead ∈ { 8, 9 }]
            // or 0 escape
          }
        }
        // FourToSeven OctalDigit
        if (code >= UnicodePoints.Digital4 && code <= UnicodePoints.Digital7) {
          if (next && next <= UnicodePoints.Digital7 && next >= UnicodePoints.Digital0) {
            eatTwoChar();
            return false;
          } else {
            // should error, but actually unreach. since this part if handle
            // by `NonZeroOctalDigit [lookahead ∉ OctalDigit]`
          }
        }
      }
      // NonOctalDecimalEscapeSequence
      case UnicodePoints.Digital8:
      case UnicodePoints.Digital9: {
        eatChar();
        return true;
      }
      // UnicodeEscapeSequence
      case UnicodePoints.LowerCaseU: {
        eatChar();
        readUnicodeEscapeSequence();
        return false;
      }
      // NonEscapeCharacter
      default: {
        eatChar();
        return false;
      }
    }
    return false;
  }
  /**
   * A JSX string literal and contain change line, and all escap string
   * take as plain text.
   * - JSX spec: #prod-JSXDoubleStringCharacters and #prod-JSXSingleStringCharacters
   * @param mode
   * @returns
   */
  function readJSXStringLiteral(mode: "Single" | "Double") {
    const modeInCodepoint = mode === "Single" ? UnicodePoints.SingleQuote : UnicodePoints.DoubleQuote;
    eatChar();
    const indexAfterStartMode = getCurrentIndex();
    while (!isEOF() && getCharCodePoint() !== modeInCodepoint) {
      eatChar();
    }
    const indexBeforeEndMode = getCurrentIndex();
    eatChar();
    return finishToken(
      SyntaxKinds.StringLiteral,
      getSourceValueByIndex(indexAfterStartMode, indexBeforeEndMode),
    );
  }
  //  ===========================================================
  //       Identifier and Keywrod Sub state mahcine
  //  ===========================================================
  /**
   * Sub state machine for tokenize a identifier or a keyword.
   * @returns {SyntaxKinds}
   */
  function readIdentifierOrKeyword(): SyntaxKinds {
    state.semantic.isKeywordContainUnicodeEscap = false;
    const word = readWordAsIdentifier();
    if (KeywordLiteralSet.has(word)) {
      // @ts-expect-error When word exist in keyword literal set, it must can map to syntaxkind
      const keywordKind = KeywordLiteralMapSyntaxKind[word];
      if (state.semantic.isKeywordContainUnicodeEscap) {
        throw new Error("keyword can not have any escap unicode");
      }
      return finishToken(keywordKind as SyntaxKinds, word);
    }
    return finishToken(SyntaxKinds.Identifier, word);
  }
  function readWordAsIdentifier() {
    let word = "";
    let startIndex = getCurrentIndex();
    while (!isEOF()) {
      const code = getCharCodePoint() as number;
      if (code === UnicodePoints.BackSlash) {
        const next = getNextCharCodePoint();
        if (next === UnicodePoints.LowerCaseU || next === UnicodePoints.UpperCaseU) {
          state.semantic.isKeywordContainUnicodeEscap = true;
          word += getSliceStringFromCode(startIndex, getCurrentIndex());
          eatTwoChar(); // eat \u \U
          const anyUnicodeString = readUnicodeEscapeSequence();
          if (!isIdentifierChar(anyUnicodeString.codePointAt(0) as number)) {
            throw lexicalError(ErrorMessageMap.v8_error_invalid_unicode_escape_sequence);
          }
          word += anyUnicodeString;
          startIndex = getCurrentIndex();
          continue;
        } else {
          throw new Error("Invalud Excap");
        }
      }
      if (!isIdentifierChar(code)) {
        break;
      }
      eatChar();
    }
    word += getSliceStringFromCode(startIndex, getCurrentIndex());
    return word;
  }
  /**
   * ## Read unicode escape seqence
   * Reading a unicode escape string start with `\u` or `\U` char.
   *
   * reference: ECMA spec 12.9.4
   * @returns {string}
   */
  function readUnicodeEscapeSequence(): string {
    const code = getCharCodePoint();
    switch (code) {
      case UnicodePoints.BracesLeft: {
        eatChar();
        const startIndex = getCurrentIndex();
        while (!isEOF()) {
          const code = getCharCodePoint() as number;
          if (code === UnicodePoints.BracesRight) {
            break;
          }
          if (isHex()) {
            eatChar();
          } else {
            throw lexicalError(ErrorMessageMap.v8_error_invalid_unicode_escape_sequence);
          }
        }
        if (isEOF()) {
          throw lexicalError(ErrorMessageMap.v8_error_invalid_unicode_escape_sequence);
        }
        const endIndex = getCurrentIndex();
        eatChar();
        return String.fromCodePoint(
          Number(`0x${getSliceStringFromCode(startIndex, endIndex)}`.replace("_", "")),
        );
      }
      default: {
        const startIndex = getCurrentIndex();
        if (isHex()) {
          eatChar();
          for (let i = 0; i < 3; ++i) {
            if (isHex()) {
              eatChar();
            } else {
              throw lexicalError(ErrorMessageMap.v8_error_invalid_unicode_escape_sequence);
            }
          }
          return String.fromCodePoint(
            Number(`0x${getSliceStringFromCode(startIndex, getCurrentIndex())}`.replace("_", "")),
          );
        }
        throw lexicalError(ErrorMessageMap.v8_error_invalid_unicode_escape_sequence);
      }
    }
  }
}
