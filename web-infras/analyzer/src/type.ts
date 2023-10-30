import { ModuleItem } from "web-infra-common";

export interface BasicBlock {
    blockId: number;
    predecessor: Array<BasicBlock>;
    successor: Array<BasicBlock>;
    statements: Array<ModuleItem>;
}

let uuid = -1;

export function createBasicBlockBuilder() {
    let uuid = 0;
    return function (
        predecessor: Array<BasicBlock> = [], successor: Array<BasicBlock> = [], statements: Array<ModuleItem> = []
    ): BasicBlock {
       return {
            blockId: uuid ++,
            predecessor,
            successor,
            statements,
        };
    }
}
export function createBasicBlock(
    predecessor: Array<BasicBlock> = [],
    successor: Array<BasicBlock> = [],
    statements: Array<ModuleItem> = [],
): BasicBlock {
   return {
        blockId: uuid ++,
        predecessor,
        successor,
        statements,
    };
}

export function logOutBlockRelation(blocks: Array<BasicBlock>, source: string) {
    for(const block of blocks) {
        console.log("========================");
        console.log(`Block Id: ${block.blockId}`);
        console.log(`Predecessors: ${block.predecessor.reduce((val,block) => `${val} ${block.blockId}`, "")}`);
        console.log(`Successor: ${block.successor.reduce((val,block) => `${val} ${block.blockId}`, "")}`);
        let code = "";
        for(const statement of block.statements) {
            code += source.slice(statement.start.index, statement.end.index) + " | ";
        }
        console.log(`Statements code: ${code}`);
        console.log("========================");
    }
}

export function connectBlock(predecessor: BasicBlock, successor: BasicBlock) {
    predecessor.successor.push(successor);
    successor.predecessor.push(predecessor);
}

export function addStatement(block: BasicBlock, statement: ModuleItem) {
    block.statements.push(statement);
}

/**
 * 
 */

export interface ControlFlow {
    entry: Array<BasicBlock>;
    exit: Array<BasicBlock>;
    blocks: Array<BasicBlock>;
}

export function createControlFlow(): ControlFlow {
    return {
        entry: [],
        exit: [],
        blocks: []
    }
}

export function createBlockForControlFlow(controlFlow: ControlFlow): BasicBlock {
    const block = createBasicBlock();
    controlFlow.blocks.push(block);
    return block;
}

export function markAsEntry(controlFlow: ControlFlow, block: BasicBlock) {
    controlFlow.entry.push(block);
}

export function markAsExit(controlFlow: ControlFlow, block: BasicBlock) {
    controlFlow.exit.push(block);
}
