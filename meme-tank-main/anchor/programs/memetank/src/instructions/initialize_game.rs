use anchor_lang::prelude::*;
use crate::state::{Game, TokenInfo, WinnerInfo, User};
use crate::utils::{round_to_decimal_places};
use crate::utils::constants::{MAX_TOKENS, MAX_NAME_LENGTH, MAX_DISTRIBUTION_NAME_LENGTH, DECIMAL_PLACES, INITIAL_REWARD_LAMPORTS};
use crate::utils::errors::{CustomError};

// Wallets allowed to create games (addresses removed; set your own before building).
const AUTHORIZED_WALLETS: [&str; 5] = [
    "ADMIN_WALLET_1",
    "ADMIN_WALLET_2",
    "ADMIN_WALLET_3",
    "ADMIN_WALLET_4",
    "ADMIN_WALLET_5"
];

pub fn initialize_game(
    ctx: Context<InitializeGame>,
    number_game_created: u32,
    num_tokens: u8,
    num_winners_tokens: u8,
    total_winners_sum: u16,
    total_distribution_sum: u16,
    name: Option<String>,
    start_date: u64,
    end_date: u64,
    initial_reward: f32,
    tokens: Vec<Pubkey>,
    winners: Vec<WinnerInfo>,
) -> Result<()> {

    let user_account = &mut ctx.accounts.user_account;

    // Only Team admins wallets authorized to create a game for now
    let is_authorized = AUTHORIZED_WALLETS.contains(&ctx.accounts.user.key().to_string().as_str());
    if !is_authorized {
        return Err(CustomError::UnauthorizedCreateGameUser.into());
    }

    let tokens_len_u8: u8 = tokens.len().try_into().map_err(|_| ProgramError::InvalidArgument)?;
    if num_tokens != tokens_len_u8 {
        return Err(CustomError::MismatchedTokenCount.into());
    }

    let winners_len_u8: u8 = winners.len().try_into().map_err(|_| ProgramError::InvalidArgument)?;
    if num_winners_tokens != winners_len_u8 {
        return Err(CustomError::MismatchedWinnerCount.into());
    }

    if let Some(name) = &name {
        if name.len() > MAX_NAME_LENGTH {
            return Err(CustomError::GameNameTooLong.into());
        }
    }

    let (calculated_total_distribution_sum, calculated_total_winners_sum): (u16, u16) = winners
        .iter()
        .fold((0, 0), |(dist_sum, win_sum), winner| {
            let winner_dist_sum: u16 = winner.winner_distribution.len() as u16;
            let winner_win_sum: u16 = winner.winner_distribution.iter().map(|dist| dist.num_winners as u16).sum();
            (dist_sum + winner_dist_sum, win_sum + winner_win_sum)
        });

    if total_distribution_sum != calculated_total_distribution_sum {
        return Err(CustomError::MismatchedDistributionSum.into());
    }

    if total_winners_sum != calculated_total_winners_sum {
        return Err(CustomError::MismatchedWinnersSum.into());
    }

    // Verify that there are no more than MAX_TOKENS tokens
    if tokens.len() > MAX_TOKENS {
        return Err(CustomError::MismatchedTokenCount.into());
    }

    for (i, token) in tokens.iter().enumerate() {
        if tokens[i + 1..].contains(token) {
            return Err(CustomError::DuplicateTokens.into());
        }
    }
    
    if user_account.user_pubkey == Pubkey::default() {
        user_account.user_pubkey = ctx.accounts.user.key();
        user_account.number_tickets = 0;
        user_account.number_game_created = 0;
        user_account.free_ticket_received = Some(false);
        user_account.free_superteam_ticket_received = Some(false);
        user_account.points = Some(0);
        user_account.number_referrals_done = Some(0);
        user_account.referral_parent = None;
        user_account.referral_code = None;
    }

    user_account.number_game_created = user_account.number_game_created.checked_add(1).unwrap();

    let game = &mut ctx.accounts.game;
    game.id = game.key();
    game.creator = *ctx.accounts.user.key;
    game.num = number_game_created;
    game.start_date = start_date;
    game.end_date = end_date;
    let rounded_initial_reward = round_to_decimal_places(initial_reward as f32, DECIMAL_PLACES);
    game.total_reward = rounded_initial_reward;
    game.remaining_reward = rounded_initial_reward;
    game.initial_reward = initial_reward;
    game.name = name;
    game.index_game_by_creator = number_game_created;

    game.tokens = tokens.into_iter().map(|token_address| TokenInfo {
        number_of_tickets: 0,
        token_address,
        is_winner: false,
        position_final: None,
        total_amount_wallet_sol: 0.0,
        total_amount_wallet_token: 0,
        swap_done: false,
    }).collect();

    // Validate winner distribution names are max MAX_DISTRIBUTION_NAME_LENGTH characters
    for winner in &mut game.winners {
        for distribution in &mut winner.winner_distribution {
            if distribution.name.len() > MAX_DISTRIBUTION_NAME_LENGTH {
                return Err(CustomError::DistributionNameTooLong.into());
            }
        }
    }

    game.winners = winners;
    for winner in &mut game.winners {
        for distribution in &mut winner.winner_distribution {
            distribution.percentage_winners = Some(0);
        }
    }

    game.is_ended = false;

    // Validate that the total percentage for all winners is 100 (99.8%)
    let total_winner_percentage: f32 = game.winners.iter().map(|winner| winner.percentage).sum();
    if (total_winner_percentage as f32) < 99.8 {
        return Err(CustomError::TotalWinnerPercentageTooLow.into());
    }

    // Validate that the total percentage for winner distribution within each winning token is 100
    for winner in &game.winners {
        let total_distribution_percentage: f32 = winner
            .winner_distribution
            .iter()
            .map(|dist| dist.percentage)
            .sum();
        if total_distribution_percentage < 99.8 {
            return Err(CustomError::DistributionPercentageTooLow.into());
        }
    }

    let initial_reward_lamports = ((round_to_decimal_places(initial_reward as f32, DECIMAL_PLACES) * 1_000_000_000.0)) as u64;
    let additional_transfer_lamports = INITIAL_REWARD_LAMPORTS; // 0.002 SOL in lamports

    let cpi_accounts = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.user.key(),
        &ctx.accounts.game.key(),
        initial_reward_lamports + additional_transfer_lamports,
    );
    anchor_lang::solana_program::program::invoke(
        &cpi_accounts,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.game.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.game.key());
    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.user_account.key());
    Ok(())
}

#[derive(Accounts)]
#[instruction(number_game_created: u32, num_tokens: u8, num_winners_tokens: u8, total_winners_sum: u16, total_distribution_sum: u16, name: Option<String>)]
pub struct InitializeGame<'info> {
    #[account(init, 
        payer = user, 
        seeds = [b"game", user.key().as_ref(), &number_game_created.to_le_bytes()],
        space = 110 + (75 * (num_tokens as usize)) + (50 * (num_winners_tokens as usize)) + (8 * (total_winners_sum as usize + 1)) + 50 + (name.as_ref().map(|s| s.len()).unwrap_or(0)) + ((total_distribution_sum+num_tokens as u16) as usize * 130) + 200,
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(
        init_if_needed,
        payer = user,
        seeds = [b"user", user.key().as_ref()],
        bump,
        space = 8 + 32 + 8 + 200
    )]
    pub user_account: Account<'info, User>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
