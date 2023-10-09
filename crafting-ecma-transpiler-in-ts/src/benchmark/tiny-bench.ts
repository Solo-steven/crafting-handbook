import { createParser } from "@/src/parser";
import { createLexer } from "@/src/lexer";
import { parse as BabelParse } from "@babel/parser";
import { parse  as AcornParse} from "acorn";
// // @ts-ignore
// import { Tokenizer } from "@babel/parser";
import { Bench } from "tinybench";
import { SyntaxKinds } from "../common";
import { performance } from "perf_hooks";

const bench = new Bench({ time: 100 });

async function getJquryString() {
    return fetch("https://unpkg.com/react@18/umd/react.development.js").then(resp => resp.text());
}

async function benchMain() {
    const code = await getJquryString();
    // const parser = createParser(code);
    // console.log(parser.parse());
    const sum = "test some thing";
    bench
        .add("babel parse", () => {
            BabelParse(code);
        })
        .add("acorn parse", () => {
            AcornParse(code, {
                ecmaVersion: 2020,
            });
        })
        .add("my parse", () => {
            const parser = createParser(code);
            parser.parse();
        })
        .add("my lexer", () => {
            const lexer = createLexer(code);
            while(1) {
                const t = lexer.nextToken();
                if(t === SyntaxKinds.EOFToken) {
                    break;
                }
            }
        })
    await bench.run();
    console.table(bench.table());
    measure(code);
}

function measure(code: string) {
    measureByPerformanceHook("babel", () => {
        BabelParse(code);
    });
    measureByPerformanceHook("my parse", () => {
        const parser = createParser(code);
        parser.parse();
    });
    measureByPerformanceHook("my lexer", () => {
        const lexer = createLexer(code);
        while(1) {
            const t = lexer.nextToken();
            if(t === SyntaxKinds.EOFToken) {
                break;
            }
        }
    });
}

function measureByPerformanceHook(prefix: string, callback: CallableFunction) {
    const start = performance.now();
    callback();
    console.log(`${prefix} performance:  ${performance.now() - start}`)
}

benchMain();