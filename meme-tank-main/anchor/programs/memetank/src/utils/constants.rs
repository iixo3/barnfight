// Pricing and Rewards
pub const STARTING_PRICE: u64 = 1_000_000; // 0.001 SOL in lamports
pub const LINEAR_SLOPE: u64 = 1_000_000;
pub const SLOPE_SCALE: u64 = 1_000;
pub const INITIAL_REWARD_LAMPORTS: u64 = 2_000_000; // 0.002 SOL in lamports
pub const CREATOR_REWARD_PERCENTAGE: f32 = 0.1; // Percentage of the reward for the creator
pub const ADMIN_REWARD_PERCENTAGE: f32 = 0.03; // Percentage of the reward for the admin
pub const WINNER_PERCENTAGE: f32 = 100.0; // Percentage of the reward for the winner

// Ticketing
pub const MIN_TICKETS: u64 = 1;
pub const MAX_TICKETS: u64 = 10000000;
pub const MAX_TOKENS: usize = 20; // Maximum number of tokens allowed
pub const MAX_TICKET_RANGES: usize = 30; // Maximum number of ticket ranges allowed

// Slippage
pub const SLIPPAGE_BPS: u16 = 100; // Default slippage basis points (1%)
pub const MIN_SLIPPAGE_BPS: u16 = 10;
pub const MAX_SLIPPAGE_BPS: u16 = 3000;

// Naming and Formatting
pub const MAX_NAME_LENGTH: usize = 100; // Maximum length for game name
pub const MAX_DISTRIBUTION_NAME_LENGTH: usize = 20; // Maximum length for winner distribution name
pub const DECIMAL_PLACES: u32 = 6; // Decimal places for rounding

// Bonding Curve
pub const BONDING_CURVE_BASE: f32 = 1.00001;

// Fees
pub const FEE_PERCENTAGE: u64 = 150; // 1.5%