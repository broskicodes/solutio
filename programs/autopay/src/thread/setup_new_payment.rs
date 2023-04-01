use crate::{
    error::AutoPayError,
    state::{AcceptedTriggers, ThreadAuthority, TokenAuthority},
    util::verify_trigger,
};

use anchor_lang::{prelude::*, InstructionData};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use clockwork_sdk::{
    cpi::{thread_create, ThreadCreate},
    state::{SerializableAccount, SerializableInstruction},
    ThreadProgram,
};
use clockwork_thread_program::{state::SEED_THREAD, ID as THREAD_PROGRAM_ID};

// Create state account to track all threads created by a given address
// Init if needed and store next thread id

#[derive(Accounts)]
pub struct SetupNewPayment<'info> {
    #[account(
        seeds = [
            TokenAuthority::SEED,
            old_authority.key.as_ref(),
            token_account.key().as_ref(),
            receiver_token_account.key().as_ref(),
        ],
        bump
    )]
    pub token_account_authority: Account<'info, TokenAuthority>,
    #[account(
      init_if_needed,
      payer = client,
      space = ThreadAuthority::LEN,
      seeds = [
          ThreadAuthority::SEED,
          client.key().as_ref(),
      ],
      bump
    )]
    pub thread_authority: Account<'info, ThreadAuthority>,
    #[account(mut)]
    pub client: Signer<'info>,
    // TODO: Limit to Wrapped Sol or USDC
    pub mint: Account<'info, Mint>,
    // Need not be assosiated ta
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = old_authority,
    )]
    pub token_account: Account<'info, TokenAccount>,
    // Need not be assosiated ta
    #[account(
        init_if_needed,
        payer = old_authority,
        associated_token::mint = mint,
        associated_token::authority = receiver,
    )]
    pub receiver_token_account: Account<'info, TokenAccount>,
    pub receiver: SystemAccount<'info>,
    #[account(mut)]
    pub old_authority: Signer<'info>,
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
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub thread_program: Program<'info, ThreadProgram>,
}

pub fn handler(
    ctx: Context<SetupNewPayment>,
    transfer_amount: u64,
    thread_trigger: AcceptedTriggers,
) -> Result<()> {
    if !ctx
        .accounts
        .thread_authority
        .client
        .eq(ctx.accounts.client.key)
    {
        ctx.accounts.thread_authority.client = ctx.accounts.client.key();
        ctx.accounts.thread_authority.next_thread_id = 0;
    }

    let thread_auth_bump = *ctx
        .bumps
        .get("thread_authority")
        .ok_or(AutoPayError::MissingBump)?;
    let client_pubkey = ctx.accounts.client.key();
    let thread_auth_seeds = &[
        ThreadAuthority::SEED,
        client_pubkey.as_ref(),
        &[thread_auth_bump],
    ];
    let signer = &[&thread_auth_seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.thread_program.to_account_info(),
        ThreadCreate {
            authority: ctx.accounts.thread_authority.to_account_info(),
            payer: ctx.accounts.client.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            thread: ctx.accounts.thread.to_account_info(),
        },
        signer,
    );

    let trigger = verify_trigger(thread_trigger)?;
    let kickoff_ix_data = crate::instruction::TransferTokens {
        amount: transfer_amount,
    };

    let acnts = crate::token::TransferTokens {
        token_account_authority: ctx.accounts.token_account_authority.clone(),
        mint: ctx.accounts.mint.clone(),
        token_account: ctx.accounts.token_account.clone(),
        receiver_token_account: ctx.accounts.receiver_token_account.clone(),
        old_authority: UncheckedAccount::try_from(ctx.accounts.old_authority.to_account_info()),
        receiver: ctx.accounts.receiver.clone(),
        system_program: ctx.accounts.system_program.clone(),
        token_program: ctx.accounts.token_program.clone(),
        associated_token_program: ctx.accounts.associated_token_program.clone(),
    }
    .to_account_metas(None)
    .into_iter()
    .map(|meta| SerializableAccount {
        pubkey: meta.pubkey,
        is_signer: false,
        is_writable: meta.is_writable,
    })
    .collect();

    let kickoff_ix = SerializableInstruction {
        program_id: *ctx.program_id,
        data: kickoff_ix_data.data(),
        accounts: acnts,
    };

    thread_create(
        cpi_ctx,
        1000000000, // Justify this amount
        vec![ctx.accounts.thread_authority.next_thread_id],
        vec![kickoff_ix],
        trigger,
    )?;

    ctx.accounts.thread_authority.next_thread_id += 1;

    Ok(())
}
