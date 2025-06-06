import { Generator } from "@/src/generator";
import {
  SyntaxKinds,
  Super,
  Import,
  ThisExpression,
  Identifier,
  PrivateName,
  NumberLiteral,
  StringLiteral,
  SpreadElement,
  AwaitExpression,
  NewExpression,
  MemberExpression,
  CallExpression,
  ChainExpression,
  UpdateExpression,
  UnaryExpression,
  BinaryExpression,
  ConditionalExpression,
  YieldExpression,
  AssigmentExpression,
  SequenceExpression,
  NullLiteral,
  UndefinbedLiteral,
  BoolLiteral,
  RegexLiteral,
  ArrayExpression,
  ObjectExpression,
  ObjectProperty,
  ObjectAccessor,
  PropertyName,
  ObjectMethodDefinition,
  FunctionExpression,
  ArrorFunctionExpression,
} from "web-infra-common";

export function writeParanIfNeed(this: Generator, isParan: boolean | undefined, callback: () => void) {
  if (isParan) {
    this.writeWithParan(callback);
  } else {
    callback();
  }
}
export function genSuper(this: Generator, superExpr: Super) {
  this.writeParanIfNeed(superExpr.parentheses, () => {
    this.writeToken(SyntaxKinds.SuperKeyword);
  });
}
export function genImport(this: Generator, importExpr: Import) {
  this.writeParanIfNeed(importExpr.parentheses, () => {
    this.writeToken(SyntaxKinds.ImportKeyword);
  });
}
export function genThisExpression(this: Generator, thisExpr: ThisExpression) {
  this.writeParanIfNeed(thisExpr.parentheses, () => {
    this.writeToken(SyntaxKinds.ThisKeyword);
  });
}
export function genIdentifier(this: Generator, identifer: Identifier) {
  this.writeParanIfNeed(identifer.parentheses, () => {
    this.writeRawString(identifer.name);
  });
}
export function genPrivateName(this: Generator, privateName: PrivateName) {
  this.writeParanIfNeed(privateName.parentheses, () => {
    this.writeToken(SyntaxKinds.HashTagPunctuator);
    this.writeRawString(privateName.name);
  });
}
export function genNumberLiteral(this: Generator, numberLiteral: NumberLiteral) {
  this.writeParanIfNeed(numberLiteral.parentheses, () => {
    this.writeRawString(numberLiteral.rawValue);
  });
}
export function genStringLiteral(this: Generator, stringLiteral: StringLiteral) {
  this.writeParanIfNeed(stringLiteral.parentheses, () => {
    this.writeToken(SyntaxKinds.SingleQuotationPunctuator);
    this.writeRawString(stringLiteral.value);
    this.writeToken(SyntaxKinds.SingleQuotationPunctuator);
  });
}
export function genBoolLiteral(this: Generator, boolLiteral: BoolLiteral) {
  this.writeParanIfNeed(boolLiteral.parentheses, () => {
    this.writeRawString(boolLiteral.value.toString());
  });
}
export function genNullLiteral(this: Generator, nullLiteral: NullLiteral) {
  this.writeParanIfNeed(nullLiteral.parentheses, () => {
    this.writeToken(SyntaxKinds.NullKeyword);
  });
}
export function genUndefiniedLiteral(this: Generator, undefinbedLiteral: UndefinbedLiteral) {
  this.writeParanIfNeed(undefinbedLiteral.parentheses, () => {
    this.writeToken(SyntaxKinds.UndefinedKeyword);
  });
}
export function genRegexLiteral(this: Generator, regexLiteral: RegexLiteral) {
  this.writeParanIfNeed(regexLiteral.parentheses, () => {
    this.writeRawString(`/${regexLiteral.pattern}/`);
    this.writeRawString(regexLiteral.pattern);
  });
}
export function genObjectExpression(this: Generator, objectExpression: ObjectExpression) {
  this.writeParanIfNeed(objectExpression.parentheses, () => {
    this.writeWithBraces(true, () => {
      for (const def of objectExpression.properties) {
        this.writePrefixSpace();
        this.genModuleItem(def);
        this.writeToken(SyntaxKinds.CommaToken);
        this.writeLineTerminator();
      }
    });
  });
}
export function genObjectProperty(this: Generator, objectProperty: ObjectProperty) {
  this.genPropertyName(objectProperty.key, objectProperty.computed);
  this.writeToken(SyntaxKinds.ColonPunctuator);
  this.writeSpace();
  if (objectProperty.value) {
    this.genModuleItem(objectProperty.value);
  }
}
export function genPropertyName(this: Generator, propertyName: PropertyName, isComputed: boolean) {
  if (isComputed) {
    this.writeToken(SyntaxKinds.BracketLeftPunctuator);
    this.genModuleItem(propertyName);
    this.writeToken(SyntaxKinds.BracesRightPunctuator);
  } else {
    this.genModuleItem(propertyName);
  }
}
export function genObjectMethod(this: Generator, objectMethod: ObjectMethodDefinition) {
  if (objectMethod.async) {
    this.writeRawString("async");
    this.writeSpace();
  }
  if (objectMethod.generator) {
    this.writeToken(SyntaxKinds.MultiplyOperator);
    this.writeSpace();
  }
  this.genPropertyName(objectMethod.key, objectMethod.computed);
  this.genFunctionParam(objectMethod.params);
  this.genFunctionBody(objectMethod.body);
}
export function genObjectAccessor(this: Generator, objectAccessor: ObjectAccessor) {
  this.writeRawString(objectAccessor.type);
  this.writeSpace();
  this.genPropertyName(objectAccessor.key, objectAccessor.computed);
  this.genFunctionParam(objectAccessor.params);
  this.genFunctionBody(objectAccessor.body);
}
export function genArrayExpression(this: Generator, arrayExpression: ArrayExpression) {
  this.writeParanIfNeed(arrayExpression.parentheses, () => {
    this.writeToken(SyntaxKinds.BracketLeftPunctuator);
    if (arrayExpression.elements[0]) this.genModuleItem(arrayExpression.elements[0]);
    for (const ele of arrayExpression.elements.slice(1)) {
      this.writeToken(SyntaxKinds.CommaToken);
      if (ele) this.genModuleItem(ele);
    }
    this.writeToken(SyntaxKinds.BracketRightPunctuator);
  });
}
export function genFunctionExpression(this: Generator, functionExpression: FunctionExpression) {
  this.writeParanIfNeed(functionExpression.parentheses, () => {
    if (functionExpression.async) {
      this.writeRawString("async");
      this.writeSpace();
    }
    if (functionExpression.generator) {
      this.writeToken(SyntaxKinds.MultiplyOperator);
      this.writeSpace();
    }
    this.writeToken(SyntaxKinds.FunctionKeyword);
    if (functionExpression.name) {
      this.writeSpace();
      this.genIdentifier(functionExpression.name);
    }
    this.genFunctionParam(functionExpression.params);
    this.writeSpace();
    this.genFunctionBody(functionExpression.body);
    this.writeLineTerminator();
  });
}
export function genArrowFunctionExpression(this: Generator, arrowExpr: ArrorFunctionExpression) {
  this.writeParanIfNeed(arrowExpr.parentheses, () => {
    if (arrowExpr.async) {
      this.writeRawString("async");
      this.writeSpace();
    }
    this.genFunctionParam(arrowExpr.arguments);
    this.writeSpace();
    this.writeToken(SyntaxKinds.ArrowOperator);
    this.writeSpace();
    this.genModuleItem(arrowExpr.body);
  });
}
export function genSpreadElement(this: Generator, spreadElement: SpreadElement) {
  this.writeParanIfNeed(spreadElement.parentheses, () => {
    this.writeToken(SyntaxKinds.SpreadOperator);
    this.genModuleItem(spreadElement.argument);
  });
}
export function genAwaitExpression(this: Generator, awaitElement: AwaitExpression) {
  this.writeParanIfNeed(awaitElement.parentheses, () => {
    this.writeRawString("await");
    this.writeSpace();
    this.genModuleItem(awaitElement.argument);
  });
}
export function genNewExpression(this: Generator, newExpression: NewExpression) {
  this.writeParanIfNeed(newExpression.parentheses, () => {
    this.writeToken(SyntaxKinds.NewKeyword);
    this.writeSpace();
    this.genModuleItem(newExpression.callee);
    this.writeWithParan(() => {
      for (const argu of newExpression.arguments) {
        this.genModuleItem(argu);
      }
    });
  });
}
export function genMemberExpression(this: Generator, memberExpression: MemberExpression) {
  this.writeParanIfNeed(memberExpression.parentheses, () => {
    this.genModuleItem(memberExpression.object);
    if (memberExpression.computed) {
      if (memberExpression.optional) {
        this.writeToken(SyntaxKinds.QustionDotOperator);
      }
      this.writeToken(SyntaxKinds.BracketLeftPunctuator);
      this.genModuleItem(memberExpression.property);
      this.writeToken(SyntaxKinds.BracketRightPunctuator);
    } else {
      if (memberExpression.optional) {
        this.writeToken(SyntaxKinds.QustionDotOperator);
      } else {
        this.writeToken(SyntaxKinds.DotOperator);
      }
      this.genModuleItem(memberExpression.property);
    }
  });
}
export function genCallExpression(this: Generator, callExpression: CallExpression) {
  this.writeParanIfNeed(callExpression.parentheses, () => {
    this.genModuleItem(callExpression.callee);
    if (callExpression.optional) {
      this.writeToken(SyntaxKinds.QustionDotOperator);
    }
    this.writeWithParan(() => {
      for (const item of callExpression.arguments) {
        this.genModuleItem(item);
        this.writeToken(SyntaxKinds.CommaToken);
      }
    });
  });
}
export function genChainExpression(this: Generator, chainExpression: ChainExpression) {
  this.writeParanIfNeed(chainExpression.parentheses, () => {
    this.genModuleItem(chainExpression.expression);
  });
}
export function genUpdateExpression(this: Generator, updateExpression: UpdateExpression) {
  this.writeParanIfNeed(updateExpression.parentheses, () => {
    if (updateExpression.prefix) {
      this.writeToken(updateExpression.operator);
      this.writeSpace();
      this.genModuleItem(updateExpression.argument);
    } else {
      this.genModuleItem(updateExpression.argument);
      this.writeSpace();
      this.writeToken(updateExpression.operator);
    }
  });
}
export function genUnaryExpression(this: Generator, unaryExpression: UnaryExpression) {
  this.writeParanIfNeed(unaryExpression.parentheses, () => {
    this.writeToken(unaryExpression.operator);
    this.writeSpace();
    this.genModuleItem(unaryExpression.argument);
  });
}
export function genBinaryExpression(this: Generator, binaryExpression: BinaryExpression) {
  this.writeParanIfNeed(binaryExpression.parentheses, () => {
    this.genModuleItem(binaryExpression.left);
    this.writeSpace();
    this.writeToken(binaryExpression.operator);
    this.writeSpace();
    this.genModuleItem(binaryExpression.right);
  });
}
export function genConditionalExpression(this: Generator, conditionalExpression: ConditionalExpression) {
  this.writeParanIfNeed(conditionalExpression.parentheses, () => {
    this.genModuleItem(conditionalExpression.test);
    this.writeToken(SyntaxKinds.QustionOperator);
    this.writeSpace();
    this.genModuleItem(conditionalExpression.consequnce);
    this.writeSpace();
    this.writeToken(SyntaxKinds.ColonPunctuator);
    this.writeSpace();
    this.genModuleItem(conditionalExpression.alter);
  });
}
export function genYieldExpression(this: Generator, yeildExpression: YieldExpression) {
  this.writeParanIfNeed(yeildExpression.parentheses, () => {
    this.writeToken(SyntaxKinds.YieldKeyword);
    if (yeildExpression.delegate) {
      this.writeToken(SyntaxKinds.MultiplyOperator);
    }
    this.writeSpace();
    if (yeildExpression.argument) {
      this.genModuleItem(yeildExpression.argument);
    }
  });
}
export function genAssignmentExpression(this: Generator, assigmentExpression: AssigmentExpression) {
  this.writeParanIfNeed(assigmentExpression.parentheses, () => {
    this.genModuleItem(assigmentExpression.left);
    this.writeSpace();
    this.writeToken(assigmentExpression.operator);
    this.writeSpace();
    this.genModuleItem(assigmentExpression.right);
  });
}
export function genSequenceExpression(this: Generator, sequenceExpression: SequenceExpression) {
  this.writeParanIfNeed(sequenceExpression.parentheses, () => {
    this.genModuleItem(sequenceExpression.exprs[0]);
    for (const expr of sequenceExpression.exprs.slice(1)) {
      this.writeToken(SyntaxKinds.CommaToken);
      this.genModuleItem(expr);
    }
  });
}
