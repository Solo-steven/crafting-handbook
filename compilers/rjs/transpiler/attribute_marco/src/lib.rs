use proc_macro::TokenStream;
use quote::quote;
use syn::{ Fields, parse_macro_input, DeriveInput, Data};
/// ## Custom Attribute Marco For AST Node
/// This marco is used for create a AST Node with some derive marco and 
/// span property (`start_span` and `finish_span`).
/// ```
/// #[js_expr_node]
/// struct Identifier {
///     pub name: Cow<'a, str>
/// }
/// /// equal to 
/// #[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
/// struct Identifier {
///     pub name: Cow<'a, str>,
///     pub start_span: Span,
///     pub finish_span: Span,
/// }
/// ```
#[proc_macro_attribute]
pub fn js_node(
    _attrs: TokenStream,
    input: TokenStream,
) -> TokenStream {
    let input_struct  = parse_macro_input!(input as DeriveInput);
    let ident = input_struct.ident;
    let generic = input_struct.generics;
    match input_struct.data {
        Data::Struct(struct_data) => {
            let fields = struct_data.fields;
            let field_name = match fields {
                Fields::Named(name) => {
                    name.named
                }
                _ => panic!()
            };
            quote!( 
                #[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
                pub struct #ident #generic {
                    #field_name
                    pub start_span: Span,
                    pub finish_span: Span,
                }
            ).into()
        },
        Data::Enum(enum_data) => { 
            let variants = enum_data.variants;
            quote!(
                #[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
                pub enum #ident #generic {
                   #variants
                }
            ).into()
        },
        Data::Union(_) => { panic!() }
    }
}

/// ## Custom Attribute Marco For Expression AST Node
/// This marco is used for create a Expression AST Node with some derive marco 
/// and span property (`start_span` and `finish_span`) and `is_paran` property.
/// ```
/// #[js_expr_node]
/// struct Identifier {
///     pub name: Cow<'a, str>
/// }
/// /// equal to 
/// #[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
/// struct Identifier {
///     pub name: Cow<'a, str>,
///     pub is_paran: bool,
///     pub start_span: Span,
///     pub finish_span: Span,
/// }
/// ```
#[proc_macro_attribute]
pub fn js_expr_node(
    _attrs: TokenStream,
    input: TokenStream,
) -> TokenStream {
    let input_struct  = parse_macro_input!(input as DeriveInput);
    let ident = input_struct.ident;
    let generic = input_struct.generics;
    match input_struct.data {
        Data::Struct(struct_data) => {
            let fields = struct_data.fields;
            let field_name = match fields {
                Fields::Named(name) => {
                    name.named
                }
                _ => panic!()
            };
            quote!( 
                #[derive(Debug, Clone, PartialEq, Deserialize, Serialize)]
                pub struct #ident #generic {
                    #field_name
                    pub is_paran: bool,
                    pub start_span: Span,
                    pub finish_span: Span,
                }
            ).into()
        },
        Data::Enum(_) => { panic!() },
        Data::Union(_) => { panic!() }
    }
}