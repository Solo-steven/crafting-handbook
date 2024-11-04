import { createLexer, type Lexer } from "@/src/lexer";
import type { Context } from "./context";
import {
  createAsyncArrowExpressionScopeRecorder,
  type AsyncArrowExpressionScopeRecorder,
} from "./scope/arrowExprScope";
import { createStrictModeScopeRecorder, type StrictModeScopeRecorder } from "./scope/strictModeScope";
import { createLexicalScopeRecorder, type LexicalScopeRecorder } from "./scope/lexicalScope";
import { createSymbolScopeRecorder, type SymbolScopeRecorder } from "./scope/symbolScope";
import { getConfigFromUserInput, ParserUserConfig, type ParserConfig } from "./config";
import type { SyntaxErrorHandler } from "../errorHandler/type";

import * as ContextImpl from "./context";
import * as JSImpl from "./js";
import * as TSImpl from "./ts";
import * as JSXImpl from "./jsx";

type ContextImplType = typeof ContextImpl;
type JSImplType = typeof JSImpl;
type TSImplType = typeof TSImpl;
type JSXImplType = typeof JSXImpl;

export class Parser {
  lexer: Lexer;
  context: Context;
  config: ParserConfig;
  // recorder
  strictModeScopeRecorder: StrictModeScopeRecorder;
  asyncArrowExprScopeRecorder: AsyncArrowExpressionScopeRecorder;
  lexicalScopeRecorder: LexicalScopeRecorder;
  symbolScopeRecorder: SymbolScopeRecorder;
  // error
  errorHandler: SyntaxErrorHandler;
  constructor(code: string, errorHandler: SyntaxErrorHandler, config?: ParserUserConfig) {
    this.lexer = createLexer(code, errorHandler);
    this.context = ContextImpl.createContext();
    this.config = getConfigFromUserInput(config);
    this.strictModeScopeRecorder = createStrictModeScopeRecorder();
    this.asyncArrowExprScopeRecorder = createAsyncArrowExpressionScopeRecorder();
    this.lexicalScopeRecorder = createLexicalScopeRecorder();
    this.symbolScopeRecorder = createSymbolScopeRecorder();
    this.errorHandler = errorHandler;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bindingParserMethod(methods: any) {
  Object.entries(methods).forEach(([name, method]) => {
    // @ts-expect-error implement in JS prototype
    Parser.prototype[name] = method;
  });
}

bindingParserMethod(ContextImpl);
bindingParserMethod(JSImpl);
bindingParserMethod(TSImpl);
bindingParserMethod(JSXImpl);

declare module "./index" {
  interface Parser extends ContextImplType, JSImplType, TSImplType, JSXImplType {
    lexer: Lexer;
    context: Context;
    config: ParserConfig;
    // recorder
    strictModeScopeRecorder: StrictModeScopeRecorder;
    asyncArrowExprScopeRecorder: AsyncArrowExpressionScopeRecorder;
    lexicalScopeRecorder: LexicalScopeRecorder;
    symbolScopeRecorder: SymbolScopeRecorder;
    // error
    errorHandler: SyntaxErrorHandler;
  }
}
