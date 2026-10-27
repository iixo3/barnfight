"use client";

import { getMemetankProgram, getMemetankProgramId } from "./idl/idl-export";
import { Program } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Cluster,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCluster } from "./cluster/cluster-data-access";
import { useAnchorProvider } from "../shared/providers/solana-provider";
import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import toast from "react-hot-toast";
import { Participation } from "@/shared/types/games/games";
import { useGameDataContext } from "./game-data-context";
import { useGetUserParticipationForAGame } from "@/shared/hooks/user/use-get-user-participations";

export function useMemetankProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getMemetankProgramId(cluster?.network as Cluster),
    [cluster]
  );
  const ADMIN_WALLET_FEES = process.env.NEXT_PUBLIC_ADMIN_WALLET_FEES || "";
  const program = getMemetankProgram(provider);

  const getUserPDA = async (wallet: PublicKey, programId: PublicKey) => {
    const [userPda] = await PublicKey.findProgramAddress(
      [Buffer.from("user"), wallet.toBuffer()],
      programId
    );
    return userPda;
  };

  const getGamePdaFromAddress = async (gameAddress: string) => {
    return await program.account.game.fetch(new PublicKey(gameAddress));
  };

  const useGameData = (gameAddress: string) => {
    const { gameData, setGameData, clearData } = useGameDataContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      let unsubscribe: () => void;

      const getGamePdaFromAddress = async () => {
        try {
          clearData();

          const gameListener = program.account.game.subscribe(
            new PublicKey(gameAddress)
          );

          gameListener.on("change", (updatedGame: any) => {
            setGameData(updatedGame);
          });

          const fetchedGameData = await program.account.game.fetch(
            new PublicKey(gameAddress)
          );
          setGameData(fetchedGameData);

          unsubscribe = () => {
            gameListener.removeAllListeners();
          };
        } catch (error) {
          console.error("Error fetching game data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      getGamePdaFromAddress();

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [gameAddress]);

    return { game: gameData, isLoadingInitial: isLoading };
  };

  const useTokenParticipationCached = (
    gameId: string,
    tokenList: PublicKey[]
  ) => {
    const { participations, setParticipations } = useGameDataContext();

    return useQuery({
      queryKey: ["token-participation", gameId, tokenList.sort()],
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      queryFn: async () => {
        let newParticipations = [];
        for (const tokenAddress of tokenList) {
          const [participationPda] = await PublicKey.findProgramAddress(
            [
              Buffer.from("participation"),
              new PublicKey(gameId).toBuffer(),
              provider.wallet.publicKey.toBuffer(),
              tokenAddress.toBuffer(),
            ],
            program.programId
          );
          const participation =
            await program.account.participation.fetchNullable(participationPda);
          const ticketsBought = participation
            ? sumTicketRanges(participation.ranges)
            : 0;
          const ranges = participation ? participation.ranges : [];
          const totalSpend = participation ? participation.totalSpend : 0;
          const totalTicketsEntered = participation
            ? participation.totalTicketsEntered
            : 0;
          newParticipations.push({
            tokenAddress,
            ticketsBought,
            ranges,
            totalSpend,
            totalTicketsEntered,
          });
        }
        return newParticipations;
      },
    });
  };

  const useTokenParticipation = (gameId: string, tokenList: PublicKey[]) => {
    const { participations, setParticipations } = useGameDataContext();
    const [isLoading, setIsLoading] = useState(true);
    const hashKey =
      gameId + tokenList?.map((token) => token.toString()).join(",");

    useEffect(() => {
      let unsubscribeFunctions: (() => void)[] = [];

      const fetchParticipations = async () => {
        try {
          const newParticipations = [];

          for (const tokenAddress of tokenList) {
            let participationPda = null;
            if (provider.wallet.publicKey) {
              const pdaObject = await PublicKey.findProgramAddress(
                [
                  Buffer.from("participation"),
                  new PublicKey(gameId).toBuffer(),
                  provider.wallet.publicKey.toBuffer(),
                  tokenAddress.toBuffer(),
                ],
                program.programId
              );

              participationPda = pdaObject[0];
            }

            let participation: any | null = {
              tokenAddress,
              ticketsBought: 0,
              ranges: [],
              totalSpend: 0,
              totalTicketsEntered: 0,
            };

            if (participationPda) {
              participation = await program.account.participation.fetchNullable(
                participationPda
              );
            }

            const ticketsBought = participation
              ? sumTicketRanges(participation.ranges)
              : 0;
            const ranges = participation ? participation.ranges : [];
            const totalSpend = participation ? participation.totalSpend : 0;
            const totalTicketsEntered = participation
              ? participation.totalTicketsEntered
              : 0;

            newParticipations.push({
              tokenAddress,
              ticketsBought,
              ranges,
              totalSpend,
              totalTicketsEntered,
            });

            if (participationPda) {
              const listener =
                program.account.participation.subscribe(participationPda);

              listener.on("change", (updatedParticipation: any) => {
                const updatedTickets = updatedParticipation
                  ? sumTicketRanges(updatedParticipation.ranges)
                  : 0;

                setParticipations((prevState: Participation[]) => {
                  const updatedState: Participation[] = prevState.map(
                    (item: Participation) =>
                      item.tokenAddress.equals(tokenAddress)
                        ? {
                            ...item,
                            ticketsBought: updatedTickets,
                            ranges: updatedParticipation.ranges,
                            total_spend: updatedParticipation.total_spend,
                            total_tickets_entered:
                              updatedParticipation.total_tickets_entered,
                          }
                        : item
                  );
                  return updatedState;
                });
              });
              unsubscribeFunctions.push(() => {
                listener.removeAllListeners();
              });
            }
          }

          setParticipations(newParticipations);
        } catch (error) {
          console.error("Error fetching token participations:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchParticipations();

      return () => {
        unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
      };
    }, [gameId, provider.wallet.publicKey, hashKey, tokenList]);

    return { participations, isLoading };
  };

  const useClaimPrizeAvailability = () => {
    const [isWinner, setIsWinner] = useState(false);
    const [isClaimAlreadyDone, setIsClaimAlreadyDone] = useState(false);
    const [isClaimable, setIsClaimable] = useState(false);
    const [stakesEntered, setStakesEntered] = useState(0);
    const [enhancedParticipations, setEnhancedParticipations] = useState(
      [] as any[]
    );
    const { gameData, participations, setParticipationTokensWinner } =
      useGameDataContext();

    const { data: userGameParticipations } = useGetUserParticipationForAGame(
      provider.wallet.publicKey?.toString(),
      gameData?.id?.toString()
    );

    useEffect(() => {
      if (!provider.wallet.publicKey) {
        setIsWinner(false);
        setIsClaimAlreadyDone(false);
        setIsClaimable(false);
        return;
      }

      if (!gameData?.isEnded) {
        setIsWinner(false);
        setIsClaimAlreadyDone(false);
        setIsClaimable(false);

        const uniqueProjectsEntered = participations.filter(
          (participation) => (participation.totalTicketsEntered ?? 0) > 0
        ).length;

        setStakesEntered(uniqueProjectsEntered);

        const enhancedParticipations = participations.map((participation) => {
          return {
            ...participation,
            isWinner: false,
            isClaimAlreadyDone: false,
            prizeDistribution: [],
            amountRewardWon: 0,
            ROI: 0,
          };
        });
        setEnhancedParticipations(enhancedParticipations);

        return;
      }

      const winnerTokenAddresses = gameData.tokens
        .filter((token) => token.isWinner)
        .map((token) => token.tokenAddress.toString());

      const matchingParticipations = participations.filter(
        (participation) =>
          winnerTokenAddresses.includes(
            participation.tokenAddress.toString()
          ) && participation.ticketsBought > 0
      );

      if (matchingParticipations.length === 0) {
        setIsWinner(false);
        setIsClaimAlreadyDone(false);
        return;
      }

      const matchingWinners = gameData.winners.filter((winner) =>
        matchingParticipations.some(
          (participation) =>
            winner.tokenAddress.toString() ===
            participation.tokenAddress.toString()
        )
      );

      if (matchingWinners.length === 0) {
        setIsWinner(false);
        setIsClaimAlreadyDone(false);
        return;
      }

      let eligibleWinTokens: string[] = [];
      let eligibleClaimTokens: string[] = [];
      const swapDoneTokens: string[] = [];
      const rewardMap: { [tokenAddress: string]: number } = {};

      matchingWinners.forEach((matchingWinner) => {
        matchingWinner.winnerDistribution.forEach((distribution) => {
          if (distribution.fairDistributionAll) {
            if (
              !eligibleWinTokens.includes(
                matchingWinner.tokenAddress.toString()
              )
            ) {
              eligibleWinTokens.push(matchingWinner.tokenAddress.toString());
            }
            const token = gameData.tokens.find(
              (token) =>
                token.tokenAddress.toString() ===
                matchingWinner.tokenAddress.toString()
            );
            if (token && distribution.percentage) {
              const totalRewardForToken = token.totalAmountWalletSol;
              const rewardWon =
                (distribution.percentage / 100) * totalRewardForToken;
              rewardMap[matchingWinner.tokenAddress.toString()] = rewardWon;
            }
            if (
              token &&
              token.swapDone &&
              !swapDoneTokens.includes(matchingWinner.tokenAddress.toString())
            ) {
              swapDoneTokens.push(matchingWinner.tokenAddress.toString());
            }
          } else {
            matchingParticipations.forEach((participation) => {
              if (
                participation.tokenAddress.toString() ===
                matchingWinner.tokenAddress.toString()
              ) {
                participation.ranges.forEach((range) => {
                  if (
                    distribution.ticketIds.some(
                      (ticketId) =>
                        ticketId >= range.start && ticketId <= range.end
                    )
                  ) {
                    if (
                      !eligibleWinTokens.includes(
                        matchingWinner.tokenAddress.toString()
                      )
                    ) {
                      eligibleWinTokens.push(
                        matchingWinner.tokenAddress.toString()
                      );
                    }
                    const token = gameData.tokens.find(
                      (token) =>
                        token.tokenAddress.toString() ===
                        matchingWinner.tokenAddress.toString()
                    );
                    if (
                      token &&
                      token.swapDone &&
                      !swapDoneTokens.includes(
                        matchingWinner.tokenAddress.toString()
                      )
                    ) {
                      swapDoneTokens.push(
                        matchingWinner.tokenAddress.toString()
                      );
                    }
                    if (token && distribution.percentage) {
                      const totalRewardForToken = token.totalAmountWalletSol;
                      const userPercentage = distribution.percentage;
                      const rewardWon =
                        (userPercentage / 100) * totalRewardForToken;
                      rewardMap[matchingWinner.tokenAddress.toString()] =
                        (rewardMap[matchingWinner.tokenAddress.toString()] ||
                          0) + rewardWon;
                    }
                  }
                });
              }
            });
          }
        });
      });

      const isWinner = eligibleWinTokens.length > 0;
      const isSwap = swapDoneTokens.length === eligibleWinTokens.length;

      if (userGameParticipations) {
        eligibleClaimTokens = eligibleWinTokens.filter((token) => {
          return !userGameParticipations.some(
            (participation) =>
              participation.data().token_address === token &&
              participation.data().is_claimed
          );
        });
      }

      setParticipationTokensWinner(eligibleClaimTokens);
      setIsWinner(isWinner);
      setIsClaimAlreadyDone(
        isWinner && isSwap && eligibleClaimTokens.length === 0
      );
      setIsClaimable(isWinner && isSwap && eligibleClaimTokens.length > 0);

      const uniqueProjectsEntered = participations.filter(
        (participation) => (participation.totalTicketsEntered ?? 0) > 0
      ).length;

      setStakesEntered(uniqueProjectsEntered);

      const enhancedParticipations = participations.map((participation) => {
        const isWinnerToken = eligibleWinTokens.includes(
          participation.tokenAddress.toString()
        );

        const hasClaimed = userGameParticipations
          ? userGameParticipations.some(
              (userParticipation) =>
                userParticipation.data().token_address ===
                  participation.tokenAddress.toString() &&
                userParticipation.data().is_claimed
            )
          : false;

        const prizeDistribution = matchingWinners.find(
          (winner) =>
            winner.tokenAddress.toString() ===
            participation.tokenAddress.toString()
        )?.winnerDistribution;

        const amountRewardWon =
          rewardMap[participation.tokenAddress.toString()] || 0;

        const totalSpend = participation.totalSpend || 0;
        const ROI =
          totalSpend > 0
            ? parseFloat(
                (((amountRewardWon - totalSpend) / totalSpend) * 100).toFixed(1)
              )
            : 0;

        const isClaimableToken = eligibleClaimTokens.includes(
          participation.tokenAddress.toString()
        );

        return {
          ...participation,
          isWinner: isWinnerToken,
          isClaimAlreadyDone: hasClaimed,
          isClaimable: isClaimableToken,
          prizeDistribution: prizeDistribution || [],
          amountRewardWon,
          ROI,
        };
      });
      setEnhancedParticipations(enhancedParticipations);
    }, [gameData, participations]);

    return {
      isWinner,
      isClaimAlreadyDone,
      isClaimable,
      enhancedParticipations,
      stakesEntered,
    };
  };

  const sumTicketRanges = (ranges: any[]): number => {
    return ranges.reduce(
      (total, range) => total + (range.end - range.start + 1),
      0
    );
  };

  const getMemeTankUserPDA = async (wallet: PublicKey) => {
    const [userPda] = await PublicKey.findProgramAddress(
      [Buffer.from("user"), wallet.toBuffer()],
      program.programId
    );
    return userPda;
  };

  const getMasterPDA = async () => {
    const [masterPda] = await PublicKey.findProgramAddress(
      [Buffer.from("master")],
      program.programId
    );
    return masterPda;
  };

  const getGamePDA = async (
    userWallet: PublicKey,
    gameNumber: number,
    programId: PublicKey
  ) => {
    const [gamePda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("game"),
        userWallet.toBuffer(),
        new anchor.BN(gameNumber).toArrayLike(Buffer, "le", 4),
      ],
      programId
    );
    return gamePda;
  };

  const master = useQuery({
    queryKey: ["master", { cluster }],
    queryFn: async () => {
      const masterPda = await getMasterPDA();
      const account = await program.account.master.fetch(masterPda);
      return { account, pda: masterPda };
    },
  });

  /*const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });*/

  /*const walletBalance = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      if (!provider.wallet.publicKey) return null;
      const balance = await connection.getBalance(provider.wallet.publicKey);
      const LAMPORTS_PER_SOL = 1000000000;
      return { balance: balance / LAMPORTS_PER_SOL };
    },
  });*/

  const initialize = useMutation({
    mutationKey: ["master", "initialize-master", { cluster }],
    mutationFn: async () => {
      const masterPda = await getMasterPDA();

      return await program.methods
        .initializeMaster(new PublicKey("xxx"), new PublicKey("xxx"))
        .accounts({
          master: masterPda,
          user: provider.publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
    },
    onSuccess: (signature) => {
      return master.refetch();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const userAccount = useQuery({
    queryKey: [
      "user-account",
      { cluster, publicKey: provider.wallet.publicKey?.toString() },
    ],
    queryFn: async () => {
      if (!provider.wallet.publicKey) return null;
      const userPda = await getUserPDA(
        provider.wallet.publicKey,
        program.programId
      );
      const account = await program.account.user.fetch(userPda);
      return { account, pda: userPda };
    },
    enabled: !!provider.wallet.publicKey?.toString(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const createGame = useMutation({
    mutationKey: ["game", "create-game", { cluster }],
    mutationFn: async (gameForm: any) => {
      const userPda = await getUserPDA(
        provider.wallet.publicKey,
        program.programId
      );

      let userAccount;
      try {
        userAccount = await program.account.user.fetch(userPda);
      } catch (error) {
        userAccount = { numberGameCreated: 0 };
      }

      const numberGameCreated = new anchor.BN(userAccount.numberGameCreated);
      const gamePda = await getGamePDA(
        provider.wallet.publicKey,
        numberGameCreated.toNumber(),
        program.programId
      );

      const startDate = new anchor.BN(Date.now() / 1000);
      const endDate = new anchor.BN(
        Date.now() / 1000 + gameForm.game_length * 60
      );
      const bigBlind = parseFloat(gameForm.blinds.blind);
      const name = gameForm.name;

      //@ts-ignore
      const winners = gameForm.winners_distribution.map((winner) => ({
        position: winner.place,
        percentage: 100 / gameForm.winners_places.length,
        tokenWinner: "",
        //@ts-ignore
        winnerDistribution: winner?.tickets?.map((ticket) => ({
          percentage: winner.winning_equally
            ? 100
            : parseFloat(ticket.percentage) * parseFloat(ticket.multiply),
          numWinners: winner.winning_equally ? 1 : parseFloat(ticket.multiply),
          fairDistributionAll: winner.winning_equally,
          name: ticket.name,
          ticketIds: [],
          percentageWinners: 0,
        })),
      }));

      //@ts-ignore
      const tokens = gameForm.contract_addresses.map(
        //@ts-ignore
        (contract) => new PublicKey(contract.contract)
      );
      // TODO: Fix here in case dataForm > winners > winnerDistribution
      // If the form already has two ticket winners in the winner spot
      // and the split is true, return only one object instead of two
      const signature = await program.methods
        .initializeGame(
          numberGameCreated,
          tokens.length,
          winners.length,
          //@ts-ignore
          winners.reduce(
            //@ts-ignore
            (acc, winner) =>
              acc +
              winner.winnerDistribution.reduce(
                //@ts-ignore
                (innerAcc, distribution) => innerAcc + distribution.numWinners,
                0
              ),
            0
          ), // sum of all number of winners in each winners list
          //@ts-ignore
          winners.reduce(
            //@ts-ignore
            (acc, winner) => acc + winner.winnerDistribution.length,
            0
          ),
          name,
          startDate,
          endDate,
          bigBlind,
          tokens,
          winners
        )
        .accounts({
          //@ts-ignore
          game: gamePda,
          userAccount: userPda,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      if (signature) {
        return gamePda.toString();
      }
      return "";
    },
    onSuccess: (gamePda: string) => {
      if (gamePda && gamePda != "") {
        setTimeout(() => {
          window.location.href = `/game/${gamePda}`;
        }, 1500);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const games = useQuery({
    queryKey: ["games", { cluster }],
    queryFn: async () => {
      const games = await program.account.game.all();
      return games;
    },
  });

  const buyTicket = useMutation({
    mutationFn: async ({
      numTickets,
      slippage,
    }: {
      numTickets: number;
      slippage: number;
    }) => {
      if (!provider.wallet.publicKey) throw new Error("Wallet not connected");
      const userPda = await getUserPDA(
        provider.wallet.publicKey,
        program.programId
      );
      const masterPda = await getMasterPDA();
      const masterAdminFees = new PublicKey(ADMIN_WALLET_FEES);

      return await program.methods
        .buyTicket(new anchor.BN(numTickets), slippage * 100) // Slippage from 0.1% to 30%
        .accounts({
          //@ts-ignore
          userAccount: userPda,
          master: masterPda,
          user: provider.wallet.publicKey,
          admin: masterAdminFees,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: () => {
      toast.success("Successfully bought tickets");
    },
    onError: (error) => {
      toast.error("Something went wrong buying your tickets, try again later");
    },
  });

  const sellTicket = useMutation({
    mutationFn: async ({
      numTickets,
      slippage,
    }: {
      numTickets: number;
      slippage: number;
    }) => {
      if (!provider.wallet.publicKey) throw new Error("Wallet not connected");
      const userPda = await getUserPDA(
        provider.wallet.publicKey,
        program.programId
      );
      const masterPda = await getMasterPDA();
      const masterAdminFees = new PublicKey(ADMIN_WALLET_FEES);

      return await program.methods
        .sellTicket(new anchor.BN(numTickets), slippage * 100)
        .accounts({
          //@ts-ignore
          userAccount: userPda,
          master: masterPda,
          user: provider.wallet.publicKey,
          admin: masterAdminFees,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: () => {},
    onError: (error) => {
      toast.error("Something went wrong selling your tickets, try again later");
    },
  });

  const joinGame = useMutation({
    mutationFn: async (joinGameForm: any) => {
      const gameAddress = new PublicKey(joinGameForm.gameId);
      const tokenAddress = new PublicKey(joinGameForm.tokenAddress);
      const ticketAmount = joinGameForm.ticketAmount;

      if (!provider.wallet.publicKey) throw new Error("Wallet not connected");
      const userPda = await getUserPDA(
        provider.wallet.publicKey,
        program.programId
      );
      const masterPda = await getMasterPDA();

      const [participationPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("participation"),
          gameAddress.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
          tokenAddress.toBuffer(),
        ],
        program.programId
      );

      let currentTickets = 0;
      try {
        const userAccountData = await program.account.user.fetch(userPda);
        currentTickets = userAccountData?.numberTickets || 0;
      } catch (error) {
        console.warn("userPda not found, assuming currentTickets is 0");
      }
      const ticketsMissing = ticketAmount - currentTickets;

      const transaction = new Transaction();

      // If tickets are missing, add a buy ticket instruction
      if (ticketsMissing > 0) {
        const buyTicketsInstruction = await program.methods
          .buyTicket(new anchor.BN(ticketsMissing), 10) // 0.1% slippage
          .accounts({
            //@ts-ignore
            userAccount: userPda,
            master: masterPda,
            user: provider.wallet.publicKey,
            admin: new PublicKey(ADMIN_WALLET_FEES),
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        transaction.add(buyTicketsInstruction);
      }

      // Add the joinGame instruction
      const joinGameInstruction = await program.methods
        .joinGame(
          joinGameForm.gameId,
          tokenAddress,
          new anchor.BN(ticketAmount)
        )
        .accounts({
          //@ts-ignore
          participation: participationPda,
          userAccount: userPda,
          master: masterPda,
          game: gameAddress,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      transaction.add(joinGameInstruction);

      // Send the transaction
      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: false,
        preflightCommitment: "processed",
      });

      return signature;
    },
    onSuccess: (signature) => {
      console.log("signature", signature);
      toast.success("Successfully joined the game");
    },
    onError: (error) => {
      console.error("Error joining game:", error);
      toast.error("Something went wrong, try again later");
    },
  });

  const claimPrize = async (
    gameData: any,
    tokenAddressWinner: string[]
  ): Promise<string> => {
    if (!provider.wallet.publicKey) throw new Error("Wallet not connected");

    if (gameData && tokenAddressWinner && tokenAddressWinner.length > 0) {
      const gamePDA = gameData.id;
      const gameCreator = gameData.creator;
      const gameIndexCreator = gameData.index_game_by_creator;

      const transaction = new Transaction();

      for (const tokenAddressStr of tokenAddressWinner) {
        const tokenAddress = new PublicKey(tokenAddressStr);

        const [participationPda] = await PublicKey.findProgramAddress(
          [
            Buffer.from("participation"),
            new PublicKey(gamePDA).toBuffer(),
            provider.wallet.publicKey.toBuffer(),
            tokenAddress.toBuffer(),
          ],
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

        const instruction = await program.methods
          .claimPrize(
            new anchor.BN(gameIndexCreator),
            new PublicKey(gameCreator)
          )
          .accounts({
            // @ts-ignore
            game: new PublicKey(gamePDA),
            participation: participationPda,
            user: provider.wallet.publicKey,
            userTokenAccount: userTokenAccount,
            gameTokenAccount: gameTokenAccount,
            tokenMint: tokenAddress,
            tokenProgram: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ),
            associatedTokenProgram: new PublicKey(
              "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
            ),
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .instruction();

        transaction.add(instruction);
      }

      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: false,
        preflightCommitment: "processed",
      });
      return signature;
    }

    return "";
  };

  return {
    program,
    programId,
    master,
    //getProgramAccount,
    initialize,
    createGame,
    games,
    userAccount,
    buyTicket,
    sellTicket,
    //walletBalance,
    joinGame,
    claimPrize,
    getMemeTankUserPDA,
    getGamePdaFromAddress,
    useGameData,
    useTokenParticipation,
    useClaimPrizeAvailability,
    useTokenParticipationCached,
  };
}
