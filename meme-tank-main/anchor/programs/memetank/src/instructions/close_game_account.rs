use anchor_lang::prelude::*;
use crate::state::{Game};
use crate::utils::CustomError;

// Wallets allowed to close games (addresses removed; set your own before building).
const AUTHORIZED_WALLETS: [&str; 4] = [
    "ADMIN_WALLET_1",
    "ADMIN_WALLET_2",
    "ADMIN_WALLET_3",
    "ADMIN_WALLET_4"
];

pub fn close_game_account(
    ctx: Context<CloseGameAccount>,
) -> Result<()> {
    let game = &mut ctx.accounts.game;

    let is_authorized = AUTHORIZED_WALLETS.contains(&ctx.accounts.user.key().to_string().as_str());
    if !is_authorized {
        return Err(CustomError::UnauthorizedCreateGameUser.into());
    }

    if game.creator != *ctx.accounts.user.key {
        return Err(CustomError::SignerMismatch.into());
    }
    Ok(())
}

#[derive(Accounts)]
pub struct CloseGameAccount<'info> {
    #[account(mut, close = user)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}