use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("The game has not ended yet or has already been marked as ended.")]
    GameNotEndedOrAlreadyEnded,
    #[msg("Total token volume cannot be zero.")]
    ZeroTokenVolume,
    #[msg("Number of tickets is out of allowed range.")]
    InvalidTicketAmount,
    #[msg("Slippage basis points (BPS) is out of allowed range.")]
    InvalidSlippageBps,
    #[msg("User account does not match provided public key.")]
    IllegalOwner,
    #[msg("Master account does not have enough funds.")]
    InsufficientFunds,
    #[msg("User does not have enough tickets to sell.")]
    InsufficientTickets,
    #[msg("The number of tokens provided does not match the specified number.")]
    MismatchedTokenCount,
    #[msg("The number of winners provided does not match the specified number.")]
    MismatchedWinnerCount,
    #[msg("The total distribution sum does not match the calculated distribution sum.")]
    MismatchedDistributionSum,
    #[msg("The game name exceeds the maximum allowed length.")]
    GameNameTooLong,
    #[msg("The total winners sum does not match the calculated winners sum.")]
    MismatchedWinnersSum,
    #[msg("Duplicate tokens detected; all token addresses must be unique.")]
    DuplicateTokens,
    #[msg("A winner distribution name exceeds the maximum allowed length.")]
    DistributionNameTooLong,
    #[msg("The total percentage for all winners is below the required threshold of 99.8%.")]
    TotalWinnerPercentageTooLow,
    #[msg("The total distribution percentage for a winner is below the required threshold of 99.8%.")]
    DistributionPercentageTooLow,
    #[msg("Game is not currently active.")]
    GameNotActive,
    #[msg("Invalid number of tickets.")]
    InvalidNumberOfTickets,
    #[msg("Exceeded the maximum number of ticket ranges allowed.")]
    ExceededMaxTicketRanges,
    #[msg("The game has not ended yet.")]
    GameNotEnded,
    #[msg("Participation has already been claimed.")]
    AlreadyClaimed,
    #[msg("Signer does not match participation user_pubkey.")]
    SignerMismatch,
    #[msg("Game ID mismatch.")]
    GameIdMismatch,
    #[msg("Token not found in game tokens.")]
    TokenNotFoundInGame,
    #[msg("Token swap has not been completed for this token.")]
    TokenSwapIncomplete,
    #[msg("Token does not have a final position.")]
    MissingFinalPosition,
    #[msg("Winner information not found for the specified position.")]
    WinnerInfoNotFound,
    #[msg("Calculated prize amount is zero.")]
    ZeroPrizeAmount,
    #[msg("User is not authorized as the admin swap.")]
    UnauthorizedAdminSwap,
    #[msg("Token swap has already been completed for this token.")]
    TokenSwapAlreadyDone,
    #[msg("User not authorized to create game.")]
    UnauthorizedCreateGameUser,
    #[msg("The participation account is already closed.")]
    ParticipationAccountAlreadyClosed,
}