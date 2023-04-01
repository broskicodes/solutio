use anchor_lang::prelude::*;
use clockwork_sdk::state::SerializableAccount;

#[derive(AnchorSerialize, AnchorDeserialize, Debug)]
pub enum AcceptedTriggers {
    Now,
    Cron { schedule_str: String },
}

#[account]
pub struct TokenAuthority {
    pub old_authority: Pubkey,
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
    pub client: Pubkey,
    pub next_thread_id: u8,
}

impl ThreadAuthority {
    pub const LEN: usize = 8 + 32 + 1;
    pub const SEED: &'static [u8] = b"thread_authority";
}

// impl Into<Vec<SerializableAccount>> for Vec<AccountMeta> {
//   fn into(self) -> Vec<SerializableAccount> {
//     self.into_iter()
//     .map(|mut meta| {
//       msg!("{:?}", meta.is_writable);
//       SerializableAccount {
//            pubkey: meta.pubkey,
//            is_signer: false,
//            is_writable: meta.is_writable
//         }
//     })
//     .collect()
//   }
// }
