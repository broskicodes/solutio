use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use spl_token::instruction::transfer;

use crate::{error::AutoPayError, state::TokenAuthority};

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(
        seeds = [
            TokenAuthority::SEED,
            token_account_owner.key.as_ref(),
            token_account.key().as_ref(),
            receiver_token_account.key().as_ref(),
        ],
        bump
    )]
    pub token_account_authority: Box<Account<'info, TokenAuthority>>,
    pub mint: Box<Account<'info, Mint>>,
    // Need not be assosiated ta
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = token_account_owner,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,
    // Need not be assosiated ta
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = receiver,
    )]
    pub receiver_token_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: Account verified through seeds of other accounts
    pub token_account_owner: UncheckedAccount<'info>,
    pub receiver: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
    let tok_auth_bump = *ctx
        .bumps
        .get("token_account_authority")
        .ok_or(AutoPayError::MissingBump)?;

    invoke_signed(
        &transfer(
            &spl_token::ID,
            &ctx.accounts.token_account.key(),
            &ctx.accounts.receiver_token_account.key(),
            &ctx.accounts.token_account_authority.key(),
            &[],
            amount,
        )?,
        &[
            ctx.accounts.receiver_token_account.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.token_account_authority.to_account_info(),
        ],
        &[&[
            TokenAuthority::SEED,
            ctx.accounts.token_account_owner.key.as_ref(),
            ctx.accounts.token_account.key().as_ref(),
            ctx.accounts.receiver_token_account.key().as_ref(),
            &[tok_auth_bump],
        ]],
    )?;

    Ok(())
}
