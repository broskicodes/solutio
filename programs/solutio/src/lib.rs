pub mod error;
pub mod id;
pub mod state;
pub mod thread;
pub mod token;
pub mod util;

use crate::id::*;
use crate::state::AcceptedTriggers;
use crate::thread::*;
use crate::token::*;

use anchor_lang::prelude::*;

#[program]
pub mod solutio {
    use super::*;

    pub fn setup_new_payment(
        ctx: Context<SetupNewPayment>,
        transfer_amount: u64,
        thread_trigger: AcceptedTriggers,
    ) -> Result<()> {
        setup_new_payment::handler(ctx, transfer_amount, thread_trigger)
    }

    pub fn update_payment(
        ctx: Context<UpadtePayment>,
        thread_id: u8,
        new_trigger: Option<AcceptedTriggers>,
        new_transfer_amount: Option<u64>,
    ) -> Result<()> {
        update_payment::handler(ctx, thread_id, new_trigger, new_transfer_amount)
    }

    pub fn cancel_payment(ctx: Context<CancelPayment>, thread_id: u8) -> Result<()> {
        cancel_payment::handler(ctx, thread_id)
    }

    pub fn deposit_to_payment_thread(
        ctx: Context<DepositToPaymentThread>,
        amount: u64,
    ) -> Result<()> {
        deposit_to_payment_thread::handler(ctx, amount)
    }

    pub fn delegate_transfer_authority(
        ctx: Context<DelegateTransferAuthority>,
        amount: u64,
    ) -> Result<()> {
        delegate_transfer_authority::handler(ctx, amount)
    }

    pub fn transfer_tokens_via_authority(ctx: Context<TransferTokensViaAuthority>, amount: u64) -> Result<()> {
        transfer_tokens_via_authority::handler(ctx, amount)
    }

    pub fn transfer_tokens_direct(ctx: Context<TransferTokensDirect>, amount: u64) -> Result<()> {
        transfer_tokens_direct::handler(ctx, amount)
    }
}
