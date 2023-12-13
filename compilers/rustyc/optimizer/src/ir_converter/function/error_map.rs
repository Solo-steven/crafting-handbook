/// This module 

pub struct IrFunctionConvertErrorMap {
    pub unreach_assignment_expr_left_value_is_array_type: &'static str,
    pub unreach_in_accpet_chain_expr_base_identifier_is_not_strutual_type: &'static str,
}

impl IrFunctionConvertErrorMap {
    pub fn new () -> Self {
        Self {
            unreach_assignment_expr_left_value_is_array_type: "[Unreach Error]: By the type checker, the left hand side of assignment expression can not be a array type",
            unreach_in_accpet_chain_expr_base_identifier_is_not_strutual_type: "[Unreach Error]: By the type checker, we can ensure identifier of a chain expression has to be struct type, pointer to struct or array type."
        }
    }
}