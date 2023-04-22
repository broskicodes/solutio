use anchor_lang::prelude::*;

// Constants
pub const USDC_MINT_ADDRESS: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
pub const PROGRAM_AS_SIGNER_SEED: &[u8] = b"program_signer";
pub const PROGRAM_SERVICE_FEE_BASIS_POINTS: u16 = 69;

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub enum AcceptedTriggers {
    Now,
    Cron { schedule_str: String },
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub enum PaymentStatus {
    Active,
    Cancelled,
    Complete,
}

// Accounts
#[account]
pub struct TokenAuthority {
    pub token_account_owner: Pubkey,
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub receiver_token_account: Pubkey,
}

impl TokenAuthority {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32;
    pub const SEED: &'static [u8] = b"token_authority";
}

#[account]
pub struct ThreadAuthority {
    pub token_account_owner: Pubkey,
    pub next_thread_id: u8,
}

impl ThreadAuthority {
    pub const LEN: usize = 8 + 32 + 1;
    pub const SEED: &'static [u8] = b"thread_authority";
}

#[account]
pub struct Payment {
    pub thread_authority: Pubkey,
    pub token_authority: Pubkey,
    pub thread_key: Pubkey,
    pub thread_id: u8,
    pub payer: Pubkey,
    pub receiver: Pubkey,
    pub mint: Pubkey,
    pub status: PaymentStatus,
    pub amount: u64,
    pub schedule: AcceptedTriggers,
}

impl Payment {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1 + 32 + 32 + 32 + 1 + 8 + (1 + 128);
    pub const SEED: &'static [u8] = b"payment";
}
