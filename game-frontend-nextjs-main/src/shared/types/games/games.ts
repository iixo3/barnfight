import { PublicKey } from "@solana/web3.js";

export interface GamesHistory {
  id: string;
  title: string;
  users: string | number;
  tickets: string | number;
  prize: string | number;
  hosted_by_me: boolean;
  time_left: string | number | Date;
  start_date: number;
}

export interface GameHistoryHook extends Game {
  isActive: boolean;
}

export interface GameBattleToken {
  is_winner?: boolean;
  last_updated_time?: number;
  number_of_tickets: number;
  position_final: number;
  swap_done: boolean;
  token_address: string;
  total_amount_wallet_sol: string;
  total_amount_wallet_token: string;
}
export interface Game {
  id: string;
  name: string;
  creator: string;
  start_date: number;
  end_date: number;
  is_ended: boolean;
  initial_reward: number | string;
  total_reward: number | string;
  remaining_reward: number | string;
  num?: number | string;
  index_game_by_creator: number | string;
  last_updated_time: number;
  streamers: {
    streamer: string;
    platform: string;
  }[];
  private_stream?: boolean;
  winners: {
    last_updated_time?: number;
    percentage: number;
    position: number;
    token_address: string;
    token_winner?: string;
    winner_distribution: {
      fair_distribution_all: boolean;
      last_updated_time: number;
      name: string;
      num_winners: number;
      percentage: number;
      ticket_ids: number[];
    }[];
  }[];
  tokens: {
    is_winner: boolean;
    number_of_tickets: number;
    position_final?: number | null;
    swap_done: boolean;
    token_address: string;
    total_amount_wallet_sol: number;
    total_amount_wallet_token: number;
    last_updated_time: number;
  }[];
}

export interface GameToken {
  address: string;
  logoURI: string;
  name: string;
  symbol: string;
}

export interface GameDataFromContract {
  id: PublicKey;
  creator: PublicKey;
  indexGameByCreator: number;
  num: number;
  isEnded: boolean;
  startDate: number;
  endDate: number;
  totalReward: number;
  remainingReward: number;
  initialReward: number;
  name: string | null;
  tokens: {
    numberOfTickets: string | number;
    tokenAddress: string;
    isWinner: boolean;
    positionFinal: number | null;
    totalAmountWalletSol: number;
    totalAmountWalletToken: string;
    swapDone: boolean;
  }[];
  winners: {
    position: number;
    percentage: number;
    tokenAddress: string;
    winnerDistribution: {
      percentage: number;
      numWinners: number;
      fairDistributionAll: boolean;
      name: string;
      ticketIds: number[];
      percentageWinners: number | null;
    }[];
  }[];
}

export interface Participation {
  tokenAddress: PublicKey;
  ticketsBought: number;
  ranges: any[];
  totalSpend: number | null;
  totalTicketsEntered: number | null;
}
