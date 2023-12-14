/// This module contain the custom error message for panic. by type checker,
/// we can ensure that some sematic error and syntax error is checked, and 
/// in convert stage there is not syntax and sematic error, so there must
/// be some place that logically unreach by our design, and error message
/// is used to show hint when reach those unreach zone
pub struct IrFunctionConvertErrorMap {
    /// 
    pub unreach_assignment_expr_left_value_is_array_type: &'static str,
    ///
    pub unreach_in_accpet_chain_expr_base_identifier_is_not_strutual_type: &'static str,
    ///
    pub unreach_subscription_object_is_not_a_pointer_or_array: &'static str,
    ///
    pub unreach_chain_expression_identifier_must_being_in_the_symbol_table: &'static str,
}

impl IrFunctionConvertErrorMap {
    pub fn new () -> Self {
        Self {
            unreach_assignment_expr_left_value_is_array_type: "[Unreach Error]: By the type checker, the left hand side of assignment expression can not be a array type",
            unreach_in_accpet_chain_expr_base_identifier_is_not_strutual_type: "[Unreach Error]: By the type checker, we can ensure identifier of a chain expression has to be struct type, pointer to struct or array type.",
            unreach_subscription_object_is_not_a_pointer_or_array: "",
            unreach_chain_expression_identifier_must_being_in_the_symbol_table: "[Unreach Error]: By the type checker, chain expression's identifier must being in the symbol table.",
        }
    }
}