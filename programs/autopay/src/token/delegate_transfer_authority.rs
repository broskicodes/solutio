use anchor_lang::{prelude::*, solana_program::program::invoke};
use anchor_spl::token::{Mint, Token, TokenAccount};
use spl_token::instruction::approve;

use crate::state::TokenAuthority;

#[derive(Accounts)]
pub struct DelegateTransferAuthority<'info> {
    #[account(
        init,
        payer = token_account_owner,
        space = TokenAuthority::LEN,
        seeds = [
            TokenAuthority::SEED,
            token_account_owner.key.as_ref(),
            token_account.key().as_ref(),
            receiver_token_account.key().as_ref(),

        ],
        bump
    )]
    pub new_authority: Account<'info, TokenAuthority>,
    pub mint: Account<'info, Mint>,
    // Need not be assosiated ta
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = token_account_owner,
    )]
    pub token_account: Account<'info, TokenAccount>,
    // Need not be assosiated ta
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = receiver,
    )]
    pub receiver_token_account: Account<'info, TokenAccount>,
    pub receiver: SystemAccount<'info>,
    #[account(mut)]
    pub token_account_owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DelegateTransferAuthority>, amount: u64) -> Result<()> {
    let new_auth = &mut ctx.accounts.new_authority;

    new_auth.token_account_owner = ctx.accounts.token_account_owner.key();
    new_auth.token_account = ctx.accounts.token_account.key();
    new_auth.mint = ctx.accounts.mint.key();
    new_auth.receiver_token_account = ctx.accounts.receiver_token_account.key();

    invoke(
        &approve(
            ctx.accounts.token_program.key,
            &ctx.accounts.token_account.key(),
            &new_auth.key(),
            ctx.accounts.token_account_owner.key,
            &[],
            amount,
        )?,
        &[
            ctx.accounts.token_account_owner.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            new_auth.to_account_info(),
        ],
    )?;

    Ok(())
}
