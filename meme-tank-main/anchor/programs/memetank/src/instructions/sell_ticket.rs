use anchor_lang::prelude::*;
use crate::state::{calculate_buffered_sell, calculate_sell_price, Master, User, get_price};
use crate::utils::constants::{MIN_TICKETS, MAX_TICKETS, MIN_SLIPPAGE_BPS, MAX_SLIPPAGE_BPS, FEE_PERCENTAGE};
use crate::utils::errors::{CustomError};

pub fn sell_ticket(ctx: Context<SellTicket>, num_tickets: u64, slippage_bps: u16) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;

    // Validate user ownership
    if user_account.user_pubkey != *ctx.accounts.user.key {
        return Err(CustomError::IllegalOwner.into());
    }

    // Validate ticket and slippage inputs
    if num_tickets < MIN_TICKETS || num_tickets > MAX_TICKETS {
        return Err(CustomError::InvalidTicketAmount.into());
    }
    if slippage_bps < MIN_SLIPPAGE_BPS || slippage_bps > MAX_SLIPPAGE_BPS {
        return Err(CustomError::InvalidSlippageBps.into());
    }
    if user_account.number_tickets < num_tickets {
        return Err(CustomError::InsufficientTickets.into());
    }

    // Calculate revenue and fees
    let real_revenue = {
        let master = &ctx.accounts.master;
        calculate_sell_price(master.total_number_ticket, num_tickets)
    };
    let buffered_revenue = calculate_buffered_sell(real_revenue, slippage_bps);

    // Calculate fee and user payout
    let fee_amount = (buffered_revenue * FEE_PERCENTAGE) / 10000; // 1.5% of the buffered revenue
    let user_revenue = buffered_revenue - fee_amount;

    // Ensure master has enough SOL for both the revenue and fee
    let master_lamports = **ctx.accounts.master.to_account_info().lamports.borrow();
    if master_lamports < buffered_revenue {
        return Err(CustomError::InsufficientFunds.into());
    }

    let master_account_info = ctx.accounts.master.to_account_info();
    let user_account_info = ctx.accounts.user.to_account_info();
    let admin_account_info = ctx.accounts.admin.to_account_info();

    **master_account_info.try_borrow_mut_lamports()? -= buffered_revenue;
    **user_account_info.try_borrow_mut_lamports()? += user_revenue;
    **admin_account_info.try_borrow_mut_lamports()? += fee_amount;

    user_account.number_tickets -= num_tickets;
    let master = &mut ctx.accounts.master;
    master.total_number_ticket -= num_tickets;

    let (buy_price, sell_price) = get_price(master.total_number_ticket);
    master.ticket_buy_price = buy_price;
    master.ticket_sell_price = sell_price;
    master.all_time_volume += (user_revenue) as f32 / 1_000_000_000.0;

    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.user_account.key());
    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.master.key());
    Ok(())
}

#[derive(Accounts)]
pub struct SellTicket<'info> {
    #[account(mut, seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, User>,
    #[account(mut, seeds = [b"master"], bump)]
    pub master: Account<'info, Master>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: Verify that address = master.admin_fees
    #[account(mut, address = master.admin_fees)]
    pub admin: AccountInfo<'info>,
}
