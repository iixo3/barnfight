use anchor_lang::prelude::*;

#[account]
pub struct User {
    pub user_pubkey: Pubkey,
    pub number_tickets: u64,
    pub number_game_created: u32,
    pub free_ticket_received: Option<bool>,
    pub free_superteam_ticket_received: Option<bool>,
    pub points: Option<u64>,
    pub number_referrals_done: Option<u32>,
    pub referral_parent: Option<Pubkey>,
    pub referral_code: Option<String>,
}
