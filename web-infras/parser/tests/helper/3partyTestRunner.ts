import { createParser } from "@/src/parser";
import chalk from "chalk";
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
  },
  {
    title: "redux development",
    url: "https://cdnjs.cloudflare.com/ajax/libs/redux/5.0.1/redux.legacy-esm.js",
    code: "",
    pass: false,
  },
  {
    title: "MUI development",
    url: "https://unpkg.com/@mui/material@latest/umd/material-ui.development.js",
    code: "",
    pass: false,
  }
];

export async function run3partyTestCase() {
  await Promise.all(
    thirdPartyTestCase.map(async (testCase) => {
      const code = await fetch(testCase.url).then((resp) => resp.text());
      testCase.code = code;
    }),
  );
  return () => {
    console.log(chalk.bold(`=========== 3rd Party Parser Test Case ===========`));
    for (const testCode of thirdPartyTestCase) {
      try {
        const parser = createParser(testCode.code);
        parser.parse();
        testCode.pass = true;
        console.log(`|${testCode.title}|: ${chalk.green("parse PASS")}.`);
      } catch (e) {
        testCode.pass = false;
        console.log(`|${testCode.title}|: ${chalk.red("parse FAILED")}.`);
      }
    }
  };
}
