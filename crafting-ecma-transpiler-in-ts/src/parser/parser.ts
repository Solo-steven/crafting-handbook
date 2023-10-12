import { 
    Expression, 
    FunctionBody, 
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
} from "@/src/common";
import { ErrorMessageMap } from "./error";
import { createLexer } from "../lexer/index";


/** ========================
 *  Context for parser
 * =========================
 */
interface Context {
    maybeArrow: boolean;
    // ====================================================================================
    // function context indicate current function state (async or generator).
    // - used by checking if await expression validate (parent function block must be async).
    // - used by checking yield expression  validare (parent function block must be generator).
    // *** when call `parseFunctionDeclaration` `parseFunctionExpression` `parseArrowFunctionExpression` 
    // *** must wrap by context helper function `enterFunctionScope`, `exitFunctionScope` 
    functionContext: Array<[boolean, boolean, boolean]>; // tuple (isAsync, isGenerator)
    // ====================================================================================
    // class context indicate current class state (is in class ?, have extend class ?)
    // - used by checking super call validate (must in class block and have extend class)
    // - used by checking private name in expression is validate (must in class block).
    // - NOTE: method and property can not use private name have already been check, because by which call
    //   `parseMethodDefinition`, we can know is in class or object.
    // *** when class `parseClass` must wrap helper function before and after parse class body
    classContext: Array<[boolean]>,
    // ====================================================================================
    // when parse for-in statement, we need to ignore `in` operator to seperate left and right
    // expression of for-in statement, so we need to know is current expression level is call by 
    // for-in statement, and expression level is determinate by `parseExpression` and 
    // `parseAssignmentExpression` function.
    inOperatorStack: Array<boolean>,
    // ====================================================================================
    // when parse ObjectExpression, we may accept coverInit for transform to ObjectPattern,
    // because coverInit is not a illegal syntax of ObjectExpression, so it must be transform.
    // so when program finish parse, but there are still some coverInitProperty not transformed
    // yet, those would be error syntax.
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
        functionContext: [],
        classContext: [],
        maybeArrow: false,
        inOperatorStack: [],
        propertiesInitSet: new Set(),
    }
}

const IdentiferWithKeyworArray = [SyntaxKinds.Identifier, ...Keywords];
const BindingIdentifierSyntaxKindArray = [SyntaxKinds.Identifier, SyntaxKinds.AwaitKeyword, SyntaxKinds.YieldKeyword, SyntaxKinds.LetKeyword];
const LexicalKeywordSet = new Set(LexicalLiteral.keywords);
/**
 * 
 * @param code 
 * @returns 
 */
export function createParser(code: string) {
    const lexer = createLexer(code);

/** =========================================================================
 *   Composition method from lexer, Context of parsr, Util helper for parser
 * ==========================================================================
 */
    const context = createContext();
    function parse() {
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
     * @returns {SyntaxKinds}
     */
    function lookahead(): SyntaxKinds {
        return lexer.lookahead();
    }
    function readRegex() {
        return lexer.readRegex();
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
        if(lexer.predictLinTerminateOREOF()) {
            return true;
        }
        if(canIgnore) {
            return false;
        }
        throw createMessageError(ErrorMessageMap.missing_semicolon);
    }
    function predictLineTerminate() {
        return lexer.predictLineTerminate();
    }
    /**
     * Create a Message error from parser's error map.
     * @param {string} messsage 
     */
    function createMessageError(messsage: string, position?: SourcePosition) {
        if(position === undefined)
            position = getStartPosition();
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return new Error(`[Syntax Error]: ${messsage} (${position.row}, ${position.col}), got token ${SytaxKindsMapLexicalLiteral[getToken()]}`);
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
        return new Error(`[Syntax Error]: Unexpect token${message}, got ${getToken()}(${getValue()}). ${getStartPosition().row},${getStartPosition().col}.${messsage}`);
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
    function enterFunctionScope(isAsync: boolean = false, isGenerator: boolean = false) {
        context.functionContext.push([isAsync, isGenerator, false]);
    }
    function exitFunctionScope() {
        context.functionContext.pop();
    }
    function enterFunctionParameter() {
        if(context.functionContext.length === 0) {
            return;
        }
        context.functionContext[context.functionContext.length-1][2] = true;
    }
    function existFunctionParameter() {
        if(context.functionContext.length === 0) {
            return;
        }
        context.functionContext[context.functionContext.length-1][2] = false;
    }
    function mutateCurrentFunctionScope(isGenerator: boolean) {
        if(context.functionContext.length === 0) {
            return;
        }
        context.functionContext[context.functionContext.length -1][1] = isGenerator;
    }
    function isTopLevel() {
        return context.functionContext.length === 1;
    }
    function isCurrentFunctionAsync(): boolean {
        if(context.functionContext.length === 0) {
            return false;
        }
        return context.functionContext[context.functionContext.length -1][0];
    }
    function isInParameter() {
        if(context.functionContext.length === 0) {
            return false;
        }
        return context.functionContext[context.functionContext.length -1][2];
    }
    function isParentFunctionAsync(): boolean {
        if(context.functionContext.length < 2) {
            return false;
        }
        return context.functionContext[context.functionContext.length -2][0];
    }
    function isParentFunctionGenerator(): boolean {
        if(context.functionContext.length < 2) {
            return false;
        }
        return context.functionContext[context.functionContext.length -2][1];   
    }
    function isCurrentFunctionGenerator() {
        if(context.functionContext.length === 0) {
            return false;
        }
        return context.functionContext[context.functionContext.length -1][1];
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
                if(lookahead() === SyntaxKinds.DotOperator || lookahead () === SyntaxKinds.ParenthesesLeftPunctuator) {
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
                if(getValue() === "async" && lookahead() === SyntaxKinds.FunctionKeyword) {
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
        const lookaheadToken = lookahead();
        if(
            lookaheadToken === SyntaxKinds.BracesLeftPunctuator || // object pattern
            lookaheadToken === SyntaxKinds.BracketLeftPunctuator || // array pattern
            lookaheadToken === SyntaxKinds.Identifier   || // id
            lookaheadToken === SyntaxKinds.AwaitKeyword ||
            lookaheadToken === SyntaxKinds.YieldKeyword 
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
                    if(predictLineTerminate()) {
                        throw createMessageError(ErrorMessageMap.missing_semicolon);
                    }
                    enterFunctionScope(true);
                    const funDeclar = parseFunctionDeclaration();
                    exitFunctionScope();
                    return funDeclar;
                } else {
                   throw createUnreachError();
                }
            // function delcaration
            case SyntaxKinds.FunctionKeyword: 
                enterFunctionScope(false);
                const functionExpr = parseFunctionDeclaration();
                exitFunctionScope();
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
                if(match(SyntaxKinds.Identifier)  && lookahead() === SyntaxKinds.ColonPunctuator ) {
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
    function helperCheckDeclarationmaybeForInOrForOfStatement(declaration: VariableDeclaration) {
        if(declaration.declarations.length > 1) {
            throw createMessageError(ErrorMessageMap.for_in_of_loop_can_not_have_one_more_binding);
        }
        if(declaration.declarations[0].init !== null) {
            throw createMessageError(ErrorMessageMap.for_in_of_loop_can_not_using_initializer);
        }
    }
    /**
     * this function is a helper function for 
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
                    throw new Error("binding no member expression");
                }
                if(context.propertiesInitSet.has(objectPropertyNode) && !objectPropertyNode.shorted) {
                    context.propertiesInitSet.delete(objectPropertyNode);
                    if(objectPropertyNode.computed || !isIdentifer(objectPropertyNode.key)) {
                        throw createMessageError("");
                    }
                    return Factory.createAssignmentPattern(
                        objectPropertyNode.key,
                        toAssignmentPattern(objectPropertyNode.value as Expression) as Pattern,
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
     * 
     */
   function parseForStatement(): ForStatement | ForInStatement | ForOfStatement {
        const { start: keywordStart }  = expect(SyntaxKinds.ForKeyword);
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
            leftOrInit = null;
        }else {
            leftOrInit = parseExpression(false);
        }
        // branch
        if(match(SyntaxKinds.SemiPunctuator)) {
            // ForStatement
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
        // when 
        if(!leftOrInit) {
            throw createUnreachError();
        }
        if (match(SyntaxKinds.InKeyword)) {
            // ForInStatement when left is variableDeclaration.
            if(leftOrInit.kind === SyntaxKinds.VariableDeclaration) {
                helperCheckDeclarationmaybeForInOrForOfStatement(leftOrInit);
            }else {
                leftOrInit = toAssignmentPattern(leftOrInit as Expression) as Expression;
            }
            nextToken();
            const right = parseExpression();
            expect(SyntaxKinds.ParenthesesRightPunctuator);
            const body = parseStatement();
            return Factory.createForInStatement(leftOrInit, right, body, keywordStart, cloneSourcePosition(body.end));
        }
        if(getValue() === "of") {
            // ForOfStatement
            if(leftOrInit.kind === SyntaxKinds.VariableDeclaration) {
                helperCheckDeclarationmaybeForInOrForOfStatement(leftOrInit);
            }
            if(!isVarDeclaration(leftOrInit)) {
                leftOrInit = toAssignmentPattern(leftOrInit) as Expression;
            }
            if(isAssignmentPattern(leftOrInit)) {
                throw createMessageError(ErrorMessageMap.invalid_left_value);
            }
            nextToken();
            const right = parseAssigmentExpression();
            expect(SyntaxKinds.ParenthesesRightPunctuator);
            const body = parseStatement();
            return Factory.createForOfStatement(isAwait, leftOrInit, right, body, keywordStart, cloneSourcePosition(body.end));
        }
        if(match(SyntaxKinds.ParenthesesRightPunctuator)) {
            throw createMessageError(ErrorMessageMap.for_in_of_loop_can_not_using_initializer);
        }
        throw createUnreachError();
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
        const body: Array<StatementListItem> = [];
        while(!match(SyntaxKinds.BracesRightPunctuator) &&  !match(SyntaxKinds.EOFToken) ) {
            body.push(parseStatementListItem());
        }
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
        if(!match(SyntaxKinds.Identifier) || lookahead() !== SyntaxKinds.ColonPunctuator) {
            // TODO: unreach
        }
        const label = parseIdentifer();
        expect(SyntaxKinds.ColonPunctuator);
        if(match(SyntaxKinds.FunctionKeyword)) {
            const delcar = parseFunctionDeclaration();
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
     * 
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
            // TODO: refactor using parseBindingElement
            let id: Pattern ;
            let isBindingPattern = false;
            if(matchSet(BindingIdentifierSyntaxKindArray)) {
                if(variableKind === "lexical" && match(SyntaxKinds.LetKeyword)) {
                    throw createMessageError(ErrorMessageMap.let_keyword_can_not_use_as_identifier_in_lexical_binding);
                }
                id = parseIdentifer();
            }else {
                isBindingPattern = true;
                id = parseBindingPattern();
                if(variableKind === "lexical" && isPatternContainLetValue(id)) {
                    throw createMessageError(ErrorMessageMap.let_keyword_can_not_use_as_identifier_in_lexical_binding);
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
    function isPatternContainLetValue(pattern: Pattern): boolean {
        if(isArrayPattern(pattern)) {
            for(const element of pattern.elements) {
                if(element) {
                    if(isPatternContainLetValue(element)) {
                        return true;
                    }
                }
            }
        }
        if(isObjectPattern(pattern)) {
            for(const property of pattern.properties) {
                if(isObjectPatternProperty(property)) {
                    if(property.value && isPatternContainLetValue(property.value)) {
                        return true
                    }
                    if(!property.value && isIdentifer(property.key) && isPatternContainLetValue(property.key)) {
                        return true;
                    }
                }else {
                    if(isPatternContainLetValue(property)) {
                        return true;
                    }
                }
            }
        }
        if(isRestElement(pattern)) {
            if(isPatternContainLetValue(pattern.argument)) {
                return true;
            }
        }
        if(isAssignmentPattern(pattern)) {
            if(isPatternContainLetValue(pattern.left)) {
                return true;
            }
        }
        if(isIdentifer(pattern)) {
            if(pattern.name === "let") {
                return true;
            }
        }
        return false;
    }
    function parseFunctionDeclaration() {
        const func = parseFunction(false);
        return Factory.transFormFunctionToFunctionDeclaration(func);
    }
    /**
     * 
     * @returns 
     */
    function parseFunction(isExpression: boolean) {
        const { start } = expect(SyntaxKinds.FunctionKeyword);
        let generator = false;
        if(match(SyntaxKinds.MultiplyOperator)) {
            generator = true;
            mutateCurrentFunctionScope(true);
            nextToken();
        }
        let name: Identifier | null = null;
        if(match(SyntaxKinds.Identifier)) {
            name = parseIdentifer();
        }
        if(match(SyntaxKinds.AwaitKeyword)) {
            if(isExpression && isCurrentFunctionAsync()) {
                throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
            }
            if(!isExpression && isParentFunctionAsync()) {
                throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
            }
            name = parseIdentiferWithKeyword();
        }
        if(match(SyntaxKinds.YieldKeyword)) {
            if(isExpression && isCurrentFunctionGenerator()) {
                throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
            }
            if(!isExpression && isParentFunctionGenerator()) {
                throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
            }
            name = parseIdentiferWithKeyword();
        }
        if(match(SyntaxKinds.LetKeyword)) {
            name = parseIdentiferWithKeyword();
        }
        if(name === null && !isExpression) {
            throw createMessageError("Function name of FunctionDeclaration can not be null");
        }
        const params = parseFunctionParam();
        const body = parseFunctionBody();
        return Factory.createFunction(name, body, params, generator, isCurrentFunctionAsync(), start, cloneSourcePosition(body.end));
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
     * Parse Function Params
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
        existFunctionParameter();
        return params;
    }
    function checkFunctionParams(params: Array<Pattern>) {
        const paramsSet = new Set<string>();
        for(const param of params) {
            checkParam(param, paramsSet);
        }
    }
    function checkParam(param: Pattern, paramSet: Set<string>) {
        if(isIdentifer(param)) {
            checkParamName(param.name, paramSet);
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
    function checkParamName(name: string, paramSet: Set<string>) {
        if(paramSet.has(name)) {
            throw createMessageError(ErrorMessageMap.duplicate_param);
        }
        paramSet.add(name);
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
        if(getValue() === "static" && lookahead() !== SyntaxKinds.ParenthesesLeftPunctuator) {
            nextToken();
            isStatic = true;
        }    
        if(helperIsMethodStartWithModifier()) {
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
    function parseExpressionStatement() {
        const expr = parseExpression();
        semi();
        return Factory.createExpressionStatement(expr, cloneSourcePosition(expr.start), cloneSourcePosition(expr.end));
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
    function parseAssigmentExpressionBase() {
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
        const right = parseAssigmentExpression();
        return Factory.createAssignmentExpression(left, right, operator as AssigmentOperatorKinds, cloneSourcePosition(left.start), cloneSourcePosition(right.end));  
    }
    function parseAssigmentExpression(allowIn = true): Expression {
        context.inOperatorStack.push(allowIn);
        const expr = parseAssigmentExpressionBase();
        context.inOperatorStack.pop();
        return expr;
    }
    function parseYieldExpression() {
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
    function getCurrentInOperatorStack() {
        if(context.inOperatorStack.length === 0) {
            return false;
        }
        return context.inOperatorStack[context.inOperatorStack.length-1];
    }
    function getBinaryPrecedence(kind: SyntaxKinds) {
        switch(kind) {
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
    function parseBinaryOps(left: Expression , lastPre = 0): Expression {
        // eslint-disable-next-line no-constant-condition
        while(1) {
            const currentOp = getToken();
            if(!isBinaryOps(currentOp) || getBinaryPrecedence(currentOp) < lastPre) {
                break;
            }
            nextToken();
            let right = parseUnaryExpression();
            const nextOp = getToken();
            if(isBinaryOps(nextOp) && (getBinaryPrecedence(nextOp) > getBinaryPrecedence(currentOp))) {
                right =  parseBinaryOps(right, getBinaryPrecedence(nextOp));
            }
            left = Factory.createBinaryExpression(left, right, currentOp as BinaryOperatorKinds, cloneSourcePosition(left.start), cloneSourcePosition(right.end));
        }
        return left;
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
            const operator = getToken () as UpdateOperatorKinds;
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
     * Parse Left hand side Expression
     * ```
     *  LeftHandSideExpression := Atoms '?.' CallExpression
     *                         := Atoms '?.' MemberExpression
     *                         := Atoms TagTemplateExpression
     * // notes: this syntax is reference babel function, which is simplify original syntax of TS39
     * // notes: 'this' and super 'super' would be meanful when apper at start of atoms, which can be handle by parseAtoms.
     * // notes: NewExpression is a spacial case , because it can not using optionalChain, so i handle it into a atom.
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
            else if (match(SyntaxKinds.DotOperator) || match(SyntaxKinds.BracketLeftPunctuator) || optional) {
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
        if(!match(SyntaxKinds.ParenthesesLeftPunctuator)) {
            throw createUnreachError([SyntaxKinds.ParenthesesLeftPunctuator]);
        }
        expectButNotEat([SyntaxKinds.ParenthesesLeftPunctuator]);
        const { nodes, end } = parseArguments();
        return Factory.createCallExpression(callee, nodes, optional, cloneSourcePosition(callee.start), end);
    }
    /**
     * Parse Arguments
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
     * Parse MemberExpression with base
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
        if(match(SyntaxKinds.DotOperator)) {
            expect(SyntaxKinds.DotOperator);
            const property = parseIdentiferWithKeyword();
            return Factory.createMemberExpression(false, base, property, optional, cloneSourcePosition(base.start), cloneSourcePosition(property.end));
        }
        else if(match(SyntaxKinds.BracketLeftPunctuator)){
            expect(SyntaxKinds.BracketLeftPunctuator);
            const property = parseExpression();
            const { end } = expect(SyntaxKinds.BracketRightPunctuator)
            return Factory.createMemberExpression(true, base, property, optional, cloneSourcePosition(base.start), end);
        }else {
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
                const lookaheadToken = lookahead();
                if(lookaheadToken === SyntaxKinds.DotOperator)
                    return parseImportMeta();
                if(lookaheadToken === SyntaxKinds.ParenthesesLeftPunctuator) {
                    return parseImportCall();
                }
            case SyntaxKinds.NewKeyword: {
                const lookaheadToken = lookahead();
                if(lookaheadToken === SyntaxKinds.DotOperator) {
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
                enterFunctionScope();
                const expr = parseFunctionExpression();
                exitFunctionScope();
                return expr;
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
                const lookaheadToken = lookahead();
                // case 1: async <Identifer> ==> must be async <id> => {};
                if(
                    lookaheadToken === SyntaxKinds.ArrowOperator || 
                    (
                        getValue() === "async"  && (
                            lookaheadToken === SyntaxKinds.Identifier ||
                            lookaheadToken === SyntaxKinds.YieldKeyword ||
                            lookaheadToken === SyntaxKinds.AwaitKeyword
                        ))
                ) {
                    if(getValue() === "async") {
                        enterFunctionScope(true);
                        nextToken();
                        if(predictLineTerminate()) {
                            throw createMessageError(ErrorMessageMap.missing_semicolon);
                        }
                    }else {
                        enterFunctionScope();
                    }
                    const argus = [parseIdentifer()];
                    const arrowExpr = parseArrowFunctionExpression({
                        nodes: argus,
                        start: argus[0].start,
                        end: argus[0].end,
                        trailingComma: false
                    });
                    exitFunctionScope();
                    return arrowExpr;
                }
                // case 2 async ( ===> must be `async (<Argument>) => {}`;
                if(getValue() === "async"  && lookaheadToken === SyntaxKinds.ParenthesesLeftPunctuator) {
                    nextToken();
                    if(predictLineTerminate()) {
                        throw createMessageError(ErrorMessageMap.missing_semicolon);
                    }
                    enterFunctionScope(true);
                    const arrowFunExpr = parseArrowFunctionExpression(parseArguments());
                    exitFunctionScope();
                    return arrowFunExpr;
                }
                // case 3 async function ==> must be async function <id> () {}
                if(getValue() === "async" && lookahead() === SyntaxKinds.FunctionKeyword) {
                    nextToken();
                    if(predictLineTerminate()) {
                        throw createMessageError(ErrorMessageMap.missing_semicolon);
                    }
                    enterFunctionScope(true);
                    const functionExpr = parseFunctionExpression();
                    exitFunctionScope();
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
    function parseIdentifer(): Identifier {
        expectButNotEat([SyntaxKinds.Identifier, SyntaxKinds.AwaitKeyword, SyntaxKinds.YieldKeyword, SyntaxKinds.LetKeyword]);
        if(match(SyntaxKinds.YieldKeyword)) {
            if (!isCurrentFunctionGenerator()) {
                const { value, start, end } = expect(SyntaxKinds.YieldKeyword);
                return Factory.createIdentifier(value, start, end);
            }
            throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
        }
        if(match(SyntaxKinds.AwaitKeyword)) {
            if(!isCurrentFunctionAsync()) {
                const { value, start, end } = expect(SyntaxKinds.AwaitKeyword);
                return Factory.createIdentifier(value, start, end);
            }
            throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
        }
        if(match(SyntaxKinds.LetKeyword)) {
            const { value, start, end } = expect(SyntaxKinds.LetKeyword);
            return Factory.createIdentifier(value, start, end);
        }
        const { value, start, end } = expect(SyntaxKinds.Identifier);
        return Factory.createIdentifier(value, start, end);
    }
    function parseIdentiferWithKeyword() {
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
        if(match(SyntaxKinds.NewKeyword) && lookahead() !== SyntaxKinds.DotOperator ) {
            return parseNewExpression();
        }
        let base = parsePrimaryExpression();
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
     * Parse ObjectLiterial
     * ```text
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
     * - start with `...` operator, must be SpreadElment
     * - start with some method modifier like `set`, `get`, `async`, `*` must be MethodDefintion
     * then parse PropertyName frist
     *   - start with `(`, must be MethodDefintion
     *   - otherwise, is ObjectProperty with or without init. 
     * #### ref: https://tc39.es/ecma262/#prod-PropertyDefinition
     */
    function helperIsMethodStartWithModifier() {
        const currentValue = getValue();
        const lookaheadToken = lookahead();
        if(currentValue === "set" && lookaheadToken === SyntaxKinds.Identifier) {
            return true
        }
        if(currentValue === "get" && lookaheadToken === SyntaxKinds.Identifier) {
            return true
        }
        if(
            currentValue === "async" && 
            (lookaheadToken === SyntaxKinds.Identifier || lookaheadToken === SyntaxKinds.MultiplyOperator)
        ) {
            return true
        }
        if(match(SyntaxKinds.MultiplyOperator)) {
            return true;
        }
        return false;

    }
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
        // if token match '*', 'async' , 'set', 'get'  is must be MethodDefintion
        if(helperIsMethodStartWithModifier()) {
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
            const expr = parseAssigmentExpression()
            return Factory.createObjectProperty(propertyName, expr , isComputedRef.isComputed, false, cloneSourcePosition(propertyName.start), cloneSourcePosition(expr.end));
        }
        if(match(SyntaxKinds.AssginOperator)) {
            nextToken();
            const expr = parseAssigmentExpression();
            const property = Factory.createObjectProperty(propertyName, expr , isComputedRef.isComputed, false, cloneSourcePosition(propertyName.start), cloneSourcePosition(expr.end));
            context.propertiesInitSet.add(property);
            return property;

        }
        return Factory.createObjectProperty(propertyName, undefined, isComputedRef.isComputed, true, cloneSourcePosition(propertyName.start), cloneSourcePosition(propertyName.end));
    }
    /**
     * Parse PropertyName, using Context to record this property is computed or not.
     * ```
     * PropertyName := Identifer
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
            if(identifer.name === "await") {
                if(isCurrentFunctionAsync() && !match(SyntaxKinds.ColonPunctuator)) {
                    throw createMessageError(ErrorMessageMap.when_in_async_context_await_keyword_will_treat_as_keyword);
                }
                return identifer;
            }
            if(identifer.name === "yield") {
                if(isCurrentFunctionGenerator() && !match(SyntaxKinds.ColonPunctuator)) {
                    throw createMessageError(ErrorMessageMap.when_in_yield_context_yield_will_be_treated_as_keyword);
                }
                return identifer;
            }
            if(identifer.name === "let") {
                return identifer;
            }
            if(LexicalKeywordSet.has(identifer.name) && !match(SyntaxKinds.ColonPunctuator)) {
                throw createMessageError(ErrorMessageMap.invalid_property_name);
            }
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
    /** Parse MethodDefintion
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
     * this method should allow using when in class or in object literal, ClassElement can be PrivateName, when it 
     * used in object literal, it should throw a error.
     * @param {boolean} inClass is used in class or not. 
     * @param {PropertyName | PrivateName | undefined } withPropertyName parse methodDeinfition with exited propertyName or not
     * @param {boolean} isStatic
     * @returns {ObjectMethodDefinition | ClassMethodDefinition | ObjectAccessor | ClassAccessor  | ClassConstructor}
     */
    function parseMethodDefintion(
        inClass: boolean = false, 
        withPropertyName: PropertyName | PrivateName | undefined = undefined, 
        isStatic: boolean = false
    ): ObjectMethodDefinition | ClassMethodDefinition | ObjectAccessor | ClassAccessor  | ClassConstructor{
        if(!helperIsMethodStartWithModifier() && !withPropertyName) {
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
            // second, parser async and is generator
            if(getValue() === "async" && lookahead() !== SyntaxKinds.ParenthesesLeftPunctuator) {
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
        /**
         * Step 2: semantic and more concise syntax check instead just throw a unexpect
         * token error.
         */
        if(type === "get" && parmas.length > 0) {
            throw createMessageError(ErrorMessageMap.getter_should_never_has_params);
        }
        if(type === "set" ) {
            if(parmas.length === 0) {
                throw createMessageError(ErrorMessageMap.setter_should_has_at_last_one_params);
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
        if(withPropertyName.kind === SyntaxKinds.Identifier) {
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
    function parseFunctionExpression() {
        const funcExpr = parseFunction(true);
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
                    throw createMessageError(ErrorMessageMap.restelement_can_not_use_in_cover);
                }
            }
            if(nodes.length === 1) {
                return nodes[0];
            }
            if(trailingComma) {
                throw createMessageError(ErrorMessageMap.sequence_expression_can_not_have_trailing_comma);
            }
            return Factory.createSequenceExpression(nodes, start, end);
        }
        enterFunctionScope();
        const arrowExpr = parseArrowFunctionExpression({start, end, nodes, trailingComma});
        exitFunctionScope();
        return arrowExpr;
    }
    function parseArrowFunctionExpression(metaData: ASTArrayWithMetaData<Expression> & { trailingComma: boolean }) {
        if(!match(SyntaxKinds.ArrowOperator)) {
            throw createUnexpectError(SyntaxKinds.ArrowOperator);
        }
        if(lexer.predictLineTerminate()) {
            throw new Error("Not Ok");
        }
        nextToken();
        let body: Expression | FunctionBody | undefined; 
        let isExpression = false;
        if(match(SyntaxKinds.BracesLeftPunctuator)) {
            body = parseFunctionBody();
        }else {
            body = parseExpression();
            isExpression = true;
        }
        const functionArguments = metaData.nodes.map(node => toAssignmentPattern(node, true)) as Array<Pattern>;
        checkFunctionParams(functionArguments);
        checkAwaitAndYieldUsageOfArrowParams(functionArguments);
        if(checkArrowParamemterHaveMultiSpreadElement(functionArguments) && metaData.trailingComma) {
            throw createMessageError(ErrorMessageMap.rest_element_can_not_end_with_comma);
        };
        return Factory.createArrowExpression(isExpression, body,  functionArguments, isCurrentFunctionAsync(), cloneSourcePosition(metaData.start), cloneSourcePosition(body.end));
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
                        match(SyntaxKinds.CommaToken) && lookahead() === SyntaxKinds.BracesRightPunctuator
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
                if(!isIdentifer(propertyName)) {
                    throw createMessageError("");
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
            enterFunctionScope();
            let funDeclar = parseFunctionExpression();
            exitFunctionScope();
            semi();
            return Factory.createExportDefaultDeclaration(funDeclar as FunctionDeclaration | FunctionExpression, start, cloneSourcePosition(funDeclar.end));
        }   
        if(getValue() === "async" && lookahead() === SyntaxKinds.FunctionKeyword) {
            nextToken();
            enterFunctionScope(true);
            const funDeclar = parseFunctionExpression();
            exitFunctionScope();
            semi();
            return Factory.createExportDefaultDeclaration(funDeclar, start, cloneSourcePosition(funDeclar.end));
        }
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