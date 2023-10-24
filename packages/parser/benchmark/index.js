const { parse: babelParse } = require('@babel/parser');
const { parse: acornParse } = require('acorn');
const { parseSync: swcParse } = require('@swc/core');
const { parse, tokenize } = require('../dist');
const { Bench } = require('tinybench');
const fs = require('fs');
const bench = new Bench({time: 100});

async function main() {
    const code  = fs.readFileSync("../dist/index.js").toString();
    const t = "   test";
    bench
        .add("start with", () => {
            if(t.startsWith("/9", 3)) {

            };
        })
        .add("index char at", () => {
            if(t.charCodeAt(0) == "/") {

            }
        })
        .add("ecma-kit tokenize", () => {
            tokenize(code);
        })
        .add("ecma-kit parse", () => {
            parse(code);
        })
        .add("babel parse", () => {
            babelParse(code);
        })
        .add("acorn parse", () => {
            acornParse(code, {});
        })
        .add("swc parse", () => {
            swcParse(code, {
                syntax: "ecmascript"
            })
        })
    await bench.run();

    console.table(bench.table());
}

main();