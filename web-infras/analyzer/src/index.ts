import { logOutBlockRelation } from "./type";
import { analyzeControlFlow } from "./controlFlow";
import { analyzeReachDefinitionForControlFlow } from "./reachDefinition";
import { parse } from "web-infra-parser";

const code = `
    function test(input) {
        let a = 10;
        let b = 100;
        if(Math.random()) {
            let a = 10
            a = a +1;
        }else {
            a = 100
        }
        a = a +b;
    }
`;

function main() {
    const ast = parse(code);
    const controlFlows = analyzeControlFlow(ast);
    // for(const controlFlow of controlFlows) {
    //     logOutBlockRelation(controlFlow.blocks, code);
    // }
    const table = analyzeReachDefinitionForControlFlow(controlFlows[0]);
    for(const [key, value] of table.entries()) {

    }
}

main()