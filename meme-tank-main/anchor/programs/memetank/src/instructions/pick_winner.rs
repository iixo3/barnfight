use rand::rngs::SmallRng;
use rand::SeedableRng;
use anchor_lang::prelude::*;
use crate::state::{Game, Master, WinnerDistribution, WinnerInfo};
use crate::utils::{round_to_decimal_places};
use rand::Rng;
use rand::seq::SliceRandom;
use std::collections::HashSet;
use std::hash::Hash;
use std::hash::Hasher;
use std::collections::hash_map::DefaultHasher;
use crate::utils::constants::{CREATOR_REWARD_PERCENTAGE, ADMIN_REWARD_PERCENTAGE, WINNER_PERCENTAGE};
use crate::utils::errors::{CustomError};

pub fn pick_winner(ctx: Context<PickWinner>, token_addresses: Vec<String>, token_volumes: Vec<f32>) -> Result<()> {

    let game_account = &mut ctx.accounts.game;

    // Check if the game has ended
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp as u64;
    let slot = clock.slot;

    if current_time < game_account.end_date || game_account.is_ended {
        return Err(CustomError::GameNotEndedOrAlreadyEnded.into());
    }

    game_account.remaining_reward = round_to_decimal_places(game_account.remaining_reward, 4);

    // Calculate rewards
    let creator_reward_lamports = (game_account.remaining_reward * CREATOR_REWARD_PERCENTAGE * 1_000_000_000.0) as u64;
    let admin_reward_lamports = (game_account.remaining_reward * ADMIN_REWARD_PERCENTAGE * 1_000_000_000.0) as u64;

    game_account.remaining_reward -= round_to_decimal_places((creator_reward_lamports + admin_reward_lamports) as f32 / 1_000_000_000.0, 5);

    // Perform the transfers
    {
        let remaining_sol = (game_account.remaining_reward * 1_000_000_000.0) as u64;
    
        // Transfer funds in a single operation to reduce CU
        let total_transfer = creator_reward_lamports + admin_reward_lamports + remaining_sol;
        **game_account.to_account_info().try_borrow_mut_lamports()? -= total_transfer;
        **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? += creator_reward_lamports;
        **ctx.accounts.admin_fees.to_account_info().try_borrow_mut_lamports()? += admin_reward_lamports;
        **ctx.accounts.admin_swap.to_account_info().try_borrow_mut_lamports()? += remaining_sol;
    }

    // Set the game as ended
    game_account.is_ended = true;

    // Hash the game account public key to get a unique seed value
    let mut hasher = DefaultHasher::new();
    game_account.key().hash(&mut hasher);
    let account_hash = hasher.finish();

    // Combine slot, current_time, and the hashed public key to create a unique seed
    let unique_seed = slot ^ current_time ^ account_hash;

    // Initialize SmallRng with the unique seed
    let mut rng = SmallRng::seed_from_u64(unique_seed);

    // Sort tokens by the number of tickets and assign positionFinal
    game_account.tokens.sort_by(|a, b| b.number_of_tickets.cmp(&a.number_of_tickets));

    // Identify the start and end indices of tokens with equal ticket counts
    let mut start_index = 0;

    while start_index < game_account.tokens.len() {
        // Find the range of tokens with the same number of tickets
        let mut end_index = start_index;
        while end_index + 1 < game_account.tokens.len() && 
            game_account.tokens[end_index + 1].number_of_tickets == game_account.tokens[start_index].number_of_tickets {
            end_index += 1;
        }
        
        // If there are multiple tokens with the same number of tickets, shuffle them
        if end_index > start_index {
            // Shuffle using the same rng instance to ensure randomness
            game_account.tokens[start_index..=end_index].shuffle(&mut rng);
        }
        
        // Move to the next range
        start_index = end_index + 1;
    }

    // Assign final positions based on the shuffled order
    for (index, token) in game_account.tokens.iter_mut().enumerate() {
        token.position_final = Some((index + 1) as u8);
    }

    let tokens_clone = game_account.tokens.clone();
    let winners_clone = game_account.winners.clone();

    let mut winner_ticket_map: Vec<Vec<u32>> = vec![Vec::new(); tokens_clone.len()];
    let mut is_winner_flags: Vec<bool> = vec![false; tokens_clone.len()];

    for (winner_index, winner) in winners_clone.iter().enumerate() {
        let winner_position = winner.position;
        let token_position = tokens_clone.iter().position(|token| token.position_final == Some(winner_position));

        if let Some(pos) = token_position {
            let number_of_tickets = tokens_clone[pos].number_of_tickets;

            let mut all_winners = Vec::new();

            // Directly use winner.winner_distribution
            for dist in &mut game_account.winners[winner_index].winner_distribution { // Modify the original winner's distribution
                if dist.fair_distribution_all {
                    is_winner_flags[pos] = true;
                    all_winners.push(0); // Assuming 0 indicates a special case
                    break;
                } else {
                    let mut winners = Vec::new();
                    let mut selected_tickets = HashSet::new();
                    let adjusted_num_winners = std::cmp::min(dist.num_winners, number_of_tickets as u8);

                    if adjusted_num_winners <= number_of_tickets as u8 {
                        while selected_tickets.len() < adjusted_num_winners as usize {
                            let random_ticket = rng.gen_range(1..=number_of_tickets as u32);
                            if selected_tickets.insert(random_ticket) {
                                winners.push(random_ticket);
                            }
                        }
                    } else {
                        
                        for ticket_id in 1..=number_of_tickets as u32 {
                            winners.push(ticket_id);
                        }
                        dist.num_winners = number_of_tickets as u8;
                    }

                    dist.ticket_ids = winners.clone();
                }
            }

            // Store the winners for this token
            winner_ticket_map[pos] = all_winners;
            is_winner_flags[pos] = true;

            // Update the token as a winner
            game_account.tokens[pos].is_winner = true;

            // Set the token winner address in the winner info
            game_account.winners[winner_index].token_address = game_account.tokens[pos].token_address.clone();
        }
    }

    /* Scenario when winner token have 0 ticket */
    // Get all winning token addresses with 0 tickets (collect their addresses, not mutable refs)
    let winning_projects_with_zero_tickets: Vec<Pubkey> = game_account.tokens
    .iter()
    .filter(|token| {
        token.is_winner && token.number_of_tickets == 0
    })
    .map(|token| token.token_address)
    .collect();

    // Identify if there are any winners with tickets
    let winners_with_tickets: Vec<Pubkey> = game_account.winners
    .iter()
    .filter_map(|winner| {
        if game_account.tokens.iter().any(|token| token.token_address == winner.token_address && token.number_of_tickets > 0) {
            Some(winner.token_address)
        } else {
            None
        }
    })
    .collect();

    // If there are any winning projects with zero tickets and no others winners
    if !winning_projects_with_zero_tickets.is_empty() && winners_with_tickets.is_empty(){
        // Step 1: First, update tokens and collect redistribution data
        let mut redistribution_updates = Vec::new();

        for token in game_account.tokens.iter_mut() {
            if winning_projects_with_zero_tickets.contains(&token.token_address) {
                token.is_winner = false;
                redistribution_updates.push((token.token_address, None));
            } else if token.number_of_tickets > 0 { 
                // 100 if token is not a winner, else check the other amount and percentage and modify
                redistribution_updates.push((token.token_address, Some(100.0)));
            }
        }

        // Step 2: Apply the redistribution to the winners based on the collected data
        for (token_address, percentage) in redistribution_updates {

            let mut match_found = false;
            let mut position_final: Option<u8> = None;

            // Check if the token_address already exists in winners list
            for winner in game_account.winners.iter_mut() {

                if winner.token_address == token_address {
                    match_found = true;

                    if let Some(percentage) = percentage {
                        // Add redistributed percentage to the winner_distribution
                        winner.winner_distribution.push(WinnerDistribution {
                            percentage,
                            num_winners: 1,
                            fair_distribution_all: true,
                            name: "EqualDistributionFromZeroTicket".to_string(),
                            ticket_ids: vec![],
                            percentage_winners: Some(0)
                        });
                    } else {
                        // Clear winner distribution if the token had 0 tickets
                        winner.winner_distribution.clear();
                    }
                    break;  // Exit the loop as we found the match
                }
            }

            // Find the positionFinal from the tokens data
            for token in game_account.tokens.iter() {
                if token.token_address == token_address {
                    if let Some(pos) = token.position_final {
                        position_final = Some(pos); // Assign the unwrapped u8 value
                    }
                    break;
                }
            }

            // If no match is found, and percentage is Some, create a new winner entry
            if !match_found {
                if let Some(percentage) = percentage {
                    if let Some(position_final) = position_final {
                        // Add the new WinnerInfo to the winners list
                        game_account.winners.push(WinnerInfo {
                            position: position_final,
                            percentage,
                            token_address,
                            winner_distribution: vec![WinnerDistribution {
                                percentage,
                                num_winners: 1,
                                fair_distribution_all: true,
                                name: "EqualDistributionFromZeroTicket".to_string(),
                                ticket_ids: vec![],
                                percentage_winners: Some(0)
                            }],
                        });

                        // Set the corresponding token to is_winner = true
                        if let Some(token) = game_account.tokens.iter_mut().find(|t| t.token_address == token_address) {
                            token.is_winner = true;
                        }
                    }
                }
            }
        }
    }

    if !winning_projects_with_zero_tickets.is_empty() && !winners_with_tickets.is_empty() {
        let total_zero_ticket = winning_projects_with_zero_tickets.len() as f32;
        let total_notzero_ticket = winners_with_tickets.len() as f32;
    
        // Calculate the total percentage share to be distributed from zero-ticket winners
        let redistribute_percentage = (total_zero_ticket / (total_zero_ticket + total_notzero_ticket)) * 50.0;
        
        // Each winner with tickets gets an equal share of the redistributed percentage
        let fair_share_per_winner = redistribute_percentage / total_notzero_ticket;
    
        // Step 1: Clear winnerDistribution for winners with zero tickets
        for token_address in &winning_projects_with_zero_tickets {
            if let Some(winner_info) = game_account.winners.iter_mut().find(|w| &w.token_address == token_address) {
                winner_info.winner_distribution.clear(); // Clear all winnerDistribution
            }
            // Find the corresponding token and set is_winner = false
            if let Some(token) = game_account.tokens.iter_mut().find(|t| &t.token_address == token_address) {
                token.is_winner = false;
            }
        }
    
        // Step 2: Update the winners by finding them in `game_account.winners`
        for winner_address in winners_with_tickets.iter() {
            if let Some(winner_info) = game_account.winners.iter_mut().find(|w| w.token_address == *winner_address) {
                // Add a new WinnerDistribution with the fair share percentage
                winner_info.winner_distribution.push(WinnerDistribution {
                    percentage: fair_share_per_winner as f32,
                    num_winners: 1,
                    fair_distribution_all: true,
                    name: "FairRedistributionFromZeroTicket".to_string(),
                    ticket_ids: vec![],
                    percentage_winners: Some(0)
                });
            }
        }
    
        // Step 3: Normalize the winner_distribution for each winner
        for winner in game_account.winners.iter_mut() {
            // Calculate the total percentage in the `winner_distribution`
            let total_distribution_percentage: f32 = winner
                .winner_distribution
                .iter()
                .map(|dist| dist.percentage as f32)
                .sum();
    
            if total_distribution_percentage > 0.0 {
                let normalization_factor = 100.0 / total_distribution_percentage;
    
                // Normalize each entry in `winner_distribution`
                for dist in winner.winner_distribution.iter_mut() {
                    dist.percentage = (dist.percentage as f32 * normalization_factor) as f32;
                }
            }
        }
    }

    game_account.winners.retain(|winner| !winner.winner_distribution.is_empty());
    
    /* End Scenario when winner token have 0 ticket */

    if game_account.winners.len() > 1 {
        let num_tokens = game_account.winners.len();
    
        let equal_distribution_share = 50.0 / num_tokens as f32;
    
        let total_volume: f32 = token_volumes.iter().sum();
        if total_volume == 0.0 {
            return Err(CustomError::ZeroTokenVolume.into());
        }
        
        let winner_volumes: Vec<f32> = game_account.winners
            .iter()
            .filter_map(|winner| {
                let winner_token_address = winner.token_address.to_string();
                let token_position = token_addresses.iter().position(|addr| addr == &winner_token_address);
                token_position.map(|pos| token_volumes[pos])
            })
            .collect();

        let inverse_volumes: Vec<f32> = winner_volumes
            .iter()
            .map(|volume| 1.0 / volume.max(1.0))
            .collect();
    
        let total_inverse_volume: f32 = inverse_volumes.iter().sum();
    
        let inverse_distribution_percentages: Vec<f32> = inverse_volumes
            .iter()
            .map(|inv_vol| (inv_vol / total_inverse_volume) * 50.0)
            .collect();
            
        for (winner_index, winner) in game_account.winners.iter_mut().enumerate() {
            let equal_share = equal_distribution_share;
            let volume_based_share = inverse_distribution_percentages[winner_index];
            let final_percentage = equal_share + volume_based_share;
        
            winner.percentage = final_percentage as f32;
        }
    } else if game_account.winners.len() == 1 {
        // Set 100% for the single winner
        if let Some(winner) = game_account.winners.first_mut() {
            winner.percentage = 100.0;
        }
    }

    // Update amount in SOL for each token winner
    {
        let remaining_reward = game_account.remaining_reward;
        let winner_updates: Vec<(usize, f32)> = game_account.winners
            .iter()
            .map(|winner| {
                let winner_position = winner.position as usize;
                let winner_percentage = winner.percentage as f32 / WINNER_PERCENTAGE;
                (winner_position, winner_percentage)
            })
            .collect();

        for (winner_position, winner_percentage) in winner_updates {
            let token_position = tokens_clone
                .iter()
                .position(|token| token.position_final == Some(winner_position as u8));

            if let Some(pos) = token_position {
                let updated_amount = round_to_decimal_places(remaining_reward * winner_percentage, 6);

                game_account.tokens[pos].total_amount_wallet_sol = updated_amount;
            }
        }
    }

    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.game.key());
    Ok(())
}


#[derive(Accounts)]
pub struct PickWinner<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    /// CHECK: Verify that address = game.creator
    #[account(mut, address = game.creator)]
    pub creator: AccountInfo<'info>,
    #[account(mut, seeds = [b"master"], bump)]
    pub master: Account<'info, Master>,
    /// CHECK: Verify that address = master.admin_fees
    #[account(mut, address = master.admin_fees)]
    pub admin_fees: AccountInfo<'info>,
    /// CHECK: Verify that address = master.admin_swap
    #[account(mut, address = master.admin_swap)]
    pub admin_swap: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}