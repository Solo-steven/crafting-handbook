import { 
    Expression, 
    FunctionBody, 
    Function as FunctionAST,
    Identifier, 
    ModuleItem, 
    Pattern, 
    PropertyDefinition,
    PropertyName, 
    MethodDefinition,
    TemplateElement, 
    PrivateName,
    ObjectMethodDefinition,
    ClassMethodDefinition,
    ClassElement,
    ClassBody,
    Class,
    VariableDeclaration,
    VariableDeclarator,
    ImportDeclaration,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    RestElement,
    ObjectPattern,
    ArrayPattern,
    StatementListItem,
    Declaration,
    Statement,
    IfStatement,
    SwitchCase,
    LabeledStatement,
    BreakStatement,
    ContinueStatement,
    ReturnStatement,
    WhileStatement,
    DoWhileStatement,
    TryStatement,
    CatchClause,
    BlockStatement,
    WithStatement,
    DebuggerStatement,
    ForStatement,
    ForInStatement,
    ForOfStatement,
    ExportDeclaration,
    ExportAllDeclaration,
    ExportNamedDeclarations,
    ExportSpecifier,
    ExportDefaultDeclaration,
    FunctionDeclaration,
    FunctionExpression,
    ClassDeclaration,
    ClassExpression,
    ObjectAccessor,
    ClassAccessor,
    StringLiteral,
    ClassConstructor,
    ObjectPatternProperty,
    SyntaxKinds ,
    UnaryOperators,
    BinaryOperators,
    AssigmentOperators,
    AssigmentOperatorKinds,
    BinaryOperatorKinds,
    UnaryOperatorKinds,
    UpdateOperators,
    UpdateOperatorKinds,
    Keywords,
    SourcePosition,
    cloneSourcePosition,
    Factory,
    EmptyStatement,
    ObjectExpression,
    ArrayExpression,
    SpreadElement,
    SytaxKindsMapLexicalLiteral,
    AssigmentExpression,
    isRestElement,
    isSpreadElement,
    KeywordLiteralMapSyntaxKind,
    isAssignmentPattern,
    isVarDeclaration,
    RegexLiteral,
    isArrowFunctionExpression,
    isIdentifer,
    isArrayPattern,
    isObjectPattern,
    AssignmentPattern,
    ObjectProperty,
    isMemberExpression,
    LexicalLiteral,
    isAwaitExpression,
    isYieldExpression,
    isObjectPatternProperty,
    ArrorFunctionExpression,
    YieldExpression,
    isCallExpression,
    isAssignmentExpression,
    isStringLiteral,
    ExpressionStatement,
    Program,
    ClassProperty,
    isPattern,
    isUnaryExpression,
    isBinaryExpression,
    JSXElement,
    JSXOpeningElement,
    JSXAttribute,
    JSXSpreadAttribute,
    JSXIdentifier,
    JSXNamespacedName,
    JSXFragment,
    JSXMemberExpression,
    JSXText,
    JSXExpressionContainer,
    JSXSpreadChild,
    JSXClosingElement,
} from "ecmakit-jscommon";
import { ErrorMessageMap } from "./error";
import { createLexer } from "../lexer/index";

/**
 * Function Scope structure, Being used for determinate
 * current structure context for async, generator, in-
 * parameter and in strict mode.
 * @member {"FunctionContext"} type - type enum string.
 * @member {boolean} isAsync
 * @member {boolean} isGenerator
 * @member {boolean} inParameter
 * @member {boolean} inStrict
 */
interface FunctionContext {
    type: "FunctionContext";
    isAsync: boolean;
    isGenerator: boolean;
    inParameter: boolean;
    isSimpleParameter: boolean;
    inStrict: boolean;
}
/**
 * Simple scope structure for block statement.
 * @member {"BlockStatement"} type - type enum string.
 */
interface BlockContext {
    type: "BlockContext";
}
/**
 * Scope structure for function body and block statement,
 * just a conbinmation of function scope and block scope.
 */
type ScopeContext = FunctionContext | BlockContext;

/**
 * Context for parser. composeed by several parts: 
 * ## ScopeContext
 * scope context contain context when enter the function or block statement,
 * we need function scope to determinate parse rule of await and yield keyword.
 * and only the direct child of function scope can using `use strict` directive.
 * 
 * ## ClassContext
 * class context indicate current class state (is in class ?, have extend class ?)
 * - used by checking super call validate (must in class block and have extend class)
 * - used by checking private name in expression is validate (must in class block).
 * 
 * please notes that method and property can not use private name have already been check, because 
 * by which call `parseMethodDefinition`, we can know is in class or object.
 * when class `parseClass` must wrap helper function before and after parse class body.
 * 
 * ## InOperatorStack
 * when parse for-in statement, we need to ignore `in` operator to seperate left and right
 * expression of for-in statement, so we need to know is current expression level is call by 
 * for-in statement, and expression level is determinate by `parseExpression` and 
 * `parseAssignmentExpression` function.
 * 
 * ## PropertiesInitSet
 * when parse ObjectExpression, we may accept coverInit for transform to ObjectPattern,
 * because coverInit is not a illegal syntax of ObjectExpression, so it must be transform.
 * so when program finish parse, but there are still some coverInitProperty not transformed
 * yet, those would be error syntax.
 * 
 * @member {boolean} maybeArrow
 * @member {Array<ScopeContext>} scopeContext
 * @member {Array<boolean>} inOperatorStack
 * @member {Set<any>} propertiesInitSet
 */
interface Context {
    maybeArrow: boolean;
    scopeContext: Array<ScopeContext>;
    classContext: Array<[boolean]>,
    inOperatorStack: Array<boolean>,
    propertiesInitSet: Set<any>;
}

interface ASTArrayWithMetaData<T> {
    nodes: Array<T>;
    start: SourcePosition;
    end: SourcePosition;
}
/**
 * Create context for parser
 * @returns {Context}
 */
function createContext(): Context {
    return {
        scopeContext: [],
        classContext: [],
        maybeArrow: false,
        inOperatorStack: [],
        propertiesInitSet: new Set(),
    }
}

const IdentiferWithKeyworArray = [SyntaxKinds.Identifier, ...Keywords];
const BindingIdentifierSyntaxKindArray = [SyntaxKinds.Identifier, SyntaxKinds.AwaitKeyword, SyntaxKinds.YieldKeyword, SyntaxKinds.LetKeyword];
const PreserveWordSet = new Set(LexicalLiteral.preserveword);
const KeywordSet = new Set(LexicalLiteral.keywords);
/**
 * create parser for input code.
 * @param {string} code 
 * @returns
 */
export function createParser(code: string) {
    const lexer = createLexer(code);

/** =========================================================================
 *   Composition method from lexer, Context of parsr, Util helper for parser
 * ==========================================================================
 */
    const context = createContext();
    /**
     * parse given string and return program if code is
     * valid syntax.
     * @returns {Program}
     */
    function parse(): Program {
        return parseProgram();
    }
    return { parse };
    /**
     * Is current token match given kind
     * @param {SyntaxKinds} kind
     * @returns {boolean}
     */
    function match(kind: SyntaxKinds): boolean {
        return lexer.getToken() === kind;
    }
    /**
     * Is current token match any of given kinds
     * @param {Array<SyntaxKinds>} kinds 
     * @returns {boolean}
     */
    function matchSet(kinds: SyntaxKinds[]): boolean {
        const result = kinds.find(value => match(value));
        if(result) {
            return result > 0;
        }
        return false;
    }
    /**
     * Move to next token and return next token
     * @returns {SyntaxKinds}
     */
    function nextToken(): SyntaxKinds {
        const token = lexer.nextToken();
        if(token === SyntaxKinds.Comment || token == SyntaxKinds.BlockComment) {
           return nextToken();
        }
        return token;
    }
    /**
     * Get current token in token stream
     * @returns {SyntaxKinds}
     */
    function getToken(): SyntaxKinds {
       const token = lexer.getToken();
       if(token === SyntaxKinds.Comment || token == SyntaxKinds.BlockComment) {
            return nextToken();
        }
        return token;
    }
    /**
     * Get string value of current token
     * @returns {string}
     */
    function getValue(): string {
        return lexer.getSourceValue();
    }
    /**
     * Get start position of token
     * @return {SourcePosition}
     */
    function getStartPosition(): SourcePosition {
        return lexer.getStartPosition();
    }
    /**
     * Get End position of token
     * @return {SourcePosition}
     */
    function getEndPosition(): SourcePosition {
        return lexer.getEndPosition();
    }
    /**
     * Get next token but do not move to next token
     */
    function lookahead() {
        return lexer.lookahead();
    }
    function readRegex() {
        return lexer.readRegex();
    }
    function getLineTerminatorFlag() {
        return lexer.getLineTerminatorFlag();
    }
    /**
     * expect a token kind, if it is, return token,
     * and move to next token
     */
    function expect(kind: SyntaxKinds | Array<SyntaxKinds>, message = "")  {
        if(Array.isArray(kind)) {
            if(matchSet(kind)) {
                const metaData = {
                    value: getValue(),
                    start: getStartPosition(),
                    end: getEndPosition()
                }
                nextToken();
                return metaData;
            }
            throw createUnexpectError(kind, message);
        }
        if(match(kind)) {
            const metaData = {
                value: getValue(),
                start: getStartPosition(),
                end: getEndPosition()
            }
            nextToken();
            return metaData;
        }
        throw createUnexpectError(kind, message);
    }
    function expectButNotEat(kind: SyntaxKinds | Array<SyntaxKinds>, message = "") {
        if(Array.isArray(kind)) {
            if(matchSet(kind)) {
                return;
            }
            throw createUnexpectError(kind, message);
        }
        if(match(kind)) {
            return;
        }
        throw createUnexpectError(kind, message);
    }
    /**
     * Some AST maybe end up with semi or line terminate or EOF
     * so you can call this function for checking.
     * it need lexer help for check EOF and line terminate.
     * @param {boolean} canIgnore this flag is only used when dowhile case.
     */
    function semi(canIgnore: boolean = false, shouldEat = true) {
        if(match(SyntaxKinds.SemiPunctuator)) {
            if(shouldEat){
                nextToken();
            }
            return true;
        }
        if(match(SyntaxKinds.BracesRightPunctuator)) {
            return true;
        }
        if(lexer.getLineTerminatorFlag()) {
            return true;
        }
        if(match(SyntaxKinds.EOFToken)) {
            return true;
        }
        if(canIgnore) {
            return false;
        }
        throw createMessageError(ErrorMessageMap.missing_semicolon);
    }
    /**
     * Create a Message error from parser's error map.
     * @param {string} messsage 
     */
    function createMessageError(messsage: string, position?: SourcePosition) {
        if(position === undefined)
            position = getStartPosition();
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return new Error(`[Syntax Error]: ${messsage} (${position.row}, ${position.col}), got token ${SytaxKindsMapLexicalLiteral[getToken()]}.\n ${code.slice(getStartPosition().index - 100, getStartPosition().index)} \n ${code.slice(getStartPosition().index, getEndPosition().index)}`);
    }
    /**
     * Create a error object with message tell developer that get a 
     * unexpect token.
     * @param {SyntaxKinds} expectToken 
     * @param {string?} messsage 
     * @returns {Error}
     */
    function createUnexpectError(expectToken: SyntaxKinds | Array<SyntaxKinds> | null , messsage: string | null = ""): Error {
        let message = "";
        if(Array.isArray(expectToken)) {
            message += ", expect token ["
            for(const token of expectToken) {
                message += `${token}, `;
            }
            message += `]`
        }
        if(expectToken) {
            message = `, expect token ${expectToken}`
        }
        return new Error(`[Syntax Error]: Unexpect token${message}, got ${getToken()}(${getValue()}). ${getStartPosition().row},${getStartPosition().col}.${messsage}\n ${code.slice(getStartPosition().index - 100, getStartPosition().index)} \n ${code.slice(getStartPosition().index, getEndPosition().index)}`);
    }
    /**
     * Given that this parser is recurive decent parser, some
     * function must call with some start token, if function call
     * with unexecpt start token, it should throw this error.
     * @param {Array<SyntaxKinds>} startTokens
     * @returns {Error}
     */
    function createUnreachError(startTokens: Array<SyntaxKinds> = []): Error {
        let start = getStartPosition();
        let message = `[Unreach Zone]: this piece of code should not be reach (${start.row}, ${start.col}), have a unexpect token ${getToken()} (${getValue()}).`;
        if(startTokens.length !== 0) {
                message += " it should call with start token["
                for(const token of startTokens) {
                    message += `${token}, `;
                }
                message += "]"
        }
        message += ", please report to developer.";
        return new Error(message);
    }
/** =================================================
 *    Context Helper
 *  =================================================
 */
    /**
     * Helper function called when enter function scope. when parse
     * - function delcaration or expression.
     * - arrow function.
     * - method of class or object.
     * 
     * need to call this function and give this flag of is this function
     * a async or generator
     * @param {boolean} isAsync 
     * @param {boolean} isGenerator 
     */
    function enterFunctionScope(isAsync: boolean = false, isGenerator: boolean = false) {
        const lastScope = helperFindLastFunctionContext();
        context.scopeContext.push({
            type: "FunctionContext",
            isAsync,
            isGenerator,
            inParameter: false,
            inStrict: lastScope ? lastScope.inStrict : false,
            isSimpleParameter: true,
        })
    }
    /**
     * Helper function for exit the function scope;
     */
    function exitFunctionScope() {
        context.scopeContext.pop();
    }
    /**
     * Helper function when enter this block scope.
     * this function only called when `parseBlockStatement`.
     */
    function enterBlockScope() {
        context.scopeContext.push({ type: "BlockContext" });
    }
    /**
     * Helper function when exiting block scope
     * this function only called when `parseBlokcStatement`
     */
    function exitBlockScope() {
        context.scopeContext.pop();
    }
    /**
     * Helper function for other context helper function to get this closest
     * function scope structure in scopeContext.
     * @returns {FunctionContext | undefined}
     */
    function helperFindLastFunctionContext(): FunctionContext| undefined {
        for(let index = context.scopeContext.length - 1 ; index >= 0 ; --index) {
            const scopeContext = context.scopeContext[index];
            if(scopeContext.type === "FunctionContext") {
                return scopeContext;
            }
        }
    }
    /**
     * Helper function for getting is parser in current function parameter.
     * we need this because event in async or generator function, we can not 
     * call await and yield expression in function parameter list. so we need
     * this function to perform side effect to mark current function context 
     * as we are parsing function parameter.
     */
    function enterFunctionParameter() {
        const scope = helperFindLastFunctionContext();
        if(scope) {
            scope.inParameter = true;
        }
    }
    function existFunctionParameter() {
        const scope = helperFindLastFunctionContext();
        if(scope) {
            scope.inParameter = false;
        }
    }
    function setCurrentFunctionContextAsGenerator() {
        const scope = helperFindLastFunctionContext();
        if(scope) {
            scope.isGenerator = true;
        }
    }
    function setCurrentFunctionContextAsStrictMode() {
        const scope = helperFindLastFunctionContext();
        if(scope) {
            scope.inStrict = true;
        }
    }
    function getCurrentInOperatorStack() {
        if(context.inOperatorStack.length === 0) {
            return false;
        }
        return context.inOperatorStack[context.inOperatorStack.length-1];
    }
    function isTopLevel() {
        const scope = helperFindLastFunctionContext();
        return scope === context.scopeContext[0];
    }
    function isCurrentFunctionAsync(): boolean {
        const scope = helperFindLastFunctionContext();
        if(scope) {
            return scope.isAsync;
        }
        return false;
    }
    function isInParameter(): boolean {
        const scope = helperFindLastFunctionContext();
        if(scope) {
            return scope.inParameter
        }
        return false;
    }
    function helperFindParentScope(): FunctionContext | undefined {
        let flag = false;
        for(let index = context.scopeContext.length - 1 ; index >= 0 ; --index) {
            const scopeContext = context.scopeContext[index];
            if(scopeContext.type === "FunctionContext") {
                if(flag) {
                    return scopeContext;
                }else {
                    flag = true
                }
            }
        }
    }
    function isParentFunctionAsync(): boolean {
        const parentScope = helperFindParentScope();
        if(parentScope) {
            return parentScope.isAsync;
        }
        return false;
    }
    function isParentFunctionGenerator(): boolean {
        const parentScope = helperFindParentScope();
        if(parentScope) {
            return parentScope.isGenerator
        }
        return false;
    }
    function isCurrentFunctionGenerator() {
        const scope = helperFindLastFunctionContext();
        if(scope) {
            return scope.isGenerator;
        }
        return false;
    }
    function enterClassScope(isExtend: boolean = false) {
        context.classContext.push([isExtend]);
    }
    function existClassScope() {
        context.classContext.pop();
    }
    function isInClassScope() {
        return context.classContext.length > 0;
    }
    function isCurrentClassExtend() {
        if(context.classContext.length === 0) {
            return false;
        }
        return context.classContext[context.classContext.length -1][0];
    }
    /**
     * Helper function for getting is current function scope is in strict mode,
     * according to ECMA spec, in class declaration and class expression, is
     * always strict mode.
     * @returns {boolean}
     */
    function isInStrictMode(): boolean {
        if(isInClassScope()) {
            return true;
        }
        const scope = helperFindLastFunctionContext();
        if(scope) {
            return scope.inStrict;
        }
        return false;
    }
    /**
     * Helper function only used by `checkStrictMode`, because
     * "use strict" directive only meansful when `ExpressionStatement`
     * is directive to function context, so we need is current 
     * `ExpressionStatement` is in functionContext or not.
     * @returns {boolean}
     */
    function isDirectToFunctionContext(): boolean {
        return context.scopeContext[context.scopeContext.length-1].type === "FunctionContext";
    }
    function setCurrentFunctionParameterListAsNonSimple() {
        const scope = helperFindLastFunctionContext();
        if(scope) {
            scope.isSimpleParameter = false;
        }
    }
    function isCurrentFunctionParameterListSimple() {
        const scope = helperFindLastFunctionContext();
        if(scope) {
            return scope.isSimpleParameter;
        }
        return false;
    }

/** ==================================================
 *  Top level parse function 
 *  ==================================================
 */
    function parseProgram() {
        const body: Array<ModuleItem> = [];
        enterFunctionScope();
        while(!match(SyntaxKinds.EOFToken)) {
            body.push(parseModuleItem());
        }
        if(context.propertiesInitSet.size > 0) {
            throw new Error();
        }
        exitFunctionScope();
        return Factory.createProgram(body, body.length === 0 ? getStartPosition() : cloneSourcePosition(body[0].start), getEndPosition());
    }
    function parseModuleItem(): ModuleItem {
        const token = getToken();
        switch(token) {
            case SyntaxKinds.ImportKeyword:
                const {kind} = lookahead();
                if(kind === SyntaxKinds.DotOperator || kind === SyntaxKinds.ParenthesesLeftPunctuator) {
                    return parseStatementListItem();
                }
                return parseImportDeclaration();
            case SyntaxKinds.ExportKeyword:
                return parseExportDeclaration();
            default:
                return parseStatementListItem();
        }
    }
    function parseStatementListItem(): StatementListItem {
        const token = getToken();
        switch(token) {
            // 'aync' maybe is
            // 1. aync function  -> declaration
            // 2. aync arrow function -> statement(expressionStatement)
            // 3. identifer -> statement (expressionStatement)
            case SyntaxKinds.ConstKeyword:
            case SyntaxKinds.FunctionKeyword: 
            case SyntaxKinds.ClassKeyword:
                return parseDeclaration();
            case SyntaxKinds.Identifier:
                const { kind, flag } = lookahead();
                if(getValue() === "async" && kind === SyntaxKinds.FunctionKeyword && flag == false) {
                    return parseDeclaration();
                }
                return parseStatement();
            case SyntaxKinds.LetKeyword:
                if(isLetPossibleIdentifier()) {
                    return parseStatement();
                }
                return parseDeclaration();
            default:
                return parseStatement();
        }
    }
    function isLetPossibleIdentifier() {
        const { kind:kind } = lookahead();
        if(
            kind === SyntaxKinds.BracesLeftPunctuator || // object pattern
            kind === SyntaxKinds.BracketLeftPunctuator || // array pattern
            kind === SyntaxKinds.Identifier   || // id
            kind === SyntaxKinds.AwaitKeyword ||
            kind === SyntaxKinds.YieldKeyword 
        ) {
            return false;
        }
        return true;
    }
    /**
     * Parse Declaration
     * 
     * ```
     *  Declaration := ('let' | 'const') BindingLst
     *              := FunctionDeclaration
     *              := FunctionGeneratorDeclaration
     *              := 'async' FunctionDeclaration
     *              := 'async' FunctionGeneratorDeclaration
     *              := ClassDeclaration
     * ```
     * when call parseDeclaration, please make sure currentToken is
     * - `let` or `const` keyword
     * - `function` keyword
     * - `class` keyword
     * - `async` with `function` keyword 
     * 
     * ref: https://tc39.es/ecma262/#prod-Declaration
     * @returns 
     */
    function parseDeclaration(): Declaration {
        const token = getToken();
        switch(token) {
            // async function declaration
            case SyntaxKinds.Identifier:
                if(match(SyntaxKinds.Identifier) && getValue() === "async") {
                    nextToken();
                    if(getLineTerminatorFlag()) {
                        throw createMessageError(ErrorMessageMap.missing_semicolon);
                    }
                    return parseFunctionDeclaration(true);
                } else {
                   throw createUnreachError();
                }
            // function delcaration
            case SyntaxKinds.FunctionKeyword: 
                const functionExpr = parseFunctionDeclaration(false);
                return functionExpr;
            case SyntaxKinds.ConstKeyword:
            case SyntaxKinds.LetKeyword:
                return parseVariableDeclaration();
            case SyntaxKinds.ClassKeyword:
                return parseClassDeclaration();
            default:
                throw createUnreachError([SyntaxKinds.ClassKeyword, SyntaxKinds.FunctionKeyword, SyntaxKinds.LetKeyword, SyntaxKinds.ConstKeyword]);
        }
    }
    /**
     * ref: https://tc39.es/ecma262/#prod-Statement
     */
    function parseStatement(): Statement {
        const token = getToken();
        switch(token) {
            case SyntaxKinds.SwitchKeyword:
                return parseSwitchStatement();
            case SyntaxKinds.ContinueKeyword:
                return parseContinueStatement();
            case SyntaxKinds.BreakKeyword:
                return parseBreakStatement();
            case SyntaxKinds.ReturnKeyword:
                return parseReturnStatement();
            case SyntaxKinds.BracesLeftPunctuator:
                return parseBlockStatement();
            case SyntaxKinds.TryKeyword:
                return parseTryStatement();
            case SyntaxKinds.ThrowKeyword:
                return parseThrowStatement();
            case SyntaxKinds.WithKeyword:
                return parseWithStatement();
            case SyntaxKinds.DebuggerKeyword:
                return parseDebuggerStatement();
            case SyntaxKinds.SemiPunctuator:
                return parseEmptyStatement();
            case SyntaxKinds.IfKeyword:
                return parseIfStatement();
            case SyntaxKinds.ForKeyword:
                return  parseForStatement();
            case SyntaxKinds.WhileKeyword:
                return parseWhileStatement();
            case SyntaxKinds.DoKeyword:
                return parseDoWhileStatement();
            case SyntaxKinds.VarKeyword:
                return parseVariableDeclaration();
            default:
                if(match(SyntaxKinds.Identifier)  && lookahead().kind === SyntaxKinds.ColonPunctuator ) {
                    return parseLabeledStatement();
                }
                return parseExpressionStatement();
        }
    }
/** =================================================================
 * Parse Statement
 * entry point reference: https://tc39.es/ecma262/#prod-Statement
 * ==================================================================
 */
    /**
     * This is a critial helper function for transform expression (major is ObjectExpression
     * and ArrayExpression) to Pattern (`BindingObjectPattern`, `BindingArrayPattern`, `AssignmentObjectPattern`
     * `AssignmentArrayPattern`).
     * 
     * ### Use Case : ParseAssignmentExpression
     * This function is used when `parseAssignmentExpression`, because parseAssignmentExpression 
     * would parse left as expression first, when left is followed by assignment operator, we need
     * to transform expression to AssignmentPattern.
     * 
     * ### Use Case : ParseArrowFunctionExpression 
     * When `parseArrowFunctionExpression`, it would use this function too. Because `parseArrowFunctionExpresssion`
     * might accept argument (array of `AssignmentExpression`) as param, so we need to transform arguments to function
     * parameter, which is transform `AssignmenExpression` to `BiningElement`(`Identifier` or `BindingPattern`).
     * 
     * ### Paramemter: isBinding
     * Most of BindingPattern and AssignmentPattern's production rule is alike, one key different is that BindingPattern 
     * `PropertyName` can only have `BindingElement`, but `PropertyName` of AssignmentPattern can have LeftHandSideExpression
     * so we add a param `isBinding` to determinate is transform to BindingPattern or not.
     * @param {ModuleItem} node target for transform to Pattern
     * @param {boolean} isBinding Is transform to BindingPattern
     */
    function toAssignmentPattern(node: ModuleItem, isBinding: boolean = false): ModuleItem {
        switch(node.kind) {
            case SyntaxKinds.Identifier:
            case SyntaxKinds.MemberExpression:
            case SyntaxKinds.AssignmentPattern:
            case SyntaxKinds.ArrayPattern:
            case SyntaxKinds.ObjectPattern:
                return node;
            case SyntaxKinds.AssigmentExpression: {
                const assignmentExpressionNode = node as AssigmentExpression;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const left = toAssignmentPattern(assignmentExpressionNode.left, isBinding);
                if(assignmentExpressionNode.operator !== SyntaxKinds.AssginOperator) {
                    throw createMessageError(ErrorMessageMap.assigment_pattern_only_can_use_assigment_operator);
                }
                return Factory.createAssignmentPattern(left as Pattern, assignmentExpressionNode.right, node.start, node.end);
            }
            case SyntaxKinds.SpreadElement: {
                const spreadElementNode = node as SpreadElement;
                return Factory.createRestElement(toAssignmentPattern(spreadElementNode.argument) as Pattern, spreadElementNode.start, spreadElementNode.end);
            }
            case SyntaxKinds.ArrayExpression: {
                const arrayExpressionNode = node as ArrayExpression;
                const elements: Array<ModuleItem | null> = [];
                for(let index = 0 ; index < arrayExpressionNode.elements.length; ++index) {
                    const element = arrayExpressionNode.elements[index];
                    if(element === null) {
                        elements.push(element);
                        continue;
                    }
                    const transformElement = toAssignmentPattern(element, isBinding);
                    if(isRestElement(transformElement)) {
                        if(index !== arrayExpressionNode.elements.length -1 || arrayExpressionNode.trailingComma) {
                            throw createMessageError(ErrorMessageMap.rest_element_can_not_end_with_comma);
                        }
                    }
                    elements.push(transformElement);
                }
                return Factory.createArrayPattern(elements as Array<Pattern>, arrayExpressionNode.start, arrayExpressionNode.end);
            }
            case SyntaxKinds.ObjectExpression: {
                const objecExpressionNode = node as ObjectExpression;
                const properties: Array<ModuleItem> = [];
                for(let index = 0 ; index < objecExpressionNode.properties.length; ++index) {
                    const property = objecExpressionNode.properties[index];
                    const transformElement = toAssignmentPattern(property, isBinding);
                    if(isRestElement(transformElement) && (isObjectPattern(transformElement.argument) || isArrayPattern(transformElement.argument))) {
                        throw createMessageError(ErrorMessageMap.invalid_rest_element_with_pattern_in_object_pattern);
                    }
                    if(isRestElement(transformElement)) {
                        if(index !== objecExpressionNode.properties.length - 1 || objecExpressionNode.trailingComma) {
                            throw createMessageError(ErrorMessageMap.rest_element_can_not_end_with_comma);
                        }
                    }
                    properties.push(transformElement);
                }
                return Factory.createObjectPattern(properties as Array<ObjectPatternProperty>, objecExpressionNode.start, objecExpressionNode.end);
            }
            case SyntaxKinds.ObjectProperty: {
                const objectPropertyNode = node as ObjectProperty
                if( isBinding && objectPropertyNode.value && isMemberExpression(objectPropertyNode.value)) {
                    throw new Error(ErrorMessageMap.binding_pattern_can_not_have_member_expression);
                }
                if(context.propertiesInitSet.has(objectPropertyNode) && !objectPropertyNode.shorted) {
                    context.propertiesInitSet.delete(objectPropertyNode);
                    if(objectPropertyNode.computed || !isIdentifer(objectPropertyNode.key)) {
                        // property name of assignment pattern can not use computed propertyname or literal
                        throw createMessageError(ErrorMessageMap.assignment_pattern_left_value_can_only_be_idenifier_or_pattern);
                    }
                    return Factory.createAssignmentPattern(
                        objectPropertyNode.key,
                        objectPropertyNode.value as Expression,
                        objectPropertyNode.start,
                        objectPropertyNode.end,
                    )
                }
                return Factory.createObjectPatternProperty(
                    objectPropertyNode.key, 
                    !objectPropertyNode.value  ? objectPropertyNode.value : toAssignmentPattern(objectPropertyNode.value as ModuleItem) as unknown as any, 
                    objectPropertyNode.computed, 
                    objectPropertyNode.shorted, objectPropertyNode.start, objectPropertyNode.end
                );
            }
            default:
                throw createMessageError(ErrorMessageMap.invalid_left_value + ` get kind ${node.kind}.`);
        }
    }
    /**
     * Parse For-related Statement, include ForStatement, ForInStatement, ForOfStatement.
     * 
     * This function is pretty complex and hard to understand, some function's flag is only
     * used in this function. ex: allowIn flag of parseExpression, parseAssignmentExpression,
     * ignoreInit of parseVariableDeclaration.
     * @returns {ForStatement | ForInStatement | ForOfStatement}
     */
   function parseForStatement(): ForStatement | ForInStatement | ForOfStatement {
        const { start: keywordStart }  = expect(SyntaxKinds.ForKeyword);
        // First, parse await modifier and lefthandside or init of for-related statement,
        // init might start with let, const, var keyword, but if is let keyword need to 
        // lookahead to determinate is identifier.
        // delcaration in there should not eat semi, becuase semi is seperator of ForStatement, 
        // and might not need init for pattern, because maybe used by ForIn or ForOf. 
        // If not start with let, var or const keyword, it should be expression, but this
        // expression can not take `in` operator as operator in toplevel, so we need pass
        // false to disallow parseExpression to take in  as operator
        let isAwait = false, leftOrInit: VariableDeclaration | Expression | null = null;
        if(match(SyntaxKinds.AwaitKeyword)) {
            nextToken();
            if(!isCurrentFunctionAsync()) {
                throw createMessageError(ErrorMessageMap.await_can_not_call_if_not_in_async);
            }
            isAwait = true;
        }
        expect(SyntaxKinds.ParenthesesLeftPunctuator);
        if(matchSet([SyntaxKinds.LetKeyword, SyntaxKinds.ConstKeyword, SyntaxKinds.VarKeyword])) {
            if(match(SyntaxKinds.LetKeyword) && isLetPossibleIdentifier()) {
                leftOrInit = parseExpression(false);
            }else {
                leftOrInit = parseVariableDeclaration(true);
            }
        }else if (match(SyntaxKinds.SemiPunctuator)) {
            // for test case `for(;;)`
            leftOrInit = null;
        }else {
            leftOrInit = parseExpression(false);
        }
        // Second is branching part, determinate the branch by following token
        // - if start with semi it should be ForStatement, 
        // - if is in operator, it should be ForInStatement, 
        // - if is of contextual keyword, it should be ForOfStatement.
        // then according to branch case, parse the following part and do the 
        // sematic check.
        // - ForStatement: if init is variable declaration pattern, it need init.
        // - ForInStatement: if left is variable decalration, must not have init, and delcaration length must be 1.
        //                   then if left is expression, must transform it to pattern.
        // - ForOfStatement: same as ForInStatement.
        // There is one case that even we disallow in operator in top level, there maybe
        // wrong init of expression like `for(a = 0 in []);` or `for(a=0 of [])` which would
        // make leftOrInit parse all token in () as a expression, so we need to check if those
        // case happend.
        if(match(SyntaxKinds.SemiPunctuator)) {
            if(leftOrInit && isVarDeclaration(leftOrInit)) {
                for(const delcar of leftOrInit.declarations) {
                    if(
                        (isArrayPattern(delcar.id) || isObjectPattern(delcar.id)) &&
                        !delcar.init
                    ) {
                        throw createMessageError(ErrorMessageMap.destructing_pattern_must_need_initializer);
                    }
                }
            }
            nextToken();
            let test: Expression | null = null, update: Expression | null = null;
            if(!match(SyntaxKinds.SemiPunctuator)) {
                test = parseExpression();
            }
            expect(SyntaxKinds.SemiPunctuator);
            if(!match(SyntaxKinds.ParenthesesRightPunctuator)) {
                update = parseExpression();
            }
            expect(SyntaxKinds.ParenthesesRightPunctuator)
            const body = parseStatement();
            return Factory.createForStatement(body, leftOrInit, test, update, keywordStart, cloneSourcePosition(body.end));
        }
        // unreach case, even if syntax error, when leftOrInit, it must match semi token.
        // and because it match semi token, if would enter forStatement case, will not
        // reach there. even syntax error, error would be throw at parseExpression or
        // parseDeclaration.
        if(!leftOrInit) {
            throw createUnreachError();
        }
        // for case `for(a = 0 of [])`; leftOrInit would parse all token before `of` as one expression
        // in this case , leftOrInit would be a assignment expression, and when it pass to toAssignment
        // function, it would transform to assignment pattern, so we need to checko if there is Assignment
        // pattern, it is , means original is assignment expression, it should throw a error.
        if(isVarDeclaration(leftOrInit)) {
            helperCheckDeclarationmaybeForInOrForOfStatement(leftOrInit);
        }else {
            leftOrInit = toAssignmentPattern(leftOrInit) as Expression;
            if(isAssignmentPattern(leftOrInit)) {
                throw createMessageError(ErrorMessageMap.invalid_left_value);
            }
        }
        if (match(SyntaxKinds.InKeyword)) {
            nextToken();
            const right = parseExpression();
            expect(SyntaxKinds.ParenthesesRightPunctuator);
            const body = parseStatement();
            return Factory.createForInStatement(leftOrInit, right, body, keywordStart, cloneSourcePosition(body.end));
        }
        if(getValue() === "of") {
            nextToken();
            const right = parseAssigmentExpression();
            expect(SyntaxKinds.ParenthesesRightPunctuator);
            const body = parseStatement();
            return Factory.createForOfStatement(isAwait, leftOrInit, right, body, keywordStart, cloneSourcePosition(body.end));
        }
        throw createUnexpectError(null);
   }
   /**
    * Helper function for check sematic error of VariableDeclaration of ForInStatement and ForOfStatement,
    * please reference to comment in parseForStatement.
    * @param {VariableDeclaration} declaration 
    */
   function helperCheckDeclarationmaybeForInOrForOfStatement(declaration: VariableDeclaration) {
        if(declaration.declarations.length > 1) {
            throw createMessageError(ErrorMessageMap.for_in_of_loop_can_not_have_one_more_binding);
        }
        if(declaration.declarations[0].init !== null) {
            throw createMessageError(ErrorMessageMap.for_in_of_loop_can_not_using_initializer);
        }
    }
   function parseIfStatement(): IfStatement {
      const {start: keywordStart} = expect(SyntaxKinds.IfKeyword);
      expect(SyntaxKinds.ParenthesesLeftPunctuator);
      const test = parseExpression();
      expect(SyntaxKinds.ParenthesesRightPunctuator);
      const consequnce = parseStatement();
      if(match(SyntaxKinds.ElseKeyword)) {
        nextToken();
        const alter = parseStatement();
        return Factory.createIfStatement(test, consequnce, alter, keywordStart, cloneSourcePosition(alter.end));
      }
      return Factory.createIfStatement(test, consequnce, null, keywordStart, cloneSourcePosition(consequnce.end));
   }
   function parseWhileStatement(): WhileStatement {
        const { start: keywordStart } = expect(SyntaxKinds.WhileKeyword);
        expect(SyntaxKinds.ParenthesesLeftPunctuator);
        const test = parseExpression();
        expect(SyntaxKinds.ParenthesesRightPunctuator);
        const body = parseStatement();
        return Factory.createWhileStatement(test, body, keywordStart, cloneSourcePosition(body.end));
    }
    function parseDoWhileStatement(): DoWhileStatement {
        const { start: keywordStart } =  expect(SyntaxKinds.DoKeyword);
        const body = parseStatement();
        expect(SyntaxKinds.WhileKeyword, "do while statement should has while condition");
        expect(SyntaxKinds.ParenthesesLeftPunctuator);
        const test = parseExpression();
        const { end: punctEnd } =  expect(SyntaxKinds.ParenthesesRightPunctuator);
        semi(true);
        return Factory.createDoWhileStatement(test, body, keywordStart, punctEnd);
    }
   function parseBlockStatement() {
        const { start: puncStart } =  expect(SyntaxKinds.BracesLeftPunctuator);
        enterBlockScope();
        const body: Array<StatementListItem> = [];
        while(!match(SyntaxKinds.BracesRightPunctuator) &&  !match(SyntaxKinds.EOFToken) ) {
            body.push(parseStatementListItem());
        }
        exitBlockScope();
        const { end: puncEnd } =  expect(SyntaxKinds.BracesRightPunctuator, "block statement must wrapped by bracket");
        return Factory.createBlockStatement(body, puncStart, puncEnd);
   }
   function parseSwitchStatement() {
        const { start: keywordStart } =  expect(SyntaxKinds.SwitchKeyword);
        expect(SyntaxKinds.ParenthesesLeftPunctuator);
        const discriminant = parseExpression();
        expect(SyntaxKinds.ParenthesesRightPunctuator);
        if(!match(SyntaxKinds.BracesLeftPunctuator)) {
            throw createUnexpectError(SyntaxKinds.BracesLeftPunctuator, "switch statement should has cases body");
        }
        const { nodes, end } = parseSwitchCases();
        return Factory.createSwitchStatement(discriminant, nodes, keywordStart, end );
    
   }
   function parseSwitchCases(): ASTArrayWithMetaData<SwitchCase> {
        const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
        const cases: Array<SwitchCase> = [];
        while(!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
            let test: Expression | null = null;
            const start = getStartPosition();
            if(match(SyntaxKinds.CaseKeyword)) {
                nextToken();
                test = parseExpression();
            } else if(match(SyntaxKinds.DefaultKeyword)) {
                nextToken();
            }
            expect(SyntaxKinds.ColonPunctuator, "switch case should has colon")
            const consequence: Array<StatementListItem> = []
            while(!matchSet([SyntaxKinds.BracesRightPunctuator, SyntaxKinds.EOFToken, SyntaxKinds.CaseKeyword, SyntaxKinds.DefaultKeyword])) {
                consequence.push(parseStatementListItem());
            }
            if(match(SyntaxKinds.EOFToken)) {
                throw createMessageError("switch case should wrapped by braces");
            }
            const end = getStartPosition();
            cases.push(Factory.createSwitchCase(test, consequence, start, end));
        }
        if(match(SyntaxKinds.EOFToken)) {
            throw createMessageError("switch statement should wrapped by braces");
        }
        const { end } =  expect(SyntaxKinds.BracesRightPunctuator);
        // TODO: multi default
        return {
            nodes: cases, start, end
        }
   }
   function parseContinueStatement(): ContinueStatement {
        const { start: keywordStart, end: keywordEnd} =  expect(SyntaxKinds.ContinueKeyword);
        if(match(SyntaxKinds.Identifier)) {
            const id = parseIdentifer();
            semi();
            return Factory.createContinueStatement(id, keywordStart, cloneSourcePosition(id.end));
        }
        semi();
        return Factory.createContinueStatement(null, keywordStart,  keywordEnd);
   }
   function parseBreakStatement(): BreakStatement {
        const { start, end } = expect(SyntaxKinds.BreakKeyword);
        if(match(SyntaxKinds.Identifier)) {
            const label = parseIdentifer();
            semi();
            return Factory.createBreakStatement(label, start, end);
        }
        semi();
        return Factory.createBreakStatement(null, start, end);
   }
   function parseLabeledStatement(): LabeledStatement {
        if(!match(SyntaxKinds.Identifier) || lookahead().kind !== SyntaxKinds.ColonPunctuator) {
            // TODO: unreach
        }
        const label = parseIdentifer();
        expect(SyntaxKinds.ColonPunctuator);
        if(match(SyntaxKinds.FunctionKeyword)) {
            const delcar = parseFunctionDeclaration(false);
            if(delcar.generator) {
                throw createMessageError(ErrorMessageMap.lable_statement_can_not_have_function_declaration_is_generator);
            }
            return Factory.createLabeledStatement(label, delcar, cloneSourcePosition(label.start), cloneSourcePosition(delcar.end));
        }else {
            const statement = parseStatement();
            return Factory.createLabeledStatement(label, statement, cloneSourcePosition(label.start), cloneSourcePosition(statement.end));
        }
   } 
   function parseReturnStatement(): ReturnStatement {
       const { start, end } =  expect(SyntaxKinds.ReturnKeyword);
       if(semi(true)) {
          return Factory.createReturnStatement(null, start, end);
       }
       const expr = parseExpression();
       semi();
       return Factory.createReturnStatement(expr, start, cloneSourcePosition(expr.end));
   }
   function parseTryStatement(): TryStatement {
        const { start: tryKeywordStart } = expect(SyntaxKinds.TryKeyword);
        const body = parseBlockStatement();
        let handler: CatchClause | null = null, finalizer: BlockStatement | null = null;
        if(match(SyntaxKinds.CatchKeyword)) {
            const catchKeywordStart = getStartPosition();
            nextToken();
            if(match(SyntaxKinds.ParenthesesLeftPunctuator)) {
                nextToken();
                const param = parseBindingElement();
                expect(SyntaxKinds.ParenthesesRightPunctuator);
                const body = parseBlockStatement();
                handler = Factory.createCatchClause( param , body, catchKeywordStart, cloneSourcePosition(body.end));
            }else {
                const body = parseBlockStatement();
                handler = Factory.createCatchClause(null, body, catchKeywordStart, cloneSourcePosition(body.end));
            }
        }
        if(match(SyntaxKinds.FinallyKeyword)) {
            nextToken();
            finalizer = parseBlockStatement();
        }
        return Factory.createTryStatement(
            body, handler, finalizer, 
            tryKeywordStart, 
            cloneSourcePosition( finalizer ? finalizer.end : handler ? handler.end :  body.end )
        );
   }
   function parseThrowStatement() {
      const { start, } =  expect(SyntaxKinds.ThrowKeyword);
      const expr = parseExpression();
      semi();
      return Factory.createThrowStatement(expr, start, cloneSourcePosition(expr.end));
   }
   function parseWithStatement(): WithStatement {
        const {start }= expect(SyntaxKinds.WithKeyword);
        expect(SyntaxKinds.ParenthesesLeftPunctuator);
        const object = parseExpression();
        expect(SyntaxKinds.ParenthesesRightPunctuator);
        const body = parseStatement();
        return Factory.createWithStatement(object, body, start, cloneSourcePosition(body.end));
   }
   function parseDebuggerStatement(): DebuggerStatement {
       const {start, end } =  expect(SyntaxKinds.DebuggerKeyword);
       semi();
       return Factory.createDebuggerStatement(start, end);
   }
   function parseEmptyStatement(): EmptyStatement {
    const { start, end } =  expect([SyntaxKinds.SemiPunctuator]);
    return Factory.createEmptyStatement(start, end);
   }
/** =================================================================
 * Parse Delcarations
 * entry point reference: https://tc39.es/ecma262/#prod-Declaration
 * ==================================================================
 */
    /**
     * Parse VariableStatement and LexicalBindingDeclaration.
     * 
     * when in for-in statement, variable declaration do not need semi for 
     * ending, in binding pattern of for-in statement, variable declaration
     * maybe do not need init.(for-in, for-of do not need, but for still need)
     * 
     * Anthoer side, let can be identifier in VariableStatement. and parsrIdentifier
     * function would always parse let as identifier if not in strict mode. so we need 
     * to implement custom function for check is identifier or value of pattern is let
     * when in LexicalBindingDeclaration
     * ```
     * VariableStatement := 'var' VariableDeclarationList
     * LexicalBidningDeclaration := '(let | const)' LexicalBinding
     * VariableDeclarationList := BindingIdentidier initalizer
     *                         := BindingPattern initalizer
     * LexicalBinding  := BindingIdentidier initalizer
     *                 := BindingPattern initalizer
     * ```
     * @returns {VariableDeclaration}
     */
    function parseVariableDeclaration(inForInit: boolean = false):VariableDeclaration {
        let variableKind = match(SyntaxKinds.VarKeyword) ? "var" : "lexical";
        const { start: keywordStart, value: variant } = expect([SyntaxKinds.VarKeyword, SyntaxKinds.ConstKeyword,SyntaxKinds.LetKeyword])
        let shouldStop = false, isStart = true;
        const declarations: Array<VariableDeclarator> = [];
        while(!shouldStop) {
            if(isStart) {
                isStart = false;
            }else {
                if(!match(SyntaxKinds.CommaToken)) {
                    shouldStop = true;
                    continue;
                }
                nextToken();
            }
            const id = parseBindingElement(false);
            const isBindingPattern = !isIdentifer(id);
            // custom logical for check is lexical binding have let identifier ?
            if(variableKind === "lexical") {
                if(checkPatternContainCertinValue(id, (value) => value === "let")) {
                    throw createMessageError(ErrorMessageMap.let_keyword_can_not_use_as_identifier_in_lexical_binding)
                }
            }
            if(
                // variable declarations binding pattern but but have init.
                (isBindingPattern && !match(SyntaxKinds.AssginOperator)) &&
                // variable declaration in for statement can existed with `of`, `in` operator 
                !inForInit
            ) {
                throw createMessageError("lexical binding must have init");
            }
            if(match(SyntaxKinds.AssginOperator)) {
                nextToken();
                const init = parseAssigmentExpression();
                declarations.push(Factory.createVariableDeclarator(id, init, cloneSourcePosition(id.start), cloneSourcePosition(init.end)));
                continue;
            }
            declarations.push(Factory.createVariableDeclarator(id, null, cloneSourcePosition(id.start), cloneSourcePosition(id.end)));
        }
        if(!inForInit) {
             semi();
        }
        return Factory.createVariableDeclaration(declarations, variant as VariableDeclaration['variant'], keywordStart, declarations[declarations.length - 1].end);
    }
    /**
     * Helper function for check is pattern contain certin identifier value.
     * 
     * ## VariableDeclaration
     * Take look at parseIdentifier, you can seems parseIdentifier allow let as identifier when is not
     * strict mode, but parseVariableDeclaration maybe is LexicalBindingDeclaration, so parseVariableDeclaration
     * needs to implement its own logical about check if there existed let identifier in LexicalBinding.
     * 
     * ## FunctionParam
     * when parse function param, we do not know is function body contain use strict directive, so we
     * need to check if function parameter list and function name is illegal in current function scope
     * or not.
     * @param {Pattern} pattern 
     * @returns {boolean}
     */
    function checkPatternContainCertinValue(pattern: Pattern, callback: (value: string) => boolean): boolean {
        if(isArrayPattern(pattern)) {
            for(const element of pattern.elements) {
                if(element) {
                    if(checkPatternContainCertinValue(element, callback)) {
                        return true;
                    }
                }
            }
        }
        if(isObjectPattern(pattern)) {
            for(const property of pattern.properties) {
                if(isObjectPatternProperty(property)) {
                    if(property.value && checkPatternContainCertinValue(property.value, callback)) {
                        return true
                    }
                    if(!property.value && isIdentifer(property.key) && checkPatternContainCertinValue(property.key, callback)) {
                        return true;
                    }
                }else {
                    if(checkPatternContainCertinValue(property, callback)) {
                        return true;
                    }
                }
            }
        }
        if(isRestElement(pattern)) {
            if(checkPatternContainCertinValue(pattern.argument, callback)) {
                return true;
            }
        }
        if(isAssignmentPattern(pattern)) {
            if(checkPatternContainCertinValue(pattern.left, callback)) {
                return true;
            }
        }
        if(isIdentifer(pattern)) {
            if(callback(pattern.name)) {
                return true;
            }
        }
        return false;
    }
    function parseFunctionDeclaration(isAsync: boolean) {
        enterFunctionScope(isAsync);
        const func = parseFunction(false);
        exitFunctionScope();
        return Factory.transFormFunctionToFunctionDeclaration(func);
    }
    /**
     * Parse function maybe call by parseFunctionDeclaration and parseFunctionExpression,
     * first different of those two function is that function-declaration can not have null
     * name.
     * @returns {FunctionAST} 
     */
    function parseFunction(isExpression: boolean): FunctionAST {
        const { start } = expect(SyntaxKinds.FunctionKeyword);
        let generator = false;
        if(match(SyntaxKinds.MultiplyOperator)) {
            generator = true;
            setCurrentFunctionContextAsGenerator();
            nextToken();
        }
        const name = parseFunctionName(isExpression);
        const params = parseFunctionParam();
        const body = parseFunctionBody();
        checkFunctionNameAndParamsInCurrentFunctionStrictMode(name, params);
        return Factory.createFunction(name, body, params, generator, isCurrentFunctionAsync(), start, cloneSourcePosition(body.end));
    }
    /**
     * Because we "use strict" directive is in function body, some we will not sure
     * if this function contain stric directive or not until we enter the function body.
     * as the result, we need to check function name and function paramemter's name after
     * parseFunctionBody.
     * @param name 
     * @param params 
     */
    function checkFunctionNameAndParamsInCurrentFunctionStrictMode(name: Identifier | null, params: Array<Pattern>) {
        if(isInStrictMode()) {
            if(name) {
                if(
                    name.name === "yield" || 
                    name.name === "let"   ||
                    PreserveWordSet.has(name.name)
                ) {
                    throw createMessageError("unexepct keyword in parameter list in strict mode")
                }
            }
            for(const param of params) {
                if(checkPatternContainCertinValue(param, (value) =>  value === "yield" || value === "let" || PreserveWordSet.has(value))) {
                    throw createMessageError("unexepct keyword in parameter list in strict mode")
                }
            }
        }
    }
    /**
     * When parse name of function, can not just call parseIdentifier, because function name
     * maybe await or yield, and function name's context rule is different from identifier in
     * scope (function body). so there we need to implement special logical for parse function 
     * name. and you need to note that name of function expression and name of function delcaration
     * have different context rule for parse function name.
     * @param {boolean} isExpression 
     * @returns {Identifier | null}
     */
    function parseFunctionName(isExpression: boolean): Identifier | null {
        let name: Identifier | null = null;
        // there we do not just using parseIdentifier function as the reason above
        // let can be function name as other place
        if(matchSet([SyntaxKinds.Identifier, SyntaxKinds.LetKeyword])) {
            name = parseIdentifer();
        }
        if(match(SyntaxKinds.AwaitKeyword)) {
            // for function expression, can await treat as function name is dep on current scope.
            if(isExpression && isCurrentFunctionAsync()) {
                throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
            }
            // for function declaration, can await treat as function name is dep on parent scope.
            if(!isExpression && isParentFunctionAsync()) {
                throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
            }
            name = parseIdentiferWithKeyword();
        }
        if(match(SyntaxKinds.YieldKeyword)) {
            // for function expression, can yield treat as function name is dep on current scope.
            if(isExpression && isCurrentFunctionGenerator()) {
                throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
            }
            // for function declaration, can yield treat as function name is  dep on parent scope.
            if(!isExpression && isParentFunctionGenerator()) {
                throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
            }
            // if in strict mode, yield can not be function name.
            if(isInStrictMode()) {
                throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
            }
            name = parseIdentiferWithKeyword();
        }
        if(name === null && !isExpression) {
            throw createMessageError("function declaration must have name");
        }
        return name;
    }
    /**
     * Parse Function Body
     * ```
     *  FunctionBody  := '{' StatementList '}'
     *  StatementList := StatementList StatementListItem
     *                := StatementListItem 
     * ```
     * @return {FunctionBody}
     */
    function parseFunctionBody(): FunctionBody {
        const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
        const body : Array<StatementListItem>= [];
        while(!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
            body.push(parseStatementListItem());
        }
        const { end } = expect(SyntaxKinds.BracesRightPunctuator);
        return Factory.createFunctionBody(body, start, end);
    }
    /**
     * Parse Function Params, parameter list is a spcial place for await and yield,
     * function parameter list is in current function scope, so await and yield would 
     * parse as expression, but parameter list can not call await and yield expression.
     * 
     * Anthoer thing is that trailing comma of restElement is error, multi restElement is
     * error for function param list.
     * ```
     * FunctionParams := '(' FunctionParamsList ')'
     *                := '(' FunctionParamsList ',' ')' 
     *                := '(' FunctionPramsList ',' RestElement ')'
     *                := '(' RestElement ')'
     * FunctiinParamList := FunctionParamList ',' FunctionParam
     *                   := FunctionParam
     * FunctionParam := BindingElement
     * ```
     */
    function parseFunctionParam(): Array<Pattern> {
        expect(SyntaxKinds.ParenthesesLeftPunctuator);
        enterFunctionParameter();
        let isStart = true;
        let isEndWithRest = false;
        const params: Array<Pattern> = [];
        while(!match(SyntaxKinds.ParenthesesRightPunctuator)) {
            if(isStart) {
                if(match(SyntaxKinds.CommaToken)) {
                    throw createMessageError(ErrorMessageMap.function_parameter_can_not_have_empty_trailing_comma);
                }
                isStart = false;
            }else {
                expect(SyntaxKinds.CommaToken)
            }
            if(match(SyntaxKinds.ParenthesesRightPunctuator)) {
                continue;
            }
            // parse SpreadElement (identifer, Object, Array)
            if(match(SyntaxKinds.SpreadOperator)) {
                isEndWithRest = true;
                params.push(parseRestElement(true));
                break;
            }
            params.push(parseBindingElement());
        }
        if(!match(SyntaxKinds.ParenthesesRightPunctuator)) {
            if(isEndWithRest && match(SyntaxKinds.CommaToken)) {
                throw createMessageError(ErrorMessageMap.rest_element_can_not_end_with_comma);
            }
            throw createUnexpectError(SyntaxKinds.ParenthesesRightPunctuator, "params list must end up with ParenthesesRight");
        }   
        nextToken();
        checkFunctionParams(params);
        checkIsSimpleParameterList(params);
        existFunctionParameter();
        return params;
    }
    /**
     * Helper function for check if parameter list is simple 
     * parameter list or not, if is simple parameter, set 
     * the context.
     * @param {Array<Pattern>} params 
     * @returns 
     */
    function checkIsSimpleParameterList(params: Array<Pattern>) {
        for(const param of params) {
            if(!isIdentifer(param)) {
                setCurrentFunctionParameterListAsNonSimple();
                return;
            }
        }
    }
    /**
     * this helper function is used for check duplicate param
     * in function paramemter declaration list.
     * @param {Array<Pattern>} params
     */
    function checkFunctionParams(params: Array<Pattern>) {
        const paramsSet = new Set<string>();
        for(const param of params) {
            checkParam(param, paramsSet);
        }
    }
    /**
     * recursive checker for check is there are maybe duplicate param
     * name of givn param and existed param list set
     * @param {Pattern} param
     * @param {Set<string>} paramSet 
     * @returns 
     */
    function checkParam(param: Pattern, paramSet: Set<string>) {
        if(isIdentifer(param)) {
            if(paramSet.has(param.name)) {
                throw createMessageError(ErrorMessageMap.duplicate_param);
            }
            paramSet.add(param.name);
            return;
        }
        if(isArrayPattern(param))  {
            param.elements.forEach((element) => {
                if(element) checkParam(element, paramSet);
            });
            return;
        }
        if(isObjectPattern(param)) {
            for(const property of param.properties) {
                if(isRestElement(property) || isAssignmentPattern(property)) {
                    checkParam(property, paramSet);
                    continue;
                }
                if(property.value){
                    checkParam(property.value, paramSet);
                }
            }
            return;
        }
        if(isAssignmentPattern(param)) {
            checkParam(param.left, paramSet);
            return;
        }
        if(isRestElement(param)) {
            checkParam(param.argument, paramSet);
            return;
        }
    }
    /**
     * 
     */
    function parseClassDeclaration(): ClassDeclaration {
        expectButNotEat(SyntaxKinds.ClassKeyword);
        const classDelcar = parseClass();
        if(classDelcar.id === null) {
            throw createMessageError("class declaration must have class id");
        }
        return Factory.transFormClassToClassDeclaration(classDelcar);
    }
    /**
     * Parse Class
     * ```
     * Class := 'class' identifer ('extends' LeftHandSideExpression) ClassBody
     * ```
     * @returns {Class}
     */
    function parseClass(): Class {
        const { start } = expect(SyntaxKinds.ClassKeyword);
        let name: Identifier | null = null;
        if(matchSet(BindingIdentifierSyntaxKindArray)) {
            name = parseIdentifer();
        }
        let superClass: Expression | null  = null;
        if(match(SyntaxKinds.ExtendsKeyword)) {
            nextToken();
            superClass = parseLeftHandSideExpression();
            enterClassScope(true);
        }else {
            enterClassScope(false);
        }
        const body = parseClassBody();
        existClassScope();
        return Factory.createClass(name, superClass, body, start, cloneSourcePosition(body.end));
    }
    /** 
     * Parse ClassBody
     * ```
     *  ClassBody := '{' [ClassElement] '}'
     * ```
     * @return {ClassBody}
     */
    function parseClassBody(): ClassBody {
        const { start } =  expect(SyntaxKinds.BracesLeftPunctuator);
        const classbody: ClassBody['body'] = []
        while(!match(SyntaxKinds.BracesRightPunctuator) && ! match(SyntaxKinds.EOFToken)) {
            if(match(SyntaxKinds.SemiPunctuator)) {
                nextToken();
                continue;
            }
            classbody.push(parseClassElement());
        }
        const { end } = expect(SyntaxKinds.BracesRightPunctuator);
        return Factory.createClassBody(classbody, cloneSourcePosition(start), cloneSourcePosition(end));
    }
    /**
     * Parse ClassElement
     * ```
     * ClassElement := MethodDefinition
     *              := 'static' MethodDefinition
     *              := FieldDefintion ;
     *              := 'static' FieldDefintion ;
     *              := ClassStaticBlock
     *              := ; (this production rule handle by caller)
     * FieldDefintion := ClassElementName ('=' AssignmentExpression)?
     * ```
     * - frist, parse 'static' keyword if possible, next follow cases
     *   1. start with some method modifier like 'set', 'get', 'async', '*' must be methodDefintion
     *   2. start with '{', must be static block
     * - then parse ClassElement
     *    1. if next token is '(', must be MethodDefintion,
     *    2. else this only case is FieldDefinition with init or not. 
     * @returns {ClassElement}
     */
    function parseClassElement(): ClassElement {
        // parse static modifier
        let isStatic = false;
        if(getValue() === "static" && lookahead().kind !== SyntaxKinds.ParenthesesLeftPunctuator) {
            nextToken();
            isStatic = true;
        }    
        if(checkIsMethodStartWithModifier()) {
            return parseMethodDefintion(true, undefined, isStatic) as ClassMethodDefinition;
        }
        if(match(SyntaxKinds.BracesLeftPunctuator) && isStatic) {
            // TODO: parse static block
        }
        // parse ClassElementName 
        const isComputedRef = { isComputed: false };
        let key: PropertyName | PrivateName | undefined;
        if(match(SyntaxKinds.PrivateName)) {
            key = parsePrivateName();
        }else {
            key = parsePropertyName(isComputedRef);
        }
        if(match(SyntaxKinds.ParenthesesLeftPunctuator)) {
            return parseMethodDefintion(true, key, isStatic) as ClassMethodDefinition;
        }
        if(matchSet([SyntaxKinds.AssginOperator])) {
            nextToken();
            const value = parseAssigmentExpression();
            semi();
            return Factory.createClassProperty(key, value , isComputedRef.isComputed, isStatic, false, cloneSourcePosition(key.start), cloneSourcePosition(value.end));
        }
        semi();
        return Factory.createClassProperty(key, undefined, isComputedRef.isComputed, isStatic, true, cloneSourcePosition(key.start), cloneSourcePosition(key.end));

    }
/** ====================================================================
 *  Parse Expression 
 *  entry point reference : https://tc39.es/ecma262/#sec-comma-operator
 * =====================================================================
 */ 

    /**
     * Entry function for parse a expression statement.
     * @returns {ExpressionStatement}
     */
    function parseExpressionStatement(): ExpressionStatement {
        const expr = parseExpression();
        checkStrictMode(expr);
        semi();
        return Factory.createExpressionStatement(expr, cloneSourcePosition(expr.start), cloneSourcePosition(expr.end));
    }
    /**
     * Helper function for checking `use strict` directive, according to 
     * ECMA spec, `use strict` directive is a `ExpressionStatement` in 
     * which value is `use strict`, and this function is doing the same
     * thing as spec required.
     * 
     * NOTE: this function would perform side effect to parse context
     * 
     * ref: https://tc39.es/ecma262/#use-strict-directive
     * @param {Expression} expr 
     */
    function checkStrictMode(expr: Expression) {
        if(isStringLiteral(expr)) {
            if(expr.value === "use strict") {
                if(isDirectToFunctionContext()) {
                    if(!isCurrentFunctionParameterListSimple()) {
                        throw createMessageError(ErrorMessageMap.illegal_use_strict_in_non_simple_parameter_list);
                    }
                    setCurrentFunctionContextAsStrictMode();
                }
            }
        }
    }
    function parseExpressionBase() {
        const exprs = [parseAssigmentExpressionBase()];
        while(match(SyntaxKinds.CommaToken)) {
            nextToken();
            exprs.push(parseAssigmentExpressionBase());
        }
        if(exprs.length === 1) {
            return exprs[0];
        }
        return Factory.createSequenceExpression(exprs, cloneSourcePosition(exprs[0].start), cloneSourcePosition(exprs[exprs.length -1].end));
    }
    function parseExpression(allowIn = true): Expression {
        context.inOperatorStack.push(allowIn);
        const expr = parseExpressionBase();
        context.inOperatorStack.pop();
        return expr;
    }
    function parseAssigmentExpressionBase(): Expression {
        if(match(SyntaxKinds.ParenthesesLeftPunctuator)) {
            context.maybeArrow = true;
        }
        if(match(SyntaxKinds.YieldKeyword) && isCurrentFunctionGenerator()) {
            return parseYieldExpression();
        }
        let left = parseConditionalExpression();
        if (!matchSet(AssigmentOperators)) {
           return left;
        }
        left = toAssignmentPattern(left) as Expression;
        const operator = getToken();
        nextToken();
        const right = parseAssigmentExpressionBase();
        return Factory.createAssignmentExpression(left, right, operator as AssigmentOperatorKinds, cloneSourcePosition(left.start), cloneSourcePosition(right.end));  
    }
    function parseAssigmentExpression(allowIn = true): Expression {
        context.inOperatorStack.push(allowIn);
        const expr = parseAssigmentExpressionBase();
        context.inOperatorStack.pop();
        return expr;
    }
    /**
     * Parse Yield Expression, when current function scope is generator, yield would 
     * seems as keyword of yield expression, but even if in generator function scope,
     * function parameter can call yield expression, so this function would check is
     * current place is in function paramter or not. if yield expression shows in 
     * parameter list, it would throw error.
     * ```
     * YieldExpression := 'yield' 
     *                 := 'yield' AssignmentExpression
     *                 := 'yield' '*' AssignmentExpression
     * ```
     * @returns {YieldExpression}
     */
    function parseYieldExpression(): YieldExpression {
        const { start } = expect(SyntaxKinds.YieldKeyword);
        let delegate = false;
        if(match(SyntaxKinds.MultiplyOperator)) {
            nextToken();
            delegate = true;
        }
        let argument: Expression | null = null;
        if(!semi(true, false)) {
            argument = parseAssigmentExpression();
        }
        if(delegate && !argument) {
            throw createMessageError(ErrorMessageMap.yield_deletgate_can_must_be_followed_by_assignment_expression);
        }
        if(isInParameter()) {
            throw createMessageError(ErrorMessageMap.yield_expression_can_not_used_in_parameter_list);
        }
        return Factory.createYieldExpression(argument, delegate, start, cloneSourcePosition(argument ? argument.end : start ));
    }
    function parseConditionalExpression(): Expression {
        const test = parseBinaryExpression();
        if(!match(SyntaxKinds.QustionOperator)) {
            return test;
        }
        nextToken();
        const conseq = parseAssigmentExpression();
        if(!match(SyntaxKinds.ColonPunctuator)) {
            throw createUnexpectError(SyntaxKinds.ColonPunctuator, "conditional operator must and conseq and alter case");
        }
        nextToken();
        const alter = parseAssigmentExpression();
        return Factory.createConditionalExpression(test, conseq, alter, cloneSourcePosition(test.start), cloneSourcePosition(alter.end));
    }
    /**
     * Using Operator-precedence parser algorithm is used for parse binary expressiom
     * with precedence order. and this is entry function for parseBinaryExpression.
     * @returns {Expression}
     */
    function parseBinaryExpression(): Expression {
        const atom = parseUnaryExpression();
        // early return for arrow function;
        if(isArrowFunctionExpression(atom)) {
            return atom;
        }
        if(matchSet(BinaryOperators)) {
            return parseBinaryOps(atom);
        }
        return atom;
    }
    /**
     * Return the precedence order by given binary operator.
     * this function should only used by parseBinaryOps
     * @param {SyntaxKinds} kind Binary Operator
     * @returns {number}
     */
    function getBinaryPrecedence(kind: SyntaxKinds): number {
        switch(kind) {
            case SyntaxKinds.NullishOperator:
            case SyntaxKinds.LogicalOROperator:
                return 4;
            case SyntaxKinds.LogicalANDOperator:
                return 5;
            case SyntaxKinds.BitwiseOROperator:
                return 6;
            case SyntaxKinds.BitwiseXOROperator:
                return 7;
            case SyntaxKinds.BitwiseANDOperator:
                return 8;
            case SyntaxKinds.StrictEqOperator:
            case SyntaxKinds.StrictNotEqOperator:
            case SyntaxKinds.EqOperator:
            case SyntaxKinds.NotEqOperator:
                return 9;
            case SyntaxKinds.InKeyword:
            case SyntaxKinds.InstanceofKeyword:
            case SyntaxKinds.GtOperator:
            case SyntaxKinds.GeqtOperator:
            case SyntaxKinds.LeqtOperator:
            case SyntaxKinds.LtOperator:
                if(kind === SyntaxKinds.InKeyword && !getCurrentInOperatorStack()) {
                    return -1;
                }
                return 10;
            case SyntaxKinds.BitwiseLeftShiftOperator:
            case SyntaxKinds.BitwiseRightShiftOperator:
            case SyntaxKinds.BitwiseRightShiftFillOperator:
                return 11;
            case SyntaxKinds.PlusOperator:
            case SyntaxKinds.MinusOperator:
                return 12;
            case SyntaxKinds.ModOperator:
            case SyntaxKinds.DivideOperator:
            case SyntaxKinds.MultiplyOperator:
                return 13;
            case SyntaxKinds.ExponOperator:
                return 14;
            default:
                return -1;
        }
    }
    function isBinaryOps(kind: SyntaxKinds) {
        return getBinaryPrecedence(kind) > 0;
    }
    /**
     * Bottom up recurive function for parse binary operator and next 
     * expression.
     * @param {Expression} left
     * @param {number} lastPre 
     * @returns {Expression}
     */
    function parseBinaryOps(left: Expression , lastPre : number = 0): Expression {
        // eslint-disable-next-line no-constant-condition
        while(1) {
            const currentOp = getToken();
            if(!isBinaryOps(currentOp) || getBinaryPrecedence(currentOp) < lastPre) {
                break;
            }
            nextToken();
            let right = parseUnaryExpression();
            const nextOp = getToken();
            checkNullishAndExpontOperation(currentOp, left, nextOp);
            if(isBinaryOps(nextOp) && (getBinaryPrecedence(nextOp) > getBinaryPrecedence(currentOp))) {
                right =  parseBinaryOps(right, getBinaryPrecedence(nextOp));
            }
            left = Factory.createBinaryExpression(left, right, currentOp as BinaryOperatorKinds, cloneSourcePosition(left.start), cloneSourcePosition(right.end));
        }
        return left;
    }
    function checkNullishAndExpontOperation(currentOps: SyntaxKinds, left: Expression, nextOps: SyntaxKinds) {
        if(left.parentheses) {
            return;
        }
        if(currentOps === SyntaxKinds.ExponOperator) {
            if(isUnaryExpression(left)) {
                throw createMessageError(ErrorMessageMap.expont_operator_need_parans);
            }
        }
        // if currentOp is nullish, next is logical or not
        // if current Ops is logical, check next is nullish or not
        if(
            currentOps === SyntaxKinds.NullishOperator && (
                nextOps === SyntaxKinds.LogicalANDOperator || 
                nextOps === SyntaxKinds.LogicalOROperator
            )
        ) {
            throw createMessageError(ErrorMessageMap.nullish_require_parans);
        }
        if(
            nextOps === SyntaxKinds.NullishOperator && (
               currentOps === SyntaxKinds.LogicalANDOperator || 
               currentOps === SyntaxKinds.LogicalOROperator
            )
        ) {
            throw createMessageError(ErrorMessageMap.nullish_require_parans);
        }
    }
    function parseUnaryExpression(): Expression {
        if(matchSet(UnaryOperators)) {
            const operator = getToken() as UnaryOperatorKinds;
            const start = getStartPosition();
            nextToken();
            const argument = parseUnaryExpression();
            return Factory.createUnaryExpression(argument, operator, start, cloneSourcePosition(argument.end));
        }
        if(match(SyntaxKinds.AwaitKeyword) && isCurrentFunctionAsync()) {
            if(isInParameter()) {
                throw createMessageError(ErrorMessageMap.await_expression_can_not_used_in_parameter_list);
            }
            const start = getStartPosition();
            nextToken();
            const argu = parseUnaryExpression();
            return Factory.createAwaitExpression(argu, start, cloneSourcePosition(argu.end));
        }
        return parseUpdateExpression();
    }
    function parseUpdateExpression(): Expression {
        if(matchSet(UpdateOperators)) {
            const operator = getToken() as UpdateOperatorKinds;
            const start = getStartPosition();
            nextToken();
            const argument = parseLeftHandSideExpression();
            return Factory.createUpdateExpression(argument, operator, true, start, cloneSourcePosition(argument.end));
        }
        const argument = parseLeftHandSideExpression();
        if(matchSet(UpdateOperators)) {
            const operator = getToken() as UpdateOperatorKinds;
            const end = getEndPosition();
            nextToken();
            return Factory.createUpdateExpression(argument, operator, false, cloneSourcePosition(argument.start), end);
        }
        return argument;
    }
    /**
     * Parse Left hand side Expression. This syntax is reference babel function, which is simplify original syntax of TS39,
     * 'this' and super 'super' would be meanful when apper at start of atoms, which can be handle by parseAtoms. NewExpression 
     * is a spacial case , because it can not using optionalChain, so i handle it into a atom.
     * ```
     *  LeftHandSideExpression := Atoms '?.' CallExpression
     *                         := Atoms '?.' MemberExpression
     *                         := Atoms TagTemplateExpression
     * ```
     * @returns {Expression}
     */
    function parseLeftHandSideExpression(): Expression {
        let base = parsePrimaryExpression();
        let shouldStop = false;
        let hasOptional = false;
        while(!shouldStop) {
            let optional = false;
            if(match(SyntaxKinds.QustionDotOperator)) {
                optional = true;
                hasOptional = true;
                nextToken();
            }
            if(match(SyntaxKinds.ParenthesesLeftPunctuator)) {
                // callexpression
                base = parseCallExpression(base, optional);
            }
            else if (matchSet([SyntaxKinds.DotOperator, SyntaxKinds.BracketLeftPunctuator]) || optional) {
                // memberexpression 
                base = parseMemberExpression(base, optional);
            }
            else if (match(SyntaxKinds.TemplateHead) || match(SyntaxKinds.TemplateNoSubstitution)) {
                // tag template expressuin
                if(hasOptional) {
                    throw createMessageError(ErrorMessageMap.tag_template_expression_can_not_use_option_chain);
                }
                base = parseTagTemplateExpression(base);
            }
            else {
                shouldStop = true;
            }
        }
        if(hasOptional) {
            return Factory.createChainExpression(base, cloneSourcePosition(base.start), cloneSourcePosition(base.end));
        }
        return base;
    }
    /**
     * Parse CallExpression 
     * ```
     * CallExpresion := GivenBase(base, optional) '(' Arguments ')'
     * ```
     * @param {Expression} callee base expression 
     * @param {boolean} optional is this call optional ?
     * @returns {Expression}
     */
    function parseCallExpression(callee: Expression, optional: boolean): Expression {
        expectButNotEat([SyntaxKinds.ParenthesesLeftPunctuator]);
        const { nodes, end } = parseArguments();
        return Factory.createCallExpression(callee, nodes, optional, cloneSourcePosition(callee.start), end);
    }
    /**
     * // TODO: remove possble dep of arrow function paramemter need to call this function.
     * 
     * Parse Arguments, used by call expression, and arrow function paramemter.
     * ```
     * Arguments := '(' ArgumentList ')'
     * ArgumentList := ArgumentList AssigmentExpression
     *              := ArgumentList SpreadElement
     *              := AssignmentExpression
     *              := SpreadElement
     * ```
     * @returns {Array<Expression>}
     */
    function parseArguments(): ASTArrayWithMetaData<Expression> & { trailingComma: boolean }  {
        const { start } = expect(SyntaxKinds.ParenthesesLeftPunctuator);
        let isStart = true;
        let shouldStop = false;
        // TODO: refactor logic to remove shoulStop
        const callerArguments: Array<Expression> = [];
        let trailingComma = false
        while(!shouldStop && !match(SyntaxKinds.ParenthesesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
            if(isStart) {
                isStart = false
                if(match(SyntaxKinds.CommaToken)) {
                    throw createMessageError(ErrorMessageMap.function_argument_can_not_have_empty_trailing_comma);
                }
            } else {
                trailingComma = true;
                expect(SyntaxKinds.CommaToken, "Argument should seprated by comma.");
            }
            // case 1: ',' following by ')'
            if(match(SyntaxKinds.ParenthesesRightPunctuator)) {
                shouldStop = true;
                continue;
            }
            trailingComma = false;
            // case 2: ',' following by SpreadElement, maybe follwed by ','
            if(match(SyntaxKinds.SpreadOperator)) {
                const spreadElementStart = getStartPosition();
                nextToken();
                const argu = parseAssigmentExpression();
                callerArguments.push(Factory.createSpreadElement(argu, spreadElementStart, cloneSourcePosition(argu.end)));
                continue;
            }
            // case 3 : ',' AssigmentExpression
            callerArguments.push(parseAssigmentExpression());
        }
        const { end } = expect(SyntaxKinds.ParenthesesRightPunctuator);
        return { 
            end, start,
            nodes: callerArguments ,
            trailingComma
        };
    }
    /**
     * Parse MemberExpression with base, this different between parseLeftHandSideExpression is
     * that parseMemberExpression would only eat a `atom` of chain of expression.
     * ```
     * MemberExpression := GivenBase(base ,optional) '.' IdentiferWithKeyword
     *                  := GivenBase(base, optional) '[' Expreession ']'
     *                  := GivenBase(base, optional) IdentiferWithKeyword
     * // for last condition, optional prope must be True
     * ```
     * @param {Expression} base base expression
     * @param {boolean} optional is base expression contain a optional
     * @returns {Expression}
     */
    function parseMemberExpression(base: Expression, optional: boolean): Expression {
        if(!match(SyntaxKinds.DotOperator) && !match(SyntaxKinds.BracketLeftPunctuator) && !optional) {
            throw createUnreachError([SyntaxKinds.DotOperator, SyntaxKinds.BracketLeftPunctuator]);
        }
        // if start with dot, must be a access property, can not with optional.
        // because optional means that last token is `?.`
        if(match(SyntaxKinds.DotOperator) && !optional) {
            expect(SyntaxKinds.DotOperator);
            const property = parseIdentiferWithKeyword();
            return Factory.createMemberExpression(false, base, property, optional, cloneSourcePosition(base.start), cloneSourcePosition(property.end));
        }
        // if start with `[`, must be computed property access.
        else if(match(SyntaxKinds.BracketLeftPunctuator)){
            expect(SyntaxKinds.BracketLeftPunctuator);
            const property = parseExpression();
            const { end } = expect(SyntaxKinds.BracketRightPunctuator)
            return Factory.createMemberExpression(true, base, property, optional, cloneSourcePosition(base.start), end);
        }else {
        // because parseLeftHandSideExpression would eat optional mark (QustionDotToken) frist, so maybe there
        // is not dot or `[` for start a member expression, so we can check optional is 
            const property = parseIdentiferWithKeyword();
            return Factory.createMemberExpression(false, base, property, optional, cloneSourcePosition(base.start), cloneSourcePosition(property.end));
        }
    }
    function parseTagTemplateExpression(base: Expression) {
        const quasi = parseTemplateLiteral();
        return Factory.createTagTemplateExpression(base, quasi, cloneSourcePosition(base.end), cloneSourcePosition(quasi.end));

    }
    function parsePrimaryExpression(): Expression {
        switch(getToken()) {
            case SyntaxKinds.LtOperator:
                return parseJSXElementOrJSXFragment();
            case SyntaxKinds.DivideOperator:
            case SyntaxKinds.DivideAssignOperator:
                return parseRegexLiteral();
            case SyntaxKinds.NullKeyword:
                return parseNullLiteral();
            case SyntaxKinds.UndefinedKeyword:
                return parseUndefinedLiteral()
            case SyntaxKinds.TrueKeyword:
            case SyntaxKinds.FalseKeyword:
                return parseBoolLiteral();
            case SyntaxKinds.NumberLiteral:
                return parseNumberLiteral();
            case SyntaxKinds.StringLiteral:
                return parseStringLiteral();
            case SyntaxKinds.TemplateHead:
            case SyntaxKinds.TemplateNoSubstitution:
                return parseTemplateLiteral();
            case SyntaxKinds.ImportKeyword:
                const { kind } = lookahead();
                if(kind === SyntaxKinds.DotOperator)
                    return parseImportMeta();
                if(kind === SyntaxKinds.ParenthesesLeftPunctuator) {
                    return parseImportCall();
                }
                throw createUnexpectError(null);
            case SyntaxKinds.NewKeyword: {
                const { kind } = lookahead();
                if(kind === SyntaxKinds.DotOperator) {
                    return parseNewTarget();
                }
                return parseNewExpression();
            }
            case SyntaxKinds.SuperKeyword:
                return parseSuper();
            case SyntaxKinds.ThisKeyword:
                return parseThisExpression();
            case SyntaxKinds.BracesLeftPunctuator:
                return parseObjectExpression();
            case SyntaxKinds.BracketLeftPunctuator:
                return parseArrayExpression();
            case SyntaxKinds.FunctionKeyword:
                return parseFunctionExpression(false);
            case SyntaxKinds.ClassKeyword:
                return parseClassExpression();
            case SyntaxKinds.ParenthesesLeftPunctuator:
                return parseCoverExpressionORArrowFunction();
            // TODO: consider wrap as function or default case ?
            case SyntaxKinds.PrivateName:
                return parsePrivateName();
            case SyntaxKinds.Identifier: 
            case SyntaxKinds.LetKeyword:
            case SyntaxKinds.AwaitKeyword:
            case SyntaxKinds.YieldKeyword: {
                const { kind, flag } = lookahead();
                // case 0: identifier `=>` ...
                if(kind === SyntaxKinds.ArrowOperator) {
                    enterFunctionScope();
                    const argus = [parseIdentifer()];
                    if(getLineTerminatorFlag()) {
                        throw createMessageError(ErrorMessageMap.no_line_break_is_allowed_before_arrow);
                    }
                    const arrowExpr = parseArrowFunctionExpression({
                        nodes: argus,
                        start: argus[0].start,
                        end: argus[0].end,
                        trailingComma: false
                    });
                    exitFunctionScope();
                    return arrowExpr;
                }
                // case 1: `async` `Identifer` ... 
                // There might be two case :
                // 1.frist case is there are line change after async, which make this case into
                //   async as identifier
                // 2.second case is not change line after async, making it become async arrow 
                //   function.
                if((
                    getValue() === "async"  && (
                        kind === SyntaxKinds.Identifier ||
                        kind === SyntaxKinds.YieldKeyword ||
                        kind === SyntaxKinds.AwaitKeyword
                    ))
                ) {
                    // async followed by flag
                    if(flag) {
                        return parseIdentifer();
                    }
                    nextToken();
                    enterFunctionScope(true);
                    const argus = [parseIdentifer()];
                    if(getLineTerminatorFlag()) {
                        throw createMessageError(ErrorMessageMap.no_line_break_is_allowed_before_async);
                    }
                    // TODO: check arrow operator
                    const arrowExpr = parseArrowFunctionExpression({
                        nodes: argus,
                        start: argus[0].start,
                        end: argus[0].end,
                        trailingComma: false
                    });
                    exitFunctionScope();
                    return arrowExpr;
                }
                // case 2 `async` `?.`, in this case, must treat as call expression
                if(getValue() === "async" &&  kind === SyntaxKinds.QustionDotOperator ) {
                    const id = parseIdentifer();
                    const {nodes, end} = parseArguments()
                    return Factory.createCallExpression(id, nodes, true, cloneSourcePosition(id.start), end);
                }
                // case 2 `async` `(` 
                // There might be two case :
                // 1.frist case is there are line change after async, which make this case into
                //   call expression
                // 2.second case is not change line after async, making it become async arrow 
                //   function.
                if(getValue() === "async"  && kind === SyntaxKinds.ParenthesesLeftPunctuator) {
                    const id =  parseIdentifer();
                    const meta =  parseArguments();
                    if(flag || !match(SyntaxKinds.ArrowOperator)) {
                        return Factory.createCallExpression(id, meta.nodes, false, cloneSourcePosition(id.start), meta.end);
                    }
                    enterFunctionScope(true);
                    // TODO: should remove parseArgument, using parseFunctionParam instead.
                    const arrowFunExpr = parseArrowFunctionExpression(meta);
                    exitFunctionScope();
                    return arrowFunExpr;
                }
                // case 3 async function ==> must be async function <id> () {}
                if(getValue() === "async" && kind === SyntaxKinds.FunctionKeyword) {
                    const { value, start, end } = expect(SyntaxKinds.Identifier);
                    if(getLineTerminatorFlag()) {
                        return Factory.createIdentifier(value, start, end);
                    }
                    const functionExpr = parseFunctionExpression(true);
                    return functionExpr;
                }
                return parseIdentifer();
            }
            default:
                throw createUnexpectError(null);
        }
    }
    function parseRegexLiteral(): RegexLiteral {
        expectButNotEat([SyntaxKinds.DivideOperator, SyntaxKinds.DivideAssignOperator]);
        let startWithAssignOperator = match(SyntaxKinds.DivideAssignOperator);
        const start = getStartPosition();
        let { pattern, flag } = readRegex();
        nextToken();
        if(startWithAssignOperator) {
            pattern = "=" + pattern;
        }
        return Factory.createRegexLiteral(pattern, flag, start , getEndPosition());
    }
    /**
     * this function is actually parse binding identifier. it accept more than just identifier
     * include await yield and let, if identifier is let, await or yield, this function would 
     * auto check context for you. but if identifier is in VariableDeclaration, function name,
     * property name, context check is not suit those place, so you maybe need to implement another
     * context check logical with parseIdentifierWithKeyword function.
     * ```
     * BindingIdentifier := Identifier
     *                   := 'await' (deps in context)
     *                   := 'yield' (deps in context)
     *                   ('let' (deps on context))
     * ```
     * @returns {Identifier}
     */
    function parseIdentifer(): Identifier {
        expectButNotEat([SyntaxKinds.Identifier, SyntaxKinds.AwaitKeyword, SyntaxKinds.YieldKeyword, SyntaxKinds.LetKeyword]);
        if(match(SyntaxKinds.YieldKeyword)) {
            // for most of yield keyword, if it should treat as identifier,
            // it should not in generator function.
            if (!isCurrentFunctionGenerator() && !isInStrictMode()) {
                const { value, start, end } = expect(SyntaxKinds.YieldKeyword);
                return Factory.createIdentifier(value, start, end);
            }
            throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
        }
        if(match(SyntaxKinds.AwaitKeyword)) {
            // for most of await keyword, if it should treat as identifier,
            // it should not in async function.
            if(!isCurrentFunctionAsync()) {
                const { value, start, end } = expect(SyntaxKinds.AwaitKeyword);
                return Factory.createIdentifier(value, start, end);
            }
            throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
        }
        if(match(SyntaxKinds.LetKeyword)) {
            // let maybe treat as identifier in not strict mode, and not lexical binding declaration.
            // so lexical binding declaration should implement it's own checker logical with parseIdentifierWithKeyword
            if(!isInStrictMode()) {
                const { value, start, end } = expect(SyntaxKinds.LetKeyword);
                return Factory.createIdentifier(value, start, end);
            }
            throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
        }
        const { value, start, end } = expect(SyntaxKinds.Identifier);
        if(isInStrictMode()) {
            if(PreserveWordSet.has(value)) {
                throw createMessageError(ErrorMessageMap.unexpect_keyword_in_stric_mode);
            }
        }
        return Factory.createIdentifier(value, start, end);
    }
    /**
     * Relatedly loose function for parseIdentifier, it not only can parse identifier,
     * it also can parse keyword as identifier.
     * @returns {Identifier}
     */
    function parseIdentiferWithKeyword(): Identifier {
        const { value, start, end } = expect(IdentiferWithKeyworArray);
        return Factory.createIdentifier(value, start, end);
    }
    function parsePrivateName() {
        const { value, start, end } = expect(SyntaxKinds.PrivateName);
        return Factory.createPrivateName(value, start, end);
    }
    function parseNullLiteral() {
        const { start, end } =  expect(SyntaxKinds.NullKeyword);
        return Factory.createNullLiteral(start, end);
    }
    function parseUndefinedLiteral() {
        const { start, end } = expect(SyntaxKinds.UndefinedKeyword);
        return Factory.createUndefinedLiteral(start, end);
    }
    function parseNumberLiteral() {
        const { start, end, value } = expect(SyntaxKinds.NumberLiteral);
        return Factory.createNumberLiteral(value, start, end);
    }
    function parseStringLiteral() {
        const { start, end, value } = expect(SyntaxKinds.StringLiteral);
        return Factory.createStringLiteral(value, start, end);
    }
    function parseBoolLiteral() {
        const { start, end, value } = expect([SyntaxKinds.TrueKeyword, SyntaxKinds.FalseKeyword]);
        return Factory.createBoolLiteral(value === "true" ? true : false, start, end);
    }
    function parseTemplateLiteral() {
        if(!matchSet([SyntaxKinds.TemplateHead, SyntaxKinds.TemplateNoSubstitution])) {
            throw createUnreachError([SyntaxKinds.TemplateHead, SyntaxKinds.TemplateNoSubstitution]);
        }
        const templateLiteralStart = getStartPosition();
        if(match(SyntaxKinds.TemplateNoSubstitution)) {
            const value = getValue();
            const templateLiteralEnd = getEndPosition();
            nextToken();
            return Factory.createTemplateLiteral(
                [Factory.createTemplateElement(value, true, templateLiteralStart, templateLiteralEnd)], 
                [], 
                templateLiteralStart, templateLiteralEnd
            );
        }
        nextToken();
        const expressions = [parseExpression()];
        const quasis: Array<TemplateElement> = [];
        while(!match(SyntaxKinds.TemplateTail) && match(SyntaxKinds.TemplateMiddle) && !match(SyntaxKinds.EOFToken)) {
            quasis.push(Factory.createTemplateElement(getValue(), false, getStartPosition(), getEndPosition()));
            nextToken();
            expressions.push(parseExpression());
        }
        if(match(SyntaxKinds.EOFToken)) {
            throw createUnexpectError(SyntaxKinds.BracesLeftPunctuator);
        }
        quasis.push(Factory.createTemplateElement(getValue(), true, getStartPosition(), getEndPosition()));
        const templateLiteralEnd = getEndPosition();
        nextToken();
        return Factory.createTemplateLiteral(quasis, expressions, templateLiteralStart, templateLiteralEnd);

    }
    function parseImportMeta() {
        const { start, end } =  expect(SyntaxKinds.ImportKeyword);
        expect(SyntaxKinds.DotOperator);
        const property = parseIdentifer();
        if(property.name !== "meta") {
            throw createMessageError(ErrorMessageMap.import_meta_invalid_property);
        }
        return Factory.createMetaProperty(Factory.createIdentifier("import", start, end), property, start, cloneSourcePosition(property.end));
    }
    function parseImportCall() {
        const { start, end } =  expect(SyntaxKinds.ImportKeyword);
        expect(SyntaxKinds.ParenthesesLeftPunctuator);
        const argument = parseAssigmentExpression();
        const { end: finalEnd } = expect(SyntaxKinds.ParenthesesRightPunctuator);
        return Factory.createCallExpression(Factory.createImport(start, end), [argument], false,  cloneSourcePosition(start), cloneSourcePosition(finalEnd));
    }
    function parseNewTarget() {
        const { start, end } = expect(SyntaxKinds.NewKeyword);
        expect(SyntaxKinds.DotOperator);
        if(getValue() !== "target") {
            throw createUnexpectError(SyntaxKinds.Identifier, "new concat with dot should only be used in meta property");
        }
        if(isTopLevel() && !isInClassScope()) {
            throw createMessageError(ErrorMessageMap.new_target_can_only_be_used_in_class_or_function_scope);
        }
        const targetStart = getStartPosition();
        const targetEnd = getEndPosition();
        nextToken();
        return Factory.createMetaProperty(Factory.createIdentifier("new", start, end), Factory.createIdentifier("target", targetStart, targetEnd), start, targetEnd);
    }
    /**
     * Parse New Expression
     * new expression is a trick one, because is not always right to left, 
     * for a new expression, last the rightest component must be a CallExpression,
     * and before that CallExpression, it can be a series of MemberExpression,
     * or event another NewExpression
     * ```
     * NewExpression := 'new' NewExpression
     *               := 'new' MemberExpressionWithoutOptional Arugment?
     * ```
     * @returns {Expression}
     */
    function parseNewExpression():Expression {
        const { start } = expect(SyntaxKinds.NewKeyword);
        // maybe is new.target
        if(match(SyntaxKinds.NewKeyword) && lookahead().kind !== SyntaxKinds.DotOperator ) {
            return parseNewExpression();
        }
        let base = parsePrimaryExpression();
        if(isCallExpression(base)) {
            throw createMessageError(ErrorMessageMap.import_call_is_not_allow_as_new_expression_called);
        }
        // TODO: refactor this loop to with function -> parseNewExpressionCallee ?
        while(match(SyntaxKinds.DotOperator) || match(SyntaxKinds.BracketLeftPunctuator) || match(SyntaxKinds.QustionDotOperator)) {
            if(match(SyntaxKinds.QustionDotOperator)) {
                throw createMessageError(ErrorMessageMap.new_expression_cant_using_optional_chain);
            }
            base = parseMemberExpression(base, false);
        }
        // accpect New XXX -> No argument
        if(!match(SyntaxKinds.ParenthesesLeftPunctuator)) {
            return Factory.createNewExpression(base, [], start, cloneSourcePosition(base.end));
        }
        const { end, nodes } = parseArguments()
        return Factory.createNewExpression(base, nodes, start, end );

    }
    function parseSuper() {
        if(!isCurrentClassExtend()) {
            throw createMessageError(ErrorMessageMap.super_can_not_call_if_not_in_class);
        }
        const { start: keywordStart, end: keywordEnd } = expect([SyntaxKinds.SuperKeyword]);
        if(match(SyntaxKinds.ParenthesesLeftPunctuator)) {
            const { nodes, end: argusEnd } = parseArguments();
            return Factory.createCallExpression(Factory.createSuper(keywordStart, keywordEnd), nodes, false, cloneSourcePosition(keywordStart) , argusEnd);
        }
        if(match(SyntaxKinds.DotOperator) || match(SyntaxKinds.BracketLeftPunctuator)) {
            return Factory.createSuper(keywordStart, keywordEnd);
        }
        throw createMessageError(ErrorMessageMap.super_must_be_followed_by_an_argument_list_or_member_access);
    }
    function parseThisExpression() {
        const { start, end } = expect([SyntaxKinds.ThisKeyword]);
        return Factory.createThisExpression(start, end);
    }
    /**
     * Parse ObjectLiterial, object property just a list of PropertyDefinition.
     * ### Trailing Comma problem
     * object expression maybe transform into `ObjectPattern` in `AssignmentExpression`
     * so i add a trailing comma field to object expression to AST struct for `toAssignment`
     * function.
     * ```
     *   ObjectLiteral := '{' PropertyDefinitionList ','? '}'
     *   PropertyDefinitionList := PropertyDefinitionList ',' PropertyDefinition
     *                          := PropertyDefinition
     * ```
     * @returns {Expression} actually is `ObjectExpression`
     */
    function parseObjectExpression(): Expression {
        const { start } =  expect(SyntaxKinds.BracesLeftPunctuator);
        let isStart = true;
        const propertyDefinitionList: Array<PropertyDefinition> = [];
        let trailingComma = false;
        while(!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
            if(isStart) {
                propertyDefinitionList.push(parsePropertyDefinition());
                isStart = false;
                continue;
            }
            expect(SyntaxKinds.CommaToken);
            if(match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
                trailingComma = true;
                break;
            }
            propertyDefinitionList.push(parsePropertyDefinition());
        }
        const { end } = expect(SyntaxKinds.BracesRightPunctuator);
        return Factory.createObjectExpression(propertyDefinitionList, trailingComma, start, end);
    }
    /**
     * Parse PropertyDefinition
     * ```
     *  PropertyDefinition := MethodDefintion
     *                     := Property
     *                     := SpreadElement
     * Property := PropertyName '=' AssignmentExpression
     * SpreadElement := '...' AssigmentExpression
     * ```
     * ### How to parse
     * 1. start with `...` operator, must be SpreadElment
     * 2. start with privatename is syntax error, but it is common, so we handle it as sematic problem.
     * 3. check is start with method modifier prefix by helper function `checkIsMethodStartWithModifier`.
     * 4. default case, property name with colon operator.
     * 5. this is speical case, we accept a coverinit in object expression, because object expression
     *    might be transform into object pattern, so we mark accept it and mark it. it coverInit of 
     *    object expression is not transform by `toAssignment` function, it would throw error in the
     *    end of `parseProgram`
     * #### ref: https://tc39.es/ecma262/#prod-PropertyDefinition
     */
    function parsePropertyDefinition(): PropertyDefinition {
        // semantics check for private 
        if(match(SyntaxKinds.PrivateName)) {
            throw createMessageError(ErrorMessageMap.private_field_can_not_use_in_object);
        }
        // spreadElement
        if(match(SyntaxKinds.SpreadOperator)) { 
            const spreadElementStart = getStartPosition();
            nextToken();
            const expr = parseAssigmentExpression();
            return Factory.createSpreadElement(expr, spreadElementStart, cloneSourcePosition(expr.end));
        }
        // start with possible method modifier
        if(checkIsMethodStartWithModifier()) {
            return parseMethodDefintion() as ObjectMethodDefinition;
        }
        // otherwise, it would be Property start with PropertyName or MethodDeinftion start with PropertyName 
        const isComputedRef = { isComputed: false };
        const propertyName = parsePropertyName(isComputedRef);
        if(match(SyntaxKinds.ParenthesesLeftPunctuator)) {
            return parseMethodDefintion(false, propertyName) as ObjectMethodDefinition;
        }
        if(match(SyntaxKinds.ColonPunctuator)) {
            nextToken();
            const expr = parseAssigmentExpression();
            return Factory.createObjectProperty(propertyName, expr , isComputedRef.isComputed, false, cloneSourcePosition(propertyName.start), cloneSourcePosition(expr.end));
        }
        if(match(SyntaxKinds.AssginOperator)) {
            nextToken();
            const expr = parseAssigmentExpression();
            const property = Factory.createObjectProperty(propertyName, expr , isComputedRef.isComputed, false, cloneSourcePosition(propertyName.start), cloneSourcePosition(expr.end));
            context.propertiesInitSet.add(property);
            return property;

        }
        // check if shorted property is keyword or not.
        checkPropertyShortedIsKeyword(propertyName);
        return Factory.createObjectProperty(propertyName, undefined, isComputedRef.isComputed, true, cloneSourcePosition(propertyName.start), cloneSourcePosition(propertyName.end));
    }
    /**
     * This is a helper function for object expression and class for determiate is property
     * a method definition or not.
     * 
     * Please notes that this function only accept regualer syntax, but also accept something 
     * like set and get generator, it will left sematic job for `parseMetodDefinition` method.
     * @returns  {boolean}
     */
    function checkIsMethodStartWithModifier(): boolean {
        if(match(SyntaxKinds.MultiplyOperator)) {
            return true;
        }
        const currentValue = getValue();
        const { kind, flag } = lookahead();
        const isLookAheadValidatePropertyNameStart = 
            Keywords.find(keyword => keyword === kind) ||
            kind === SyntaxKinds.Identifier ||
            kind === SyntaxKinds.StringLiteral ||
            kind === SyntaxKinds.NumberLiteral ||
            kind === SyntaxKinds.BracketLeftPunctuator || 
            kind === SyntaxKinds.MultiplyOperator;
        if(currentValue === "set" && isLookAheadValidatePropertyNameStart) {
            return true
        }
        if(currentValue === "get" && isLookAheadValidatePropertyNameStart) {
            return true
        }
        if(currentValue === "async" && (isLookAheadValidatePropertyNameStart) && !flag) {
            return true
        }
        return false;
    }
    /**
     * Parse PropertyName, using context ref which passed in to record this property is computed or not.
     * 
     * ### Problem of Keyword as PropertyName
     * PropertyName can not only be a identifier but alse can be a keyword in some place, for example, as method
     * of object or class, and it is ok to use it as left value of property name. the syntax error happend when
     * using keyword as shorted property. So when `parsePropertyName` parse a identifier with keyword, it would 
     * check if next token is `(` or `:`, to make sure throw error when parse keyword as shorted property
     * 
     * ```
     * PropertyName := Identifer (IdentifierName, not BindingIdentifier)
     *              := NumberLiteral
     *              := StringLiteral
     *              := ComputedPropertyName
     * ComputedPropertyName := '[' AssignmentExpression ']'
     * ```
     * ref: https://tc39.es/ecma262/#prod-PropertyName
     * @returns {PropertyName}
     */
    function parsePropertyName(isComputedRef: { isComputed: boolean }): PropertyName {
        expectButNotEat([SyntaxKinds.BracketLeftPunctuator, SyntaxKinds.NumberLiteral, SyntaxKinds.StringLiteral, ...IdentiferWithKeyworArray]);
        if(match(SyntaxKinds.StringLiteral)) {
            return parseStringLiteral();
        }
        if(match(SyntaxKinds.NumberLiteral)) {
            return parseNumberLiteral();
        }
        // propty name is a spical test of binding identifier.
        // if `await` and `yield` is propty name with colon (means assign), it dose not affected by scope.
        if(matchSet(IdentiferWithKeyworArray)) {
            const identifer = parseIdentiferWithKeyword();
            return identifer;
        }
        nextToken();
        const expr = parseAssigmentExpression();
        if(match(SyntaxKinds.BracketRightPunctuator)) {
            nextToken();
            isComputedRef.isComputed = true;
            return expr;
        }
        throw createUnexpectError(SyntaxKinds.BracketRightPunctuator);
    }
    /**
     *  propty name is a spical test of binding identifier.
     *  if `await` and `yield` is propty name with colon (means assign), 
     *  it dose not affected by scope.
     * @param propertyName 
     */
    function checkPropertyShortedIsKeyword(propertyName: PropertyName) {
        if(isIdentifer(propertyName)) {
            // @ts-ignore
            if(KeywordSet.has(propertyName.name)) {
                throw createMessageError(ErrorMessageMap.invalid_property_name);
            }
            if(PreserveWordSet.has(propertyName.name) && isInStrictMode()) {
                throw createMessageError(ErrorMessageMap.invalid_property_name);
            }
        }
    }
    /** Parse MethodDefintion, this method should allow using when in class or in object literal.
     *  1. ClassElement can be PrivateName, when it used in object literal, it should throw a error.
     *  2. It should parse modifier when `withPropertyName` is falsey.
     * 
     * ### Parse Modifier
     * we parse modifier according to the pattern `('set' | 'get')? 'async' '*' ClassElement `, this
     * is not a regulat syntax, it may accept wrong syntax, but by accept more case then spec, we cam
     * provide more concies sematic message to developer.
     * ```
     * MethodDefintion := ClassElementName BindingList FunctionBody
     *                 := AyncMethod
     *                 := GeneratorMethod
     *                 := AsyncGeneratorMethod
     *                 := 'set' ClassElementName BindingList FunctionBody
     *                 := 'get' ClassElementName '('')' FunctionBody
     * AyncMethod := 'async' ClassElementName BindingList FunctionBody
     * GeneratorMethod := '*' ClassElementName BindingList FunctionBody
     * AsyncGeneratorMethod := 'async' '*' ClassElementName BindingList FunctionBody
     * ClassElementName := PropertyName
     *                   := PrivateName
     * ```
     * @param {boolean} inClass is used in class or not. 
     * @param {PropertyName | PrivateName | undefined } withPropertyName parse methodDeinfition with exited propertyName or not
     * @param {boolean} isStatic
     * @returns {ObjectMethodDefinition | ClassMethodDefinition | ObjectAccessor | ClassAccessor  | ClassConstructor | ClassProperty}
     */
    function parseMethodDefintion(
        inClass: boolean = false, 
        withPropertyName: PropertyName | PrivateName | undefined = undefined, 
        isStatic: boolean = false
    ): ObjectMethodDefinition | ClassMethodDefinition | ObjectAccessor | ClassAccessor  | ClassConstructor | ClassProperty{
        if(!checkIsMethodStartWithModifier() && !withPropertyName) {
            throw createUnreachError([SyntaxKinds.MultiplyAssignOperator, SyntaxKinds.Identifier]);
        }
        /**
         * Step 1 : if not with propertyName , parse modifier frist, otherwise, if with propertyName, it shouldn't do anything.
         * structure would be like : ('set' | 'get')? 'async' '*' PropertyName  ...., this strcuture isn't match the spec.
         * but in this structure, we can detect some syntax error more concies, like set and get can not use with async
         * or generator.
         */
        let type: MethodDefinition['type'] = "method";
        let isAsync: MethodDefinition['async'] = false;
        let generator: MethodDefinition['generator'] = false;
        let computed: MethodDefinition['computed'] = false;
        let start: SourcePosition | null = null;
        if(!withPropertyName) {
            // frist, is setter or getter
            if(getValue() === "set") {
                type = "set";
                start = getStartPosition();
                nextToken();
            }
            else if(getValue() === "get") {
                type = "get"
                start = getStartPosition();
                nextToken();
            }
            // second, parser async and generator
            const { kind } = lookahead();
            if(getValue() === "async" && kind !== SyntaxKinds.ParenthesesLeftPunctuator) {
                start = getStartPosition();
                isAsync = true;
                nextToken();
                if(match(SyntaxKinds.MultiplyOperator)) {
                    nextToken();
                    generator = true;
                }
            }
            else if(match(SyntaxKinds.MultiplyOperator)) {
                start = getStartPosition();
                generator = true;
                nextToken();
            }
            if(match(SyntaxKinds.PrivateName)) {
                withPropertyName = parsePrivateName();
            }else {
                const isComputedRef = { isComputed: false };
                withPropertyName = parsePropertyName(isComputedRef);
                computed = isComputedRef.isComputed
            }
        }else {
            start = cloneSourcePosition(withPropertyName.start);
        }
        enterFunctionScope(isAsync, generator);
        const parmas = parseFunctionParam();
        const body = parseFunctionBody();
        exitFunctionScope();
        // there we do not need to check parameter list and function name in body strcit mode
        // by the function `checkFunctionNameAndParamsInCurrentFunctionStrictMode`, because 
        // class scope is auto strict mode.
        /**
         * Step 2: semantic and more concise syntax check instead just throw a unexpect
         * token error.
         */
        if(type === "get" && parmas.length > 0) {
            throw createMessageError(ErrorMessageMap.getter_should_never_has_params);
        }
        if(type === "set" ) {
            if(parmas.length !== 1) {
                throw createMessageError(ErrorMessageMap.setter_should_has_only_one_params);
            }
            for(const param of parmas) {
                if(isRestElement(param)) {
                    throw createMessageError(ErrorMessageMap.setter_can_not_have_rest_element_as_argument);
                }
            }
        }
        if(type === "get" && (isAsync || generator)) {
            throw createMessageError(ErrorMessageMap.getter_can_not_be_async_or_generator);
        }
        if(type === "set" && (isAsync || generator)) {
            throw createMessageError(ErrorMessageMap.setter_can_not_be_async_or_generator);
        }
        if(isIdentifer(withPropertyName)) {
            if(withPropertyName.name === "constructor" && isInClassScope()) {
                if(isAsync || generator || isStatic) {
                    throw createMessageError(ErrorMessageMap.constructor_can_not_be_async_or_generator);
                }
                return Factory.createClassConstructor(withPropertyName, body, parmas, start as SourcePosition, cloneSourcePosition(body.end));
            }
        }
        /**
         * Step 3 return based on type, if accessor or methodDefintion
         */
        if(inClass) {
            if(type === "set" || type === "get") {
                return Factory.createClassAccessor(withPropertyName, body, parmas, type, computed, start as SourcePosition, cloneSourcePosition(body.end));
            }
            return Factory.createClassMethodDefintion(
                withPropertyName, body, parmas, isAsync, generator, computed, isStatic,
                start ? start : cloneSourcePosition(withPropertyName.start), 
                cloneSourcePosition(body.end)
            );
        }
        if(type === "set" || type === "get") {
            return Factory.createObjectAccessor(withPropertyName, body, parmas, type, computed, start as SourcePosition, cloneSourcePosition(body.end));
        }
        return Factory.createObjectMethodDefintion(
            withPropertyName, body, parmas, isAsync, generator, computed, 
            start ? start : cloneSourcePosition(withPropertyName.start), 
            cloneSourcePosition(body.end)
        );
    }
    function parseArrayExpression() {
        const { start } = expect(SyntaxKinds.BracketLeftPunctuator);
        const elements: Array<Expression | null> = [];
        let tralingComma = false;
        let isStart = true;
        while(!match(SyntaxKinds.BracketRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
            if(isStart) {
                isStart = false;
            }else {
                expect(SyntaxKinds.CommaToken, "array expression or pattern need comma for separating elements");
            }
            if(matchSet([SyntaxKinds.BracketRightPunctuator, SyntaxKinds.EOFToken])) {
                tralingComma = true;
                break;
            }
            if(match(SyntaxKinds.CommaToken)) {
                elements.push(null);
                continue;
            }
            if(match(SyntaxKinds.SpreadOperator)) {
                const start = getStartPosition();
                nextToken();
                const expr = parseAssigmentExpression();
                elements.push(Factory.createSpreadElement(expr, start, cloneSourcePosition(expr.end)));
            }else {
                const expr = parseAssigmentExpression();
                elements.push(expr);
            }
        }
        const { end } = expect(SyntaxKinds.BracketRightPunctuator);
        return Factory.createArrayExpression(elements, start, end, tralingComma);
    }
    function parseFunctionExpression(isAsync: boolean) {
        enterFunctionScope(isAsync);
        const funcExpr = parseFunction(true);
        exitFunctionScope();
        return Factory.transFormFunctionToFunctionExpression(funcExpr);
    }
    function parseClassExpression() {
        return Factory.transFormClassToClassExpression(parseClass());
    }
    function parseCoverExpressionORArrowFunction() {
        expectButNotEat(SyntaxKinds.ParenthesesLeftPunctuator);
        const { start, end, nodes, trailingComma } = parseArguments();
        if(!context.maybeArrow || !match(SyntaxKinds.ArrowOperator)) {
            // transfor to sequence or signal expression
            for(const element of nodes) {
                if(isSpreadElement(element)) {
                    throw createMessageError(ErrorMessageMap.rest_element_can_not_use_in_cover);
                }
            }
            if(nodes.length === 1) {
                nodes[0].parentheses = true;
                return nodes[0];
            }
            if(trailingComma) {
                throw createMessageError(ErrorMessageMap.sequence_expression_can_not_have_trailing_comma);
            }
            const seq = Factory.createSequenceExpression(nodes, start, end);
            seq.parentheses = true;
            return seq;
        }
        enterFunctionScope();
        const arrowExpr = parseArrowFunctionExpression({start, end, nodes, trailingComma});
        exitFunctionScope();
        return arrowExpr;
    }
    /**
     * Parse arrow function expression, by given argumentlist and meta data, include
     * - start of `(`
     * - end of `)`,
     * - is trailing comma of argument list
     * please notes that this function accept with arguments, not paramemter list, so we need to 
     * transform arguments to parameter list, so we need to call `toAssignment` for each argument.
     * and we also need to check is parameter duplicate.
     * 
     * @param {ASTArrayWithMetaData<Expression> & { trailingComma: boolean }} metaData 
     * @returns {ArrorFunctionExpression}
     */
    function parseArrowFunctionExpression(metaData: ASTArrayWithMetaData<Expression> & { trailingComma: boolean }): ArrorFunctionExpression {
        if(!match(SyntaxKinds.ArrowOperator)) {
            throw createUnexpectError(SyntaxKinds.ArrowOperator);
        }
        if(getLineTerminatorFlag()) {
            throw createMessageError(ErrorMessageMap.no_line_break_is_allowed_before_arrow);
        }
        nextToken();
        const functionArguments = argumentToFunctionParams(metaData.nodes, metaData.trailingComma);
        let body: Expression | FunctionBody | undefined; 
        let isExpression = false;
        if(match(SyntaxKinds.BracesLeftPunctuator)) {
            body = parseFunctionBody();
        }else {
            body = parseAssigmentExpression();
            isExpression = true;
        }
        checkFunctionNameAndParamsInCurrentFunctionStrictMode(null, functionArguments);
        return Factory.createArrowExpression(isExpression, body,  functionArguments, isCurrentFunctionAsync(), cloneSourcePosition(metaData.start), cloneSourcePosition(body.end));
    }
    // Transform argument list to function parameter list, there are some thing we need to check
    // 1. multi spread element is ok to argument list, but parameter list can only have one spread list
    // 2. if argument list last one is spread element, can have trailing comma, but paramemter last is restelement,
    //   it can not have trailing comma.
    // 3. argument list can have duplicate identifier name, but parameter list can not.
    // 4. argument list can have await or yield expression as default value, but paramemter list can not.
    // 5. there are some case dose not enter function scope when parse argument, so we need to check is there any await
    //    and yield usage in parameter list
    // First and second thing toAssignment would check for us. 3 can be done by call `checkFunctionParams`, 4 and 5
    // one can be done by create custome helper function.
    function argumentToFunctionParams(functionArguments: Array<Expression>, trailingComma: boolean): Array<Pattern> {
        const paramaList = functionArguments.map(node => toAssignmentPattern(node, true)) as Array<Pattern>;
        // check as function params
        checkFunctionParams(paramaList);
        checkIsSimpleParameterList(paramaList);
        // extra check
        checkAwaitAndYieldUsageOfArrowParams(paramaList);
        if( isCurrentFunctionAsync() || isCurrentFunctionGenerator()){
            // when parse as argument, it already follow the parent scope rule, now only if 
            // current scope is async or generator we need to check
            paramaList.forEach(param => checkPatternContainInValidAwaitAndYieldValue(param));
        }
        if(checkArrowParamemterHaveMultiSpreadElement(paramaList) && trailingComma) {
            throw createMessageError(ErrorMessageMap.rest_element_can_not_end_with_comma);
        };
        return paramaList;
    }
    function checkAwaitAndYieldUsageOfArrowParams(params: Array<Pattern>) {
        for(const param of params) {
            if(isAssignmentPattern(param)) {
                // parent scope is async, no matter current scope is async or not
                // await expression can not call
                if(isAwaitExpression(param.right)) {
                    throw createMessageError(ErrorMessageMap.await_expression_can_not_used_in_parameter_list);
                }
                // parent scope is generator, arrow expression must not generator,
                // so yield is not illegal
                if(isYieldExpression(param.right)) {
                    throw createMessageError(ErrorMessageMap.yield_expression_can_not_used_in_parameter_list);
                }
            }
        }
    }
    function checkArrowParamemterHaveMultiSpreadElement(params: Array<Pattern>) {
        let flag = false;
        params.forEach((param) => {
            if(flag && isRestElement(param)) {
                throw createMessageError(ErrorMessageMap.rest_element_should_be_last_property);
            }
            if(flag) {
                throw createMessageError(ErrorMessageMap.rest_element_should_be_last_property);
            }
            if(!flag && isRestElement(param)) {
                flag = true;
            }
        });
        return flag;
    }
    function checkPatternContainInValidAwaitAndYieldValue(pattern: Pattern) {
        if(isArrayPattern(pattern)) {
            for(const element of pattern.elements) {
                if(element) {
                    checkPatternContainInValidAwaitAndYieldValue(element)
                }
            }
            return;
        }
        if(isObjectPattern(pattern)) {
            for(const property of pattern.properties) {
                if(isObjectPatternProperty(property)) {
                    if(property.value) {
                        checkPatternContainInValidAwaitAndYieldValue(property.value)
                    }
                    if(!property.value && isIdentifer(property.key)) {
                        checkPatternContainInValidAwaitAndYieldValue(property.key);
                    }
                }else {
                    checkPatternContainInValidAwaitAndYieldValue(property)
                }
            }
            return;
        }
        if(isRestElement(pattern)) {
            checkPatternContainInValidAwaitAndYieldValue(pattern.argument);
            return;
        }
        if(isAssignmentPattern(pattern)) {
            checkPatternContainInValidAwaitAndYieldValue(pattern.left);
            return;
        }
        if(pattern.name === "await" && isCurrentFunctionAsync()) {
            throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
        }
        if(pattern.name === "yield" && isCurrentFunctionGenerator()) {
            throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
        }
    }
/** ================================================================================
 *  Parse JSX
 *  entry point: https://facebook.github.io/jsx/
 * ==================================================================================
 */
    /**
     * Parse JSX Element or JSX Fragment
     * ```
     * PrimaryExpression := JSXElement
     *                   := JSXFragment
     * ```
     */
    function parseJSXElementOrJSXFragment(): JSXElement | JSXFragment {
        const lookaheadToken = lookahead();
        if(lookaheadToken.kind !== SyntaxKinds.GtOperator) {
            return parseJSXElement();
        }else {
            return parseJSXFragment();
        }
    }
    /**
     * Parse JSX Element
     * ```
     * JSXElement := JSXOpeningElement JSXChildren JSXClosingElement
     *            := JSXOpeningElement
     * ```
     * @returns {JSXElement}
     */
    function parseJSXElement(): JSXElement {
        const opeingElement = parseJSXOpeingElement();
        if(opeingElement.selfClosing) {
            return Factory.createJSXElement(opeingElement, null, [], cloneSourcePosition(opeingElement.start), cloneSourcePosition(opeingElement.end));
        }
        const children = parseJSXChildren();
        const closingElement = parseJSXClosingElement();
        return Factory.createJSXElement(opeingElement, closingElement, children, cloneSourcePosition(opeingElement.start), cloneSourcePosition(opeingElement.end));
    }
    /**
     * Parse JSXOpeingElement
     * ```
     * JSXOpeningElement := `<` JSXElementName JSXAtrributes `>`
     *                   := `<` JSXElementName JSXAtrributes `/>`
     * ```
     * @returns {JSXOpeningElement}
     */
    function parseJSXOpeingElement(): JSXOpeningElement {
        const { start } = expect(SyntaxKinds.LtOperator);
        const name = parseJSXElementName();
        const attributes = parseJSXAttributes();
        if(match(SyntaxKinds.GtOperator)) {
            const { end } = expect(SyntaxKinds.GtOperator);
            return Factory.createJSXOpeningElement(name, attributes, false, start, end);
        }
        if(match(SyntaxKinds.JSXSelfClosedToken)) {
            const { end } = expect(SyntaxKinds.JSXSelfClosedToken);
            return Factory.createJSXOpeningElement(name, attributes, true, start, end);
        }
        throw createUnexpectError(null);
    }
    /**
     * Parse name of jsx element or jsx fragment
     * ```
     * JSXElementName := JSXIdentifier
     *                := JSXMemberExpression
     *                := JSXNamespaceName
     * ```
     * @returns {JSXIdentifier | JSXMemberExpression | JSXNamespacedName}
     */
    function parseJSXElementName(): JSXIdentifier | JSXMemberExpression | JSXNamespacedName {
        let name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName = parseJSXIdentifier();
        if(match(SyntaxKinds.ColonPunctuator)) {
            nextToken();
            const subName = parseJSXIdentifier();
            name = Factory.createJSXNamespacedName(name, subName, cloneSourcePosition(name.start), cloneSourcePosition(subName.end))
        }else if (match(SyntaxKinds.DotOperator)) {
            while(match(SyntaxKinds.DotOperator) && !match(SyntaxKinds.EOFToken)) {
                nextToken();
                const property = parseJSXIdentifier();
                name = Factory.createJSXMemberExpression(name, property, cloneSourcePosition(name.start), cloneSourcePosition(property.end));
            }
        }
        return name;
    }
    /**
     * Parse JSX Attributes.
     * ```
     * JSXAttributes := JSXAttributes JSXAttribute
     *               := JSXAttributes JSXSpreadAttribute
     *               := JSXAttribute
     *               := JSXSpreadAttribute
     * JSXAttribute  := JSXAttributeName '=' StringLiteral
     *               := JSXAttributeName '=' JSXExpressionContainer (expression can not be null)
     *               := JSXAttributeName '=' JSXElement
     *               := JSxAttributeName '=' JSXFragment
     *               := JSXAttrbuteName
     * JSXSpreadAttribute := '{''...' AssignmentExpression '}' 
     * JSXAttributeName := JSXIdentifier
     *                  := JSXNamespaceName
     * ```
     * @returns {Array<JSXAttribute | JSXSpreadAttribute>}
     */
    function parseJSXAttributes(): Array<JSXAttribute | JSXSpreadAttribute> {
        const attribute: Array<JSXAttribute | JSXSpreadAttribute> = [];
        while(!match(SyntaxKinds.EOFToken) && !match(SyntaxKinds.GtOperator) && !match(SyntaxKinds.JSXSelfClosedToken)) {
            // parse spread 
            if(match(SyntaxKinds.BracesLeftPunctuator)) {
                nextToken();
                expect(SyntaxKinds.SpreadOperator);
                const expression = parseAssigmentExpression();
                expect(SyntaxKinds.BracesRightPunctuator);
                attribute.push(Factory.createJSXSpreadAttribute(expression,cloneSourcePosition(expression.start), cloneSourcePosition(expression.end) ));
                continue;
            }
            // parse name
            let name: JSXIdentifier | JSXNamespacedName = parseJSXIdentifier();
            if(match(SyntaxKinds.ColonPunctuator)) {
                nextToken;
                const subName = parseJSXIdentifier();
                name = Factory.createJSXNamespacedName(name, subName, cloneSourcePosition(name.start), cloneSourcePosition(subName.end))
            }
            // parse value
            if(match(SyntaxKinds.AssginOperator)) {
                nextToken();
                if(match(SyntaxKinds.StringLiteral)) {
                    const value = parseStringLiteral();
                    attribute.push(Factory.createJSXAttribute(name, value, cloneSourcePosition(name.start),cloneSourcePosition(value.end)));
                    continue;
                }
                if(match(SyntaxKinds.BracesLeftPunctuator)) {
                    const expression = parseJSXExpressionContainer();
                    if(!expression.expression) {
                        throw new Error("right hand side of jsx attribute must have expression if start with `{`");
                    }
                    attribute.push(Factory.createJSXAttribute(name, expression,cloneSourcePosition(name.start), cloneSourcePosition(expression.end) ));
                    continue;
                }
                const element = parseJSXElementOrJSXFragment();
                attribute.push(Factory.createJSXAttribute(name, element, cloneSourcePosition(name.start), cloneSourcePosition(element.end),
                ));
            }else {
                attribute.push(Factory.createJSXAttribute(name, null, cloneSourcePosition(name.start),cloneSourcePosition(name.end)))
            }
        }
        return attribute;
    }
    /**
     * Parse JSX Children
     * ```
     * JSXChildren := JSXChildren JSXChild
     *             := JSXChild
     * JSXChild    := JSXText
     *             := JSXExpressionContainer
     *             := JSXElement
     *             := JSXFragment
     *             := JSXSpreadChild
     * JSXSpreadChild := {'...AssignmentExpression '}'
     * ```
     * @returns {Array<JSXText | JSXExpressionContainer | JSXElement | JSXFragment | JSXSpreadChild>}
     */
    function parseJSXChildren(): JSXElement['children'] {
        const children: JSXElement['children'] = [];
        while(
            !match(SyntaxKinds.JSXCloseTagStart) && 
            !match(SyntaxKinds.EOFToken)
        ) {
            if(match(SyntaxKinds.LtOperator)) {
                children.push(parseJSXElementOrJSXFragment());
                continue;
            }
            if(match(SyntaxKinds.BracesLeftPunctuator)) {
                if(lookahead().kind == SyntaxKinds.SpreadOperator) {
                    expect(SyntaxKinds.BracesLeftPunctuator);
                    expect(SyntaxKinds.SpreadOperator);
                    const expression = parseAssigmentExpression();
                    expect(SyntaxKinds.BracesRightPunctuator);
                    children.push(Factory.createJSXSpreadChild(expression, cloneSourcePosition(expression.start), cloneSourcePosition(expression.end)));
                }
                children.push(parseJSXExpressionContainer());
                continue;
            }
            children.push(parseJSXText());
        }
        return children;
    }
    /**
     * Parse JSX expression container
     * ```
     * JSXExpressionContainer = '{' AssignmentExpression '}'
     * ```
     * @returns {JSXExpressionContainer}
     */
    function parseJSXExpressionContainer(): JSXExpressionContainer {
        const { start } = expect(SyntaxKinds.BracesLeftPunctuator);
        const expression = match(SyntaxKinds.BracesRightPunctuator) ? null : parseAssigmentExpression();
        const { end } = expect(SyntaxKinds.BracesRightPunctuator);
        return Factory.createsJSXExpressionContainer(expression, start, end);
    }
    /**
     * Parse Closing Element of JSXElement
     * ```
     * JSXClosingElement := '</' JSXElementName '>'
     * ```
     * @returns {JSXClosingElement}
     */
    function parseJSXClosingElement(): JSXClosingElement {
        const { start } = expect(SyntaxKinds.JSXCloseTagStart);
        const name = parseJSXElementName();
        const { end } = expect(SyntaxKinds.GtOperator);
        return Factory.createJSXClosingElement(name, start, end);
    }
    /**
     * Same as `parseIdentifierWithKeyword` function.
     * @returns {JSXIdentifier}
     */
    function parseJSXIdentifier(): JSXIdentifier {
        const { start, end, value } =  expect(IdentiferWithKeyworArray);
        return Factory.createJSXIdentifier(value, start, end);
    }
    function parseJSXText(): JSXText {
        let value = "";
        const start = getStartPosition();
        let end = getEndPosition();
        while(!matchSet([SyntaxKinds.EOFToken, SyntaxKinds.JSXCloseTagStart, SyntaxKinds.BracesLeftPunctuator])) {
            value += lexer.getBeforeValue();
            value += getValue();
            end = getEndPosition();
            nextToken();
        }
        value += lexer.getBeforeValue();
        return Factory.createJSXText(value, start, end);
    }
    /**
     * Parse JSXFragment
     * ```
     * JSXFragment := `<``/>` JSXChildern `</``>`
     * ```
     * @returns {JSXFragment}
     */
    function parseJSXFragment(): JSXFragment {
        const { start: openingStart } = expect(SyntaxKinds.LtOperator);
        const { end: openingEnd } = expect(SyntaxKinds.GtOperator);
        const children = parseJSXChildren();
        const { start: closingStart } =  expect(SyntaxKinds.JSXCloseTagStart);
        const { end: closingEnd } = expect(SyntaxKinds.GtOperator);
        return Factory.createJSXFragment(
            Factory.createJSXOpeningFragment(openingStart, openingEnd),
            Factory.createJSXClosingFragment(closingStart, closingEnd),
            children,
            cloneSourcePosition(openingStart),
            cloneSourcePosition(closingEnd),
        );
    }

/** ================================================================================
 *  Parse Pattern
 *  entry point: https://tc39.es/ecma262/#sec-destructuring-binding-patterns
 * ==================================================================================
 */
    /**
     * Parse BindingElement
     * ```
     * BindingElemet := Identifer ('=' AssigmentExpression)?
     *               := BindingPattern ('=' AssigmentExpression)?
     * ```
     * @returns 
     */
    function parseBindingElement(shouldParseAssignment = true): Pattern {
        expectButNotEat([...IdentiferWithKeyworArray, SyntaxKinds.BracesLeftPunctuator, SyntaxKinds.BracketLeftPunctuator]);
        let left: Pattern | undefined ;
        if(matchSet(BindingIdentifierSyntaxKindArray)) {
            left = parseIdentifer();
        }else {
            left = parseBindingPattern();
        }
        if(match(SyntaxKinds.AssginOperator) && shouldParseAssignment) {
            nextToken();
            const right = parseAssigmentExpression();
            return Factory.createAssignmentPattern(left, right, cloneSourcePosition(left.start), cloneSourcePosition(right.end));
        }
        return left;
    }
    function parseRestElement(allowPattern: boolean): RestElement {
        const { start } =  expect([SyntaxKinds.SpreadOperator]);
        let id: Pattern | null = null;
        if(matchSet(BindingIdentifierSyntaxKindArray)) {
            id = parseIdentifer()
        }
        if(matchSet([SyntaxKinds.BracesLeftPunctuator, SyntaxKinds.BracketLeftPunctuator]))  {
            if(allowPattern) {
                id = parseBindingPattern();
            }
            if(!allowPattern) {
                throw createUnexpectError(SyntaxKinds.Identifier);
            }
        }
        if(!id) {
            throw createMessageError(ErrorMessageMap.rest_element_must_be_either_binding_identifier_or_binding_pattern);
        }
        return Factory.createRestElement(id, start, cloneSourcePosition(id.end));
    }
    /**
     * Parse BindingPattern
     * ```
     * BindingPattern := ObjectPattern
     *                := ArrayPattern
     * ```
     */
    function parseBindingPattern(): ObjectPattern | ArrayPattern {
        expectButNotEat([SyntaxKinds.BracesLeftPunctuator, SyntaxKinds.BracketLeftPunctuator]);
        if(match(SyntaxKinds.BracesLeftPunctuator)) {
            return parseObjectPattern();
        }
        return parseArrayPattern();
    }
    /** Parse Object Pattern
     * ```
     * ObjectPattern := '{' ObjectPatternProperties  '}'
     *               := '{' ObjtecPatternProperties ',' '}'
     *               := '{' ObjectPatternProperties ',' RestElement '}'
     *               := '{' RestElement '}
     * ObjectPatternProperties := ObjectPatternProperties ',' ObjectPatternProperty
     * ObjectPatternProperty   := Identifer ('=' AssigmentExpression)
     *                          := BindingPattern ('=' AssignmentExpression) 
     * ```
     * @return {ObjectPattern}
     */
    function parseObjectPattern(): ObjectPattern {
        const { start } =  expect(SyntaxKinds.BracesLeftPunctuator);
        let isStart = false;
        const properties: Array<ObjectPatternProperty | RestElement | AssignmentPattern> = [];
        while(!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
            // eat comma.
            if(!isStart) {
                isStart = true;
            }else {
                expect(SyntaxKinds.CommaToken);
            }
            if(match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
               continue;
            }
            // parse Rest property
            if(match(SyntaxKinds.SpreadOperator)) {
                properties.push(parseRestElement(false));
                // sematic check, Rest Property Must be last,
                if(
                    !(
                        match(SyntaxKinds.BracesRightPunctuator) ||
                        match(SyntaxKinds.CommaToken) && lookahead().kind === SyntaxKinds.BracesRightPunctuator
                    )
                ) {
                    throw createMessageError(ErrorMessageMap.rest_element_should_be_last_property);
                }
                continue;
            }
            // parse Object pattern property
            const isComputedRef = { isComputed: false }
            const propertyName = parsePropertyName(isComputedRef);
            if(match(SyntaxKinds.AssginOperator)) {
                nextToken();
                const expr =  parseAssigmentExpression();
                if(!isPattern(propertyName)) {
                    throw createMessageError("assignment pattern left value can only allow identifier or pattern");
                }
                properties.push(Factory.createAssignmentPattern(propertyName, expr, cloneSourcePosition(propertyName.start), cloneSourcePosition(expr.end)))
                continue;
            }
            if(match(SyntaxKinds.ColonPunctuator)) {
                nextToken();
                const pattern = parseBindingElement();
                properties.push(Factory.createObjectPatternProperty(propertyName, pattern, isComputedRef.isComputed, false, cloneSourcePosition(propertyName.start), cloneSourcePosition(pattern.end)));
                continue;
            }
            // check property name is keyword or not 
            checkPropertyShortedIsKeyword(propertyName);
            properties.push(Factory.createObjectPatternProperty(propertyName, undefined, isComputedRef.isComputed, true, cloneSourcePosition(propertyName.start), cloneSourcePosition(propertyName.end)));
        }
        const { end } =  expect(SyntaxKinds.BracesRightPunctuator);
        return Factory.createObjectPattern(properties, start, end);
    }
    function parseArrayPattern(): ArrayPattern {
        const { start } = expect(SyntaxKinds.BracketLeftPunctuator)
        let isStart = true;
        const elements: Array<Pattern| null> = [];
        while(!match(SyntaxKinds.BracketRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
            if(isStart) {
                isStart = false;
            }else {
                expect(SyntaxKinds.CommaToken)
            }
            if(match(SyntaxKinds.BracketRightPunctuator) || match(SyntaxKinds.EOFToken)) {
                continue;
            }
            if(match(SyntaxKinds.CommaToken)) {
                elements.push(null);
                continue;
            }
            if(match(SyntaxKinds.SpreadOperator)) {
                elements.push(parseRestElement(true));
                if(!match(SyntaxKinds.BracketRightPunctuator)) {
                    throw createMessageError(ErrorMessageMap.rest_element_can_not_end_with_comma);
                }
                break
            }
            elements.push(parseBindingElement());
        }
        const { end } =  expect(SyntaxKinds.BracketRightPunctuator);
        return Factory.createArrayPattern(elements, start, end);
    }
/** ================================================================================
 *  Parse Import Declaration
 *  entry point: https://tc39.es/ecma262/#sec-imports
 * ==================================================================================
 */
    function expectFormKeyword() {
        if(getValue() !== "from") {
            throw createUnexpectError(SyntaxKinds.Identifier, "expect from keyword");
        }
        nextToken();
    }
    /**
     * Parse Import Declaration
     * ```
     * ImportDeclaration := 'import'  ImportClasue FromClause
     *                   := 'import'  StringLiteral
     * FromClause := 'from' StringLiteral
     * ImportClause := ImportDefaultBinding
     *              := ImportNamesapce
     *              := ImportNamed
     *              := ImportDefaultBindling ',' ImportNamed
     *              := ImportDefaultBindling ',' ImportNamespace
     * ```
     * - frist, eat import keyword
     *   1. if it is string literal, must be `import StringLiteral`
     *   2. if it start with `*`, must be import name space
     *   3. if it start with '{', must be import named 
     *   4. fallback case: default import with import named or import namesspace
     *      or nothing
     * @returns {ImportDeclaration}
     */
    function parseImportDeclaration(): ImportDeclaration {
        const { start } =  expect(SyntaxKinds.ImportKeyword)
        const specifiers: Array<ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier> = [];
        if(match(SyntaxKinds.StringLiteral)) {
            const source = parseStringLiteral();
            semi();
            return Factory.createImportDeclaration(specifiers, source, start, cloneSourcePosition(source.end));
        }
        if(match(SyntaxKinds.MultiplyOperator)) {
            specifiers.push(parseImportNamespaceSpecifier());
            expectFormKeyword();
            const source = parseStringLiteral();
            semi();
            return Factory.createImportDeclaration(specifiers, source, start, cloneSourcePosition(source.end));
        }
        if(match(SyntaxKinds.BracesLeftPunctuator)) {
            parseImportSpecifiers(specifiers);
            expectFormKeyword();
            const source = parseStringLiteral();
            semi();
            return Factory.createImportDeclaration(specifiers, source, start, cloneSourcePosition(source.end));
        }
        specifiers.push(parseImportDefaultSpecifier());
        if(match(SyntaxKinds.CommaToken)) {
            nextToken();
            if(match(SyntaxKinds.BracesLeftPunctuator)) {
                parseImportSpecifiers(specifiers);
            }else if (match(SyntaxKinds.MultiplyOperator)) {
                specifiers.push(parseImportNamespaceSpecifier());
            }else {
                throw createMessageError("import default specifier can only concat with namespace of import named specifier");
            }
        }
        expectFormKeyword();
        const source = parseStringLiteral();
        semi();
        return Factory.createImportDeclaration(specifiers, source, start, cloneSourcePosition(source.end));
    }
    /**
     * Parse Default import binding
     * ```
     * ImportDefaultBinding := Identifer
     * ```
     * @returns {ImportDefaultSpecifier}
     */
    function parseImportDefaultSpecifier(): ImportDefaultSpecifier {
        const name = parseIdentifer();
        return Factory.createImportDefaultSpecifier(name, cloneSourcePosition(name.start), cloneSourcePosition(name.end));
    }
    /**
     * Parse namespace import 
     * ```
     * ImportNamespace := '*' 'as' Identifer
     * ```
     * @returns {ImportNamespaceSpecifier}
     */
    function parseImportNamespaceSpecifier(): ImportNamespaceSpecifier {
        const { start } =  expect(SyntaxKinds.MultiplyOperator);
        if(getValue()!== "as") {
            throw createMessageError("import namespace specifier must has 'as'");
        }
        nextToken();
        const id = parseIdentifer()
        return Factory.createImportNamespaceSpecifier(id, start, cloneSourcePosition(id.end));
    }
    /**
     * Parse Import Nameds
     * ```
     *  ImportNamed := '{' ImportList ','? '}'
     *  ImportList  := [ ImportItem ]
     *  ImportItem  := IdentiferWithKeyword
     *              := (Identifer | StringLiteral) 'as' Identifer
     * ```
     * @param specifiers
     * @return {void}
     */
    function parseImportSpecifiers(specifiers: Array<ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier>): void {
        expect(SyntaxKinds.BracesLeftPunctuator);
        let isStart = true;
        while(!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
            if(isStart) {
                isStart = false;
            }else {
                expect(SyntaxKinds.CommaToken);
            }
            if(match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
                break;
            }
            if(matchSet([SyntaxKinds.Identifier, ...Keywords])) {
                const imported = parseIdentiferWithKeyword();
                if(getValue() !== "as") {
                    // @ts-ignore
                    if(KeywordLiteralMapSyntaxKind[imported.name]) {
                        throw createMessageError(ErrorMessageMap.keyword_can_not_use_in_imported_when_just_a_specifier);
                    }
                    specifiers.push(Factory.createImportSpecifier(imported, null, cloneSourcePosition(imported.start), cloneSourcePosition(imported.end)));
                    continue;
                }
                nextToken();
                const local = parseIdentifer();
                specifiers.push(Factory.createImportSpecifier(imported, local, cloneSourcePosition(imported.start), cloneSourcePosition(local.end)));
            }else if(match(SyntaxKinds.StringLiteral)) {
                const imported = parseStringLiteral();
                if(getValue() !== "as") {
                    specifiers.push(Factory.createImportSpecifier(imported, null, cloneSourcePosition(imported.start), cloneSourcePosition(imported.end)));
                    continue;
                }
                nextToken();
                const local = parseIdentifer();
                specifiers.push(Factory.createImportSpecifier(imported, local, cloneSourcePosition(imported.start), cloneSourcePosition(local.end)));
            }else {
                throw createUnexpectError(SyntaxKinds.Identifier, "import specifier must start with strinhLiteral or identifer")
            }
        }
        expect(SyntaxKinds.BracesRightPunctuator);
    } 
/** ================================================================================
 *  Parse Export Declaration
 *  entry point: https://tc39.es/ecma262/#prod-ExportDeclaration
 * ==================================================================================
 */
    /**
     * Parse Export Declaration
     * ```
     * ExportDeclaration := 'export' ExportNamedDeclaration ';'?
     *                   := 'export' ExportDefaultDeclaration 
     *                   := 'export' ExportAllDeclaration
     * ExportNamedDeclaration := '{' ExportList  '}' ('from' StringLiteral)?
     *                        := Declaration
     *                        := VarStatement
     * ExportAllDeclaration := '*' 'from' StringLiteral
     *                      := '*' 'as'  Identifer 'from' StringLiteral
     * ```
     * @returns {ExportDeclaration}
     */
    function parseExportDeclaration(): ExportDeclaration {
        const {start} = expect(SyntaxKinds.ExportKeyword);
        if(match(SyntaxKinds.DefaultKeyword)) {
            return parseExportDefaultDeclaration(start);
        }
        if(match(SyntaxKinds.MultiplyOperator)) {
            return parseExportAllDeclaration(start);
        }
        if(match(SyntaxKinds.BracesLeftPunctuator)) {
            return parseExportNamedDeclaration(start);
        }
        const declaration = match(SyntaxKinds.VarKeyword) ? parseVariableDeclaration() : parseDeclaration();
        return Factory.createExportNamedDeclaration([], declaration, null, start, cloneSourcePosition(declaration.end));
    }
    function parseExportDefaultDeclaration(start: SourcePosition): ExportDefaultDeclaration{
        expect(SyntaxKinds.DefaultKeyword);
        if(match(SyntaxKinds.ClassKeyword)) {
            let classDeclar = parseClass();
            classDeclar = Factory.transFormClassToClassExpression(classDeclar);
            semi();
            return Factory.createExportDefaultDeclaration(classDeclar as ClassDeclaration | ClassExpression, start, cloneSourcePosition(classDeclar.end));
        }
        if(match(SyntaxKinds.FunctionKeyword)) {
            let funDeclar = parseFunctionExpression(false);
            semi();
            return Factory.createExportDefaultDeclaration(funDeclar as FunctionDeclaration | FunctionExpression, start, cloneSourcePosition(funDeclar.end));
        }   
        if(getValue() === "async" && lookahead().kind === SyntaxKinds.FunctionKeyword) {
            nextToken();
            const funDeclar = parseFunctionExpression(true);
            semi();
            return Factory.createExportDefaultDeclaration(funDeclar, start, cloneSourcePosition(funDeclar.end));
        }
        // TODO: parse export default from ""; (experimental feature)
        const expr = parseAssigmentExpression();
        semi();
        return Factory.createExportDefaultDeclaration(expr, start, cloneSourcePosition(expr.end));
    }
    function parseExportNamedDeclaration(start: SourcePosition): ExportNamedDeclarations {
        expect(SyntaxKinds.BracesLeftPunctuator);
        const specifier: Array<ExportSpecifier> = []; 
        let isStart = true;
        while(!match(SyntaxKinds.BracesRightPunctuator) && !match(SyntaxKinds.EOFToken)) {
            if(isStart) {
                isStart = false;
            }else {
                expect(SyntaxKinds.CommaToken);
            }
            if(match(SyntaxKinds.BracesRightPunctuator) || match(SyntaxKinds.EOFToken)) {
                break;
            }
            // TODO: reafacor into parseModuleName ?
            const exported = matchSet([SyntaxKinds.Identifier, ...Keywords]) ? parseIdentiferWithKeyword() : parseStringLiteral();
            if(getValue() === "as") {
                nextToken();
                const local = matchSet([SyntaxKinds.Identifier, ...Keywords]) ? parseIdentiferWithKeyword() : parseStringLiteral();
                specifier.push(Factory.createExportSpecifier(exported, local, cloneSourcePosition(exported.start), cloneSourcePosition(local.end)));
                continue;
            }
            specifier.push(Factory.createExportSpecifier(exported, null, cloneSourcePosition(exported.start), cloneSourcePosition(exported.end)));
        }
        const { end: bracesRightPunctuatorEnd } = expect(SyntaxKinds.BracesRightPunctuator);
        let source: StringLiteral | null = null;
        if(getValue () === "from") {
            nextToken();
            source = parseStringLiteral();
        }
        semi();
        const end = source ? source.end: specifier.length === 0 ? bracesRightPunctuatorEnd : specifier[specifier.length-1].end;
        return Factory.createExportNamedDeclaration(specifier, null, source, start, cloneSourcePosition(end));
    }
    function parseExportAllDeclaration(start: SourcePosition): ExportAllDeclaration {
        expect(SyntaxKinds.MultiplyOperator);
        let exported: Identifier | null = null;
        if(getValue() === "as") {
            nextToken();
            exported = parseIdentiferWithKeyword();
        }else {
            exported  = null;
        }
        expectFormKeyword();
        const source = parseStringLiteral();
        semi();
        return Factory.createExportAllDeclaration(exported, source, start, cloneSourcePosition(source.end));
    }
}