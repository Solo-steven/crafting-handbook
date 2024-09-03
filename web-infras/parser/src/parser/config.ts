/**
 * Config from babel parser
 */
export type ParserConfig = {
  sourceType: "script" | "module";
  allowReturnOutsideFunction: boolean;
  allowAwaitOutsideFunction: boolean;
  allowNewTargetOutsideFunction: boolean;
  plugins: Array<string>;
};
export type ParserUserConfig = Partial<ParserConfig>;
const defaultConfig: ParserConfig = {
  sourceType: "script",
  allowReturnOutsideFunction: false,
  allowAwaitOutsideFunction: false,
  allowNewTargetOutsideFunction: false,
  plugins: [],
};
export function getConfigFromUserInput(config?: ParserUserConfig): ParserConfig {
  return {
    ...defaultConfig,
    ...(config || {}),
  };
}
