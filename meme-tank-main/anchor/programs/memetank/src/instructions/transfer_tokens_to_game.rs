use anchor_lang::prelude::*;
use crate::state::{Game, Master};
use anchor_spl::token;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use crate::utils::errors::{CustomError};

pub fn transfer_tokens_to_game(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
    let game_account = &mut ctx.accounts.game;

    // Ensure the user is the admin swap
    if ctx.accounts.user.key() != ctx.accounts.master.admin_swap {
        return Err(CustomError::UnauthorizedAdminSwap.into());
    }

    // Transfer tokens from admin swap to game PDA
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_token_account.to_account_info(),
                to: ctx.accounts.game_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    let mint_account = &ctx.accounts.mint_account;
    let corresponding_token = game_account.tokens.iter_mut().find(|token| token.token_address == mint_account.key());

    if let Some(token) = corresponding_token {
        if !token.swap_done {
            token.swap_done = true;
            token.total_amount_wallet_token = amount;
        } else {
            return Err(CustomError::TokenSwapAlreadyDone.into());
        }
    } else {
        return Err(CustomError::TokenNotFoundInGame.into());
    }

    msg!("ACCOUNT-UPDATE: {}", game_account.key());
    Ok(())
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub master: Account<'info, Master>,
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
    )]
    pub mint_account: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = user,
    )]
    pub sender_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = mint_account,
        associated_token::authority = game,
    )]
    pub game_token_account: Account<'info, TokenAccount>,

    /// CHECK: Verify that address = master.admin_swap
    #[account(mut, address = master.admin_swap)]
    pub admin_swap: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}