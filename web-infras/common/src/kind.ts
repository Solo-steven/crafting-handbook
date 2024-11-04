export enum SyntaxKinds {
  /** ======================================
   *         Tokens
   * =======================================
   */
  // ============= Keyword ===========
  AwaitKeyword = 10010,
  BreakKeyword,
  CaseKeyword,
  CatchKeyword,
  ClassKeyword,
  ConstKeyword,
  ContinueKeyword,
  DebuggerKeyword,
  DefaultKeyword,
  DoKeyword,
  ElseKeyword,
  EnumKeyword,
  ExportKeyword,
  ExtendsKeyword,
  FinallyKeyword,
  ForKeyword,
  FunctionKeyword,
  IfKeyword,
  ImportKeyword,
  LetKeyword,
  NewKeyword,
  ReturnKeyword,
  SuperKeyword,
  SwitchKeyword,
  ThisKeyword,
  ThrowKeyword,
  TryKeyword,
  VarKeyword,
  WithKeyword,
  WhileKeyword,
  YieldKeyword,
  DeleteKeyword,
  VoidKeyword,
  TypeofKeyword,
  InKeyword,
  InstanceofKeyword,
  // ========== Operators ==========
  PlusOperator, // +
  MinusOperator, // -
  DivideOperator, // /
  MultiplyOperator, // *
  ModOperator, // %
  IncreOperator, // ++
  DecreOperator, // --
  ExponOperator, // **
  GtOperator, // >
  LtOperator, // <
  EqOperator, // ==
  NotEqOperator, // !=
  GeqtOperator, // >=
  LeqtOperator, // <=
  ArrowOperator, //  =>
  StrictEqOperator, // ===
  StrictNotEqOperator, // !==
  BitwiseOROperator, // |
  BitwiseANDOperator, // &
  BitwiseNOTOperator, // ~
  BitwiseXOROperator, // ^
  BitwiseLeftShiftOperator, // <<
  BitwiseRightShiftOperator, // >>
  BitwiseRightShiftFillOperator, // >>>
  LogicalOROperator, // ||
  LogicalANDOperator, // &&
  LogicalNOTOperator, // !
  SpreadOperator, // ...
  QustionOperator, // ?
  QustionDotOperator, // ?.
  NullishOperator, // ??
  DotOperator, // .
  AssginOperator, // =
  PlusAssignOperator, // +=
  MinusAssignOperator, // -=
  ModAssignOperator, // %=
  DivideAssignOperator, // /=
  MultiplyAssignOperator, // *=
  ExponAssignOperator, // **=
  BitwiseORAssginOperator, // |=
  BitwiseANDAssginOperator, // &=
  BitwiseNOTAssginOperator, // ~=
  BitwiseXORAssginOperator, // ^=
  LogicalORAssignOperator, // ||=
  logicalANDAssginOperator, // &&=
  BitwiseLeftShiftAssginOperator, // <<=
  BitwiseRightShiftAssginOperator, // >>=
  BitwiseRightShiftFillAssginOperator, // >>>=
  NullishAssignOperator, // ??=
  // ========= Token (Maybe Punctuator and Operator) =====
  CommaToken,
  // ========== Punctuator ===========
  BracesLeftPunctuator, // {
  BracesRightPunctuator, // }
  BracketLeftPunctuator, // [
  BracketRightPunctuator, // ]
  ParenthesesLeftPunctuator, // (
  ParenthesesRightPunctuator, // )
  SingleQuotationPunctuator, // '
  DoubleQuotationPunctuator, // "
  SemiPunctuator, // ;
  ColonPunctuator, // :
  HashTagPunctuator, // #
  AtPunctuator,
  // ========== Template ===========
  TemplateHead,
  TemplateTail,
  TemplateMiddle,
  TemplateNoSubstitution,
  // ========== Literal ===========
  TrueKeyword,
  FalseKeyword,
  NullKeyword,
  UndefinedKeyword,
  StringLiteral,
  DecimalLiteral,
  NonOctalDecimalLiteral,
  DecimalBigIntegerLiteral,
  OctalIntegerLiteral,
  HexIntegerLiteral,
  BinaryBigIntegerLiteral,
  OctalBigIntegerLiteral,
  HexBigIntegerLiteral,
  BinaryIntegerLiteral,
  LegacyOctalIntegerLiteral,
  RegexLiteral,
  // =========== Comment =============
  Comment,
  BlockComment,
  // ========= Identifier ===========
  Identifier,
  PrivateName,
  // ========== EOF ==========
  EOFToken,
  /** ======================================
   *          AST Node
   * ======================================
   */
  // =========== Top Level ===========
  Program,
  // =========== Statement ===========
  IfStatement,
  BlockStatement,
  SwitchStatement,
  SwitchCase,
  LabeledStatement,
  BreakStatement,
  ContinueStatement,
  ReturnStatement,
  WhileStatement,
  DoWhileStatement,
  TryStatement,
  CatchClause,
  ThrowStatement,
  DebuggerStatement,
  EmptyStatement,
  WithStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  // =========== Declaration ===========
  VariableDeclaration,
  VariableDeclarator,
  Function,
  FunctionDeclaration,
  FunctionBody,
  ClassDeclaration,
  ClassBody,
  // ========== Expression ==========
  NullLiteral,
  UndefinedLiteral,
  BooleanLiteral,
  MetaProperty,
  Super,
  Import,
  ThisExpression,
  SpreadElement,
  ArrayExpression,
  ObjectExpression,
  ObjectProperty,
  ObjectAccessor,
  ObjectMethodDefintion,
  ClassExpression,
  ClassProperty,
  ClassAccessorProperty,
  ClassAccessor,
  ClassConstructor,
  ClassMethodDefinition,
  ClassStaticBlock,
  Decorator,
  FunctionExpression,
  TemplateLiteral,
  TemplateElement,
  ArrowFunctionExpression,
  Property,
  ChainExpression,
  NewExpression,
  MemberExpression,
  TaggedTemplateExpression,
  AwaitExpression,
  CallExpression,
  UpdateExpression,
  UnaryExpression,
  BinaryExpression,
  YieldExpression,
  AssigmentExpression,
  ConditionalExpression,
  SequenceExpression,
  ExpressionStatement,
  // =========== Pattern ==========
  AssignmentPattern,
  ObjectPattern,
  ObjectPatternProperty,
  ArrayPattern,
  RestElement,
  // ========= ImportDeclaration ==========
  ImportDeclaration,
  ImportSpecifier,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  // ========= ImportDeclaration ==========
  ExportNamedDeclaration,
  ExportSpecifier,
  ExportDefaultDeclaration,
  ExportAllDeclaration,
  // ==== Module Assertion and Attribute
  ImportAttribute,
  // ======= JSX Element and JSX Fragment
  JSXElement,
  JSXOpeningElement,
  JSXClosingElement,
  JSXFragment,
  JSXOpeningFragment,
  JSXClosingFragment,
  JSXAttribute,
  JSXSpreadAttribute,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespaceName,
  JSXSpreadChild,
  JSXText,
  JSXExpressionContainer,
  JSXSelfClosedToken, // token for `/>`
  JSXCloseTagStart, // token for `</`
  /** ======================================
   *      TypeScript AST Node
   * ======================================
   */
  // ========= Type computation
  TSConditionalType,
  TSUnionType,
  TSIntersectionType,
  TSTypeOperator,
  TSArrayType,
  TSIndexedAccessType,
  // ========= High Level Type
  TSConstructorType,
  TSFunctionType,
  // ========= Type Interface and Type Alias =====
  TSTypeAliasDeclaration,
  TSInterfaceDeclaration,
  TSInterfaceHeritage,
  TSInterfaceBody,
  TSTypeLiteral,
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
  TSIndexSignature,
  TSPropertySignature,
  TSMethodSignature,
  // ======== Type Enum
  TSEnumDeclaration,
  TSEnumBody,
  TSEnumMember,
  // ========= Type Expression
  TSInstantiationExpression,
  TSTypeAssertionExpression,
  TSAsExpression,
  TSSatisfiesExpression,
  TSNonNullExpression,
  // ========= Type Parameter
  TSTypeParameterInstantiation,
  TSTypeParameterDeclaration,
  TSTypeParameter,
  // ======= Other Type
  TSQualifiedName,
  TSTypePredicate,
  TSTypeAnnotation,
  // ======= Other Basic Type
  TSTypeReference,
  TSTypeQuery,
  TSTupleType,
  TSLiteralType,
  // ====== Function and class method declaration
  TSDeclareFunction,
  ClassMethodDeclaration,
  TSAbstractClassAccessorDeclaration,
  TSClassConstructorDeclaration,
  // ======= Atom Basic Type ======
  TSStringKeyword,
  TSNumberKeyword,
  TSBigIntKeyword,
  TSBooleanKeyword,
  TSNullKeyword,
  TSUndefinedKeyword,
  TSSymbolKeyword,
  TSAnyKeyword,
  TSNeverKeyword,
  TSUnknowKeyword,
  TSVoidKeyword,
}
export const LexicalLiteral = {
  whiteSpaceChars: [" ", "\t"],
  newLineChars: ["\n"],
  nonDigitalPrefix: ["x", "X", "o", "O", "b", "B"],
  binaryPrfix: ["b", "B"],
  binaryChar: ["0", "1", "_"],
  octalPrefix: ["o", "O"],
  octalChars: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "_"],
  hexPrefix: ["x", "X"],
  hexChars: [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "_",
  ],
  numberChars: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  punctuators: ["{", "}", "[", "]", "(", ")", ":", ";", "'", '"', "#"],
  operator: [
    // Arithmetic operators
    "+",
    "-",
    "*",
    "/",
    "%",
    "++",
    "--",
    "**",
    // Compare operators
    ">",
    "<",
    "==",
    "!=",
    "<=",
    ">=",
    "===",
    "!==",
    // Bitwise operators
    "|",
    "&",
    "~",
    "^",
    "<<",
    ">>",
    ">>>",
    // Logical operators
    "||",
    "&&",
    "!",
    "??",
    // Comma operators
    ",",
    //
    "...",
    // Optional Chaining, Chaining
    "?.",
    ".",
    "?",
    "??",
    // Template Literal
    "`",
    // Assignment operator,
    "=",
    "+=",
    "-=",
    "*=",
    "%=",
    "**=",
    "|=",
    "&=",
    ">>=",
    "<<=",
    ">>>=",
    "^=",
    "~=",
    "||=",
    "&&=",
    "??=",
  ],
  BooleanLiteral: ["true", "false"],
  NullLiteral: ["null"],
  UndefinbedLiteral: ["undefined"],
  keywords: [
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "do",
    "else",
    "enum",
    "export",
    "extends",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "new",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "var",
    "with",
    "while",
    "yield",
    "let",
    // Unary operators
    "delete",
    "void",
    "typeof",
    // Relation operators
    "in",
    "instanceof",
  ],
  preserveword: ["static", "implements", "interface", "package", "private", "protected", "public"],
};

export const KeywordLiteralMapSyntaxKind = {
  ["await"]: SyntaxKinds.AwaitKeyword,
  ["break"]: SyntaxKinds.BreakKeyword,
  ["case"]: SyntaxKinds.CaseKeyword,
  ["catch"]: SyntaxKinds.CatchKeyword,
  ["class"]: SyntaxKinds.ClassKeyword,
  ["const"]: SyntaxKinds.ConstKeyword,
  ["continue"]: SyntaxKinds.ContinueKeyword,
  ["debugger"]: SyntaxKinds.DebuggerKeyword,
  ["default"]: SyntaxKinds.DefaultKeyword,
  ["do"]: SyntaxKinds.DoKeyword,
  ["else"]: SyntaxKinds.ElseKeyword,
  ["enum"]: SyntaxKinds.EnumKeyword,
  ["export"]: SyntaxKinds.ExportKeyword,
  ["extends"]: SyntaxKinds.ExtendsKeyword,
  ["finally"]: SyntaxKinds.FinallyKeyword,
  ["for"]: SyntaxKinds.ForKeyword,
  ["function"]: SyntaxKinds.FunctionKeyword,
  ["if"]: SyntaxKinds.IfKeyword,
  ["import"]: SyntaxKinds.ImportKeyword,
  ["new"]: SyntaxKinds.NewKeyword,
  ["null"]: SyntaxKinds.NullKeyword,
  ["return"]: SyntaxKinds.ReturnKeyword,
  ["super"]: SyntaxKinds.SuperKeyword,
  ["switch"]: SyntaxKinds.SwitchKeyword,
  ["this"]: SyntaxKinds.ThisKeyword,
  ["throw"]: SyntaxKinds.ThrowKeyword,
  ["try"]: SyntaxKinds.TryKeyword,
  ["var"]: SyntaxKinds.VarKeyword,
  ["with"]: SyntaxKinds.WithKeyword,
  ["while"]: SyntaxKinds.WhileKeyword,
  ["yield"]: SyntaxKinds.YieldKeyword,
  ["let"]: SyntaxKinds.LetKeyword,
  ["delete"]: SyntaxKinds.DeleteKeyword,
  ["void"]: SyntaxKinds.VoidKeyword,
  ["typeof"]: SyntaxKinds.TypeofKeyword,
  ["in"]: SyntaxKinds.InKeyword,
  ["instanceof"]: SyntaxKinds.InstanceofKeyword,
  ["true"]: SyntaxKinds.TrueKeyword,
  ["false"]: SyntaxKinds.FalseKeyword,
  ["undefined"]: SyntaxKinds.UndefinedKeyword,
};

export const SytaxKindsMapLexicalLiteral: Record<SyntaxKinds, string> = {
  /** ======================================
   *         Tokens
   * =======================================
   */
  // ============= Keyword ===========
  [SyntaxKinds.AwaitKeyword]: "await",
  [SyntaxKinds.BreakKeyword]: "break",
  [SyntaxKinds.CaseKeyword]: "case",
  [SyntaxKinds.CatchKeyword]: "catch",
  [SyntaxKinds.ClassKeyword]: "class",
  [SyntaxKinds.ConstKeyword]: "const",
  [SyntaxKinds.ContinueKeyword]: "continue",
  [SyntaxKinds.DebuggerKeyword]: "debugger",
  [SyntaxKinds.DefaultKeyword]: "default",
  [SyntaxKinds.DoKeyword]: "do",
  [SyntaxKinds.ElseKeyword]: "else",
  [SyntaxKinds.EnumKeyword]: "enum",
  [SyntaxKinds.ExportKeyword]: "export",
  [SyntaxKinds.ExtendsKeyword]: "extends",
  [SyntaxKinds.FinallyKeyword]: "finally",
  [SyntaxKinds.ForKeyword]: "for",
  [SyntaxKinds.FunctionKeyword]: "function",
  [SyntaxKinds.IfKeyword]: "if",
  [SyntaxKinds.ImportKeyword]: "import",
  [SyntaxKinds.LetKeyword]: "let",
  [SyntaxKinds.NewKeyword]: "new",
  [SyntaxKinds.ReturnKeyword]: "return",
  [SyntaxKinds.SuperKeyword]: "super",
  [SyntaxKinds.SwitchKeyword]: "switch",
  [SyntaxKinds.ThisKeyword]: "this",
  [SyntaxKinds.ThrowKeyword]: "throw",
  [SyntaxKinds.TryKeyword]: "try",
  [SyntaxKinds.VarKeyword]: "var",
  [SyntaxKinds.WithKeyword]: "with",
  [SyntaxKinds.WhileKeyword]: "while",
  [SyntaxKinds.YieldKeyword]: "yield",
  [SyntaxKinds.DeleteKeyword]: "delete",
  [SyntaxKinds.VoidKeyword]: "void",
  [SyntaxKinds.TypeofKeyword]: "typeof",
  [SyntaxKinds.InKeyword]: "in",
  [SyntaxKinds.InstanceofKeyword]: "instanceof",
  // ========== Operators ==========
  [SyntaxKinds.PlusOperator]: "+", // +
  [SyntaxKinds.MinusOperator]: "-", // -
  [SyntaxKinds.DivideOperator]: "/", // /
  [SyntaxKinds.MultiplyOperator]: "*", // *
  [SyntaxKinds.ModOperator]: "%", // %
  [SyntaxKinds.IncreOperator]: "++", // ++
  [SyntaxKinds.DecreOperator]: "--", // --
  [SyntaxKinds.ExponOperator]: "**", // **
  [SyntaxKinds.GtOperator]: ">", // >
  [SyntaxKinds.LtOperator]: "<", // <
  [SyntaxKinds.EqOperator]: "==", // ==
  [SyntaxKinds.NotEqOperator]: "!=", // !=
  [SyntaxKinds.GeqtOperator]: ">=", // >=
  [SyntaxKinds.LeqtOperator]: "<=", // <=
  [SyntaxKinds.ArrowOperator]: "=>", //  =>
  [SyntaxKinds.StrictEqOperator]: "===", // ===
  [SyntaxKinds.StrictNotEqOperator]: "!==", // !==
  [SyntaxKinds.BitwiseOROperator]: "|", // |
  [SyntaxKinds.BitwiseANDOperator]: "&", // &
  [SyntaxKinds.BitwiseNOTOperator]: "~", // ~
  [SyntaxKinds.BitwiseXOROperator]: "^", // ^
  [SyntaxKinds.BitwiseLeftShiftOperator]: "<<", // <<
  [SyntaxKinds.BitwiseRightShiftOperator]: ">>", // >>
  [SyntaxKinds.BitwiseRightShiftFillOperator]: ">>>", // >>>
  [SyntaxKinds.LogicalOROperator]: "||", // ||
  [SyntaxKinds.LogicalANDOperator]: "&&", // &&
  [SyntaxKinds.LogicalNOTOperator]: "!", // !
  [SyntaxKinds.SpreadOperator]: "...", // ...
  [SyntaxKinds.QustionOperator]: "?", // ?
  [SyntaxKinds.QustionDotOperator]: "?.", // ?.
  [SyntaxKinds.NullishOperator]: "??",
  [SyntaxKinds.DotOperator]: ".", // .
  [SyntaxKinds.AssginOperator]: "=", // =
  [SyntaxKinds.PlusAssignOperator]: "+=", // +=
  [SyntaxKinds.MinusAssignOperator]: "-=", // -=
  [SyntaxKinds.ModAssignOperator]: "%=", // %=
  [SyntaxKinds.DivideAssignOperator]: "/=", // /=
  [SyntaxKinds.MultiplyAssignOperator]: "*=", // *=
  [SyntaxKinds.ExponAssignOperator]: "**=", // **=
  [SyntaxKinds.BitwiseORAssginOperator]: "|=", // |=
  [SyntaxKinds.BitwiseANDAssginOperator]: "&=", // &=
  [SyntaxKinds.BitwiseNOTAssginOperator]: "~=", // ~=
  [SyntaxKinds.BitwiseXORAssginOperator]: "^=", // ^=
  [SyntaxKinds.LogicalORAssignOperator]: "||=", // ||=
  [SyntaxKinds.logicalANDAssginOperator]: "&&=", // &&=
  [SyntaxKinds.BitwiseLeftShiftAssginOperator]: "<<=", // <<=
  [SyntaxKinds.BitwiseRightShiftAssginOperator]: ">>=", // >>=
  [SyntaxKinds.BitwiseRightShiftFillAssginOperator]: ">>>=", // >>>=
  [SyntaxKinds.NullishAssignOperator]: "??=",
  // ========= Token (Maybe Punctuator and Operator) =====
  [SyntaxKinds.CommaToken]: "CommaToken",
  // ========== Punctuator ===========
  [SyntaxKinds.BracesLeftPunctuator]: "{", // {
  [SyntaxKinds.BracesRightPunctuator]: "}", // }
  [SyntaxKinds.BracketLeftPunctuator]: "[", // [
  [SyntaxKinds.BracketRightPunctuator]: "]", // ]
  [SyntaxKinds.ParenthesesLeftPunctuator]: "(", // (
  [SyntaxKinds.ParenthesesRightPunctuator]: ")", // )
  [SyntaxKinds.SingleQuotationPunctuator]: "'", // '
  [SyntaxKinds.DoubleQuotationPunctuator]: '"', // "
  [SyntaxKinds.SemiPunctuator]: ";", // ;
  [SyntaxKinds.ColonPunctuator]: ":", // :
  [SyntaxKinds.HashTagPunctuator]: "#", // #
  [SyntaxKinds.AtPunctuator]: "@", // @

  // ========== Template ===========
  [SyntaxKinds.TemplateHead]: "TemplateHead",
  [SyntaxKinds.TemplateTail]: "TemplateTail",
  [SyntaxKinds.TemplateMiddle]: "TemplateMiddle",
  [SyntaxKinds.TemplateNoSubstitution]: "TemplateNoSubstitution",
  // ========== Literal ===========
  [SyntaxKinds.TrueKeyword]: "TrueKeyword",
  [SyntaxKinds.FalseKeyword]: "FalseKeyword",
  [SyntaxKinds.NullKeyword]: "NullKeyword",
  [SyntaxKinds.UndefinedKeyword]: "UndefinedKeyword",
  [SyntaxKinds.StringLiteral]: "StringLiteral",
  [SyntaxKinds.DecimalLiteral]: "DecimalLiteral",
  [SyntaxKinds.NonOctalDecimalLiteral]: "NonOctalDecimalIntegerLiteral",
  [SyntaxKinds.LegacyOctalIntegerLiteral]: "LegacyOctalIntegerLiteral",
  [SyntaxKinds.BinaryIntegerLiteral]: "BinaryIntegerLiteral",
  [SyntaxKinds.OctalIntegerLiteral]: "OctalIntegerLiteral",
  [SyntaxKinds.HexIntegerLiteral]: "HexIntegerLiteral",
  [SyntaxKinds.DecimalBigIntegerLiteral]: "DecimalBigIntegerLiteral",
  [SyntaxKinds.BinaryBigIntegerLiteral]: "BinaryBigIntegerLiteral",
  [SyntaxKinds.HexBigIntegerLiteral]: "HexBigIntegerLiteral",
  [SyntaxKinds.OctalBigIntegerLiteral]: "OctBigIntegerLiteral",
  [SyntaxKinds.RegexLiteral]: "RegexLiteral",
  // =========== Comment =============
  [SyntaxKinds.Comment]: "Comment",
  [SyntaxKinds.BlockComment]: "BlockComment",
  // ========= Identifier ===========
  [SyntaxKinds.Identifier]: "Identifer",
  [SyntaxKinds.PrivateName]: "PrivateName",
  // ========== EOF ==========
  [SyntaxKinds.EOFToken]: "EOFToken",
  /** ======================================
   *          AST Node
   * ======================================
   */
  // =========== Top Level ===========
  [SyntaxKinds.Program]: "Program",
  // =========== Statement ===========
  [SyntaxKinds.IfStatement]: "IfStatement",
  [SyntaxKinds.BlockStatement]: "BlockStatement",
  [SyntaxKinds.SwitchStatement]: "SwitchStatement",
  [SyntaxKinds.SwitchCase]: "SwitchCase",
  [SyntaxKinds.LabeledStatement]: "LabledStatement",
  [SyntaxKinds.BreakStatement]: "BreakStatement",
  [SyntaxKinds.ContinueStatement]: "ContinueStatement",
  [SyntaxKinds.ReturnStatement]: "ReturnStatement",
  [SyntaxKinds.WhileStatement]: "WhileStatement",
  [SyntaxKinds.DoWhileStatement]: "DoWhileStatement",
  [SyntaxKinds.TryStatement]: "TryStatement",
  [SyntaxKinds.CatchClause]: "CatchClause",
  [SyntaxKinds.ThrowStatement]: "ThrowStatement",
  [SyntaxKinds.DebuggerStatement]: "DebuggerStatement",
  [SyntaxKinds.EmptyStatement]: "EmptyStatement",
  [SyntaxKinds.WithStatement]: "WithStatement",
  [SyntaxKinds.ForInStatement]: "ForInStatement",
  [SyntaxKinds.ForOfStatement]: "ForOfStatement",
  [SyntaxKinds.ForStatement]: "ForStatement",
  // =========== Declaration ===========
  [SyntaxKinds.VariableDeclaration]: "VariableDeclaration",
  [SyntaxKinds.VariableDeclarator]: "VariableDeclarator",
  [SyntaxKinds.Function]: "Function",
  [SyntaxKinds.FunctionDeclaration]: "FunctionDeclaration",
  [SyntaxKinds.FunctionBody]: "FunctionBody",
  [SyntaxKinds.ClassDeclaration]: "ClassDeclaration",
  [SyntaxKinds.ClassBody]: "ClassBody",
  // ========== Expression ==========
  [SyntaxKinds.NullLiteral]: "NullLiteral",
  [SyntaxKinds.UndefinedLiteral]: "UndefinedLiteral",
  [SyntaxKinds.BooleanLiteral]: "BoolLterial",
  [SyntaxKinds.MetaProperty]: "MetaProperty",
  [SyntaxKinds.Super]: "Super",
  [SyntaxKinds.Import]: "Import",
  [SyntaxKinds.ThisExpression]: "ThisExpression",
  [SyntaxKinds.SpreadElement]: "SpreadElement",
  [SyntaxKinds.ArrayExpression]: "ArrayExpression",
  [SyntaxKinds.ObjectExpression]: "ObjectExpression",
  [SyntaxKinds.ObjectProperty]: "ObjectProperty",
  [SyntaxKinds.ObjectAccessor]: "ObjectAccessor",
  [SyntaxKinds.ObjectMethodDefintion]: "ObjectMethodDefinition",
  [SyntaxKinds.ClassExpression]: "ClassExpression",
  [SyntaxKinds.ClassProperty]: "ClassProperty",
  [SyntaxKinds.ClassAccessorProperty]: "ClassAccessorProperty",
  [SyntaxKinds.ClassAccessor]: "ClassAccessor",
  [SyntaxKinds.ClassConstructor]: "ClassConstructor",
  [SyntaxKinds.ClassMethodDefinition]: "ClassMethodDefinition",
  [SyntaxKinds.ClassStaticBlock]: "ClassStaticBlock",
  [SyntaxKinds.Decorator]: "Decorator",
  [SyntaxKinds.FunctionExpression]: "FunctionExpression",
  [SyntaxKinds.TemplateLiteral]: "TemplateLiteral",
  [SyntaxKinds.TemplateElement]: "TemplateElement",
  [SyntaxKinds.ArrowFunctionExpression]: "ArrowFunctionExpression",
  [SyntaxKinds.Property]: "Property",
  [SyntaxKinds.ChainExpression]: "ChainExpression",
  [SyntaxKinds.NewExpression]: "NewExpression",
  [SyntaxKinds.MemberExpression]: "MemberExpression",
  [SyntaxKinds.TaggedTemplateExpression]: "TaggTemplateExpression",
  [SyntaxKinds.AwaitExpression]: "AwaitExpression",
  [SyntaxKinds.CallExpression]: "CallExpression",
  [SyntaxKinds.UpdateExpression]: "UpdateExpression",
  [SyntaxKinds.UnaryExpression]: "UnaryExpression",
  [SyntaxKinds.BinaryExpression]: "BinaryExpression",
  [SyntaxKinds.YieldExpression]: "YieldExpression",
  [SyntaxKinds.AssigmentExpression]: "AssigmentExpression",
  [SyntaxKinds.ConditionalExpression]: "ConditionalExpression",
  [SyntaxKinds.SequenceExpression]: "SequenceExpression",
  [SyntaxKinds.ExpressionStatement]: "ExpressionStatement",
  // =========== Pattern ==========
  [SyntaxKinds.AssignmentPattern]: "AssigmentPattern",
  [SyntaxKinds.ObjectPattern]: "ObjectPattern",
  [SyntaxKinds.ObjectPatternProperty]: "ObjectPatternProperty",
  [SyntaxKinds.ArrayPattern]: "ArrayPattern",
  [SyntaxKinds.RestElement]: "RestElement",
  // ========= ImportDeclaration ==========
  [SyntaxKinds.ImportDeclaration]: "ImportDeclaration",
  [SyntaxKinds.ImportSpecifier]: "ImportSpecifier",
  [SyntaxKinds.ImportDefaultSpecifier]: "ImportDefaultSpecifier",
  [SyntaxKinds.ImportNamespaceSpecifier]: "ImportNamespaceSpecifier",
  // ========= ImportDeclaration ==========
  [SyntaxKinds.ExportNamedDeclaration]: "ExportNamedDeclaration",
  [SyntaxKinds.ExportSpecifier]: "ExportSpecifier",
  [SyntaxKinds.ExportDefaultDeclaration]: "ExportDefaultDeclaration",
  [SyntaxKinds.ExportAllDeclaration]: "ExportAllDeclaration",
  // ========= ImportDeclaration ==========
  [SyntaxKinds.ImportAttribute]: "ImportAttribute",
  // ========= JSXElement and JSXFragment ========
  [SyntaxKinds.JSXElement]: "JSXElement",
  [SyntaxKinds.JSXOpeningElement]: "JSXOpeningElement",
  [SyntaxKinds.JSXClosingElement]: "JSXClosingElement",
  [SyntaxKinds.JSXFragment]: "JSXFragment",
  [SyntaxKinds.JSXOpeningFragment]: "JSXOpeningFragment",
  [SyntaxKinds.JSXClosingFragment]: "JSXClosingFragment",
  [SyntaxKinds.JSXAttribute]: "JSXAttribute",
  [SyntaxKinds.JSXSpreadAttribute]: "JSXSpreadAttribute",
  [SyntaxKinds.JSXIdentifier]: "JSXIdentifier",
  [SyntaxKinds.JSXMemberExpression]: "JSXMemberExpression",
  [SyntaxKinds.JSXNamespaceName]: "JSXNamespaceName",
  [SyntaxKinds.JSXSpreadChild]: "JSXSpreadChild",
  [SyntaxKinds.JSXText]: "JSXText",
  [SyntaxKinds.JSXExpressionContainer]: "JSXExpressionContainer",
  [SyntaxKinds.JSXCloseTagStart]: "JSXClosedTagStart",
  [SyntaxKinds.JSXSelfClosedToken]: "JSXSelfClosedToken",
  // ====== TypeScript Computed Type
  [SyntaxKinds.TSConditionalType]: "TSConditionalType",
  [SyntaxKinds.TSUnionType]: "TSUnionType",
  [SyntaxKinds.TSIntersectionType]: "TSIntersectionType",
  [SyntaxKinds.TSTypeOperator]: "TSTypeOperator",
  [SyntaxKinds.TSArrayType]: "TSArrayType",
  [SyntaxKinds.TSIndexedAccessType]: "TSIndexedAccessType",
  [SyntaxKinds.TSTypeAliasDeclaration]: "TSTypeAliasDeclaration",
  [SyntaxKinds.TSInterfaceDeclaration]: "TSInterfaceDeclaration",
  // ====== TypeScript High Basic Type
  [SyntaxKinds.TSFunctionType]: "TSFunctionType",
  [SyntaxKinds.TSConstructorType]: "TSConstructorType",
  // ====== TypeScript Type Param
  [SyntaxKinds.TSTypeParameterInstantiation]: "TSTypeParameterInstantiation",
  [SyntaxKinds.TSTypeParameterDeclaration]: "TSTypeParameterDeclaration",
  [SyntaxKinds.TSTypeParameter]: "TSTypeParameter",
  // ====== TypeScript Basic Type
  [SyntaxKinds.TSTypeLiteral]: "TSTypeLiteral",
  [SyntaxKinds.TSCallSignatureDeclaration]: "TSCallSignatureDeclaration",
  [SyntaxKinds.TSConstructSignatureDeclaration]: "TSConstructSignatureDeclaration",
  [SyntaxKinds.TSIndexSignature]: "TSIndexSignature",
  [SyntaxKinds.TSPropertySignature]: "TSPropertySignature",
  [SyntaxKinds.TSMethodSignature]: "TSMethodSignature",
  [SyntaxKinds.TSQualifiedName]: "TSQualifiedName",
  [SyntaxKinds.TSTypePredicate]: "TSTypePredicate",
  [SyntaxKinds.TSTypeAnnotation]: "TSTypeAnnotation",
  [SyntaxKinds.TSTypeReference]: "TSTypeReference",
  [SyntaxKinds.TSStringKeyword]: "TSStringKeyword",
  [SyntaxKinds.TSNumberKeyword]: "TSNumberKeyword",
  [SyntaxKinds.TSBigIntKeyword]: "TSBigIntKeyword",
  [SyntaxKinds.TSBooleanKeyword]: "TSBooleanKeyword",
  [SyntaxKinds.TSNullKeyword]: "TSNullKeyword",
  [SyntaxKinds.TSUndefinedKeyword]: "TSUndefinedKeyword",
  [SyntaxKinds.TSSymbolKeyword]: "TSSymbolKeyword",
  [SyntaxKinds.TSAnyKeyword]: "TSAnyKeyword",
  [SyntaxKinds.TSNeverKeyword]: "TSNeverKeyword",
  [SyntaxKinds.TSUnknowKeyword]: "TSUnknowKeyword",
  [SyntaxKinds.TSTypeQuery]: "TSTypeQuery",
  [SyntaxKinds.TSInterfaceBody]: "TSInterfaceBody",
  [SyntaxKinds.TSTupleType]: "TSTupleType",
  [SyntaxKinds.TSLiteralType]: "TSLiteralType",
  [SyntaxKinds.TSVoidKeyword]: "TSVoidKeyword",
  [SyntaxKinds.TSInstantiationExpression]: "TSInstantiationExpression",
  [SyntaxKinds.TSInterfaceHeritage]: "TSInterfaceHeritage",
  [SyntaxKinds.TSTypeAssertionExpression]: "TSTypeAssertionExpression",
  [SyntaxKinds.TSAsExpression]: "TSAsExpression",
  [SyntaxKinds.TSSatisfiesExpression]: "TSSatisfiesExpression",
  [SyntaxKinds.TSNonNullExpression]: "TSNonNullExpression",
  [SyntaxKinds.TSEnumDeclaration]: "TSEnumDeclaration",
  [SyntaxKinds.TSEnumBody]: "TSEnumBody",
  [SyntaxKinds.TSEnumMember]: "TSEnumMember",
  [SyntaxKinds.TSDeclareFunction]: "TSDeclareFunction",
  [SyntaxKinds.TSAbstractClassAccessorDeclaration]: "TSAbstractClassAccessorDeclaration",
  [SyntaxKinds.ClassMethodDeclaration]: "ClassMethodDeclaration",
  [SyntaxKinds.TSClassConstructorDeclaration]: "TSClassConstructorDeclaration",
};
/** ===================================
 *          Union SytaxKinds
 * ======================================
 */
export type AssigmentOperatorKinds =
  | SyntaxKinds.AssginOperator
  | SyntaxKinds.PlusAssignOperator
  | SyntaxKinds.MinusAssignOperator
  | SyntaxKinds.ExponAssignOperator
  | SyntaxKinds.DivideAssignOperator
  | SyntaxKinds.MultiplyAssignOperator
  | SyntaxKinds.ModAssignOperator
  | SyntaxKinds.BitwiseORAssginOperator // |=
  | SyntaxKinds.BitwiseANDAssginOperator // &=
  | SyntaxKinds.BitwiseNOTAssginOperator // ~=
  | SyntaxKinds.BitwiseXORAssginOperator // ^=
  | SyntaxKinds.LogicalORAssignOperator // ||=
  | SyntaxKinds.logicalANDAssginOperator // &&=
  | SyntaxKinds.BitwiseLeftShiftAssginOperator // <<=
  | SyntaxKinds.BitwiseRightShiftAssginOperator // >>=
  | SyntaxKinds.BitwiseRightShiftFillAssginOperator
  | SyntaxKinds.NullishAssignOperator; // >>>=
export const AssigmentOperators = [
  SyntaxKinds.AssginOperator,
  SyntaxKinds.PlusAssignOperator,
  SyntaxKinds.MinusAssignOperator,
  SyntaxKinds.ExponAssignOperator,
  SyntaxKinds.DivideAssignOperator,
  SyntaxKinds.MultiplyAssignOperator,
  SyntaxKinds.ModAssignOperator,
  SyntaxKinds.BitwiseORAssginOperator, // |=
  SyntaxKinds.BitwiseANDAssginOperator, // &=
  SyntaxKinds.BitwiseNOTAssginOperator, // ~=
  SyntaxKinds.BitwiseXORAssginOperator, // ^=
  SyntaxKinds.LogicalORAssignOperator, // ||=
  SyntaxKinds.logicalANDAssginOperator, // &&=
  SyntaxKinds.BitwiseLeftShiftAssginOperator, // <<=
  SyntaxKinds.BitwiseRightShiftAssginOperator, // >>=
  SyntaxKinds.BitwiseRightShiftFillAssginOperator, // >>>=
  SyntaxKinds.NullishAssignOperator,
];
export type BinaryOperatorKinds =
  | SyntaxKinds.PlusOperator // +
  | SyntaxKinds.MinusOperator // -
  | SyntaxKinds.DivideOperator // /
  | SyntaxKinds.MultiplyOperator // *
  | SyntaxKinds.ModOperator // %
  | SyntaxKinds.IncreOperator // ++
  | SyntaxKinds.DecreOperator // --
  | SyntaxKinds.ExponOperator // **
  | SyntaxKinds.GtOperator // >
  | SyntaxKinds.LtOperator // <
  | SyntaxKinds.EqOperator // ==
  | SyntaxKinds.NotEqOperator // !=
  | SyntaxKinds.GeqtOperator // >=
  | SyntaxKinds.LeqtOperator // <=
  | SyntaxKinds.StrictEqOperator // ===
  | SyntaxKinds.StrictNotEqOperator // !==
  | SyntaxKinds.BitwiseOROperator // |
  | SyntaxKinds.BitwiseANDOperator // &
  | SyntaxKinds.BitwiseLeftShiftOperator // <<
  | SyntaxKinds.BitwiseRightShiftOperator // >>
  | SyntaxKinds.BitwiseRightShiftFillOperator // >>>
  | SyntaxKinds.LogicalANDOperator // &&
  | SyntaxKinds.LogicalOROperator // ||
  | SyntaxKinds.CommaToken // ,
  | SyntaxKinds.InKeyword
  | SyntaxKinds.InstanceofKeyword
  | SyntaxKinds.NullishOperator; // ??
export const BinaryOperators = [
  SyntaxKinds.PlusOperator, // +
  SyntaxKinds.MinusOperator, // -
  SyntaxKinds.DivideOperator, // /
  SyntaxKinds.MultiplyOperator, // *
  SyntaxKinds.ModOperator, // %
  SyntaxKinds.IncreOperator, // ++
  SyntaxKinds.DecreOperator, // --
  SyntaxKinds.ExponOperator, // **
  SyntaxKinds.GtOperator, // >
  SyntaxKinds.LtOperator, // <
  SyntaxKinds.EqOperator, // ==
  SyntaxKinds.NotEqOperator, // !=
  SyntaxKinds.GeqtOperator, // >=
  SyntaxKinds.LeqtOperator, // <=
  SyntaxKinds.StrictEqOperator, // ===
  SyntaxKinds.StrictNotEqOperator, // !==
  SyntaxKinds.BitwiseOROperator, // |
  SyntaxKinds.BitwiseANDOperator, // &
  SyntaxKinds.BitwiseXOROperator, // ^
  SyntaxKinds.BitwiseLeftShiftOperator, // <<
  SyntaxKinds.BitwiseRightShiftOperator, // >>
  SyntaxKinds.BitwiseRightShiftFillOperator, // >>>
  SyntaxKinds.LogicalANDOperator, // &&
  SyntaxKinds.LogicalOROperator, // ||
  SyntaxKinds.CommaToken, // ,
  SyntaxKinds.InKeyword,
  SyntaxKinds.InstanceofKeyword,
  SyntaxKinds.NullishOperator, // ??
];
export type UpdateOperatorKinds = SyntaxKinds.IncreOperator | SyntaxKinds.DecreOperator;
export const UpdateOperators = [SyntaxKinds.IncreOperator, SyntaxKinds.DecreOperator];
export type UnaryOperatorKinds =
  | SyntaxKinds.LogicalNOTOperator // !
  | SyntaxKinds.BitwiseNOTOperator // ~
  | SyntaxKinds.BitwiseXOROperator // ^
  | SyntaxKinds.PlusOperator // +
  | SyntaxKinds.MinusOperator // -
  | SyntaxKinds.DeleteKeyword // delete
  | SyntaxKinds.VoidKeyword // void
  | SyntaxKinds.TypeofKeyword; // typeof
export const UnaryOperators = [
  SyntaxKinds.LogicalNOTOperator, // !
  SyntaxKinds.BitwiseNOTOperator, // ~
  SyntaxKinds.BitwiseXOROperator, // ^
  SyntaxKinds.PlusOperator, // +
  SyntaxKinds.MinusOperator, // -
  SyntaxKinds.DeleteKeyword, // delete
  SyntaxKinds.VoidKeyword, // void
  SyntaxKinds.TypeofKeyword, // typeof
];

export const Keywords = [
  SyntaxKinds.AwaitKeyword,
  SyntaxKinds.BreakKeyword,
  SyntaxKinds.CaseKeyword,
  SyntaxKinds.CatchKeyword,
  SyntaxKinds.ClassKeyword,
  SyntaxKinds.ConstKeyword,
  SyntaxKinds.ContinueKeyword,
  SyntaxKinds.DebuggerKeyword,
  SyntaxKinds.DefaultKeyword,
  SyntaxKinds.DoKeyword,
  SyntaxKinds.ElseKeyword,
  SyntaxKinds.EnumKeyword,
  SyntaxKinds.ExportKeyword,
  SyntaxKinds.ExtendsKeyword,
  SyntaxKinds.FinallyKeyword,
  SyntaxKinds.ForKeyword,
  SyntaxKinds.FunctionKeyword,
  SyntaxKinds.IfKeyword,
  SyntaxKinds.ImportKeyword,
  SyntaxKinds.LetKeyword,
  SyntaxKinds.NewKeyword,
  SyntaxKinds.NullKeyword,
  SyntaxKinds.ReturnKeyword,
  SyntaxKinds.SuperKeyword,
  SyntaxKinds.SwitchKeyword,
  SyntaxKinds.ThisKeyword,
  SyntaxKinds.ThrowKeyword,
  SyntaxKinds.TryKeyword,
  SyntaxKinds.VarKeyword,
  SyntaxKinds.WithKeyword,
  SyntaxKinds.YieldKeyword,
  SyntaxKinds.DeleteKeyword,
  SyntaxKinds.VoidKeyword,
  SyntaxKinds.TypeofKeyword,
  SyntaxKinds.InKeyword,
  SyntaxKinds.InstanceofKeyword,
  SyntaxKinds.TrueKeyword,
  SyntaxKinds.FalseKeyword,
  SyntaxKinds.UndefinedKeyword,
];
export const NumericLiteralKinds = [
  SyntaxKinds.DecimalLiteral,
  SyntaxKinds.NonOctalDecimalLiteral,
  SyntaxKinds.BinaryIntegerLiteral,
  SyntaxKinds.OctalIntegerLiteral,
  SyntaxKinds.HexIntegerLiteral,
  SyntaxKinds.LegacyOctalIntegerLiteral,
  SyntaxKinds.BinaryBigIntegerLiteral,
  SyntaxKinds.DecimalBigIntegerLiteral,
  SyntaxKinds.HexBigIntegerLiteral,
  SyntaxKinds.OctalBigIntegerLiteral,
];
