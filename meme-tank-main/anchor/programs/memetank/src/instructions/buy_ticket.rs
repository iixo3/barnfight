use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use crate::state::{calculate_buffered_price, calculate_buy_price, Master, User, get_price};
use crate::utils::constants::{MIN_TICKETS, MAX_TICKETS, MIN_SLIPPAGE_BPS, MAX_SLIPPAGE_BPS, FEE_PERCENTAGE};
use crate::utils::errors::{CustomError};

pub fn buy_ticket(ctx: Context<BuyTicket>, num_tickets: u64, slippage_bps: u16) -> Result<()> {

    if num_tickets < MIN_TICKETS || num_tickets > MAX_TICKETS {
        return Err(CustomError::InvalidTicketAmount.into());
    }

    if slippage_bps < MIN_SLIPPAGE_BPS || slippage_bps > MAX_SLIPPAGE_BPS {
        return Err(CustomError::InvalidSlippageBps.into());
    }

    let real_cost = {
        let master = &ctx.accounts.master;
        calculate_buy_price(master.total_number_ticket, num_tickets)
    };
    let buffered_cost = calculate_buffered_price(real_cost, slippage_bps);

    // Calculate the fee amount
    let fee_amount = (buffered_cost * FEE_PERCENTAGE) / 10000; // 1.5% of the buffered cost

    let master_key = ctx.accounts.master.to_account_info().key;
    let master_account_info = ctx.accounts.master.to_account_info();
    let admin_key = ctx.accounts.master.admin_fees;

    // Transfer SOL from the user to the master account for the ticket cost
    invoke(
        &system_instruction::transfer(ctx.accounts.user.key, master_key, buffered_cost),
        &[
            ctx.accounts.user.to_account_info(),
            master_account_info.clone(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Transfer SOL from the user to the admin wallet for the fee
    invoke(
        &system_instruction::transfer(ctx.accounts.user.key, &admin_key, fee_amount),
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.admin.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    {
        let user_account = &mut ctx.accounts.user_account;
        let master = &mut ctx.accounts.master;

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

        if user_account.user_pubkey != *ctx.accounts.user.key {
            return Err(CustomError::IllegalOwner.into());
        }

        user_account.number_tickets += num_tickets;
        master.total_number_ticket += num_tickets;

        let (buy_price, sell_price) = get_price(master.total_number_ticket);
        master.ticket_buy_price = buy_price;
        master.ticket_sell_price = sell_price;

        master.all_time_volume += (buffered_cost + fee_amount) as f32 / 1_000_000_000.0;
    }

    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.master.key());
    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.user_account.key());
    Ok(())
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(
        init_if_needed,
        payer = user,
        seeds = [b"user", user.key().as_ref()],
        bump,
        space = 8 + 32 + 8 + 200
    )]
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