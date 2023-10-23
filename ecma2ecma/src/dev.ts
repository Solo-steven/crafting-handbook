import { createLexer } from "@/src/lexer";
import { SyntaxKinds, SytaxKindsMapLexicalLiteral, ModuleItem } from "@/src/common";
import { createParser } from "@/src/parser";
import { traversal as halfInlineTraversal } from "@/src/common/visitor/half-inline";
import { traversal as declarativeTraversal } from "@/src/common/visitor/declarative";
import { traversal as allInlineTraversal } from "./common/visitor/all-inline";
import { Visitor } from "@/src/common/visitor/type";
import { Bench } from "tinybench";
import { transformSyntaxKindToLiteral } from  "../tests/transform";
import fs from 'fs';
import path from "path";
const code = fs.readFileSync(path.join(__dirname, "test.js"), "utf-8").toString();

const bench = new Bench({time: 400});

mainBench();
// printLexer(code);
// printParser(code);


async function mainBench() {
    const code = await fetch("https://code.jquery.com/jquery-3.7.1.js").then(rep => rep.text());
    const ast = createParser(code).parse();
    bench.add("half inline", () => {
        halfInlineTraversal(ast, VisitorTable);
    });
    bench.add("declarative", () => {
        declarativeTraversal(ast, VisitorTable);
    });
    bench.add("all inline", () => {
        allInlineTraversal(ast, VisitorTable);
    })
    await bench.run();
    console.table(bench.table());
}

function printLexer(code: string) {
    console.log("=================================");
    console.log("=================================");
    console.log("============ lexer ==============");
    console.log("=================================");
    
    const lexer = createLexer(code);
    while(lexer.getToken() != SyntaxKinds.EOFToken) {
        console.log( lexer.getToken(), SytaxKindsMapLexicalLiteral[lexer.getToken()], lexer.getSourceValue(), lexer.getStartPosition(), lexer.getEndPosition());
        lexer.nextToken();
    }
    console.log( SytaxKindsMapLexicalLiteral[lexer.getToken()], lexer.getSourceValue(), lexer.getStartPosition(), lexer.getEndPosition());
    
}
function printParser(code: string) {
    console.log("=================================");
    console.log("============ Parser =============");
    console.log("=================================");
    const ast = createParser(code).parse();
    transformSyntaxKindToLiteral(ast);
    console.log(JSON.stringify(ast, null, 4));
}



const VisitorTable: Visitor = {
    [SyntaxKinds.Program]: transformKind,
    [SyntaxKinds.RegexLiteral]: transformKind,
    [SyntaxKinds.BooleanLiteral]: transformKind,
    [SyntaxKinds.NullLiteral]: transformKind,
    [SyntaxKinds.UndefinedLiteral]: transformKind,
    [SyntaxKinds.NumberLiteral]: transformKind,
    [SyntaxKinds.StringLiteral]: transformKind,
    [SyntaxKinds.Identifier]: transformKind,
    [SyntaxKinds.Super]: transformKind,
    [SyntaxKinds.Import]: transformKind,
    [SyntaxKinds.ThisExpression]: transformKind,
    [SyntaxKinds.PrivateName]: transformKind,
    [SyntaxKinds.TemplateLiteral]: transformKind,
    [SyntaxKinds.TemplateElement]: transformKind,
    [SyntaxKinds.ObjectExpression]: transformKind,
    [SyntaxKinds.ObjectProperty]: transformKind,
    [SyntaxKinds.ObjectMethodDefintion]: transformKind,
    [SyntaxKinds.ObjectAccessor]: transformKind,
    [SyntaxKinds.SpreadElement]: transformKind,
    [SyntaxKinds.ClassExpression]: transformKind,
    [SyntaxKinds.ArrayExpression]: transformKind,
    [SyntaxKinds.FunctionExpression]: transformKind,
    [SyntaxKinds.ArrowFunctionExpression]: transformKind,
    [SyntaxKinds.MetaProperty]: transformKind,
    [SyntaxKinds.AwaitExpression]: transformKind,
    [SyntaxKinds.NewExpression]: transformKind,
    [SyntaxKinds.MemberExpression]: transformKind,
    [SyntaxKinds.CallExpression]: transformKind,
    [SyntaxKinds.TaggedTemplateExpression]: transformKind,
    [SyntaxKinds.ChainExpression]: transformKind,
    [SyntaxKinds.UpdateExpression]: transformKind,
    [SyntaxKinds.UnaryExpression]: transformKind,
    [SyntaxKinds.BinaryExpression]: transformKind,
    [SyntaxKinds.ConditionalExpression]: transformKind,
    [SyntaxKinds.YieldExpression]: transformKind,
    [SyntaxKinds.AssigmentExpression]: transformKind,
    [SyntaxKinds.SequenceExpression]: transformKind,
    [SyntaxKinds.ExpressionStatement]: transformKind,
    [SyntaxKinds.ObjectPattern]: transformKind,
    [SyntaxKinds.ObjectPatternProperty]: transformKind,
    [SyntaxKinds.ArrayPattern]: transformKind,
    [SyntaxKinds.AssignmentPattern]: transformKind,
    [SyntaxKinds.RestElement]: transformKind,
    [SyntaxKinds.IfStatement]: transformKind,
    [SyntaxKinds.BlockStatement]: transformKind,
    [SyntaxKinds.DebuggerStatement]: transformKind,
    [SyntaxKinds.EmptyStatement]: transformKind,
    [SyntaxKinds.SwitchStatement]: transformKind,
    [SyntaxKinds.SwitchCase]: transformKind,
    [SyntaxKinds.ContinueStatement]: transformKind,
    [SyntaxKinds.BreakStatement]: transformKind,
    [SyntaxKinds.ReturnStatement]: transformKind,
    [SyntaxKinds.LabeledStatement]: transformKind,
    [SyntaxKinds.WhileStatement]: transformKind,
    [SyntaxKinds.DoWhileStatement]: transformKind,
    [SyntaxKinds.TryStatement]: transformKind,
    [SyntaxKinds.CatchClause]: transformKind,
    [SyntaxKinds.ThrowStatement]: transformKind,
    [SyntaxKinds.WithStatement]: transformKind,
    [SyntaxKinds.ForStatement]: transformKind,
    [SyntaxKinds.ForInStatement]: transformKind,
    [SyntaxKinds.ForOfStatement]: transformKind,
    [SyntaxKinds.VariableDeclaration]: transformKind,
    [SyntaxKinds.VariableDeclarator]: transformKind,
    [SyntaxKinds.FunctionBody]: transformKind,
    [SyntaxKinds.FunctionDeclaration]: transformKind,
    [SyntaxKinds.ClassBody]: transformKind,
    [SyntaxKinds.ClassProperty]: transformKind,
    [SyntaxKinds.ClassMethodDefinition]: transformKind,
    [SyntaxKinds.ClassConstructor]: transformKind,
    [SyntaxKinds.ClassAccessor]: transformKind,
    [SyntaxKinds.ClassDeclaration]: transformKind,
    [SyntaxKinds.ImportDeclaration]: transformKind,
    [SyntaxKinds.ImportDefaultSpecifier]: transformKind,
    [SyntaxKinds.ImportSpecifier]: transformKind,
    [SyntaxKinds.ImportNamespaceSpecifier]: transformKind,
    [SyntaxKinds.ExportNamedDeclaration]: transformKind,
    [SyntaxKinds.ExportSpecifier]: transformKind,
    [SyntaxKinds.ExportDefaultDeclaration]: transformKind,
    [SyntaxKinds.ExportAllDeclaration]: transformKind,
    [SyntaxKinds.JSXElement]: transformKind,
    [SyntaxKinds.JSXOpeningElement]: transformKind,
    [SyntaxKinds.JSXClosingElement]: transformKind,
    [SyntaxKinds.JSXIdentifier]: transformKind,
    [SyntaxKinds.JSXMemberExpression]: transformKind,
    [SyntaxKinds.JSXNamespaceName]: transformKind,
    [SyntaxKinds.JSXAttribute]: transformKind,
    [SyntaxKinds.JSXSpreadAttribute]: transformKind,
    [SyntaxKinds.JSXSpreadChild]: transformKind,
    [SyntaxKinds.JSXExpressionContainer]: transformKind,
    [SyntaxKinds.JSXFragment]: transformKind,
    [SyntaxKinds.JSXOpeningFragment]: transformKind,
    [SyntaxKinds.JSXClosingFragment]: transformKind,
};
function transformKind(node: ModuleItem) {
    // f(3);
}

function f(n: number): number {
    if(n === 0 || n === 1) 
        return 1;
    return f(n-2) + f(n-1);
}