import { parse } from "@/src/index";
import { ParserConfig } from "@/src/parser/config";
import chalk from "chalk";

const isUpdate = Boolean(process.env.TEST_UPDATE) || false;

const thirdPartyTestCase = [
  {
    title: "Jquery uncompressed",
    url: "https://code.jquery.com/jquery-3.7.1.js",
    code: "",
    pass: false,
  },
  {
    title: "react development",
    url: "https://unpkg.com/react@18/umd/react.development.js",
    code: "",
    pass: false,
  },
  {
    title: "react dom development",
    url: "https://unpkg.com/react-dom@18/umd/react-dom.development.js",
    code: "",
    pass: false,
  },
  {
    title: "vue esm brower prod min",
    url: "https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.4/vue.esm-browser.prod.min.js",
    code: "",
    pass: false,
    config: { sourceType: "module" },
  },
  {
    title: "redux development",
    url: "https://cdnjs.cloudflare.com/ajax/libs/redux/5.0.1/redux.legacy-esm.js",
    code: "",
    pass: false,
    config: { sourceType: "module" },
  },
  {
    title: "MUI development",
    url: "https://unpkg.com/@babel/standalone@7.25.5/babel.min.js",
    code: "",
    pass: false,
  },
];

export default async function run3partyTestCase() {
  if (isUpdate) {
    return () => true;
  }
  await Promise.all(
    thirdPartyTestCase.map(async (testCase) => {
      const code = await fetch(testCase.url).then((resp) => resp.text());
      testCase.code = code;
    }),
  );
  return () => {
    console.log(chalk.bold(`=========== 3rd Party Parser Test Case ===========`));
    let result = true;
    for (const testCode of thirdPartyTestCase) {
      try {
        parse(testCode.code, testCode.config as ParserConfig);
        testCode.pass = true;
        console.log(`|${testCode.title}|: ${chalk.green("parse PASS")}.`);
        result &&= true;
      } catch {
        testCode.pass = false;
        console.log(`|${testCode.title}|: ${chalk.red("parse FAILED")}.`);
        result &&= false;
      }
    }
    return result;
  };
}
