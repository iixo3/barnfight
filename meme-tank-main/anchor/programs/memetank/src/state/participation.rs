use anchor_lang::prelude::*;

#[account]
pub struct Participation {
    pub user_pubkey: Pubkey,
    pub game_id: String,
    pub token_address: Pubkey,
    pub ranges: Vec<TicketRange>,
    pub is_claimed: bool,
    pub total_spend: Option<f32>,
    pub total_tickets_entered: Option<u32>,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct TicketRange {
    pub start: u32,
    pub end: u32,
}