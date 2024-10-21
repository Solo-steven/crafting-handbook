import { SourcePosition } from "web-infra-common";
export interface SyntaxError {
  message: string;
  position: SourcePosition;
}

export type SyntaxErrorHandler = {
  pushSyntaxErrors: (...syntaxErrors: Array<SyntaxError>) => void;
  haveError: () => boolean;
  formatErrorString: () => string;
  markAsTry(): number;
  restoreTryFail(index: number): void;
};
