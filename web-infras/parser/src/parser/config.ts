/**
 * Config from babel parser
 */
export type ParserConfig = {
  sourceType?: "script" | "module";
  allowReturnOutsideFunction?: boolean;
  allowAwaitOutsideFunction?: boolean;
  // createImportExpressions?: boolean;
  allowNewTargetOutsideFunction?: boolean;
  plugins?: Array<string>;
};
export type ParserMergedConfig = {
  sourceType: "script" | "module";
  allowReturnOutsideFunction: boolean;
  allowAwaitOutsideFunction: boolean;
  allowNewTargetOutsideFunction: boolean;
  plugins: Array<string>;
};
const defaultConfig: ParserMergedConfig = {
  sourceType: "script",
  allowReturnOutsideFunction: false,
  allowAwaitOutsideFunction: false,
  allowNewTargetOutsideFunction: false,
  plugins: [],
};
export function getConfigFromUserInput(config?: ParserConfig): ParserMergedConfig {
  return {
    ...defaultConfig,
    ...(config || {}),
  };
}
