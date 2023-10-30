/**
 * this module create a symbol table for each scope in syntax tree.
 */
import {
    Program,
    VariableDeclaration,
    SyntaxKinds,
    BlockStatement,
    visitNodes,
    FunctionDeclaration,
    FunctionExpression,
    ArrorFunctionExpression,
    FunctionBody,
    visitNode,
    isIdentifer,
} from "web-infra-common";
/**
 * store the reference map of identifier to a variable declaration
 */
interface SymbolTable {
    map: Map<string, VariableDeclaration>;
    parent: SymbolTable | null;
}

function createSymbolTable(): SymbolTable {
    return { map: new Map(), parent: null };
}

function getVariableDeclarationOfIdentifir(id: string, table: SymbolTable) {
    return table.map.get(id);
}

export function createSyombolTableChain(ast: Program) {
    const globalSymbolTable = createSymbolTable();
    let currentSymbolTable = globalSymbolTable;
    const table = {
        [SyntaxKinds.BlockStatement]: function (node: BlockStatement) {
            const cache = currentSymbolTable;
            currentSymbolTable = createSymbolTable();
            currentSymbolTable.parent = cache;
            visitNodes(node.body, table);
            currentSymbolTable = cache;
        },
        [SyntaxKinds.FunctionDeclaration]: function (node: FunctionDeclaration ) {
            const cache = currentSymbolTable;
            currentSymbolTable = createSymbolTable();
            currentSymbolTable.parent = cache;
            visitNodes(node.body.body, table);
            currentSymbolTable = cache;
        },
        [SyntaxKinds.FunctionExpression]: function (node: FunctionExpression) {
            const cache = currentSymbolTable;
            currentSymbolTable = createSymbolTable();
            currentSymbolTable.parent = cache;
            visitNodes(node.body.body, table);
            currentSymbolTable = cache;
        },
        [SyntaxKinds.ArrowFunctionExpression]: function (node: ArrorFunctionExpression) {
            if(node.expressionBody) {
                visitNode(node.body, table);
            }else {
                const cache = currentSymbolTable;
                currentSymbolTable = createSymbolTable();
                currentSymbolTable.parent = cache;
                const body = node.body as FunctionBody
                visitNodes(body.body, table);
                currentSymbolTable = cache;
            }
        },
        [SyntaxKinds.VariableDeclaration]: function (node: VariableDeclaration) {
            for(const declar of node.declarations) {
                if(isIdentifer(declar.id)) {
                    currentSymbolTable.map.set(declar.id.name, node);
                }else {
                    throw new Error("pattern not implement yet");
                }
            }
        }
    }
}