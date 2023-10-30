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
} from "ecmakit-jscommon";
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

import { parse } from "ecmakit-jsparser";

const code = `
    function test(input) {
        function uu() {
            if(input > 10) {
                if(Math.random()) {
                    return a;
                }else {
                    return b;
                }
            }else  {
                return b;
            }
        }
        if(input > 10) {
            if(Math.random()) {
                return a;
            }else {
                return b;
            }
        }else  {
            return b;
        }
    }

`;

/**
 * 
 * @param node 
 */

type Context = {
    currentBlock: BasicBlock;
    controlFlow: ControlFlow;
} 

function analyzeControlFlow(ast: Program) {
    const controlFlows: Array<ControlFlow> = [];
    const context: Context = {
        currentBlock: createBasicBlock(),
        controlFlow: createControlFlow(),
    };
    function resetContext() {
        context.controlFlow = createControlFlow();
        context.currentBlock = createBlockForControlFlow(context.controlFlow);
        markAsEntry(context.controlFlow, context.currentBlock);
    }
    function helperVisitScope(nodes: Array<ModuleItem>) {
        for(const item of nodes) {
            if(isIfStatement(item)) {
                const cache = context.currentBlock;
                visitNode(item, table);
                context.currentBlock = cache;
                continue;
            }
            if(isReturnStatement(item)) {
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


function main() {
    const ast = parse(code);
    const controlFlows = analyzeControlFlow(ast);
    for(const controlFlow of controlFlows) {
        logOutBlockRelation(controlFlow.blocks);
        console.log(controlFlow.entry);
        console.log(controlFlow.exit);
    }
}

main()