use anchor_lang::prelude::*;
use crate::state::{calculate_sell_price, Game, Master, Participation, TicketRange, User, get_price};
use crate::utils::{round_to_decimal_places};
use crate::utils::constants::{MIN_TICKETS, MAX_TICKET_RANGES, DECIMAL_PLACES};
use crate::utils::errors::{CustomError};

pub fn join_game(
    ctx: Context<JoinGame>,
    game_id: String,
    token_address: Pubkey,
    num_tickets: u64,
) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;
    let game_account = &ctx.accounts.game;

    // Verify that the current time is between game start and end dates
    let current_time = Clock::get()?.unix_timestamp as i64;
    let game_start = game_account.start_date as i64;
    let game_end = game_account.end_date as i64;
    
    if current_time < game_start || current_time >= game_end {
        return Err(CustomError::GameNotActive.into());
    }

    if num_tickets < MIN_TICKETS || user_account.number_tickets < num_tickets {
        return Err(CustomError::InvalidNumberOfTickets.into());
    }

    // Calculate total sell price
    let total_revenue = {
        let master_account = &ctx.accounts.master;
        calculate_sell_price(master_account.total_number_ticket, num_tickets)
    };

    // Transfer SOL from master to game account
    {
        let master_info = ctx.accounts.master.to_account_info();
        let game_info = ctx.accounts.game.to_account_info();

        **master_info.try_borrow_mut_lamports()? -= total_revenue;
        **game_info.try_borrow_mut_lamports()? += total_revenue;
    }

    // Decrease ticket numbers
    {
        let master_account = &mut ctx.accounts.master;
        user_account.number_tickets -= num_tickets;
        master_account.total_number_ticket -= num_tickets;

        let (buy_price, sell_price) = get_price(master_account.total_number_ticket);
        master_account.ticket_buy_price = buy_price;
        master_account.ticket_sell_price = sell_price;
        master_account.all_time_volume += (total_revenue) as f32 / 1_000_000_000.0;
    }

    // Determine the start and end of the new ticket range based on the game token info
    let (start_ticket, end_ticket) = {
        let game_account = &ctx.accounts.game;
        let start = game_account.tokens.iter()
            .find(|token| token.token_address == token_address)
            .map(|token| token.number_of_tickets + 1)
            .unwrap_or(1);
        let end = start + num_tickets - 1;
        (start, end)
    };
    // Update participation tickets
    let participation_account = &mut ctx.accounts.participation;
    if participation_account.user_pubkey == Pubkey::default() {
        participation_account.user_pubkey = *ctx.accounts.user.key;
        participation_account.game_id = game_id;
        participation_account.token_address = token_address;
        participation_account.is_claimed = false;
    }
    participation_account.total_spend = Some(
        participation_account.total_spend.unwrap_or(0.0) + (total_revenue) as f32 / 1_000_000_000.0
    );
    participation_account.total_tickets_entered = Some(
        participation_account.total_tickets_entered.unwrap_or(0) + num_tickets as u32
    );

    // Max 20 ticket ranges
    if participation_account.ranges.len() >= MAX_TICKET_RANGES {
        return Err(CustomError::ExceededMaxTicketRanges.into());
    }

    participation_account.ranges.push(TicketRange {
        start: start_ticket as u32,
        end: end_ticket as u32,
    });

    // Update game token info
    {
        let game_account = &mut ctx.accounts.game;
        for token in game_account.tokens.iter_mut() {
            if token.token_address == token_address {
                token.number_of_tickets += num_tickets;
                break;
            }
        }
        let reward_increase = round_to_decimal_places(total_revenue as f32 / 1_000_000_000.0, DECIMAL_PLACES);
        game_account.total_reward = round_to_decimal_places(game_account.total_reward as f32 + reward_increase, DECIMAL_PLACES);
        game_account.remaining_reward = round_to_decimal_places(game_account.remaining_reward as f32 + reward_increase, DECIMAL_PLACES);
    }

    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.game.key());
    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.master.key());
    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.participation.key());
    msg!("ACCOUNT-UPDATE: {}", ctx.accounts.user_account.key());

    Ok(())
}

#[derive(Accounts)]
#[instruction(game_id: String, token_address: Pubkey)]
pub struct JoinGame<'info> {
    #[account(
        init_if_needed,
        payer = user,
        seeds = [b"participation", game.key().as_ref(), user.key().as_ref(), token_address.as_ref()],
        bump,
        space = 8 + 32 + 4 + game_id.len() + 32 + 4 + 1 + 30 + 30 * 8 + 20 + 20 + 50 // 30 ticket ranges max
    )]
    pub participation: Account<'info, Participation>,
    #[account(mut, seeds = [b"user", user.key().as_ref()], bump)]
    pub user_account: Account<'info, User>,
    #[account(mut, seeds = [b"master"], bump)]
    pub master: Account<'info, Master>,
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
