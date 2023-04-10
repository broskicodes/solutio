use anchor_lang::prelude::*;

#[error_code]
pub enum SolutioError {
    #[msg("Numerical Overflow")]
    NumericalOverflow,
    #[msg("Context is missing a required bump")]
    MissingBump,
    #[msg("Schedule string is missing or invalid")]
    InvalidScheduleString,
    #[msg("Context is missing a required account")]
    MissingOptionalAccount,
}
