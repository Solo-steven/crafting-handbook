/**
 * Config from babel parser
 */
export type ParserConfig = {
  sourceType?: "script" | "module";
  allowReturnOutsideFunction?: boolean;
  allowAwaitOutsideFunction?: boolean;
};
const defaultConfig: ParserConfig = {
  sourceType: "script",
  allowReturnOutsideFunction: false,
  allowAwaitOutsideFunction: false,
};
export function getConfigFromUserInput(config?: ParserConfig): ParserConfig {
  return {
    ...defaultConfig,
    ...(config || {}),
  };
}
