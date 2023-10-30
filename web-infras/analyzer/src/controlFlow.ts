import { 
    visitNode,
    SyntaxKinds,
    FunctionDeclaration,
    FunctionExpression,
    ModuleItem,
    IfStatement,
    isIfStatement,
    isBlockStatement,
    isReturnStatement,
    isFunctionExpression,
    isFunctionDeclaration,
    Program,
} from "web-infra-common";
import {
    BasicBlock,
    ControlFlow,
    createBasicBlock,
    addStatement,
    connectBlock,
    createControlFlow,
    createBlockForControlFlow,
    logOutBlockRelation,
    markAsEntry,
    markAsExit
} from "./type";

/**
 * 
 * @param node 
 */

type Context = {
    currentBlock: BasicBlock;
    controlFlow: ControlFlow;
    markTopLevelIfCondition: ModuleItem | null;
    conditionPendingConnect: Array<BasicBlock>;
} 

export function analyzeControlFlow(ast: Program) {
    const controlFlows: Array<ControlFlow> = [];
    const context: Context = {
        currentBlock: createBasicBlock(),
        controlFlow: createControlFlow(),
        markTopLevelIfCondition: null,
        conditionPendingConnect: [],
    };
    function connectPendingConditionBlocks() {
        for(const block of context.conditionPendingConnect) {
            connectBlock(block, context.currentBlock);
        }
    }
    function resetContext() {
        context.controlFlow = createControlFlow();
        context.currentBlock = createBlockForControlFlow(context.controlFlow);
        context.conditionPendingConnect = [];
        markAsEntry(context.controlFlow, context.currentBlock);
    }
    function helperVisitScope(nodes: Array<ModuleItem>) {
        let topLevelCondition = false;
        let returnOrBranchFlag = false;
        for(const item of nodes) {
            if(isIfStatement(item)) {
                returnOrBranchFlag = true;
                const cache = context.currentBlock;
                // if is first level, maybe need to create basic block for continue;
                if(!context.markTopLevelIfCondition) {
                    console.log(item);
                    context.markTopLevelIfCondition = item;
                    topLevelCondition = true;
                }
                visitNode(item, table);
                context.currentBlock = cache;
                continue;
            }
            // if is first level, maybe need to create basic block for continue;
            if(topLevelCondition) {
                topLevelCondition = false;
                context.markTopLevelIfCondition = null;
                const cache = context.currentBlock;
                context.currentBlock = createBlockForControlFlow(context.controlFlow);
                connectPendingConditionBlocks();
            }
            if(isReturnStatement(item)) {
                returnOrBranchFlag = true;
                addStatement(context.currentBlock, item);
                markAsExit(context.controlFlow, context.currentBlock);
                // TODO, remove dead code
                return;
            }
            if(isBlockStatement(item)) {
                helperVisitScope(item.body);
            }
            if(isFunctionExpression(item) ||isFunctionDeclaration(item) ) {
                addStatement(context.currentBlock, item);
                visitNode(item, table);
                continue;
            }
            addStatement(context.currentBlock, item);
        }
        if(!returnOrBranchFlag) {
            context.conditionPendingConnect.push(context.currentBlock);
        }
    }
    function visitFunction(node: FunctionDeclaration | FunctionExpression) {
        const cache = {...context};
        resetContext();
        // visit function body
        helperVisitScope(node.body.body);
        // add controlflow 
        controlFlows.push(context.controlFlow);
        // perform side effect, reset context for function
        context.controlFlow = cache.controlFlow;
        context.currentBlock = cache.currentBlock;
    }
    
    function visitIfStatement(node: IfStatement) {
        // create entry point for test expression
        let testBlock: BasicBlock; 
        if(context.currentBlock.statements.length === 0) {
            testBlock = context.currentBlock;
            addStatement(testBlock, node.test);
        }else {
            testBlock = createBlockForControlFlow(context.controlFlow);
            addStatement(testBlock, node.test);
            connectBlock(context.currentBlock, testBlock);
        }
        // for conseqence
        const conseqBlock = createBlockForControlFlow(context.controlFlow);
        connectBlock(testBlock, conseqBlock);
        context.currentBlock = conseqBlock;
        if(isBlockStatement(node.conseqence)) {
            helperVisitScope(node.conseqence.body);
        }else {
            helperVisitScope([node.conseqence]);
        }
        // for alter
        if(node.alternative) {
            const alterBlock = createBlockForControlFlow(context.controlFlow);
            connectBlock(testBlock, alterBlock);
            context.currentBlock = alterBlock;
            if(isBlockStatement(node.alternative)) {
                helperVisitScope(node.alternative.body);
            }else {
                helperVisitScope([node.alternative]);
            }
        }
    }
    const table = {
        [SyntaxKinds.FunctionExpression]: visitFunction,
        [SyntaxKinds.FunctionDeclaration]: visitFunction,
        [SyntaxKinds.IfStatement]: visitIfStatement,
    }
    visitNode(ast, table);
    return controlFlows;
}
