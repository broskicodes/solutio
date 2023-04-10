use crate::{
    error::SolutioError,
    state::{Payment, PaymentStatus, ThreadAuthority, TokenAuthority},
};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use clockwork_sdk::{
    cpi::{thread_delete, ThreadDelete},
    ThreadProgram,
};
use clockwork_thread_program::{state::SEED_THREAD, ID as THREAD_PROGRAM_ID};

#[derive(Accounts)]
#[instruction(thread_id: u8)]
pub struct CancelPayment<'info> {
    #[account(
        seeds = [
            ThreadAuthority::SEED,
            token_account_owner.key().as_ref(),
        ],
        bump
    )]
    pub thread_authority: Box<Account<'info, ThreadAuthority>>,
    #[account(
        mut,
        seeds = [
            TokenAuthority::SEED,
            token_account_owner.key().as_ref(),
            token_account.key().as_ref(),
            receiver_token_account.key().as_ref(),
        ],
        bump,
    )]
    pub token_account_authority: Box<Account<'info, TokenAuthority>>,
    #[account(
        mut,
        seeds = [
            Payment::SEED,
            token_account_owner.key().as_ref(),
            thread.key().as_ref()
        ],
        bump
    )]
    pub payment: Box<Account<'info, Payment>>,
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
    pub receiver: SystemAccount<'info>,
    #[account(mut)]
    pub token_account_owner: Signer<'info>,
    /// CHECK: Seeds checked in constraint
    #[account(
        mut,
        seeds = [
            SEED_THREAD,
            thread_authority.key().as_ref(),
            &[thread_id]
        ],
        bump,
        seeds::program = THREAD_PROGRAM_ID
    )]
    pub thread: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub thread_program: Program<'info, ThreadProgram>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<CancelPayment>, _thread_id: u8) -> Result<()> {
    let thread_auth_bump = *ctx
        .bumps
        .get("thread_authority")
        .ok_or(SolutioError::MissingBump)?;

    let ta_owner_pubkey = ctx.accounts.token_account_owner.key();
    let thread_auth_seeds = &[
        ThreadAuthority::SEED,
        ta_owner_pubkey.as_ref(),
        &[thread_auth_bump],
    ];
    let signer = &[&thread_auth_seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.thread_program.to_account_info(),
        ThreadDelete {
            authority: ctx.accounts.thread_authority.to_account_info(),
            close_to: ctx.accounts.token_account_owner.to_account_info(),
            thread: ctx.accounts.thread.to_account_info(),
        },
        signer,
    );

    thread_delete(cpi_ctx)?;

    ctx.accounts.payment.status = PaymentStatus::Cancelled;

    Ok(())
}
