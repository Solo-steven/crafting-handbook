import * as HelperImpl from "./helper";
import * as JSImpl from "./js";

export class Generator {
  code: string;
  spaceLevel: number;
  constructor() {
    this.code = "";
    this.spaceLevel = 0;
  }
}

type JSImplType = typeof JSImpl;
type HelperImpType = typeof HelperImpl;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bindingParserMethod(methods: any) {
  Object.entries(methods).forEach(([name, method]) => {
    // @ts-expect-error implement in JS prototype
    Generator.prototype[name] = method;
  });
}

bindingParserMethod(HelperImpl);
bindingParserMethod(JSImpl);

declare module "./generator" {
  interface Generator extends JSImplType, HelperImpType {
    code: string;
    spaceLevel: number;
  }
}
