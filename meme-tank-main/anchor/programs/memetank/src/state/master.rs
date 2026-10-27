use anchor_lang::prelude::*;

#[account]
pub struct Master {
    pub total_number_ticket: u64,
    pub admin_fees: Pubkey,
    pub admin_swap: Pubkey,
    pub ticket_buy_price: f32,
    pub ticket_sell_price: f32,
    pub all_time_volume: f32,
}
