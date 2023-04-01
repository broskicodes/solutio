use crate::state::ThreadAuthority;
use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction::transfer},
};
use clockwork_thread_program::{state::SEED_THREAD, ID as THREAD_PROGRAM_ID};

#[derive(Accounts)]
pub struct DepositToPaymentThread<'info> {
    #[account(
        seeds = [
            ThreadAuthority::SEED,
            client.key().as_ref(),
        ],
        bump
    )]
    pub thread_authority: Account<'info, ThreadAuthority>,
    #[account(mut)]
    pub client: Signer<'info>,
    /// CHECK: Seeds checked in constraint
    #[account(
        mut,
        seeds = [
            SEED_THREAD,
            thread_authority.key().as_ref(),
            &[thread_authority.next_thread_id]
        ],
        bump,
        seeds::program = THREAD_PROGRAM_ID
    )]
    pub thread: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DepositToPaymentThread>, amount: u64) -> Result<()> {
    invoke(
        &transfer(ctx.accounts.client.key, ctx.accounts.thread.key, amount),
        &[
            ctx.accounts.client.to_account_info(),
            ctx.accounts.thread.to_account_info(),
        ],
    )?;

    Ok(())
}
