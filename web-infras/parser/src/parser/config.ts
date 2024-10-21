/**
 * Config from babel parser
 */
export type ParserConfig = {
  sourceType: "script" | "module";
  allowReturnOutsideFunction: boolean;
  allowAwaitOutsideFunction: boolean;
  allowNewTargetOutsideFunction: boolean;
  allowUndeclaredExports: boolean;
  plugins: Array<ParserPlugin>;
  // errorRecovery: boolean;
  // createImportExpressions: boolean;
  // allowSuperOutsideMethod: boolean;
};
export type ParserUserConfig = Partial<ParserConfig>;

export enum ParserPlugin {
  TypeScript = "typescript",
  JSX = "jsx",
  ImportAssertions = "importAssertions",
  ImportAttribute = "importAttributes",
}

const defaultConfig: ParserConfig = {
  sourceType: "script",
  allowReturnOutsideFunction: false,
  allowAwaitOutsideFunction: false,
  allowNewTargetOutsideFunction: false,
  allowUndeclaredExports: false,
  plugins: [],
};
export function getConfigFromUserInput(config?: ParserUserConfig): ParserConfig {
  return {
    ...defaultConfig,
    ...(config || {}),
  };
}
