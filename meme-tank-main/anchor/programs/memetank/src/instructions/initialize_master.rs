use anchor_lang::prelude::*;
use crate::state::{Master, get_price};

pub fn initialize_master(ctx: Context<InitializeMaster>, admin_swap: Pubkey, admin_fees: Pubkey) -> Result<()> {
    let master = &mut ctx.accounts.master;
    master.total_number_ticket = 0;
    master.admin_fees = admin_fees;
    master.admin_swap = admin_swap;
    master.all_time_volume = 0.0;
    let (buy_price, sell_price) = get_price(0);
    master.ticket_buy_price = buy_price;
    master.ticket_sell_price = sell_price;
    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.master.key());
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeMaster<'info> {
    #[account(init, payer = user, seeds = [b"master"], bump, space = 8 + 8 + 32 + 32 + 30 + 100 + 8 + 8 + 300)]
    pub master: Account<'info, Master>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
