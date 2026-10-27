/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/memetank.json`.
 */
export type Memetank = {
  address: "PROGRAM_ID_REMOVED";
  metadata: {
    name: "memetank";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "buyTicket";
      discriminator: [11, 24, 17, 193, 168, 116, 164, 169];
      accounts: [
        {
          name: "userAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "master";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 97, 115, 116, 101, 114];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "admin";
          writable: true;
        },
      ];
      args: [
        {
          name: "numTickets";
          type: "u64";
        },
        {
          name: "slippageBps";
          type: "u16";
        },
      ];
    },
    {
      name: "claimPrize";
      discriminator: [157, 233, 139, 121, 246, 62, 234, 235];
      accounts: [
        {
          name: "game";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 97, 109, 101];
              },
              {
                kind: "arg";
                path: "creator";
              },
              {
                kind: "arg";
                path: "indexGameByCreator";
              },
            ];
          };
        },
        {
          name: "participation";
          writable: true;
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "userTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "user";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: "account";
                path: "tokenMint";
              },
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: "gameTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "game";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: "account";
                path: "participation.token_address";
                account: "participation";
              },
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: "tokenMint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "indexGameByCreator";
          type: "u32";
        },
        {
          name: "creator";
          type: "pubkey";
        },
      ];
    },
    {
      name: "initializeGame";
      discriminator: [44, 62, 102, 247, 126, 208, 130, 215];
      accounts: [
        {
          name: "game";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 97, 109, 101];
              },
              {
                kind: "account";
                path: "user";
              },
              {
                kind: "arg";
                path: "numberGameCreated";
              },
            ];
          };
        },
        {
          name: "userAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "numberGameCreated";
          type: "u32";
        },
        {
          name: "numTokens";
          type: "u8";
        },
        {
          name: "numWinnersTokens";
          type: "u8";
        },
        {
          name: "totalWinnersSum";
          type: "u16";
        },
        {
          name: "totalDistributionSum";
          type: "u16";
        },
        {
          name: "name";
          type: {
            option: "string";
          };
        },
        {
          name: "startDate";
          type: "u64";
        },
        {
          name: "endDate";
          type: "u64";
        },
        {
          name: "initialReward";
          type: "f32";
        },
        {
          name: "tokens";
          type: {
            vec: "pubkey";
          };
        },
        {
          name: "winners";
          type: {
            vec: {
              defined: {
                name: "winnerInfo";
              };
            };
          };
        },
      ];
    },
    {
      name: "initializeMaster";
      discriminator: [206, 91, 246, 30, 216, 101, 134, 166];
      accounts: [
        {
          name: "master";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 97, 115, 116, 101, 114];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "adminSwap";
          type: "pubkey";
        },
        {
          name: "adminFees";
          type: "pubkey";
        },
      ];
    },
    {
      name: "joinGame";
      discriminator: [107, 112, 18, 38, 56, 173, 60, 128];
      accounts: [
        {
          name: "participation";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  116,
                  105,
                  111,
                  110,
                ];
              },
              {
                kind: "account";
                path: "game";
              },
              {
                kind: "account";
                path: "user";
              },
              {
                kind: "arg";
                path: "tokenAddress";
              },
            ];
          };
        },
        {
          name: "userAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "master";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 97, 115, 116, 101, 114];
              },
            ];
          };
        },
        {
          name: "game";
          writable: true;
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "gameId";
          type: "string";
        },
        {
          name: "tokenAddress";
          type: "pubkey";
        },
        {
          name: "numTickets";
          type: "u64";
        },
      ];
    },
    {
      name: "pickWinner";
      discriminator: [227, 62, 25, 73, 132, 106, 68, 96];
      accounts: [
        {
          name: "game";
          writable: true;
        },
        {
          name: "creator";
          writable: true;
        },
        {
          name: "master";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 97, 115, 116, 101, 114];
              },
            ];
          };
        },
        {
          name: "adminFees";
          writable: true;
        },
        {
          name: "adminSwap";
          writable: true;
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "tokenAddresses";
          type: {
            vec: "string";
          };
        },
        {
          name: "tokenVolumes";
          type: {
            vec: "f32";
          };
        },
      ];
    },
    {
      name: "sellTicket";
      discriminator: [222, 99, 130, 10, 204, 2, 58, 171];
      accounts: [
        {
          name: "userAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 115, 101, 114];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "master";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 97, 115, 116, 101, 114];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "admin";
          writable: true;
        },
      ];
      args: [
        {
          name: "numTickets";
          type: "u64";
        },
        {
          name: "slippageBps";
          type: "u16";
        },
      ];
    },
    {
      name: "transferTokensToGame";
      discriminator: [226, 176, 120, 84, 171, 230, 115, 117];
      accounts: [
        {
          name: "game";
          writable: true;
        },
        {
          name: "master";
          writable: true;
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "mintAccount";
          writable: true;
        },
        {
          name: "senderTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "user";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: "account";
                path: "mintAccount";
              },
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: "gameTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "game";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: "account";
                path: "mintAccount";
              },
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: "adminSwap";
          writable: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "game";
      discriminator: [27, 90, 166, 125, 74, 100, 121, 18];
    },
    {
      name: "master";
      discriminator: [168, 213, 193, 12, 77, 162, 58, 235];
    },
    {
      name: "participation";
      discriminator: [237, 154, 142, 46, 143, 63, 189, 18];
    },
    {
      name: "user";
      discriminator: [159, 117, 95, 227, 239, 151, 58, 236];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "gameNotEndedOrAlreadyEnded";
      msg: "The game has not ended yet or has already been marked as ended.";
    },
    {
      code: 6001;
      name: "zeroTokenVolume";
      msg: "Total token volume cannot be zero.";
    },
    {
      code: 6002;
      name: "invalidTicketAmount";
      msg: "Number of tickets is out of allowed range.";
    },
    {
      code: 6003;
      name: "invalidSlippageBps";
      msg: "Slippage basis points (BPS) is out of allowed range.";
    },
    {
      code: 6004;
      name: "illegalOwner";
      msg: "User account does not match provided public key.";
    },
    {
      code: 6005;
      name: "insufficientFunds";
      msg: "Master account does not have enough funds.";
    },
    {
      code: 6006;
      name: "insufficientTickets";
      msg: "User does not have enough tickets to sell.";
    },
    {
      code: 6007;
      name: "mismatchedTokenCount";
      msg: "The number of tokens provided does not match the specified number.";
    },
    {
      code: 6008;
      name: "mismatchedWinnerCount";
      msg: "The number of winners provided does not match the specified number.";
    },
    {
      code: 6009;
      name: "mismatchedDistributionSum";
      msg: "The total distribution sum does not match the calculated distribution sum.";
    },
    {
      code: 6010;
      name: "gameNameTooLong";
      msg: "The game name exceeds the maximum allowed length.";
    },
    {
      code: 6011;
      name: "mismatchedWinnersSum";
      msg: "The total winners sum does not match the calculated winners sum.";
    },
    {
      code: 6012;
      name: "duplicateTokens";
      msg: "Duplicate tokens detected; all token addresses must be unique.";
    },
    {
      code: 6013;
      name: "distributionNameTooLong";
      msg: "A winner distribution name exceeds the maximum allowed length.";
    },
    {
      code: 6014;
      name: "totalWinnerPercentageTooLow";
      msg: "The total percentage for all winners is below the required threshold of 99.8%.";
    },
    {
      code: 6015;
      name: "distributionPercentageTooLow";
      msg: "The total distribution percentage for a winner is below the required threshold of 99.8%.";
    },
    {
      code: 6016;
      name: "gameNotActive";
      msg: "Game is not currently active.";
    },
    {
      code: 6017;
      name: "invalidNumberOfTickets";
      msg: "Invalid number of tickets.";
    },
    {
      code: 6018;
      name: "exceededMaxTicketRanges";
      msg: "Exceeded the maximum number of ticket ranges allowed.";
    },
    {
      code: 6019;
      name: "gameNotEnded";
      msg: "The game has not ended yet.";
    },
    {
      code: 6020;
      name: "alreadyClaimed";
      msg: "Participation has already been claimed.";
    },
    {
      code: 6021;
      name: "signerMismatch";
      msg: "Signer does not match participation user_pubkey.";
    },
    {
      code: 6022;
      name: "gameIdMismatch";
      msg: "Game ID mismatch.";
    },
    {
      code: 6023;
      name: "tokenNotFoundInGame";
      msg: "Token not found in game tokens.";
    },
    {
      code: 6024;
      name: "tokenSwapIncomplete";
      msg: "Token swap has not been completed for this token.";
    },
    {
      code: 6025;
      name: "missingFinalPosition";
      msg: "Token does not have a final position.";
    },
    {
      code: 6026;
      name: "winnerInfoNotFound";
      msg: "Winner information not found for the specified position.";
    },
    {
      code: 6027;
      name: "zeroPrizeAmount";
      msg: "Calculated prize amount is zero.";
    },
    {
      code: 6028;
      name: "unauthorizedAdminSwap";
      msg: "User is not authorized as the admin swap.";
    },
    {
      code: 6029;
      name: "tokenSwapAlreadyDone";
      msg: "Token swap has already been completed for this token.";
    },
    {
      code: 6030;
      name: "unauthorizedCreateGameUser";
      msg: "User not authorized to create game.";
    },
  ];
  types: [
    {
      name: "game";
      type: {
        kind: "struct";
        fields: [
          {
            name: "id";
            type: "pubkey";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "indexGameByCreator";
            type: "u32";
          },
          {
            name: "num";
            type: "u32";
          },
          {
            name: "isEnded";
            type: "bool";
          },
          {
            name: "startDate";
            type: "u64";
          },
          {
            name: "endDate";
            type: "u64";
          },
          {
            name: "totalReward";
            type: "f32";
          },
          {
            name: "remainingReward";
            type: "f32";
          },
          {
            name: "initialReward";
            type: "f32";
          },
          {
            name: "name";
            type: {
              option: "string";
            };
          },
          {
            name: "tokens";
            type: {
              vec: {
                defined: {
                  name: "tokenInfo";
                };
              };
            };
          },
          {
            name: "winners";
            type: {
              vec: {
                defined: {
                  name: "winnerInfo";
                };
              };
            };
          },
        ];
      };
    },
    {
      name: "master";
      type: {
        kind: "struct";
        fields: [
          {
            name: "totalNumberTicket";
            type: "u64";
          },
          {
            name: "adminFees";
            type: "pubkey";
          },
          {
            name: "adminSwap";
            type: "pubkey";
          },
          {
            name: "ticketBuyPrice";
            type: "f32";
          },
          {
            name: "ticketSellPrice";
            type: "f32";
          },
          {
            name: "allTimeVolume";
            type: "f32";
          },
        ];
      };
    },
    {
      name: "participation";
      type: {
        kind: "struct";
        fields: [
          {
            name: "userPubkey";
            type: "pubkey";
          },
          {
            name: "gameId";
            type: "string";
          },
          {
            name: "tokenAddress";
            type: "pubkey";
          },
          {
            name: "ranges";
            type: {
              vec: {
                defined: {
                  name: "ticketRange";
                };
              };
            };
          },
          {
            name: "isClaimed";
            type: "bool";
          },
          {
            name: "totalSpend";
            type: {
              option: "f32";
            };
          },
          {
            name: "totalTicketsEntered";
            type: {
              option: "u32";
            };
          },
        ];
      };
    },
    {
      name: "ticketRange";
      type: {
        kind: "struct";
        fields: [
          {
            name: "start";
            type: "u32";
          },
          {
            name: "end";
            type: "u32";
          },
        ];
      };
    },
    {
      name: "tokenInfo";
      type: {
        kind: "struct";
        fields: [
          {
            name: "numberOfTickets";
            type: "u64";
          },
          {
            name: "tokenAddress";
            type: "pubkey";
          },
          {
            name: "isWinner";
            type: "bool";
          },
          {
            name: "positionFinal";
            type: {
              option: "u8";
            };
          },
          {
            name: "totalAmountWalletSol";
            type: "f32";
          },
          {
            name: "totalAmountWalletToken";
            type: "u64";
          },
          {
            name: "swapDone";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "user";
      type: {
        kind: "struct";
        fields: [
          {
            name: "userPubkey";
            type: "pubkey";
          },
          {
            name: "numberTickets";
            type: "u64";
          },
          {
            name: "numberGameCreated";
            type: "u32";
          },
          {
            name: "freeTicketReceived";
            type: {
              option: "bool";
            };
          },
          {
            name: "freeSuperteamTicketReceived";
            type: {
              option: "bool";
            };
          },
          {
            name: "points";
            type: {
              option: "u64";
            };
          },
          {
            name: "numberReferralsDone";
            type: {
              option: "u32";
            };
          },
          {
            name: "referralParent";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "referralCode";
            type: {
              option: "string";
            };
          },
        ];
      };
    },
    {
      name: "winnerDistribution";
      type: {
        kind: "struct";
        fields: [
          {
            name: "percentage";
            type: "f32";
          },
          {
            name: "numWinners";
            type: "u8";
          },
          {
            name: "fairDistributionAll";
            type: "bool";
          },
          {
            name: "name";
            type: "string";
          },
          {
            name: "ticketIds";
            type: {
              vec: "u32";
            };
          },
          {
            name: "percentageWinners";
            type: {
              option: "u8";
            };
          },
        ];
      };
    },
    {
      name: "winnerInfo";
      type: {
        kind: "struct";
        fields: [
          {
            name: "position";
            type: "u8";
          },
          {
            name: "percentage";
            type: "f32";
          },
          {
            name: "tokenAddress";
            type: "pubkey";
          },
          {
            name: "winnerDistribution";
            type: {
              vec: {
                defined: {
                  name: "winnerDistribution";
                };
              };
            };
          },
        ];
      };
    },
  ];
};
