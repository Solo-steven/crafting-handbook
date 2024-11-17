import { Generator } from "@/src/generator";
import {
  AssignmentPattern,
  ObjectPattern,
  ObjectPatternProperty,
  RestElement,
  SyntaxKinds,
} from "web-infra-common";

export function genObjectPattern(this: Generator, objectPat: ObjectPattern) {
  this.writeWithBraces(false, () => {
    this.writeSpace();
    this.genPropertyInObjectPattern(objectPat.properties[0]);
    for (const property of objectPat.properties.slice(1)) {
      this.writeToken(SyntaxKinds.CommaToken);
      this.writeSpace();
      this.genPropertyInObjectPattern(property);
    }
    this.writeSpace();
  });
}

export function genPropertyInObjectPattern(
  this: Generator,
  property: ObjectPatternProperty | RestElement | AssignmentPattern,
) {
  switch (property.kind) {
    case SyntaxKinds.ObjectPatternProperty: {
      this.genObjectPatternProperty(property);
      break;
    }
    case SyntaxKinds.RestElement: {
      this.genRestElement(property);
      break;
    }
    case SyntaxKinds.AssignmentPattern: {
      break;
    }
  }
}

export function genObjectPatternProperty(this: Generator, objectPatProps: ObjectPatternProperty) {
  this.genPropertyName(objectPatProps.key, objectPatProps.computed);
  if (objectPatProps.value) {
    this.writeToken(SyntaxKinds.ColonPunctuator);
    this.writeSpace();
    this.genModuleItem(objectPatProps.value);
  }
}
export function genRestElement(this: Generator, restElement: RestElement) {
  this.writeToken(SyntaxKinds.SpreadOperator);
  this.genModuleItem(restElement.argument);
}
