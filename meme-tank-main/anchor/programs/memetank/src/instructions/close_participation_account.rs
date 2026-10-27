use anchor_lang::prelude::*;
use crate::state::{Participation};
use crate::utils::CustomError;

pub fn close_participation_account(
    ctx: Context<CloseParticipationAccount>,
) -> Result<()> {
    let participation_account = &mut ctx.accounts.participation;

    if participation_account.user_pubkey != *ctx.accounts.user.key {
        return Err(CustomError::SignerMismatch.into());
    }

    if participation_account.user_pubkey == Pubkey::default() {
        return Err(CustomError::ParticipationAccountAlreadyClosed.into());
    }
    Ok(())
}

#[derive(Accounts)]
pub struct CloseParticipationAccount<'info> {
    #[account(mut, close = user)]
    pub participation: Account<'info, Participation>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}