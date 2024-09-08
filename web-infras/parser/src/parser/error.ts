export const ErrorMessageMap = {
  // general
  missing_semicolon: "Missing semicolon or line terminator",
  // spread, rest element
  rest_element_should_be_last_property: "RestElement should be the lastest property",
  rest_element_can_not_end_with_comma: "RestElement can not concat with comma",
  rest_element_must_be_either_binding_identifier_or_binding_pattern:
    "rest element must be either binding identifier to binding pattern.",
  rest_operator_must_be_followed_by_an_assignable_reference_in_assignment_contexts:
    "`...` must be followed by an assignable reference in assignment contexts",
  // binding pattern, assignment pattern
  invalid_left_value: "invalid left value",
  assignment_pattern_left_value_can_only_be_idenifier_or_pattern: "assignment pattern",
  binding_pattern_can_not_have_member_expression: "binding pattern can not have member expression",
  when_binding_pattern_property_name_is_string_literal_can_not_be_shorted:
    "When binding pattern property name is string literal, it can not be shorted",
  // for-related statement
  await_can_just_in_for_of_loop: "await can only be in for of loop",
  for_of_can_not_use_let_as_identifirt: "for-of loop can not use let as identifier",
  // trailing comma
  function_parameter_can_not_have_empty_trailing_comma:
    "function parameter list can not have trailing comma when is empty",
  function_argument_can_not_have_empty_trailing_comma:
    "function argument list can not have trailing comma when is empty",
  // strict mode problem
  unexpect_keyword_in_stric_mode: "unexpect keyword in strict mode",
  illegal_use_strict_in_non_simple_parameter_list: "illegal use strict in non simple parameter list",
  with_statement_can_not_use_in_strict_mode: "with statement can not use in strict mode",
  // invalid change line char
  // nullish and expont operator
  nullish_require_parans:
    "Nullish coalescing operator(??) requires parens when mixing with logical operators",
  expont_operator_need_parans:
    "Illegal expression. Wrap left hand side or entire exponentiation in parentheses",
  // modules export, import
  string_literal_cannot_be_used_as_an_exported_binding_without_from:
    "A string literal cannot be used as an exported binding without `from`",
  string_literal_cannot_be_used_as_an_imported_binding:
    "A string literal cannot be used as an imported binding",
  // other
  function_declaration_must_have_name: "Function delcaration must have function name",
  keyword_can_not_use_in_imported_when_just_a_specifier:
    "keyword can not use in imported_when just a specifier",
  duplicate_param: "duplicate params",
  await_can_not_call_if_not_in_async: "await expression can not be call if not in async block",
  when_in_async_context_await_keyword_will_treat_as_keyword:
    "when in async context await_keyword will treat as keyword not identifier",
  when_in_yield_context_yield_will_be_treated_as_keyword:
    "when in yield context yield will be treated as keyword not identifier",
  yield_deletgate_can_must_be_followed_by_assignment_expression:
    "yield deletegate must be followed by assignment expression",
  await_expression_can_not_used_in_parameter_list: "await expression can not used in parameter list",
  yield_expression_can_not_used_in_parameter_list: "yield expression can not used in parameter list",
  lable_statement_can_not_have_function_declaration_is_generator:
    "labled statement can not have function declaration is generator",
  let_keyword_can_not_use_as_identifier_in_lexical_binding:
    "let keyword can not used as identifier in lexical binding",
  invalid_esc_char_in_keyword: "keyword can not contain any esc flag.",
  /**
   * Format error from MDN, v8 runtime and babel transpiler, if there is a better error message then
   * unexpect token, the priority of error message is:
   * - using MDN error message.
   * - v8 error message.
   * - babel transpiler.
   * - added by my self.
   */
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_return
  syntax_error_return_not_in_function: "return not in function",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Arguments_not_allowed
  syntax_error_arguments_is_not_valid_in_fields:
    "SyntaxError: 'arguments' is not allowed in class field initializer or static initialization block",
  syntax_error_rest_parameter_may_not_have_a_default:
    "SyntaxError: Rest parameter may not have a default initializer",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Parameter_after_rest_parameter
  syntax_error_parameter_after_rest_parameter: "SyntaxError: Rest parameter must be last formal parameter",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_assignment_left-hand_side
  syntax_error_invalid_assignment_left_hand_side: "SyntaxError: invalid assignment left-hand side",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Setter_one_argument
  syntax_error_setter_functions_must_have_one_argument:
    "SyntaxError: Setter must have exactly one formal parameter.",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Setter_one_argument
  syntax_error_setter_functions_must_have_one_argument_not_rest:
    "SyntaxError: Setter function argument must not be a rest parameter",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_octal_literal
  Syntax_error_0_prefixed_octal_literals_are_deprecated:
    "SyntaxError: Octal literals are not allowed in strict mode",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Duplicate_proto
  syntax_error_property_name__proto__appears_more_than_once_in_object_literal:
    "SyntaxError: property name __proto__ appears more than once in object literal",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Delete_in_strict_mode
  syntax_error_applying_the_delete_operator_to_an_unqualified_name_is_deprecated:
    "SyntaxError: applying the 'delete' operator to an unqualified name is deprecated",
  // try `({ cc = 100})` in v8 based runtime
  Syntax_error_Invalid_shorthand_property_initializer: "SyntaxError: Invalid shorthand property initializer",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_octal_escape_sequence
  syntax_error_Octal_escape_sequences_are_not_allowed_in_strict_mode:
    "SyntaxError: Octal escape sequences are not allowed in strict mode.",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Function_label
  syntax_error_functions_cannot_be_labelled:
    "SyntaxError: In non-strict mode code, functions can only be declared at top level, inside a block, or as the body of an if statement.",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_break
  syntax_error_unlabeled_break_must_be_inside_loop_or_switch:
    "SyntaxError: unlabeled break must be inside loop or switch.",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_continue
  syntax_error_continue_must_be_inside_loop:
    "SyntaxError: Illegal continue statement: no surrounding iteration statement.",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Label_not_found
  syntax_error_label_not_found: "SyntaxError: label not found.",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_for-of_initializer
  syntax_error_for_of_loop_variable_declaration_may_not_have_an_initializer:
    "'for-of' loop variable declaration may not have an initializer.",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_for-in_initializer
  syntax_error_for_in_loop_head_declarations_may_not_have_initializer:
    "'for-in' loop variable declaration may not have an initializer.",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_no_arguments
  syntax_error_getter_functions_must_have_no_arguments: "getter functions must have no arguments",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_super_call
  syntax_error_super_is_only_valid_in_derived_class_constructors:
    "super() is only valid in derived class constructors",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_optional_template
  syntax_error_tag_template_expression_can_not_use_option_chain: "Invalid tagged template on optional chain",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Hash_outside_class
  syntax_error_unexpected_hash_used_outside_of_class_body: "Unexpected '#' used outside of class body",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_super_prop
  syntax_error_use_of_super_property_member_accesses_only_valid_within_methods_or_eval_code_within_methods:
    "use of super property/member accesses only valid within methods or eval code within methods.",
  // try: `const {...[x]} = {}` in babel playgroud`
  v8_error_rest_binding_property_must_be_followed_by_an_identifier_in_declaration_contexts:
    "SyntaxError: `...` must be followed by an identifier in declaration contexts",
  v8_error_rest_assignment_property_must_be_followed_by_an_identifier_in_declaration_contexts:
    "SyntaxError: `...` must be followed by an assignable reference in assignment contexts",
  // try: `try{}` in v8 runtime
  v8_error_missing_catch_or_finally_after_try: "SyntaxError: Missing catch or finally after try.",
  // try: `"\xfG"` in v8 runtime (same from lexer)
  v8_error_invalid_hexadecimal_escape_sequence: "SyntaxError: Invalid hexadecimal escape sequence.",
  // try: duplicate ctor in v8 runtime.
  v8_error_a_class_may_only_have_one_constructor: "SyntaxError: A class may only have one constructor.",
  // try: multi default in switch case
  v8_error_more_than_one_default_clause_in_switch_statement:
    "More than one default clause in switch statement.",
  // try: `x: while (true) { x: while (true) { } }` in v8 runtime,
  v8_error_label_has_already_been_declared: "SyntaxError: Label has already been declared.",
  // try: using lexical declaration in VariableDeclarationStatement
  v8_error_lexical_declaration_cannot_appear_in_a_single_statement_context:
    "SyntaxError: Lexical declaration cannot appear in a single-statement context.",
  // try: duplicate block identifier
  v8_error_duplicate_identifier: "SyntaxError: Identifier has already been declared.",
  // try: `for(let a, b of []);` in v8 runtime
  v8_error_Invalid_left_hand_side_in_for_in_loop_must_have_a_single_binding:
    "Invalid left-hand side in for-in loop: Must have a single binding.",
  // try: constructor with async
  v8_error_class_constructor_may_not_be_an_async_method: "Class constructor may not be an async method.",
  // try: constructor with generator
  v8_error_class_constructor_may_not_be_a_generator: "Class constructor may not be a generator.",
  // try: using accessor in constructor
  v8_error_class_constructor_may_not_be_an_accessor: "Class constructor may not be an accessor.",
  // try: using private name as constructor
  v8_error_class_may_not_have_a_private_field_named_constructor:
    "Classes may not have a private field named '#constructor'.",
  // try: using prototype as static property
  v8_error_class_may_not_have_static_property_named_prototype:
    "Classes may not have static property named prototype.",
  // try: using keyword as shorted property.
  babel_error_unexpected_keyword: "Unexpect keyword in property name.",
  // try: using presvered word as shorted property in strict mode
  babel_error_unexpected_reserved_word: "Unexpected reserved word.",
  // try: `import.meta` in babel playground when sourceType is script
  babel_error_import_meta_may_appear_only_with_source_type_module: `SyntaxError: import.meta may appear only with 'sourceType: "module"`,
  // try `import.name` in babel playground
  babel_error_the_only_valid_meta_property_for_import_is_import_meta:
    "SyntaxError: The only valid meta property for import is import.meta.",
  // try any import or export in module type is script
  babel_error_import_and_export_may_appear_only_with_sourceType_module: `SyntaxError: 'import' and 'export' may appear only with 'sourceType: "module"'`,
  // try jsx but not enable preset
  babel_error_need_enable_jsx: "This experimental syntax requires enabling jsx plugins.",
  // try using decorator in static block
  babel_error_decorators_can_not_be_used_with_a_static_block: "Decorators can't be used with a static block.",
  // try using decorator with constructor
  babel_error_decorators_can_not_be_used_with_a_constructor: "Decorators can't be used with a constructor.",
  // try using decorator outside of class
  babel_error_leading_decorators_must_be_attached_to_a_class_declaration:
    "Leading decorators must be attached to a class declaration.",
  // try export a name export declaration with no declar variable
  babel_error_export_is_not_defined: "Export variable is not defined.",
  // try to access private name from super first level member access
  babel_error_private_fields_cant_be_accessed_on_super: "Private fields can't be accessed on super.",
  // try to access private name but not function call or member expression access.
  babel_invalid_usage_of_super_call:
    "'super' can only be used with function calls (i.e. super()) or in property accesses (i.e. super.prop or super[prop].",
  // try to call super in not constructor function.
  babel_error_call_super_outside_of_ctor:
    "`super()` is only valid inside a class constructor of a subclass. Maybe a typo in the method name ('constructor') or not extending another class?",
  // try `#privateName+1` in babel playground.
  babel_error_private_name_wrong_used:
    "Private names are only allowed in property accesses (`obj.#private`) or in `in` expressions (`#private in obj`).",
  // try `const {a}` in babel playground
  babel_error_destructing_pattern_must_need_initializer: "Missing initializer in destructuring declaration.",
  // try `new.target` in top level
  babel_error_new_target_can_only_be_used_in_class_or_function_scope:
    "`new.target` can only be used in functions or class properties.",
  // try declarate a function out of block (like label)
  babel_error_generators_can_only_be_declared_at_the_top_level_or_inside_a_block:
    "Generators can only be declared at the top level or inside a block.",
  // try declarate a constructor as property name
  babel_error_classe_may_not_have_a_field_named_constructor:
    "Classes may not have a field named 'constructor'.",
  // try imported call in new expression
  babel_error_cannot_use_new_with_import: "Cannot use new with import(...).",
  // try new expression contain optional access.
  babel_error_constructors_in_after_an_optional_chain_are_not_allowed:
    "Constructors in/after an Optional Chain are not allowed.",
  // try duplicate privatename in class
  babel_error_private_name_duplicate: "Duplicate private name.",
  // try access privatename in class method
  babel_error_private_name_undeinfed: "Private name undeinfed",
  // try `({ a: (d) }) => {};` in babel playground
  babel_error_invalid_parenthesized_pattern: "Invalid parenthesized assignment pattern.",
  // try to add async in front of getter
  extra_error_getter_can_not_be_async_or_generator: "getter can not be async or generator.",
  // try to add generator in front of setter
  extra_error_setter_can_not_be_async_or_generator: "setter can not be async or generator.",
  // try using private field in object expression
  extra_error_private_field_in_object_expression: "Private name can not use in object expression.",
  // try `(1,1,)`
  extra_error_sequence_expression_can_not_have_trailing_comma:
    "sequence expression can not have trailing comma.",
  // try `(1,1,...a)`
  extra_error_rest_element_invalid: "Invalid rest elements.",
  // try `()`
  extra_error_empty_parentheses_expression: "Parentheses expression can not be empty.",
  // try `() \n => {}`
  extra_error_no_line_break_is_allowed_before_arrow: "No line break is allowed before '=>'",
};
