import { BasicBlock, ControlFlow } from "./type";
import { isVarDeclaration, isIdentifer, VariableDeclaration, AssigmentExpression, isAssignmentExpression } from "web-infra-common";
type GenMap = Map<string, VariableDeclaration>;
type KillMap = Map<string, AssigmentExpression>;
type GeneralMap = Map<string, Array<VariableDeclaration | AssigmentExpression>>;
type BasicBlockAttribute = { genMap: GenMap, killMap: KillMap, inMap:GeneralMap , outMap: GeneralMap };
/**
 *  analyze reach definition for each blocks, each identifier in basic block can 
 *  using a mapping table to find it's reaching defintion.
 */
export function analyzeReachDefinitionForControlFlow(controlFlow: ControlFlow ) {
    const blockAttributeMap: Map<number, BasicBlockAttribute> = new Map();
    for(const block of controlFlow.blocks) {
        blockAttributeMap.set(
            block.blockId, {
                ...computeGenAndKillMapForBasickBlock(block),
                inMap: new Map(), outMap: new Map()
            });
    }
    const queue = [...controlFlow.entry];
    computeInAndOutSetForBasicBlocks(queue, blockAttributeMap);
    console.log(blockAttributeMap.entries());
}

function computeGenAndKillMapForBasickBlock(block: BasicBlock) {
    const genMap: Map<string, VariableDeclaration> = new Map();
    const killMap: Map<string, AssigmentExpression> = new Map();
    for(const statement of block.statements) {
        if(isVarDeclaration(statement)) {
            const node = statement;
            for(const declar of node.declarations) {
                if(isIdentifer(declar.id)) {
                    genMap.set(declar.id.name, node);
                }else {
                    throw new Error("pattern not implement yet");
                }
            }
            continue;
        }
        if(isAssignmentExpression(statement)) {
            const node = statement;
            if(isIdentifer(node.left)) {
                killMap.set(node.left.name, node);
            }
        }
    }
    return { genMap, killMap };
}

function computeInAndOutSetForBasicBlocks(queue: Array<BasicBlock>, blockAttributeMap: Map<number, BasicBlockAttribute>) {
    while(queue.length > 0) {
        const block = queue.pop() as BasicBlock;
        const currentAttributeMap = blockAttributeMap.get(block.blockId);
        if(!currentAttributeMap) {
            throw new Error(`unreach, block attribute of block id ${block.blockId} not existed.`);
        }
        // compute in
        for(const predecessor of block.predecessor) {
            const predecessorAttributeMap = blockAttributeMap.get(predecessor.blockId);
            if(!predecessorAttributeMap) {
                throw new Error(`unreach, block attribute of block id ${predecessor.blockId} not existed.`);
            }
           for(const [name, syntaxItem] of predecessorAttributeMap.outMap.entries()) {
                currentAttributeMap.inMap.set(name, [...syntaxItem]);
            }
        }
        // compute out
        currentAttributeMap.outMap = new Map();
        for(const [name, syntaxItem] of currentAttributeMap.genMap.entries()) {
            currentAttributeMap.outMap.set(name, [syntaxItem]);
        }
        for(const [name, syntaxItem] of currentAttributeMap.killMap.entries()) {
            currentAttributeMap.outMap.set(name, [syntaxItem]);
        }
        for(const [name, syntaxItem] of currentAttributeMap.inMap.entries()) {
            if(!currentAttributeMap.outMap.get(name)) {
                currentAttributeMap.outMap.set(name, syntaxItem);
            }
        }
        for(const sucessor of block.successor) {
            queue.push(sucessor);
        }
    }
}