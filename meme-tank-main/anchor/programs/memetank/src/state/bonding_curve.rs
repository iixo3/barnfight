use crate::utils::constants::{STARTING_PRICE, LINEAR_SLOPE, SLOPE_SCALE, FEE_PERCENTAGE};
use crate::utils::{round_to_decimal_places};

pub fn calculate_buy_price(current_ticket_count: u64, new_ticket_count: u64) -> u64 {
    let start_price = STARTING_PRICE + (current_ticket_count * LINEAR_SLOPE) / SLOPE_SCALE;
    let end_price = STARTING_PRICE + ((current_ticket_count + new_ticket_count) * LINEAR_SLOPE) / SLOPE_SCALE;
    let total_price = (new_ticket_count * (start_price + end_price)) / 2;
    total_price
}

pub fn calculate_buffered_price(price: u64, slippage_bps: u16) -> u64 {
    price + (price * slippage_bps as u64 / 10000)
}

pub fn calculate_sell_price(current_ticket_count: u64, sell_ticket_count: u64) -> u64 {
    if current_ticket_count == 0 {
        return 0;
    }
    let start_price = STARTING_PRICE + ((current_ticket_count - sell_ticket_count) * LINEAR_SLOPE) / SLOPE_SCALE;
    let end_price = STARTING_PRICE + (current_ticket_count * LINEAR_SLOPE) / SLOPE_SCALE;
    let total_price = (sell_ticket_count * (start_price + end_price)) / 2;
    total_price
}

pub fn calculate_buffered_sell(price: u64, slippage_bps: u16) -> u64 {
    price - (price * slippage_bps as u64 / 10000)
}

/*pub fn get_price(number_of_tickets: u64) -> (f32, f32) {
    msg!("number_of_tickets: {}", number_of_tickets);
    let buy_price = calculate_buy_price(number_of_tickets, 1) as f32 / 1_000_000_000.0;
    let sell_price = calculate_sell_price(number_of_tickets, 1) as f32 / 1_000_000_000.0;
    msg!("buy ticket: {} and sell ticket: {}", buy_price, sell_price);

    let admin_fees = FEE_PERCENTAGE as f32 / 10000.0;
    let buy_price_with_fees = (buy_price * (1.0 + admin_fees)) as f32;
    let sell_price_with_fees = (sell_price * (1.0 - admin_fees)) as f32;
    let rounded_buy_price = round_to_decimal_places(buy_price_with_fees, 6);
    let rounded_sell_price = round_to_decimal_places(sell_price_with_fees, 6);
    (rounded_buy_price, rounded_sell_price)
}*/

pub fn get_price(number_of_tickets: u64) -> (f32, f32) {
    let raw_buy_price = calculate_buy_price(number_of_tickets, 1);
    let raw_sell_price = calculate_sell_price(number_of_tickets, 1);

    let buy_price = raw_buy_price as f32 / 1_000_000_000.0;
    let sell_price = raw_sell_price as f32 / 1_000_000_000.0;

    let admin_fees = FEE_PERCENTAGE as f32 / 10000.0;
    let buy_price_with_fees = buy_price * (1.0 + admin_fees);
    let sell_price_with_fees = sell_price * (1.0 - admin_fees);

    let rounded_buy_price = round_to_decimal_places(buy_price_with_fees, 6);
    let rounded_sell_price = round_to_decimal_places(sell_price_with_fees, 6);

    (rounded_buy_price, rounded_sell_price)
}

/*
1 tickets: 0.001 SOL
1,000 tickets: 0.001001 SOL
10,000 tickets: 0.00101 SOL
100,000 tickets: 0.001105 SOL
500,000 tickets: 0.001649 SOL
1,000,000 tickets: 0.002718 SOL
2,000,000 tickets: 0.007389 SOL
5,000,000 tickets: 0.1484 SOL
5,500,000 tickets: 0.2447 SOL
6,000,000 tickets: 0.4034 SOL
7,000,000 tickets: 1.0966 SOL
8,000,000 tickets: 2.9810 SOL
*/