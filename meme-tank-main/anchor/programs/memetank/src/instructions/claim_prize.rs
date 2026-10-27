use anchor_lang::prelude::*;
use crate::state::{Game, Participation};
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer, Mint};
use anchor_spl::associated_token::{AssociatedToken};
use crate::utils::errors::{CustomError};

pub fn claim_prize(
    ctx: Context<ClaimPrize>, 
    index_game_by_creator: u32, 
    creator: Pubkey
) -> Result<()> {
    let game_account = &mut ctx.accounts.game;
    let participation_account = &mut ctx.accounts.participation;

    // Ensure the game has ended
    if !game_account.is_ended {
        return Err(CustomError::GameNotEnded.into());
    }

    // Ensure the participation has not already been claimed
    if participation_account.is_claimed {
        return Err(CustomError::AlreadyClaimed.into());
    }

    // Verify that the participation user_pubkey matches the signer
    if participation_account.user_pubkey != *ctx.accounts.user.key {
        return Err(CustomError::SignerMismatch.into());
    }

    // Verify that the game.id matches the participation.game_id
    // Ensure that the `game_id` in the participation account is exactly the same as the game account's `id`
    if game_account.id.to_string() != participation_account.game_id.to_string() {
        return Err(CustomError::GameIdMismatch.into());
    }

    // Ensure the token in participation is part of the game's tokens list
    let token = game_account.tokens.iter().find(|&t| t.token_address == participation_account.token_address);
    if token.is_none() {
        return Err(CustomError::TokenNotFoundInGame.into());
    }
    let token = token.unwrap();

    // Verify that the token's `swapDone` is true before proceeding
    if !token.swap_done {
        return Err(CustomError::TokenSwapIncomplete.into());
    }

    // Ensure that the token has a valid `position_final`
    if token.position_final.is_none() {
        return Err(CustomError::MissingFinalPosition.into());
    }
    let position_final = token.position_final.unwrap();

    // Find the winner info for this token's position
    let winner_info = game_account.winners.iter().find(|&w| w.position == position_final);
    if winner_info.is_none() {
        return Err(CustomError::WinnerInfoNotFound.into());
    }
    let winner_info = winner_info.unwrap();

    // Calculate the total percentage of the prize the user is entitled to
    let mut total_percentage = 0.0;
    for range in &participation_account.ranges {
        for distribution in &winner_info.winner_distribution {
            if distribution.fair_distribution_all {
                let user_ticket_percentage = (range.end - range.start + 1) as f64 / token.number_of_tickets as f64;
                total_percentage += user_ticket_percentage * distribution.percentage as f64;
                msg!("Fair distribution for all tickets, adding percentage: {}", user_ticket_percentage * distribution.percentage as f64);
            } else {
                let ticket_ids = &distribution.ticket_ids;
                let num_winners = ticket_ids.len() as f64;
                let ticket_percentage = distribution.percentage as f64 / num_winners;
                let winning_tickets_in_range = ticket_ids.iter().filter(|&id| *id >= range.start && *id <= range.end).count();
                total_percentage += ticket_percentage * winning_tickets_in_range as f64;
                msg!("Found {} winning tickets in range, adding percentage: {}", winning_tickets_in_range, ticket_percentage * winning_tickets_in_range as f64);
            }
        }
    }

    msg!("Total percentage: {}", total_percentage);

    let scaled_percentage = (total_percentage * 10_000.0) as u64;
    let prize_amount = (token.total_amount_wallet_token as u128 * scaled_percentage as u128 / 1_000_000) as u64;
    msg!("Amount user should get: {} tokens", prize_amount);

    // Check that the prize amount is valid
    if prize_amount == 0 {
        msg!("Error: Calculated prize amount is zero.");
        return Err(ProgramError::InsufficientFunds.into());
    }

    let seeds = &[b"game", creator.as_ref(), &index_game_by_creator.to_le_bytes(), &[ctx.bumps.game]];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.game_token_account.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.game.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    transfer(CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds), prize_amount)?;

    participation_account.is_claimed = true;

    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.participation.key());

    Ok(())
}

#[derive(Accounts)]
#[instruction(index_game_by_creator: u32, creator: Pubkey)]
pub struct ClaimPrize<'info> {
    #[account(
        mut,
        seeds = [b"game", creator.key().as_ref(), &index_game_by_creator.to_le_bytes()],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub participation: Account<'info, Participation>,
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user, 
        associated_token::mint = token_mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = participation.token_address,
        associated_token::authority = game,
    )]
    pub game_token_account: Account<'info, TokenAccount>,

    #[account(address = participation.token_address)]
    pub token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}