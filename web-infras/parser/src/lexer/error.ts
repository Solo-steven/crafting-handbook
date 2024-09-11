/**
 * Format error from MDN, using v8 based as error message value, some error is come from babel and
 * v8 engine.
 * If MDN message exsit for certain error, if not, using v8 error, if v8 still not, go back to use
 * babel.
 */
export const ErrorMessageMap = {
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_regexp_flag
  syntax_error_invalid_regular_expression_flags: "Invalid regular expression flags",
  // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_octal_escape_sequence
  syntax_error_Octal_escape_sequences_are_not_allowed_in_strict_mode:
    "Octal escape sequences are not allowed in strict mode.",
  v8_error_invalid_unicode_escape_sequence: "Invalid Unicode escape sequence",
  // try `"\xfG"` in v8 runtime
  v8_error_invalid_hexadecimal_escape_sequence: "Invalid hexadecimal escape sequence",
  // try: `const a = ';` in babel playground
  babel_error_unterminated_string_constant: "Unterminated string constant",
  // try: `const a = `;` in babel playground
  babel_error_unterminated_template: "Unterminated template",
  // try: `const a = 1_0_;` in babel playground
  babel_error_a_numeric_separator_is_only_allowed_between_two_digits:
    "A numeric separator is only allowed between two digits",
  // try: `const a = 2e;` in babel playground
  babel_error_floating_point_numbers_require_a_valid_exponent_after_the_e:
    "Floating-point numbers require a valid exponent after the 'e'",
  // try: `1.3n` in babel playground
  babel_error_invalid_bigIntLiteral: "Invalid hexadecimal escape sequence",
  // try `3in []` in babel playground
  babel_error_Identifier_directly_after_number: "Identifier directly after number.",
  // error: `001_1`
  error_legacy_octal_literals_contain_numeric_seperator:
    "Legacy octal literals can not contain any numeric seperator",
  // error `010e01` or `010.13`
  error_legacy_octal_literals_contain_float_or_expon:
    "Legacy octal literals can not contain any float number or expon",
  error_line_terminator_in_string_literal: "Line Terminator can not be in string literal without escape.",
};
