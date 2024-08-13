/**
 * Config from babel parser
 */
export type ParserConfig = {
  sourceType?: "script" | "module";
  allowReturnOutsideFunction?: boolean;
  allowAwaitOutsideFunction?: boolean;
  // createImportExpressions?: boolean;
  plugins?: Array<string>;
};
export type ParserMergedConfig = {
  sourceType: "script" | "module";
  allowReturnOutsideFunction: boolean;
  allowAwaitOutsideFunction: boolean;
  plugins: Array<string>;
};
const defaultConfig: ParserMergedConfig = {
  sourceType: "script",
  allowReturnOutsideFunction: false,
  allowAwaitOutsideFunction: false,
  plugins: [],
};
export function getConfigFromUserInput(config?: ParserConfig): ParserMergedConfig {
  return {
    ...defaultConfig,
    ...(config || {}),
  };
}
