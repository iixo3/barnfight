'use client';

import { getMemetankProgram, getMemetankProgramId } from '@meme-tank/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import * as anchor from '@coral-xyz/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

export function useMemetankProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getMemetankProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getMemetankProgram(provider);

  const getUserPDA = async (wallet: PublicKey, programId: PublicKey) => {
    const [userPda] = await PublicKey.findProgramAddress(
      [Buffer.from('user'), wallet.toBuffer()],
      programId
    );
    return userPda;
  };
  
  const getMasterPDA = async () => {
    const [masterPda] = await PublicKey.findProgramAddress(
      [Buffer.from('master')],
      program.programId
    );
    return masterPda;
  };
  
  const getGamePDA = async (userWallet: PublicKey, gameNumber: number, programId: PublicKey) => {
    const [gamePda] = await PublicKey.findProgramAddress(
      [ 
        Buffer.from("game"), 
        userWallet.toBuffer(),
        new anchor.BN(gameNumber).toArrayLike(Buffer, 'le', 4)
      ],
      programId
    );
    return gamePda;
  };

  const master = useQuery({
    queryKey: ['master', { cluster }],
    queryFn: async () => {
      const masterPda = await getMasterPDA();
      const account = await program.account.master.fetch(masterPda);
      return { account, pda: masterPda };
    },
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const walletBalance = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      if (!provider.wallet.publicKey) return null;
      const balance = await connection.getBalance(provider.wallet.publicKey);
      const LAMPORTS_PER_SOL = 1000000000;
      return {balance: balance / LAMPORTS_PER_SOL}; 
    }
  });

  const initialize = useMutation({
    mutationKey: ['master', 'initialize-master', { cluster }],
    mutationFn: async () => {

      const masterPda = await getMasterPDA();

      return await program.methods
        .initializeMaster(new PublicKey(process.env.NEXT_PUBLIC_MASTER_ADMIN_SWAP || ""), new PublicKey(process.env.NEXT_PUBLIC_MASTER_ADMIN_FEES || ""))
        .accounts({
          master: masterPda,
          user: provider.publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return master.refetch();
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to initialize account')},
    }
);

const userAccount = useQuery({
  queryKey: ['user-account', { cluster, publicKey: publicKey?.toString() }],
  queryFn: async () => {
    if (!publicKey) return null;
    const userPda = await getUserPDA(publicKey, program.programId);
    const account = await program.account.user.fetch(userPda);
    return { account, pda: userPda };
  },
  enabled: !!publicKey,
});

  const createGame = useMutation({
    mutationKey: ['game', 'create-game', { cluster }],
    mutationFn: async () => {
      const userPda = await getUserPDA(provider.wallet.publicKey, program.programId);

      let userAccount;
      try {
        userAccount = await program.account.user.fetch(userPda);
      } catch (error) {
        userAccount = { numberGameCreated: 0 };
      }

      const numberGameCreated = new anchor.BN(userAccount.numberGameCreated);
      const gamePda = await getGamePDA(provider.wallet.publicKey, numberGameCreated.toNumber(), program.programId);

      const startDate = new anchor.BN(Date.now() / 1000);
      const endDate = new anchor.BN(Date.now() / 1000 + 400);//60);
      const bigBlind = 0;
      const name = "Sample game";

      const winners = [
        {
          position:1,
          percentage: 50,
          tokenWinner: "",
          winnerDistribution: [
            {
              percentage: 100,
              numWinners: 1,
              fairDistributionAll: true,
              name: "Fantastic",
              ticketIds: [],
              percentageWinners: 0
            }
          ],
        },
        {
          position:2,
          percentage: 50,
          tokenWinner: "",
          winnerDistribution: [
            {
              percentage: 100,
              numWinners: 1,
              fairDistributionAll: true,
              name: "Fantastic",
              ticketIds: [],
              percentageWinners: 0
            }
          ],
        },
      ];

      const tokens = [
        new PublicKey("5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC"),
        new PublicKey("7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr")
      ];

      return await program.methods
        .initializeGame(
          numberGameCreated,
          tokens.length, 
          winners.length, 
          2, // sum of all number of winners in each winners list
          2,
          name,
          startDate,
          endDate,
          bigBlind,
          tokens,
          winners,
        )
        .accounts({
          game: gamePda,
          userAccount: userPda,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      master.refetch();
      userAccount.refetch();
      return games.refetch();
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to create game')},
    }
  );

  const games = useQuery({
    queryKey: ['games', { cluster }],
    queryFn: async () => {
      const games = await program.account.game.all();
      return games;
    },
  });

  const buyTicket = useMutation({
    mutationFn: async (numTickets: number) => {
      if (!provider.wallet.publicKey) throw new Error('Wallet not connected');
      const userPda = await getUserPDA(provider.wallet.publicKey, program.programId);
      const masterPda = await getMasterPDA();
      const masterAdminFees = new PublicKey(process.env.NEXT_PUBLIC_MASTER_ADMIN_FEES || "");

      console.log("numTickets", numTickets);
      console.log("pda", masterPda.toString());
      console.log("Test", masterAdminFees.toString());
      console.log("userPda", userPda.toString());

      return await program.methods
        .buyTicket(new anchor.BN(numTickets), 10) // Slippage from 0.1% to 30%
        .accounts({
          userAccount: userPda,
          master: masterPda,
          user: provider.wallet.publicKey,
          admin: masterAdminFees,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-account'] });
      queryClient.invalidateQueries({ queryKey: ['master'] });
      toast.success('Tickets purchased successfully!');
    },
    onError: (error) => {
      console.error('Error buying tickets:', error);
      toast.error('Failed to purchase tickets. Please try again.');
    },
  });

  const sellTicket = useMutation({
    mutationFn: async (numTickets: number) => {
      if (!provider.wallet.publicKey) throw new Error('Wallet not connected');
      const userPda = await getUserPDA(provider.wallet.publicKey, program.programId);
      const masterPda = await getMasterPDA();
      const masterAdminFees = new PublicKey(process.env.NEXT_PUBLIC_MASTER_ADMIN_FEES || "");

      return await program.methods
        .sellTicket(new anchor.BN(numTickets), 10)
        .accounts({
          userAccount: userPda,
          master: masterPda,
          user: provider.wallet.publicKey,
          admin: masterAdminFees,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-account'] });
      queryClient.invalidateQueries({ queryKey: ['master'] });
      toast.success('Tickets sold successfully!');
    },
    onError: (error) => {
      console.error('Error selling tickets:', error);
      toast.error('Failed to sell tickets. Please try again.');
    },
  });

  const joinGame = useMutation({
    mutationFn: async ({ gameId, tokenAddress }: { gameId: PublicKey; tokenAddress: PublicKey }) => {
      if (!provider.wallet.publicKey) throw new Error('Wallet not connected');
      const userPda = await getUserPDA(provider.wallet.publicKey, program.programId);
      const masterPda = await getMasterPDA();

      const [participationPda] = await PublicKey.findProgramAddress(
        [Buffer.from('participation'), gameId.toBuffer(), provider.wallet.publicKey.toBuffer(), tokenAddress.toBuffer()],
        program.programId
      );

      return await program.methods
        .joinGame(gameId.toString(), tokenAddress, new anchor.BN(1))
        .accounts({
          participation: participationPda,
          userAccount: userPda,
          master: masterPda,
          game: gameId,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['user-account'] });
      toast.success('Successfully joined the game!');
    },
    onError: (error) => {
      console.error('Error joining game:', error);
      toast.error('Failed to join the game. Please try again.');
    },
  });

  const claimPrize = useMutation({
    mutationFn: async ({ game, tokenAddress }: { game: any; tokenAddress: PublicKey }) => {
      if (!provider.wallet.publicKey) throw new Error('Wallet not connected');
  
      const gamePDA = game.id;
      const gameCreator = game.creator;
      const gameIndexCreator = game.indexGameByCreator;
  
      console.log("gamePDA", gamePDA.toString());
      console.log("gameCreator", gameCreator.toString());
      console.log("gameIndexCreator", gameIndexCreator);
  
      const [participationPda] = await PublicKey.findProgramAddress(
        [Buffer.from('participation'), gamePDA.toBuffer(), provider.wallet.publicKey.toBuffer(), tokenAddress.toBuffer()],
        program.programId
      );
      const userTokenAccount = await getAssociatedTokenAddress(
        tokenAddress,
        provider.wallet.publicKey,
        false
      );

      const gameTokenAccount = await getAssociatedTokenAddress(
        tokenAddress,
        new PublicKey(gamePDA),
        true
      );
  
      console.log("participationPda", participationPda.toString());
      console.log("userTokenAccount", userTokenAccount.toString());
      console.log("gameTokenAccount", gameTokenAccount.toString());
  
      const transaction = await program.methods
        .claimPrize(new anchor.BN(gameIndexCreator), gameCreator)
        .accounts({
          game: new PublicKey(gamePDA),
          participation: participationPda,
          user: provider.wallet.publicKey,
          userTokenAccount: userTokenAccount,
          gameTokenAccount: gameTokenAccount,
          tokenMint: tokenAddress,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .transaction();
  
      transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = provider.wallet.publicKey;
  
      // Sign and send transaction without preflight
      const signedTransaction = await provider.wallet.signTransaction(transaction);
      const txid = await provider.connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: true,
        maxRetries: 3, // Optional: Increase retries for potentially flaky networks
      });
  
      console.log("Transaction sent with txid:", txid);
      return txid;
    },
    onSuccess: () => {
      toast.success('Prize claimed successfully!');
    },
    onError: (error) => {
      console.error('Error claiming prize:', error);
      toast.error('Failed to claim prize. Please try again.');
    },
  });
  
  const closeParticipation = useMutation({
    mutationFn: async () => {
      if (!provider.wallet.publicKey) throw new Error('Wallet not connected');
  
      const [participationPda] = await PublicKey.findProgramAddress(
        [Buffer.from('participation'), new PublicKey(process.env.NEXT_PUBLIC_SAMPLE_GAME_ID || "").toBuffer(), provider.wallet.publicKey.toBuffer(), new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263").toBuffer()],
        program.programId
      );
  
      return await program.methods
        .closeParticipationAccount()
        .accounts({
          participation: participationPda,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      toast.success('Participation account closed successfully!');
    },
    onError: (error) => {
      console.error('Error closing participation account:', error);
      toast.error('Failed to close participation account. Please try again.');
    },
  });

  const closeGame = useMutation({
    mutationFn: async () => {
      if (!provider.wallet.publicKey) throw new Error('Wallet not connected');
  
      const gamePda = await getGamePDA(new PublicKey(process.env.NEXT_PUBLIC_GAME_CREATOR_WALLET || ""), 1, new PublicKey("PROGRAM_ID_REMOVED"));
      console.log("gamePda", gamePda.toString());

      return await program.methods
        .closeGameAccount()
        .accounts({
          game: gamePda,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
    },
  });
  

  return {
    program,
    programId,
    master,
    getProgramAccount,
    initialize,
    createGame,
    games,
    userAccount,
    buyTicket,
    sellTicket,
    walletBalance,
    joinGame,
    claimPrize,
    closeParticipation,
    closeGame
  };
}