export const ErrorMessageMap = {
  // general
  missing_semicolon: "Missing semicolon or line terminator",
  // class, object property, method .. etc
  getter_should_never_has_params: "Getter Should Not Has Any Parameters",
  getter_can_not_be_async_or_generator: "getter can not be async or generator",
  setter_should_has_only_one_params: "setter must only one param",
  setter_can_not_be_async_or_generator: "setter can not be async or generator",
  setter_can_not_have_rest_element_as_argument: "setter method can not ahve rest element as argument",
  setter_and_getter_can_not_used_in_field_definition: "setter and getter can not used in field definition",
  constructor_can_not_be_async_or_generator_or_method_incorrect:
    "constructor in class can not be a async or generator, and can not be getter or setter",
  object_property_can_not_have_initializer: "object property can not have initializer",
  private_field_can_not_use_in_object: "Private field '#test' must be declared in an enclosing class",
  invalid_property_name: "invalid property name",
  no_changle_line_after_async: "",
  super_can_not_call_if_not_in_class: "super can not be called if not in class block",
  super_must_be_followed_by_an_argument_list_or_member_access:
    "'super' must be followed by an argument list or member access.",
  private_name_wrong_used:
    "Private names are only allowed in property accesses or or in left hand side of `in` expressions",
  private_name_duplicate: "Private name duplicate.",
  private_name_undeinfed: "Private name undeinfed",
  constructor_name_as_private_name: "constructor can not be private name",
  constructor_can_not_be_class_property_name: "constructor can not used as class property name",
  prototype_can_not_be_static: "Classes may not have static property named prototype",
  delete_private_name: "Can not delete a private name",
  // spread, rest element
  rest_element_should_be_last_property: "RestElement should be the lastest property",
  rest_element_can_not_end_with_comma: "RestElement can not concat with comma",
  rest_element_can_not_use_in_cover: "rest element can not use in cover expression",
  rest_element_must_be_either_binding_identifier_or_binding_pattern:
    "rest element must be either binding identifier to binding pattern.",
  rest_operator_must_be_followed_by_an_assignable_reference_in_assignment_contexts:
    "`...` must be followed by an assignable reference in assignment contexts",
  invalid_rest_element_with_pattern_in_object_pattern: "invalid rest element with pattern in object pattern",
  // binding pattern, assignment pattern
  destructing_pattern_must_need_initializer: "destucturing pattern must have a initializer",
  invalid_left_value: "invalid left value",
  assigment_pattern_only_can_use_assigment_operator: "assigment pattern can only using assignment operator",
  assignment_pattern_left_value_can_only_be_idenifier_or_pattern: "assignment pattern",
  binding_pattern_can_not_have_member_expression: "binding pattern can not have member expression",
  when_binding_pattern_property_name_is_string_literal_can_not_be_shorted:
    "When binding pattern property name is string literal, it can not be shorted",
  pattern_should_not_has_paran: "pattern should not has pattern.",
  // for-related statement
  for_in_of_loop_may_not_using_initializer: "for in and for of loop may not usng initializer",
  for_in_of_loop_can_not_have_one_more_binding:
    "variable declaration in for-in or for-of statement can't not have more than one binding",
  await_can_just_in_for_of_loop: "await can only be in for of loop",
  for_of_can_not_use_let_as_identifirt: "for-of loop can not use let as identifier",
  // trailing comma
  function_parameter_can_not_have_empty_trailing_comma:
    "function parameter list can not have trailing comma when is empty",
  sequence_expression_can_not_have_trailing_comma: "sequence expression can not have trailing comma",
  function_argument_can_not_have_empty_trailing_comma:
    "function argument list can not have trailing comma when is empty",
  // strict mode problem
  unexpect_keyword_in_stric_mode: "unexpect keyword in strict mode",
  argument_can_not_use_as_binding_identifier: "",
  eval_can_not_use_as_binding_identifier: "",
  illegal_use_strict_in_non_simple_parameter_list: "illegal use strict in non simple parameter list",
  with_statement_can_not_use_in_strict_mode: "with statement can not use in strict mode",
  // invalid change line char
  no_line_break_is_allowed_before_arrow: "No line break is allowed before '=>'",
  no_line_break_is_allowed_before_async: "No line break is allowed before `async`",
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
  new_expression_cant_using_optional_chain: "New expression can not using optional chain in callee",
  tag_template_expression_can_not_use_option_chain: "Tag template expression should not using optional chain",
  keyword_can_not_use_in_imported_when_just_a_specifier:
    "keyword can not use in imported_when just a specifier",
  duplicate_param: "duplicate params",
  await_can_not_call_if_not_in_async: "await expression can not be call if not in async block",
  import_meta_invalid_property: "The only valid meta property for import is import.meta",
  when_in_async_context_await_keyword_will_treat_as_keyword:
    "when in async context await_keyword will treat as keyword not identifier",
  when_in_yield_context_yield_will_be_treated_as_keyword:
    "when in yield context yield will be treated as keyword not identifier",
  yield_deletgate_can_must_be_followed_by_assignment_expression:
    "yield deletegate must be followed by assignment expression",
  await_expression_can_not_used_in_parameter_list: "await expression can not used in parameter list",
  yield_expression_can_not_used_in_parameter_list: "yield expression can not used in parameter list",
  new_target_can_only_be_used_in_class_or_function_scope:
    "new target meta property can only be used in class or function scope",
  lable_statement_can_not_have_function_declaration_is_generator:
    "labled statement can not have function declaration is generator",
  let_keyword_can_not_use_as_identifier_in_lexical_binding:
    "let keyword can not used as identifier in lexical binding",
  import_call_is_not_allow_as_new_expression_called: "import call is not allowed as new expression called",
  invalid_esc_char_in_keyword: "keyword can not contain any esc flag.",
  paran_expr_can_not_be_empty: "paran expression can not be empty",
  /**
   * Format error from MDN, using v8 based as error message value, some error is come from babel and
   * v8 engine
   */
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_return
  syntax_error_return_not_in_function: "SyntaxError: return not in function",
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
  // try: `const {...[x]} = {}` in babel playgroud`
  v8_error_rest_binding_property_must_be_followed_by_an_identifier_in_declaration_contexts:
    "SyntaxError: `...` must be followed by an identifier in declaration contexts",
  v8_error_rest_assignment_property_must_be_followed_by_an_identifier_in_declaration_contexts:
    "SyntaxError: `...` must be followed by an assignable reference in assignment contexts",
  // try: `((a)) => {}` in v8 runtime.
  v8_error_invalid_parenthesized_assignment_pattern: "SyntaxError: Invalid destructuring assignment target.",
  // try: `try{}` in v8 runtime
  v8_error_missing_catch_or_finally_after_try: "SyntaxError: Missing catch or finally after try",
  // try: `"\xfG"` in v8 runtime (same from lexer)
  v8_error_invalid_hexadecimal_escape_sequence: "SyntaxError: Invalid hexadecimal escape sequence",
  // try: duplicate ctor in v8 runtime.
  v8_error_a_class_may_only_have_one_constructor: "SyntaxError: A class may only have one constructor",
  // try: multi default in switch case
  v8_error_more_than_one_default_clause_in_switch_statement:
    "SyntaxError: More than one default clause in switch statement",
  // try: `x: while (true) { x: while (true) { } }` in v8 runtime,
  v8_error_label_has_already_been_declared: "SyntaxError: Label has already been declared",
  // try: using lexical declaration in VariableDeclarationStatement
  v8_error_lexical_declaration_cannot_appear_in_a_single_statement_context:
    "SyntaxError: Lexical declaration cannot appear in a single-statement context.",
  // try: `import.meta` in babel playground when sourceType is script
  babel_error_import_meta_may_appear_only_with_source_type_module: `SyntaxError: import.meta may appear only with 'sourceType: "module"`,
  // try `import.name` in babel playground
  babel_error_the_only_valid_meta_property_for_import_is_import_meta:
    "SyntaxError: The only valid meta property for import is import.meta.",
  // try any import or export in module type is script
  babel_error_import_and_export_may_appear_only_with_sourceType_module: `SyntaxError: 'import' and 'export' may appear only with 'sourceType: "module"'`,
  // try jsx but not enable preset
  babel_error_need_enable_jsx: "This experimental syntax requires enabling jsx plugins",
  // try using decorator in static block
  babel_error_decorators_can_not_be_used_with_a_static_block:
    "SyntaxError: Decorators can't be used with a static block.",
  // try using decorator with constructor
  babel_error_decorators_can_not_be_used_with_a_constructor:
    "SyntaxError: Decorators can't be used with a constructor.",
  // try using decorator outside of class
  babel_error_leading_decorators_must_be_attached_to_a_class_declaration:
    "SyntaxError: Leading decorators must be attached to a class declaration.",
};
