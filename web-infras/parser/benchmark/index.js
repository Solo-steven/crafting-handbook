const { parse: babelParse } = require('@babel/parser');
const { parse: acornParse, tokenizer } = require('acorn');
const { parseSync: swcParse } = require('@swc/core');
const { parse, tokenize, doNothing } = require('../dist');
const { Bench } = require('tinybench');
const fs = require('fs');
const bench = new Bench({time: 200});

async function main() {
    const code  = fs.readFileSync("./dist/index.js").toString();
    const t = "   test";
    const s = new Set([
            "1","2","3","4","5","6","7","8","9","10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
            "11","21","31","41","51","61","71","81","91","101", "111", "121", "131", "141", "151", "161", "171", "181", "191", "201"
    ]);
    const table = {
        "1": 1,
        "2": 1,
        "3": 1,
    }
    const a = "/".charCodeAt(0);
    const b = "0".charCodeAt(0);
    const c = " ".charCodeAt(0);
    let allT = 0;
    let allST = 0;
    let count =0;
    bench
        // .add("multiple start with", () => {
        //     function startsWith(s, n = 2) {
        //         return t.startsWith(s, n);
        //     }
        //     if(startsWith("/*") || startsWith("0.") || startsWith(" ")) {
        //         if(startsWith("/")) {

        //         }
        //         if(startsWith("0")) {

        //         }
        //     }
        // })
        .add("ecma-kit tokenize", () => {
            const [,time, skiptime] = tokenize(code);
            count += 1;
            allT += time;
            allST += skiptime;
        })
        .add("ecma-kit parse", () => {
            parse(code);
        })
        .add("ecma-kit do notthing", () => {
            doNothing(code);
        })
        .add("babel parse", () => {
            babelParse(code);
        })
        .add("acorn parse", () => {
            acornParse(code, {});
        })
        .add("acorn tokenize", () => {
            let t = tokenizer(code, {});
            for(const tt of t) {

            }
        })
        .add("swc parse", () => {
            swcParse(code, {
                syntax: "ecmascript"
            })
        })
    await bench.run();
    console.log("Read word", allT / count);
    console.log("Skip word", allST / count);
    console.table(bench.table());
}

main();