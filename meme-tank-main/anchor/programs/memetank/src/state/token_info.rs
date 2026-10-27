use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TokenInfo {
    pub number_of_tickets: u64,
    pub token_address: Pubkey,
    pub is_winner: bool,
    pub position_final: Option<u8>,
    pub total_amount_wallet_sol: f32,
    pub total_amount_wallet_token: u64,
    pub swap_done: bool,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize, Default)]
pub struct WinnerInfo {
    pub position: u8,
    pub percentage: f32,
    pub token_address: Pubkey,
    pub winner_distribution: Vec<WinnerDistribution>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug)]
pub struct WinnerDistribution {
    pub percentage: f32,
    pub num_winners: u8,
    pub fair_distribution_all: bool,
    pub name: String,
    pub ticket_ids: Vec<u32>,
    pub percentage_winners: Option<u8>,
}
