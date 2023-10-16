export const ErrorMessageMap = {
    // general
    missing_semicolon: "Missing semicolon or line terminator",
    // class, object property, method .. etc
    getter_should_never_has_params: "Getter Should Not Has Any Parameters",
    getter_can_not_be_async_or_generator: "getter can not be async or generator",
    setter_should_has_only_one_params: "setter must only one param",
    setter_can_not_be_async_or_generator: "setter can not be async or generator",
    setter_can_not_have_rest_element_as_argument: "setter method can not ahve rest element as argument",
    constructor_can_not_be_async_or_generator: "constructor in class can not be a async or generator",
    object_property_can_not_have_initializer: "object property can not have initializer",
    private_field_can_not_use_in_object: "Private field '#test' must be declared in an enclosing class",
    invalid_property_name: "invalid property name",
    super_can_not_call_if_not_in_class: "super can not be called if not in class block",
    super_must_be_followed_by_an_argument_list_or_member_access: "'super' must be followed by an argument list or member access.",
    // spread, rest element
    rest_element_should_be_last_property: "RestElement should be the lastest property",
    rest_element_can_not_end_with_comma: "RestElement can not concat with comma",
    rest_element_can_not_use_in_cover: "rest element can not use in cover expression",
    rest_element_must_be_either_binding_identifier_or_binding_pattern: "rest element must be either binding identifier to binding pattern.",
    invalid_rest_element_with_pattern_in_object_pattern: "invalid rest element with pattern in object pattern",
    // binding pattern, assignment pattern
    destructing_pattern_must_need_initializer: "destucturing pattern must have a initializer",
    invalid_left_value: "invalid left value",
    assigment_pattern_only_can_use_assigment_operator: "assigment pattern can only using assignment operator",
    // for related loop
    for_in_of_loop_can_not_using_initializer: "for in and for of loop can not usng initializer",
    for_in_of_loop_can_not_have_one_more_binding: "variable declaration in for-in or for-of statement can't not have more than one binding",
    await_can_just_in_for_of_loop: "await can only be in for of loop",
    // trailing comma
    function_parameter_can_not_have_empty_trailing_comma: "function parameter list can not have trailing comma when is empty",
    sequence_expression_can_not_have_trailing_comma: "sequence expression can not have trailing comma",
    function_argument_can_not_have_empty_trailing_comma: "function argument list can not have trailing comma when is empty",
    // strict mode identifer problem
    unexpect_keyword_in_stric_mode: "unexpect keyword in strict mode",

    // other
    new_expression_cant_using_optional_chain: "New expression can not using optional chain in callee",
    tag_template_expression_can_not_use_option_chain: "Tag template expression should not using optional chain",
    no_line_break_is_allowed_before_arrow: "No line break is allowed before '=>'",
    keyword_can_not_use_in_imported_when_just_a_specifier: "keyword can not use in imported_when just a specifier",
    duplicate_param: "duplicate params",
    await_can_not_call_if_not_in_async: "await expression can not be call if not in async block",
    import_meta_invalid_property: "The only valid meta property for import is import.meta",
    when_in_async_context_await_keyword_will_treat_as_keyword: "when in async context await_keyword will treat as keyword not identifier",
    when_in_yield_context_yield_will_be_treated_as_keyword: "when in yield context yield will be treated as keyword not identifier",
    yield_deletgate_can_must_be_followed_by_assignment_expression: "yield deletegate must be followed by assignment expression",
    await_expression_can_not_used_in_parameter_list: "await expression can not used in parameter list",
    yield_expression_can_not_used_in_parameter_list: "yield expression can not used in parameter list",
    new_target_can_only_be_used_in_class_or_function_scope: "new target meta property can only be used in class or function scope",
    lable_statement_can_not_have_function_declaration_is_generator: "labled statement can not have function declaration is generator",
    let_keyword_can_not_use_as_identifier_in_lexical_binding: "let keyword can not used as identifier in lexical binding",
    import_call_is_not_allow_as_new_expression_called: "import call is not allowed as new expression called",
}