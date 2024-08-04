/**
 * Config from babel parser
 */
export type ParserConfig = {
  sourceType?: "script" | "module";
  allowReturnOutsideFunction?: boolean;
  allowAwaitOutsideFunction?: boolean;
};
export type ParserMergedConfig = {
  sourceType: "script" | "module";
  allowReturnOutsideFunction: boolean;
  allowAwaitOutsideFunction: boolean;
};
const defaultConfig: ParserMergedConfig = {
  sourceType: "script",
  allowReturnOutsideFunction: false,
  allowAwaitOutsideFunction: false,
};
export function getConfigFromUserInput(config?: ParserConfig): ParserMergedConfig {
  return {
    ...defaultConfig,
    ...(config || {}),
  };
}
