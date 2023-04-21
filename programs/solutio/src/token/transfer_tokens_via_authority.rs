use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use spl_token::instruction::transfer;
use clockwork_thread_program::{state::SEED_THREAD};

use crate::{error::SolutioError, state::{TokenAuthority, PROGRAM_AS_SIGNER_SEED}, util::calculate_fee};

#[derive(Accounts)]
pub struct TransferTokensViaAuthority<'info> {
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
    #[account(
        signer,
        seeds = [
          SEED_THREAD,
          signing_thread.authority.as_ref(),
          signing_thread.id.as_slice()
        ],
        seeds::program = clockwork_sdk::ID,
        bump
    )]
    pub signing_thread: Box<Account<'info, clockwork_sdk::state::Thread>>,
    #[account(
        seeds = [PROGRAM_AS_SIGNER_SEED],
        bump
    )]
    pub program_as_signer: SystemAccount<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = program_as_signer,
    )]
    pub program_token_account: Box<Account<'info, TokenAccount>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<TransferTokensViaAuthority>, amount: u64) -> Result<()> {
    let tok_auth_bump = *ctx
        .bumps
        .get("token_account_authority")
        .ok_or(SolutioError::MissingBump)?;

    let fee = calculate_fee(amount)?;

    invoke_signed(
        &transfer(
            &spl_token::ID,
            &ctx.accounts.token_account.key(),
            &ctx.accounts.receiver_token_account.key(),
            &ctx.accounts.token_account_authority.key(),
            &[],
            amount.checked_sub(fee).ok_or(SolutioError::NumericalOverflow)?,
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


    invoke_signed(
        &transfer(
            &spl_token::ID,
            &ctx.accounts.token_account.key(),
            &ctx.accounts.program_token_account.key(),
            &ctx.accounts.token_account_authority.key(),
            &[],
            fee,
        )?,
        &[
            ctx.accounts.program_token_account.to_account_info(),
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
