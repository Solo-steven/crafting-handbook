import { logOutBlockRelation } from "./type";
import { analyzeControlFlow } from "./controlFlow";
import { analyzeReachDefinitionForControlFlow } from "./reachDefinition";
import { parse } from "web-infra-parser";

const code = `
    function test(input) {
        let a = 10;
        let b = 10;
        if(input > 10) {

            a = a + b;
        }else if(input == 10) {
            a = a -b  + a ** b;
        }
        return a * b;
    }
`;

function main() {
    const ast = parse(code);
    const controlFlows = analyzeControlFlow(ast);
    for(const controlFlow of controlFlows) {
        logOutBlockRelation(controlFlow.blocks, code);
        analyzeReachDefinitionForControlFlow(controlFlow)
    }
}

main()