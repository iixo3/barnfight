#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("PROGRAM_ID_REMOVED");

pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;
use state::*;

#[program]
pub mod memetank {
    use super::*;

    pub fn initialize_master(ctx: Context<InitializeMaster>, admin_swap: Pubkey, admin_fees: Pubkey) -> Result<()> {
        instructions::initialize_master(ctx, admin_swap, admin_fees)
    }

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
        instructions::initialize_game(
            ctx, number_game_created, num_tokens, num_winners_tokens, total_winners_sum, total_distribution_sum, name, start_date, end_date, initial_reward, tokens, winners
        )
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, num_tickets: u64, slippage_bps: u16) -> Result<()> {
        instructions::buy_ticket(ctx, num_tickets, slippage_bps)
    }

    pub fn sell_ticket(ctx: Context<SellTicket>, num_tickets: u64, slippage_bps: u16) -> Result<()> {
        instructions::sell_ticket(ctx, num_tickets, slippage_bps)
    }

    pub fn join_game(
        ctx: Context<JoinGame>,
        game_id: String,
        token_address: Pubkey,
        num_tickets: u64,
    ) -> Result<()> {
        instructions::join_game(ctx, game_id, token_address, num_tickets)
    }

    pub fn pick_winner(ctx: Context<PickWinner>, token_addresses: Vec<String>, token_volumes: Vec<f32>) -> Result<()> {
        instructions::pick_winner(ctx, token_addresses, token_volumes)
    }

    pub fn transfer_tokens_to_game(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        instructions::transfer_tokens_to_game(ctx, amount)
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>, index_game_by_creator: u32, creator: Pubkey) -> Result<()> {
        instructions::claim_prize(ctx, index_game_by_creator, creator)
    }

    pub fn close_participation_account(ctx: Context<CloseParticipationAccount>) -> Result<()> {
        instructions::close_participation_account(ctx)
    }

    pub fn close_game_account(ctx: Context<CloseGameAccount>) -> Result<()> {
        instructions::close_game_account(ctx)
    }
}
