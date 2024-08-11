/**
 * Format error from MDN, using v8 based as error message value, some error is come from babel and
 * v8 engine
 */
export const ErrorMessageMap = {
  v8_error_invalid_unicode_escape_sequence: "SyntaxError: Invalid Unicode escape sequence",
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
  // error: `001_1`
  error_legacy_octal_literals_contain_numeric_seperator:
    "Legacy octal literals can not contain any numeric seperator",
  // error `010e01` or `010.13`
  error_legacy_octal_literals_contain_float_or_expon:
    "Legacy octal literals can not contain any float number or expon",
  error_line_terminator_in_string_literal: "",
};
