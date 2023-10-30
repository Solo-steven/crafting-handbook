import { 
    BinaryExpression, 
    ModuleItem,
    ObjectExpression,
    ObjectMethodDefinition,
    ObjectProperty,
    ObjectAccessor,
    PrivateName,
    Program,
    Super,
    TemplateElement,
    TemplateLiteral,
    ThisExpression,
    SpreadElement,
    ClassExpression,
    ArrayExpression,
    FunctionExpression,
    ArrorFunctionExpression,
    MetaProperty,
    AwaitExpression,
    NewExpression,
    MemberExpression,
    CallExpression,
    UpdateExpression,
    UnaryExpression,
    ConditionalExpression,
    YieldExpression,
    AssigmentExpression,
    SequenceExpression,
    ObjectPattern,
    ObjectPatternProperty,
    ArrayPattern,
    AssignmentPattern,
    RestElement,
    IfStatement,
    BlockStatement,
    SwitchStatement,
    SwitchCase,
    ContinueStatement,
    BreakStatement,
    ReturnStatement,
    LabeledStatement,
    WhileStatement,
    DoWhileStatement,
    TryStatement,
    CatchClause,
    ThrowStatement,
    WithStatement,
    DebuggerStatement,
    ForStatement,
    ForInStatement,
    ForOfStatement,
    VariableDeclaration,
    VariableDeclarator,
    FunctionBody,
    FunctionDeclaration,
    ClassBody,
    ClassProperty,
    ClassMethodDefinition,
    ClassAccessor,
    ClassDeclaration,
    ImportDeclaration,
    ImportDefaultSpecifier,
    ImportSpecifier,
    ImportNamespaceSpecifier,
    ExportNamedDeclarations,
    ExportSpecifier,
    ExportDefaultDeclaration,
    ExportAllDeclaration,
    TaggedTemplateExpression,
    ChainExpression,
    ClassConstructor,
    ExpressionStatement,
    Identifier,
    NumberLiteral,
    StringLiteral,
    BoolLiteral,
    EmptyStatement,
    NullLiteral,
    UndefinbedLiteral,
    Import,
    RegexLiteral,
} from "./ast";
import { SyntaxKinds } from "./kind";

/**
 * Visitor Type for AST traversal table
 */
type Visitor = {
    [SyntaxKinds.Program]?: (node: Program, visitor: Visitor) => void;
    [SyntaxKinds.RegexLiteral]?: (node: RegexLiteral, visitor: Visitor) => void;
    [SyntaxKinds.NullLiteral]?: (node: NullLiteral, visitor: Visitor) => void;
    [SyntaxKinds.UndefinedLiteral]?: (node: UndefinbedLiteral, visitor: Visitor) => void;
    [SyntaxKinds.BooleanLiteral]?: (node: BoolLiteral, visior: Visitor) => void;
    [SyntaxKinds.NumberLiteral]?: (node: NumberLiteral, visitor: Visitor) => void;
    [SyntaxKinds.StringLiteral]?: (node: StringLiteral, visitor: Visitor) => void;
    [SyntaxKinds.Identifier]?: (node: Identifier, visitor: Visitor )=> void;
    [SyntaxKinds.Super]?: (node: Super, visitor: Visitor) => void;
    [SyntaxKinds.Import]?: (node: Import, visitor: Visitor) => void;
    [SyntaxKinds.ThisExpression]?: (node: ThisExpression, visitor: Visitor) => void;
    [SyntaxKinds.PrivateName]?: (node: PrivateName, visitor: Visitor) => void;
    [SyntaxKinds.TemplateLiteral]?: (node: TemplateLiteral, visitor: Visitor) => void;
    [SyntaxKinds.TemplateElement]?: (node: TemplateElement, visitor: Visitor) => void;
    [SyntaxKinds.ObjectExpression]?: (node: ObjectExpression, visitor: Visitor) => void;
    [SyntaxKinds.ObjectProperty]?: (node: ObjectProperty, visitor: Visitor) => void;
    [SyntaxKinds.ObjectMethodDefintion]?:(node: ObjectMethodDefinition, visitor: Visitor) => void;
    [SyntaxKinds.ObjectAccessor]?: (node: ObjectAccessor, visitor: Visitor) => void;
    [SyntaxKinds.SpreadElement]?: (node: SpreadElement, visitor: Visitor) => void;
    [SyntaxKinds.ClassExpression]?: (node: ClassExpression, visitor: Visitor) => void;
    [SyntaxKinds.ArrayExpression]?: (node: ArrayExpression,visitor: Visitor) => void;
    [SyntaxKinds.FunctionExpression]?:(node: FunctionExpression, visitor: Visitor) => void;
    [SyntaxKinds.ArrowFunctionExpression]?: (node: ArrorFunctionExpression, visitor: Visitor) => void;
    [SyntaxKinds.MetaProperty]?: (node: MetaProperty, visitor: Visitor) => void;
    [SyntaxKinds.AwaitExpression]?: (node: AwaitExpression, visitor: Visitor) => void;
    [SyntaxKinds.NewExpression]?: (node: NewExpression, visitor: Visitor) => void;
    [SyntaxKinds.MemberExpression]?: (node: MemberExpression, visitor: Visitor) => void;
    [SyntaxKinds.CallExpression]?: (node: CallExpression, visitor: Visitor) => void;
    [SyntaxKinds.TaggedTemplateExpression]?: (node: TaggedTemplateExpression, visitor: Visitor) => void;
    [SyntaxKinds.ChainExpression]?: (node: ChainExpression, visitor: Visitor) => void;
    [SyntaxKinds.UpdateExpression]?: (node: UpdateExpression, visitor: Visitor) => void;
    [SyntaxKinds.UnaryExpression]?: (node: UnaryExpression, visitor: Visitor) => void;
    [SyntaxKinds.BinaryExpression]?: (node: BinaryExpression, visitor: Visitor) => void;
    [SyntaxKinds.ConditionalExpression]?: (node: ConditionalExpression, visitor: Visitor) => void;
    [SyntaxKinds.YieldExpression]?: (node: YieldExpression, visitor: Visitor) => void;
    [SyntaxKinds.AssigmentExpression]?: (node: AssigmentExpression, visitor: Visitor) => void;
    [SyntaxKinds.SequenceExpression]?: (node: SequenceExpression, visitor: Visitor) => void;
    [SyntaxKinds.ExpressionStatement]?: (node: ExpressionStatement, visitor: Visitor) => void;
    [SyntaxKinds.ObjectPattern]?: (node: ObjectPattern, visitor: Visitor) => void;
    [SyntaxKinds.ObjectPatternProperty]?: (node: ObjectPatternProperty, visitor: Visitor) => void;
    [SyntaxKinds.ArrayPattern]?: (node: ArrayPattern, visitor: Visitor) => void;
    [SyntaxKinds.AssignmentPattern]?: (node: AssignmentPattern, visitor: Visitor)  => void;
    [SyntaxKinds.RestElement]?: (node: RestElement, visitor: Visitor) => void;
    [SyntaxKinds.IfStatement]?: (node: IfStatement, visitor: Visitor) => void;
    [SyntaxKinds.BlockStatement]?:(node: BlockStatement, visitor: Visitor) => void;
    [SyntaxKinds.SwitchStatement]?: (node: SwitchStatement, visitor: Visitor) => void;
    [SyntaxKinds.SwitchCase]?: (node: SwitchCase, visitor: Visitor) => void;
    [SyntaxKinds.ContinueStatement]?: (node: ContinueStatement, visitor: Visitor) => void;
    [SyntaxKinds.BreakStatement]?: (node: BreakStatement, visitor: Visitor) => void;
    [SyntaxKinds.ReturnStatement]?: (node: ReturnStatement, visitor: Visitor) => void;
    [SyntaxKinds.LabeledStatement]?: (node: LabeledStatement, visitor: Visitor) => void;
    [SyntaxKinds.WhileStatement]?: (node: WhileStatement, visitor: Visitor) => void;
    [SyntaxKinds.DoWhileStatement]?: (node: DoWhileStatement, visitor: Visitor) => void;
    [SyntaxKinds.TryStatement]?: (node: TryStatement, visitor: Visitor) => void;
    [SyntaxKinds.CatchClause]?: (node: CatchClause, visitor: Visitor) => void;
    [SyntaxKinds.ThrowStatement]?: (node: ThrowStatement, visitor: Visitor) => void;
    [SyntaxKinds.WithStatement]?: (node: WithStatement, visitor: Visitor) => void;
    [SyntaxKinds.DebuggerStatement]?: (node: DebuggerStatement, visitor: Visitor) => void;
    [SyntaxKinds.EmptyStatement]?:(node: EmptyStatement, visitor: Visitor) => void;
    [SyntaxKinds.ForStatement]?: (node: ForStatement, visitor: Visitor) => void;
    [SyntaxKinds.ForInStatement]?: (node: ForInStatement, visitor: Visitor) => void;
    [SyntaxKinds.ForOfStatement]?: (node: ForOfStatement, visitor: Visitor)  => void;
    [SyntaxKinds.VariableDeclaration]?: (node: VariableDeclaration, visitor: Visitor)  => void;
    [SyntaxKinds.VariableDeclarator]?: (node: VariableDeclarator, visitor: Visitor) => void;
    [SyntaxKinds.FunctionBody]?: (node: FunctionBody, visitor: Visitor) => void;
    [SyntaxKinds.FunctionDeclaration]?: (node: FunctionDeclaration, visitor: Visitor) => void;
    [SyntaxKinds.ClassBody]?: (node: ClassBody, visitor: Visitor) => void;
    [SyntaxKinds.ClassProperty]?: (node: ClassProperty, visitor: Visitor) => void;
    [SyntaxKinds.ClassMethodDefinition]?: (node: ClassMethodDefinition, visitor: Visitor) => void;
    [SyntaxKinds.ClassConstructor]?: (node: ClassConstructor, visitor: Visitor) => void;
    [SyntaxKinds.ClassAccessor]?: (node: ClassAccessor, visitor: Visitor) => void;
    [SyntaxKinds.ClassDeclaration]?: (node: ClassDeclaration, visitor: Visitor) => void;
    [SyntaxKinds.ImportDeclaration]?: (node: ImportDeclaration, visitor: Visitor) => void;
    [SyntaxKinds.ImportDefaultSpecifier]?: (node: ImportDefaultSpecifier, visitor: Visitor) => void;
    [SyntaxKinds.ImportSpecifier]?: (node: ImportSpecifier, visitor: Visitor) => void;
    [SyntaxKinds.ImportNamespaceSpecifier]?: (node: ImportNamespaceSpecifier, visitor: Visitor) => void;
    [SyntaxKinds.ExportNamedDeclaration]?: (node: ExportNamedDeclarations, visitor: Visitor) => void;
    [SyntaxKinds.ExportSpecifier]?: (node: ExportSpecifier, visitor: Visitor)=> void;
    [SyntaxKinds.ExportDefaultDeclaration]?: (node: ExportDefaultDeclaration, visitor: Visitor) => void;
    [SyntaxKinds.ExportAllDeclaration]?: (node: ExportAllDeclaration, visitor: Visitor) => void;
};

const DefaultVisitorTable = {
    [SyntaxKinds.Program]: function visitProgram(node: Program, visitor: Visitor) {
        visitNodes(node.body, visitor);
    },
    [SyntaxKinds.RegexLiteral]: function visitRegexLiteral(node: RegexLiteral, visior: Visitor) {},
    [SyntaxKinds.NullLiteral]: function visitNullLiteral(node: NullLiteral, visitor: Visitor) {},
    [SyntaxKinds.UndefinedLiteral]: function visitUndefinedLiteral(node: UndefinbedLiteral, visitor: Visitor) {},
    [SyntaxKinds.BooleanLiteral]: function visitBoolLiteral(node: BoolLiteral, visior: Visitor) {},
    [SyntaxKinds.NumberLiteral]: function visitNumberString(node: NumberLiteral, visitor: Visitor) {},
    [SyntaxKinds.StringLiteral]: function visitStringLiteral(node: StringLiteral, visitor: Visitor) {},
    [SyntaxKinds.Identifier]: function bindIdentifier(node: Identifier, visitor: Visitor) {},
    [SyntaxKinds.Super]: function bindSuper(node: Super, visitor: Visitor ) {},
    [SyntaxKinds.Import]: function bindImport(node: Import, visitor: Visitor) {},
    [SyntaxKinds.ThisExpression]: function bindThisExpression(node: ThisExpression, visitor: Visitor) {},
    [SyntaxKinds.PrivateName]: function bindPrivateName(node: PrivateName, visitor: Visitor) {},
    [SyntaxKinds.TemplateLiteral]: function bindTemplateLiteral(node: TemplateLiteral, visitor: Visitor) {
        visitNodes(node.expressions, visitor);
        visitNodes(node.quasis, visitor);
    },
    [SyntaxKinds.TemplateElement]: function bindTemplateElement(node: TemplateElement, visitor: Visitor) {},
    [SyntaxKinds.ObjectExpression]: function bindObjectExpression(node: ObjectExpression, visitor: Visitor) {
        visitNodes(node.properties, visitor);
    },
    [SyntaxKinds.ObjectProperty]: function bindObjectProperty(node: ObjectProperty, visitor: Visitor) {
        visitNode(node.key, visitor);
        visitNode(node.value, visitor);
    },
    [SyntaxKinds.ObjectMethodDefintion]: function bindObjectMethodDefintion(node: ObjectMethodDefinition, visitor: Visitor) {
        visitNode(node.key, visitor);
        visitNodes(node.params, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ObjectAccessor]: function bindObjectAccessor(node: ObjectAccessor, visitor: Visitor) {
        visitNode(node.key, visitor);
        visitNodes(node.params, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.SpreadElement]: function bindSpreadElement(node: SpreadElement, visitor: Visitor) {
       visitNode(node.argument, visitor)
    },
    [SyntaxKinds.ClassExpression]: function bindClassExpression(node: ClassExpression, visitor: Visitor) {
        visitNode(node.id, visitor);
        visitNode(node.superClass, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ArrayExpression]: function bindArrayExpression(node: ArrayExpression,visitor: Visitor) {
        visitNodes(node.elements, visitor);
    },
    [SyntaxKinds.FunctionExpression]: function bindFunctionExpression(node: FunctionExpression, visitor: Visitor) {
        visitNode(node.name, visitor);
        visitNodes(node.params, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ArrowFunctionExpression]: function bindArrowFunctionExpression(node: ArrorFunctionExpression, visitor: Visitor) {
        visitNode(node.body, visitor);
        visitNodes(node.arguments, visitor);
    },
    [SyntaxKinds.MetaProperty]: function bindMetaProperty(node: MetaProperty, visitor: Visitor) {
        visitNode(node.meta, visitor);
        visitNode(node.property, visitor);
    },
    [SyntaxKinds.AwaitExpression]: function bindAwaitExpression(node: AwaitExpression, visitor: Visitor) {
        visitNode(node.argument, visitor);
    },
    [SyntaxKinds.NewExpression]: function bindNewExpression(node: NewExpression, visitor: Visitor) {
        visitNode(node.callee, visitor);
        visitNodes(node.arguments, visitor);
    },
    [SyntaxKinds.MemberExpression]: function bindMemberExpression(node: MemberExpression, visitor: Visitor) {
        visitNode(node.object, visitor);
        visitNode(node.property, visitor);
    },
    [SyntaxKinds.CallExpression]: function bindCallExpression(node: CallExpression, visitor: Visitor) {
        visitNode(node.callee, visitor);
        visitNodes(node.arguments, visitor);
    },
    [SyntaxKinds.TaggedTemplateExpression]: function bindTaggTemplateExpression(node: TaggedTemplateExpression, visitor: Visitor) {
        visitNode(node.tag, visitor);
        visitNode(node.quasi, visitor);
    },
    [SyntaxKinds.ChainExpression]: function bindChainExpression(node: ChainExpression, visitor: Visitor) {
        visitNode(node.expression, visitor);
    },
    [SyntaxKinds.UpdateExpression]: function bindUpdateExpression(node: UpdateExpression, visitor: Visitor) {
        visitNode(node.argument, visitor);
    },
    [SyntaxKinds.UnaryExpression]: function bindUnaryExpression(node: UnaryExpression, visitor: Visitor) {
        visitNode(node.argument, visitor);
    },
    [SyntaxKinds.BinaryExpression]: function bindBinaryExpression(node: BinaryExpression, visitor: Visitor) {
        visitNode(node.left, visitor);
        visitNode(node.right, visitor);
    },
    [SyntaxKinds.ConditionalExpression]: function bindConditionalExpression(node: ConditionalExpression, visitor: Visitor) {
        visitNode(node.test, visitor);
        visitNode(node.consequnce, visitor);
        visitNode(node.alter, visitor);
    },
    [SyntaxKinds.YieldExpression]: function bindYieldExpression(node: YieldExpression, visitor: Visitor) {
        visitNode(node.argument, visitor);
    },
    [SyntaxKinds.AssigmentExpression]: function bindAssignmentExpression(node: AssigmentExpression, visitor: Visitor) {
        visitNode(node.left, visitor);
        visitNode(node.right, visitor);
    },
    [SyntaxKinds.SequenceExpression]: function bindSequenceExpression(node: SequenceExpression, visitor: Visitor) {
        visitNodes(node.exprs, visitor);
    },
    [SyntaxKinds.ExpressionStatement]: function bindExpressionStatement(node: ExpressionStatement, visitor: Visitor) {
        visitNode(node.expr, visitor);
    },
    [SyntaxKinds.ObjectPattern]: function bindObjectPattern(node: ObjectPattern, visitor: Visitor) {
        visitNodes(node.properties, visitor);
    },
    [SyntaxKinds.ObjectPatternProperty]: function bindObjectPatternProperty(node: ObjectPatternProperty, visitor: Visitor) {
        visitNode(node.key, visitor);
        visitNode(node.value, visitor);
    },
    [SyntaxKinds.ArrayPattern]: function bindArrayPattern(node: ArrayPattern, visitor: Visitor) {
        visitNodes(node.elements, visitor);
    },
    [SyntaxKinds.AssignmentPattern]: function bindAssigmentPattern(node: AssignmentPattern, visitor: Visitor) {
        visitNode(node.left, visitor);
        visitNode(node.right, visitor);
    },
    [SyntaxKinds.RestElement]: function bindRestElement(node: RestElement, visitor: Visitor) {
        visitNode(node.argument, visitor);
    },
    [SyntaxKinds.IfStatement]: function bindIfStatement(node: IfStatement, visitor: Visitor) {
        visitNode(node.test, visitor);
        visitNode(node.conseqence, visitor);
        visitNode(node.alternative, visitor);
    },
    [SyntaxKinds.BlockStatement]: function bindBlockStatement(node: BlockStatement, visitor: Visitor) {
        visitNodes(node.body, visitor);
    },
    [SyntaxKinds.SwitchStatement]: function bindSwitchStatement(node: SwitchStatement, visitor: Visitor) {
        visitNode(node.discriminant, visitor);
        visitNodes(node.cases, visitor);
    },
    [SyntaxKinds.SwitchCase]: function bindSwitchCase(node: SwitchCase, visitor: Visitor) {
        visitNode(node.test, visitor);
        visitNodes(node.consequence, visitor);
    },
    [SyntaxKinds.ContinueStatement]: function bindContinueStatement(node: ContinueStatement, visitor: Visitor) {
        visitNode(node.label, visitor);
    },
    [SyntaxKinds.BreakStatement]: function bindBreakStatement(node: BreakStatement, visitor: Visitor) {
        visitNode(node.label, visitor);
    },
    [SyntaxKinds.ReturnStatement]: function bindReturnStatement(node: ReturnStatement, visitor: Visitor) {
        visitNode(node.argu, visitor);
    },
    [SyntaxKinds.LabeledStatement]: function bindLabeledStatement(node: LabeledStatement, visitor: Visitor) {
        visitNode(node.label, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.WhileStatement]: function bindWhileStatement(node: WhileStatement, visitor: Visitor) {
        visitNode(node.test, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.DoWhileStatement]: function bindDoWhileStatement(node: DoWhileStatement, visitor: Visitor) {
        visitNode(node.test, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.TryStatement]: function bindTryStatement(node: TryStatement, visitor: Visitor) {
        visitNode(node.block, visitor);
        visitNode(node.handler, visitor);
        visitNode(node.finalizer, visitor);
    },
    [SyntaxKinds.CatchClause]: function bindCatchClause(node: CatchClause, visitor: Visitor) {
        visitNode(node.param, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ThrowStatement]: function bindThrowStatement(node: ThrowStatement, visitor: Visitor) {
        visitNode(node.argu, visitor);
    },
    [SyntaxKinds.WithStatement]: function bindWithStatement(node: WithStatement, visitor: Visitor) {
        visitNode(node.object, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.DebuggerStatement]: function bindDebuggerStatement(node: DebuggerStatement, visitor: Visitor) {},
    [SyntaxKinds.EmptyStatement]: function visitEmptyStatement(node: EmptyStatement, visitor: Visitor) {},
    [SyntaxKinds.ForStatement]: function bindForStatement(node: ForStatement, visitor: Visitor) {
        visitNode(node.test, visitor);
        visitNode(node.init, visitor);
        visitNode(node.update, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ForInStatement]: function bindForInStatement(node: ForInStatement, visitor: Visitor) {
        visitNode(node.left, visitor);
        visitNode(node.right, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ForOfStatement]: function bindForOfStatement(node: ForOfStatement, visitor: Visitor) {
        visitNode(node.left, visitor);
        visitNode(node.right, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.VariableDeclaration]: function bindVariableDeclaration(node: VariableDeclaration, visitor: Visitor) {
        visitNodes(node.declarations, visitor);
    },
    [SyntaxKinds.VariableDeclarator]: function bindVariableDeclarator(node: VariableDeclarator, visitor: Visitor) {
        visitNode(node.id, visitor);
        visitNode(node.init, visitor);
    },
    [SyntaxKinds.FunctionBody]: function bindFunctionBody(node: FunctionBody, visitor: Visitor) {
        visitNodes(node.body, visitor);
    },
    [SyntaxKinds.FunctionDeclaration]: function bindFunctionDeclaration(node: FunctionDeclaration, visitor: Visitor) {
        visitNode(node.name, visitor);
        visitNodes(node.params, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ClassBody]: function bindClassBody(node: ClassBody, visitor: Visitor) {
        visitNodes(node.body, visitor);
    },
    [SyntaxKinds.ClassProperty]: function bindClassProperty(node: ClassProperty, visitor: Visitor) {
        visitNode(node.key, visitor);
        visitNode(node.value, visitor);
    },
    [SyntaxKinds.ClassMethodDefinition]: function bindClassMethodDefiniton(node: ClassMethodDefinition, visitor: Visitor) {
        visitNode(node.key, visitor);
        visitNodes(node.params, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ClassConstructor]: function bindClassConstructor(node: ClassConstructor, visitor: Visitor) {
        visitNode(node.key, visitor);
        visitNodes(node.params, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ClassAccessor]: function bindClassAccessor(node: ClassAccessor, visitor: Visitor) {
        visitNode(node.key, visitor);
        visitNodes(node.params, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ClassDeclaration]: function bindClassDeclaration(node: ClassDeclaration, visitor: Visitor) {
        visitNode(node.id, visitor);
        visitNode(node.superClass, visitor);
        visitNode(node.body, visitor);
    },
    [SyntaxKinds.ImportDeclaration]: function bindImportDeclaration(node: ImportDeclaration, visitor: Visitor) {
        visitNodes(node.specifiers, visitor);
        visitNode(node.source, visitor);
    },
    [SyntaxKinds.ImportDefaultSpecifier]: function bindImportDefaultSpecifier(node: ImportDefaultSpecifier, visitor: Visitor) {
        visitNode(node.imported, visitor);
    },
    [SyntaxKinds.ImportSpecifier]: function bindImportSpecifier(node: ImportSpecifier, visitor: Visitor) {
        visitNode(node.imported, visitor);
        visitNode(node.local, visitor);
    },
    [SyntaxKinds.ImportNamespaceSpecifier]: function bindImportNamespaceSpecifier(node: ImportNamespaceSpecifier, visitor: Visitor) {
        visitNode(node.imported, visitor);
    },
    [SyntaxKinds.ExportNamedDeclaration]: function bindExportNameDeclaration(node: ExportNamedDeclarations, visitor: Visitor) {
        visitNode(node.declaration, visitor);
        visitNodes(node.specifiers, visitor);
    },
    [SyntaxKinds.ExportSpecifier]: function bindExportSpecifier(node: ExportSpecifier, visitor: Visitor) {
        visitNode(node.exported, visitor);
        visitNode(node.local, visitor);
    },
    [SyntaxKinds.ExportDefaultDeclaration]: function bindExportDefaultDeclaration(node: ExportDefaultDeclaration, visitor: Visitor) {
        visitNode(node.declaration, visitor);
    },
    [SyntaxKinds.ExportAllDeclaration]: function bindExportAllDeclaration(node: ExportAllDeclaration, visitor: Visitor) {
        visitNode(node.exported, visitor);
        visitNode(node.source, visitor);
    }
}

export function visitNode<T extends ModuleItem>(node: T | null | undefined, visitor: Visitor) {
    if(!node) return;
    // @ts-ignore
    const handler = visitor[node.kind] || DefaultVisitorTable[node.kind];
    if(handler){
        handler(node, visitor);
    }
}

export function visitNodes<T extends ModuleItem>(nodes: Array<T | null | undefined> | null | undefined, visitor: Visitor) {
    if(!nodes) return;
    for(const node of nodes) {
        visitNode(node, visitor);
    }
}