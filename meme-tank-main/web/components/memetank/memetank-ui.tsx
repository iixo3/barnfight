'use client';
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useMemetankProgram } from './memetank-data-access';
import { useWallet } from '@solana/wallet-adapter-react';

export function MasterCreate() {
  const { initialize, closeParticipation } = useMemetankProgram();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => closeParticipation.mutateAsync()}
      disabled={initialize.isPending}
    >
      Create Master {initialize.isPending && '...'}
    </button>
  );
}

export function MasterAccount() {
  const { master } = useMemetankProgram();

  if (master.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!master.data) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No Master Account</h2>
        <p>Master account not found. Create one above to get started.</p>
      </div>
    );
  }

  const { account, pda } = master.data;

  return (
    <div className="card bg-base-100 shadow-xl text-base-content">
      <div className="card-body items-center text-center">
        <h2 className="card-title justify-center text-3xl">
          <ExplorerLink
            path={`account/${pda.toString()}`}
            label="Master Account"
            className="link link-primary"
          />
        </h2>
        <div className="space-y-4">
          <p className="text-lg">
            <strong>Admin Fees Wallet:</strong>{' '}
            {account.adminFees ? (
              <ExplorerLink
                path={`account/${account.adminFees.toString()}`}
                label={ellipsify(account.adminFees.toString())}
                className="link link-primary"
              />
            ) : (
              'Not set'
            )}
          </p>
          <p className="text-lg">
            <strong>Admin Swap Wallet:</strong>{' '}
            {account.adminSwap ? (
              <ExplorerLink
                path={`account/${account.adminSwap.toString()}`}
                label={ellipsify(account.adminSwap.toString())}
                className="link link-primary"
              />
            ) : (
              'Not set'
            )}
          </p>
          <p className="text-lg">
            <strong>Total Number of Tickets:</strong>{' '}
            <span className="font-bold">{account.totalNumberTicket?.toString() ?? '0'}</span>
          </p>
          <p className="text-lg">
            <strong>Price to Buy 1 Ticket:</strong>{' '}
            <span className="font-bold">{account.ticketBuyPrice ?? '0'}</span> SOL
          </p>
          <p className="text-lg">
            <strong>Price to Sell 1 Ticket:</strong>{' '}
            <span className="font-bold">{account.ticketSellPrice ?? '0'}</span> SOL
          </p>
          <p className="text-lg">
            <strong>All time Volume:</strong>{' '}
            <span className="font-bold">{account.allTimeVolume ?? '0'}</span> SOL
          </p>
        </div>
      </div>
    </div>
  );
}

export function GameCreate() {
  const { createGame } = useMemetankProgram();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => createGame.mutateAsync()}
      disabled={createGame.isPending}
    >
      Create Game {createGame.isPending && '...'}
    </button>
  );
}

export function GamesList() {
  const { games, joinGame } = useMemetankProgram();

  if (games.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!games.data || games.data.length === 0) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No Games</h2>
        <p>No games found. Create one above to get started.</p>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl text-base-content mt-8">
      <div className="card-body">
        <h2 className="card-title justify-center text-3xl">Games</h2>
        {games.data.map((game, index) => (
          <div key={index} className="mt-4 p-4 border rounded">
            <p><strong>Game Account:</strong> {game.publicKey.toString()}</p>
            <p><strong>Name:</strong> {game.account.name}</p>
            <p><strong>Creator:</strong> {game.account.creator.toString()}</p>
            <p><strong>Is Ended:</strong> {game.account.isEnded.toString()}</p>
            <p><strong>Start Date:</strong> {new Date(game.account.startDate.toNumber() * 1000).toLocaleString()}</p>
            <p><strong>End Date:</strong> {new Date(game.account.endDate.toNumber() * 1000).toLocaleString()}</p>
            <p><strong>Total Reward:</strong> {game.account.totalReward?.toFixed(5).replace(/0+$/, '')}</p>
            <p><strong>Remaining Reward:</strong> {game.account.remainingReward?.toFixed(5).replace(/0+$/, '')}</p>
            <p><strong>Initial Reward put my Creator:</strong> {game.account.initialReward?.toFixed(5).replace(/0+$/, '')}</p>
            <p><strong>Tokens:</strong> {JSON.stringify(game.account.tokens)}</p>
            <p><strong>Tokens:</strong> {game.account?.tokens[0]?.totalAmountWalletToken?.toString()}</p>
            <p><strong>Winners:</strong> {JSON.stringify(game.account.winners)}</p>
            <div className="mt-4">
              {game.account.tokens.map((token, tokenIndex) => (
                <div key={tokenIndex} className="mb-2">
                  <ClaimPrizeButton game={game.account} tokenAddress={new PublicKey(token.tokenAddress.toString())} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              {game.account.tokens.map((token, tokenIndex) => (
                <button
                  key={tokenIndex}
                  className="btn btn-xs lg:btn-sm btn-primary mr-2 mb-2"
                  onClick={() => joinGame.mutate({ 
                    gameId: game.publicKey, 
                    tokenAddress: new PublicKey(token.tokenAddress) 
                  })}
                  disabled={joinGame.isPending}
                >
                  Join with {token.tokenAddress.toString()} {joinGame.isPending && '...'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserAccount() {
  const { publicKey } = useWallet();
  const { userAccount, walletBalance } = useMemetankProgram();

  if (userAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!userAccount.data) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No User Account</h2>
        <p>User account not found. Create a game or buy ticket to get started.</p>
      </div>
    );
  }

  const { account, pda } = userAccount.data;

  return (
    <div className="card bg-base-100 shadow-xl text-base-content">
      <div className="card-body items-center text-center">
        <h2 className="card-title justify-center text-3xl">
          <ExplorerLink
            path={`account/${pda.toString()}`}
            label="User Account"
            className="link link-primary"
          />
        </h2>
        <div className="space-y-4">
          <p className="text-lg">
            <strong>Wallet:</strong>{' '}
            <ExplorerLink
              path={`account/${publicKey?.toString()}`}
              label={ellipsify(publicKey?.toString() ?? '')}
              className="link link-primary"
            />
          </p>
          <p className="text-lg">
            <strong>Wallet Balance:</strong>{' '}
            <span className="font-bold">
              {walletBalance.data ? `${walletBalance.data.balance.toFixed(4)} SOL` : 'Loading...'}
            </span>
          </p>
          <p className="text-lg">
            <strong>Total Tickets:</strong>{' '}
            <span className="font-bold">{account.numberTickets.toString()}</span>
          </p>
          <p className="text-lg">
            <strong>Total Games Created:</strong>{' '}
            <span className="font-bold">{account.numberGameCreated.toString()}</span>
          </p>
          <p className="text-lg">
            <strong>Free ticket received:</strong>{' '}
            <span className="font-bold">{account.freeTicketReceived?.toString()}</span>
          </p>
          <p className="text-lg">
            <strong>Free ticket received Superteam:</strong>{' '}
            <span className="font-bold">{account.freeSuperteamTicketReceived?.toString()}</span>
          </p>
          <p className="text-lg">
            <strong>Points:</strong>{' '}
            <span className="font-bold">{account.points?.toString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function BuyTicketForm() {
  const [numTickets, setNumTickets] = useState(1);
  const { buyTicket } = useMemetankProgram();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buyTicket.mutate(numTickets);
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-4">
      <h3 className="text-xl font-bold mb-4">Buy Tickets</h3>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Number of Tickets</span>
        </label>
        <input
          type="number"
          min="1"
          max="10000"
          value={numTickets}
          onChange={(e) => setNumTickets(parseInt(e.target.value))}
          className="input input-bordered"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary mt-4"
        disabled={buyTicket.isPending}
      >
        {buyTicket.isPending ? 'Buying...' : 'Buy Tickets'}
      </button>
    </form>
  );
}

export function SellTicketForm() {
  const [numTickets, setNumTickets] = useState(1);
  const { sellTicket } = useMemetankProgram();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sellTicket.mutate(numTickets);
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-4">
      <h3 className="text-xl font-bold mb-4">Sell Tickets</h3>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Number of Tickets</span>
        </label>
        <input
          type="number"
          min="1"
          max="10000"
          value={numTickets}
          onChange={(e) => setNumTickets(parseInt(e.target.value))}
          className="input input-bordered"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary mt-4"
        disabled={sellTicket.isPending}
      >
        {sellTicket.isPending ? 'Selling...' : 'Sell Tickets'}
      </button>
    </form>
  );
}

interface ClaimPrizeButtonProps {
  game: any;
  tokenAddress: PublicKey;
}

export function ClaimPrizeButton({ game, tokenAddress }: ClaimPrizeButtonProps) {
  const { claimPrize, closeParticipation, closeGame } = useMemetankProgram();
  const { publicKey } = useWallet();

  const handleClaimPrize = async () => {
    if (!publicKey) return;

    try {
      //await closeParticipation.mutateAsync();
      //await closeGame.mutateAsync();
      await claimPrize.mutateAsync({ game, tokenAddress });
    } catch (error) {
      console.error("Error claiming prize:", error);
    }
  };

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={handleClaimPrize}
      disabled={claimPrize.isPending}
    >
      Claim Prize for Token {tokenAddress.toString()} {claimPrize.isPending && '...'}
    </button>
  );
}