use anchor_lang::{prelude::*, solana_program::program::invoke};
use anchor_spl::{
  associated_token::AssociatedToken,
  token::{Mint, Token, TokenAccount},
};
use spl_token::instruction::transfer;
use std::str::FromStr;

use crate::{util::calculate_fee, error::SolutioError, state::{USDC_MINT_ADDRESS, PROGRAM_AS_SIGNER_SEED}};

#[derive(Accounts)]
pub struct TransferTokensDirect<'info> {
  #[account(address = Pubkey::from_str(USDC_MINT_ADDRESS).unwrap() @ SolutioError::UnsupportedMintAddress)]
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
    pub token_account_owner: Signer<'info>,
    pub receiver: SystemAccount<'info>,
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

pub fn handler(ctx: Context<TransferTokensDirect>, amount: u64) -> Result<()> {
    let fee = calculate_fee(amount)?;
    
    invoke(
        &transfer(
            &spl_token::ID,
            &ctx.accounts.token_account.key(),
            &ctx.accounts.receiver_token_account.key(),
            &ctx.accounts.token_account_owner.key(),
            &[],
            amount.checked_sub(fee).ok_or(SolutioError::NumericalOverflow)?,
        )?,
        &[
            ctx.accounts.receiver_token_account.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.token_account_owner.to_account_info(),
        ],
    )?;

    invoke(
        &transfer(
            &spl_token::ID,
            &ctx.accounts.token_account.key(),
            &ctx.accounts.program_token_account.key(),
            &ctx.accounts.token_account_owner.key(),
            &[],
            fee,
        )?,
        &[
            ctx.accounts.program_token_account.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.token_account_owner.to_account_info(),
        ],
    )?;

    Ok(())
}