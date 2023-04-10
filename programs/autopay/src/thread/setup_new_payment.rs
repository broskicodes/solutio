use crate::{
    error::AutoPayError,
    state::{AcceptedTriggers, Payment, PaymentStatus, ThreadAuthority, TokenAuthority},
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

#[derive(Accounts)]
pub struct SetupNewPayment<'info> {
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
    #[account(
      init_if_needed,
      payer = token_account_owner,
      space = ThreadAuthority::LEN,
      seeds = [
          ThreadAuthority::SEED,
          token_account_owner.key().as_ref(),
      ],
      bump
    )]
    pub thread_authority: Box<Account<'info, ThreadAuthority>>,
    #[account(
        init,
        payer = token_account_owner,
        space = Payment::LEN,
        seeds = [
            Payment::SEED,
            token_account_owner.key().as_ref(),
            thread.key().as_ref()
        ],
        bump
    )]
    pub payment: Box<Account<'info, Payment>>,
    // TODO: Limit mint to Wrapped Sol or USDC
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
        init_if_needed,
        payer = token_account_owner,
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
        .token_account_owner
        .eq(ctx.accounts.token_account_owner.key)
    {
        ctx.accounts.thread_authority.token_account_owner = ctx.accounts.token_account_owner.key();
        ctx.accounts.thread_authority.next_thread_id = 0;
    }

    let thread_auth_bump = *ctx
        .bumps
        .get("thread_authority")
        .ok_or(AutoPayError::MissingBump)?;
    let ta_owner_pubkey = ctx.accounts.token_account_owner.key();
    let thread_auth_seeds = &[
        ThreadAuthority::SEED,
        ta_owner_pubkey.as_ref(),
        &[thread_auth_bump],
    ];
    let signer = &[&thread_auth_seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.thread_program.to_account_info(),
        ThreadCreate {
            authority: ctx.accounts.thread_authority.to_account_info(),
            payer: ctx.accounts.token_account_owner.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            thread: ctx.accounts.thread.to_account_info(),
        },
        signer,
    );

    let trigger = verify_trigger(thread_trigger.clone())?;
    let kickoff_ix_data = crate::instruction::TransferTokens {
        amount: transfer_amount,
    };

    let acnts = crate::token::TransferTokens {
        token_account_authority: ctx.accounts.token_account_authority.clone(),
        mint: ctx.accounts.mint.clone(),
        token_account: ctx.accounts.token_account.clone(),
        receiver_token_account: ctx.accounts.receiver_token_account.clone(),
        token_account_owner: UncheckedAccount::try_from(
            ctx.accounts.token_account_owner.to_account_info(),
        ),
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
        100000000, // Justify this amount
        vec![ctx.accounts.thread_authority.next_thread_id],
        vec![kickoff_ix],
        trigger,
    )?;

    let payment = &mut ctx.accounts.payment;
    payment.thread_authority = ctx.accounts.thread_authority.key();
    payment.token_authority = ctx.accounts.token_account_authority.key();
    payment.thread_key = ctx.accounts.thread.key();
    payment.thread_id = ctx.accounts.thread_authority.next_thread_id;
    payment.payer = ctx.accounts.token_account_owner.key();
    payment.receiver = ctx.accounts.receiver.key();
    payment.mint = ctx.accounts.mint.key();
    payment.status = PaymentStatus::Active; // Should set to Complete if trigger = Now?
    payment.amount = transfer_amount;
    payment.schedule = thread_trigger.clone();

    ctx.accounts.thread_authority.next_thread_id += 1;

    Ok(())
}
