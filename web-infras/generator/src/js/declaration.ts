import { Generaotr } from "@/src/index";
import {
  SyntaxKinds,
  Pattern,
  FunctionBody,
  FunctionDeclaration,
  VariableDeclaration,
  VariableDeclarator,
} from "web-infra-common";

export function genVariableDeclaration(this: Generaotr, variableDeclaration: VariableDeclaration) {
  this.writeRawString(variableDeclaration.variant);
  this.writeSpace();
  this.genVariableDeclarator(variableDeclaration.declarations[0]);
  for (const declarator of variableDeclaration.declarations.slice(1)) {
    this.writeToken(SyntaxKinds.CommaToken);
    this.genVariableDeclarator(declarator);
  }
  this.writeToken(SyntaxKinds.SemiPunctuator);
  this.writeLineTerminator();
}
export function genVariableDeclarator(this: Generaotr, declarator: VariableDeclarator) {
  this.genModuleItem(declarator.id);
  if (declarator.init) {
    this.writeSpace();
    this.writeToken(SyntaxKinds.AssginOperator);
    this.writeSpace();
    this.genModuleItem(declarator.init);
  }
}
export function genFunctionDeclaration(this: Generaotr, functionDeclar: FunctionDeclaration) {
  if (functionDeclar.async) {
    this.writeRawString("async");
    this.writeSpace();
  }
  if (functionDeclar.generator) {
    this.writeToken(SyntaxKinds.MultiplyOperator);
    this.writeSpace();
  }
  this.writeToken(SyntaxKinds.FunctionKeyword);
  this.writeSpace();
  this.genIdentifier(functionDeclar.name);
  this.genFunctionParam(functionDeclar.params);
  this.writeSpace();
  this.genFunctionBody(functionDeclar.body);
}

export function genFunctionParam(this: Generaotr, params: Pattern[]) {
  this.writeWithParan(() => {
    params.forEach((param, index) => {
      this.genModuleItem(param);
      if (index !== params.length - 1) this.writeToken(SyntaxKinds.CommaToken);
    });
  });
}
export function genFunctionBody(this: Generaotr, body: FunctionBody) {
  this.writeWithBraces(true, () => {
    for (const statementItem of body.body) {
      this.writePrefixSpace();
      this.genModuleItem(statementItem);
    }
  });
}
