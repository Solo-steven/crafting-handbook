import { BasicBlock, ControlFlow } from "./type";
import { 
    isVarDeclaration, 
    isIdentifer, 
    AssigmentExpression,
    isAssignmentExpression,
    SyntaxKinds,
    SourcePosition,
    Identifier,
    VariableDeclarator,
    Expression,
    visitNode,
    isExpressionStatement 
} from "web-infra-common";

type Definition = VariableDeclarator | AssigmentExpression;
type MultipleDefintion = Array<Definition>;
type ReachingDefnitionTable = Map<Identifier, Definition | MultipleDefintion> 

type DefinitionWithMeta = { defintion: Definition, declarationLevel: number }
type InnerTable = Map<string, DefinitionWithMeta>;
type InTable = Map<string, Array<DefinitionWithMeta>>;
type OutTable = Map<string, Array<DefinitionWithMeta>>;

type BasicBlockMeta = {
    reachingDefinitionTable: ReachingDefnitionTable,
    innerTable: InnerTable,
    inTable: InTable
    outTable: OutTable,
    pendingIdentifiers: Array<Identifier>,
}
type BasicBlockMetaTable = Map<number, BasicBlockMeta>;
/**
 * 
 * @param sourcePosition 
 * @returns 
 */
function getStringFromSourcePosition(sourcePosition: SourcePosition) {
    return `(${sourcePosition.row}, ${sourcePosition.col})`;
}
/**
 * Helper function for getting format string form inner table, format as below:
 * ```
 * <identifier-name> --> (type)[declarationLevel](start position information)
 * ```
 * @param table 
 */
export function emitInnerTable(table: InnerTable) {
    let logOutInfo = "";
    for(const [identifier, definition] of table.entries()) {
        const type = isAssignmentExpression(definition.defintion) ? "AssignExpr" : "VarDeclar";
        logOutInfo += `${identifier} --> ${type}[${definition.declarationLevel}]${getStringFromSourcePosition(definition.defintion.start)}\n`;
    }
    return logOutInfo;
}
/**
 * Helper function for getting format string from inTable or out Table. format as below:
 * ```
 * <identifier-name> --> (type)[declarationLevel](start position information)
 * ```
 * If there are more then just one defintion per name :
 * ```
 * <identifier-name> --> (type)[declarationLevel](start position information)
 *                   --> (type)[declarationLevel](start position information)
 * ```
 * @param table 
 */
export function emitInOutTable(table: InTable | OutTable) {
    let logOutInfo = "";
    for(const [identifier, deinfitions] of table) {
        let message = `${identifier} `;
        const prefixLen = message.length;
        let isStart = true;
        for(const definition of deinfitions) {
            if(isStart) {
                isStart = false;
            }else {
                message += `${Array(prefixLen).fill(" ").join("")}`;
            }
            const type = isAssignmentExpression(definition.defintion) ? "AssignExpr" : "VarDeclar";
            message += `--> ${type}[${definition.declarationLevel}]${getStringFromSourcePosition(definition.defintion.start)}\n`;
        }
        logOutInfo += message;
        continue;
    }
    return logOutInfo;
}
/**
 * Helper function for logger out reaching table as following format :
 * ```
 * <identifier-name>(start position information) --> (type)(start position information)
 * ```
 * If there are more then just one defintion per identifier :
 * ```
 * <identifier-name>(start position information) --> (type)[declarationLevel](start position information)
 *                                               --> (type)[declarationLevel](start position information)
 * ```
 * @param reachingDefinitionTable 
 */
export function emitReachingDefinitionTable(reachingDefinitionTable: ReachingDefnitionTable) {
    let logOutInfo = "";
    for(const [identifier, deinfitions] of reachingDefinitionTable) {
        if(Array.isArray(deinfitions)) {
            let message = `${identifier.name}${getStringFromSourcePosition(identifier.start)} `;
            const prefixLen = message.length;
            let isStart = true;
            for(const definition of deinfitions) {
                if(isStart) {
                    isStart = false;
                }else {
                    message += `${Array(prefixLen).fill(" ").join("")}`;
                }
                const type = isAssignmentExpression(definition) ? "AssignExpr" : "VarDeclar";
                message += `---> ${type}(${getStringFromSourcePosition(definition.start)})\n`;
            }
            logOutInfo += message;
            continue;
        }
        const type = isAssignmentExpression(deinfitions) ? "AssignExpr" : "VarDeclar";
        const message = `${identifier.name}${getStringFromSourcePosition(identifier.start)} --> ${type}, ${getStringFromSourcePosition(deinfitions.start)}\n`;
        logOutInfo += message;
    }
    return logOutInfo;
}
/**
 *  analyze reach definition for each blocks, each identifier in basic block can 
 *  using a mapping table to find it's reaching defintion.
 * @param controlFlow 
 * @returns 
 */
export function analyzeReachDefinitionForControlFlow(controlFlow: ControlFlow) {
    const basicBlockMetaTable = analyzeGenAndKillForBlocks(controlFlow.blocks);
    for(const [key, blockMeta] of basicBlockMetaTable.entries()) {
        console.log(`====== ${key} ==========`);
        console.log("--- Inner Table -----");
        console.log(emitInnerTable(blockMeta.innerTable));
        console.log("--- Reaching Defintiion Table -----");
        console.log(emitReachingDefinitionTable(blockMeta.reachingDefinitionTable));
    }
    analyzeInAndOutForBlocks(controlFlow.blocks, basicBlockMetaTable);
    for(const [key, blockMeta] of basicBlockMetaTable.entries()) {
        console.log(`====== ${key} ==========`);
        console.log("--- Inner Table -----");
        console.log(emitInnerTable(blockMeta.innerTable));
        console.log("--- Reaching Defintiion Table -----");
        console.log(emitReachingDefinitionTable(blockMeta.reachingDefinitionTable));
        console.log('--- In Table ---');
        console.log(emitInOutTable(blockMeta.inTable));
        console.log('--- OutTable ---');
        console.log(emitInOutTable(blockMeta.outTable));
    }
    return basicBlockMetaTable;
}
/**
 * Compute inner table (gen and kill) for basic blocks.
 * @param blocks 
 * @returns 
 */
export function analyzeGenAndKillForBlocks(blocks: Array<BasicBlock>) {
    const basicBlockMetaTable: BasicBlockMetaTable = new Map();
    blocks.forEach(block => basicBlockMetaTable.set(block.blockId, analyzeGenAndKill(block)));
    return basicBlockMetaTable;
}
/**
 * Compute inner table (gen and kill) for a basic block.
 * @param block 
 * @returns {BasicBlockMeta}
 */
function analyzeGenAndKill(block: BasicBlock): BasicBlockMeta {
    const innerTable: InnerTable = new Map();
    const reachingDefinitionTable: ReachingDefnitionTable = new Map();
    const pendingIdentifiers: Array<Identifier> = [];

    for(const statement of block.statements) {
        if(isVarDeclaration(statement)) {
            for(const declaration of statement.declarations) {
                if(declaration.init) {
                    visitIdentifierInRightHandSide(declaration.init, innerTable, reachingDefinitionTable, pendingIdentifiers);
                }
                if(isIdentifer(declaration.id)) {
                    innerTable.set(declaration.id.name, { defintion: declaration, declarationLevel: block.level });
                }
            }
            continue;
        }
        if(isExpressionStatement(statement)) {
            if(isAssignmentExpression(statement.expr)) {
                visitIdentifierInRightHandSide(statement.expr.right, innerTable, reachingDefinitionTable, pendingIdentifiers);
                if(isIdentifer(statement.expr.left)) {
                    const maybeExisted = innerTable.get(statement.expr.left.name);
                    const declarationLevel = maybeExisted ? maybeExisted.declarationLevel : -1
                    innerTable.set(statement.expr.left.name, { defintion: statement.expr,  declarationLevel });
                }
            }else {
                visitIdentifierInRightHandSide(statement.expr, innerTable, reachingDefinitionTable, pendingIdentifiers);
            }
            continue;
        }
    }
    return  {
        innerTable,
        reachingDefinitionTable,
        pendingIdentifiers,
        inTable: new Map(),
        outTable: new Map(),
    }
}
/**
 * Visit Identifier in right hand side of expression and see if there 
 * any possible AssignExpr or VarDeclar we can use in InnerTable, if 
 * not, push identifier into waiting queue.
 * 
 * TODO: better visitor constrian. etc: identifier in memberExpression
 * should not be visit. (a.b)
 * @param expression 
 * @param innerTable 
 * @param reachingDefinitionTable 
 * @param pendingIdentifiers 
 */
function visitIdentifierInRightHandSide(
    expression: Expression, 
    innerTable: InnerTable, 
    reachingDefinitionTable: ReachingDefnitionTable,
    pendingIdentifiers: Array<Identifier>
) {
    const table = {
        [SyntaxKinds.Identifier]: (node: Identifier) => {
            const maybeDefintion = innerTable.get(node.name);
            if(maybeDefintion) {
                reachingDefinitionTable.set(node, maybeDefintion.defintion);
            }else {
                pendingIdentifiers.push(node);
            }
        }
    }
    visitNode(expression, table);
}

/**
 * 
 * @param blocks 
 * @param table 
 */
function analyzeInAndOutForBlocks(blocks: Array<BasicBlock>, table: BasicBlockMetaTable) {
    // TODO, using ordered BFS to compute in and out set of each block, and resolve pending 
    // identifier's reaching defintion
    for(const block of blocks) {
        analyzeInAndOut(block, table);
    }
}
/**
 * 
 * @param definitions 
 * @param level 
 * @returns 
 */
function findClosedDefinitions(definitions: Array<DefinitionWithMeta>, level: number) {
    let closedLevel = Number.MAX_SAFE_INTEGER;
    for(const definition of definitions) {
        if(definition.declarationLevel <= level) {
            if(level - definition.declarationLevel < closedLevel) {
                closedLevel = definition.declarationLevel;
            }
        }
    }
    return definitions.filter(definition => definition.declarationLevel === closedLevel);
}

function analyzeInAndOut(block: BasicBlock, table: BasicBlockMetaTable) {
    const blockMeta = table.get(block.blockId);
    if(!blockMeta) {
        throw new Error(`Unreach able code, ${block.blockId} have not meta data`);
    }
    // construct inTable from predecessor. only extract some defintion
    // is outer block or in same block.
    const inTable = blockMeta.inTable;
    for(const predecessor of block.predecessor) {
        const predecessorBlockMeta = table.get(predecessor.blockId);
        if(!predecessorBlockMeta) {
            throw new Error(`Unreach able code, ${block.blockId} have not meta data`);
        }
        const predecessorOutTable = predecessorBlockMeta.outTable;
        for(const [key, values] of predecessorOutTable.entries()) {
            for(const value of values) {
                if(value.declarationLevel > block.level) {
                    continue;
                } 
                const maybeExisted = inTable.get(key);
                if(maybeExisted) {
                    // diff predecessor might have same parent, so we need to make sure if 
                    // there is no dulipate from definition.
                    if(!(maybeExisted.filter(def => def.defintion === value.defintion).length > 0)) {
                        maybeExisted.push(value);
                    }
                }else {
                    inTable.set(key, [value]);
                }
            }
        } 
    }
    // resolve pending identifr
    for(const identifier of blockMeta.pendingIdentifiers) {
        const maybeExisted = inTable.get(identifier.name);
        if(maybeExisted) {
            const closedDefinitions = findClosedDefinitions(maybeExisted, block.level);
            blockMeta.reachingDefinitionTable.set(
                identifier, closedDefinitions.length > 1
                ? closedDefinitions.map(def => def.defintion)
                : closedDefinitions[0].defintion
             );
        }
    }
    // update innerTable's declarationLevel
    for(const [key, value] of blockMeta.innerTable) {
        if(value.declarationLevel === -1) {
            const maybeExisted = inTable.get(key);
            if(maybeExisted) {
                const closedDefinitions = findClosedDefinitions(maybeExisted, block.level);
                value.declarationLevel = closedDefinitions[0].declarationLevel;
            }else {
                value.declarationLevel = block.level;
            }
        }
    }
    // constrcut out table
    const outTable = blockMeta.outTable;
    for(const [key, value] of inTable.entries() ) {
        outTable.set(key, value);
    }
    for(const [key, value] of blockMeta.innerTable.entries()) {
        const maybeExisted = inTable.get(key);
        if(maybeExisted) {
            outTable.set(key, [...maybeExisted.filter(def => def.declarationLevel !== value.declarationLevel), value]);
        }else {
            outTable.set(key, [value]);
        }
    }
}