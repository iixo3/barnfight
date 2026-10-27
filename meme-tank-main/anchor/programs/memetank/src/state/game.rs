use anchor_lang::prelude::*;
use crate::state::TokenInfo;
use crate::state::WinnerInfo;

#[account]
pub struct Game {
    pub id: Pubkey,
    pub creator: Pubkey,
    pub index_game_by_creator: u32,
    pub num: u32,
    pub is_ended: bool,
    pub start_date: u64,
    pub end_date: u64,
    pub total_reward: f32,
    pub remaining_reward: f32,
    pub initial_reward: f32,
    pub name: Option<String>,
    pub tokens: Vec<TokenInfo>,
    pub winners: Vec<WinnerInfo>,
}
