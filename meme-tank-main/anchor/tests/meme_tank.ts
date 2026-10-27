import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Memetank } from "../target/types/memetank";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";

describe("Memetank", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const rpcUrl = process.env.SOLANA_RPC_URL || "";
  const connection = new anchor.web3.Connection(rpcUrl, "confirmed");
  const wallet = anchor.AnchorProvider.env().wallet;
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  const program = anchor.workspace.Memetank as Program<Memetank>;
  anchor.setProvider(provider);

  it("Initializes the master PDA!", async () => {
    const [masterPda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("master")],
      program.programId
    );

    const tx = await program.methods
      .initializeMaster(new PublicKey(process.env.MASTER_ADMIN_SWAP || ""), new PublicKey(process.env.MASTER_ADMIN_FEES || ""))
      .accounts({
        master: masterPda,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const masterAccount = await program.account.master.fetch(masterPda);

    if (masterAccount.totalNumberTicket.toNumber() !== 0) {
      throw new Error("Initialization failed, total_number_ticket is not 0");
    }
  });

  /*it("Initializes the game PDA!", async () => {
    const gameSeed = "game";
    const numberGameCreated = 0;

    const [gamePda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(gameSeed), provider.wallet.publicKey.toBuffer(), new anchor.BN(numberGameCreated).toArrayLike(Buffer, 'le', 4)],
      program.programId
    );

    const startDate = new anchor.BN(Date.now() / 1000);
    const endDate = new anchor.BN(Date.now() / 1000 + 86400);
    const initialReward = 0.1;
    const name = "Test Game";

    const winners = [
      {
        position: 1,
        percentage: 75,
        winnerDistribution: [
          {
            percentage: 100,
            numWinners: 1,
            fairDistributionAll: true,
          }
        ],
      },
      {
        position: 2,
        percentage: 25,
        winnerDistribution: [
          {
            percentage: 100,
            numWinners: 1,
            fairDistributionAll: false,
          },
        ],
      },
    ];

    const tokens = [
      {
        name: "Token1",
        numberOfTickets: new anchor.BN(0),
        symbol: "TK1",
        tokenAddress: new PublicKey("So11111111111111111111111111111111111111112"),
        isWinner: false,
        winnerListId: null,
        positionFinal: null
      },
      {
        name: "Token2",
        numberOfTickets: new anchor.BN(0),
        symbol: "TK2",
        tokenAddress: new PublicKey("So11111111111111111111111111111111111111113"),
        isWinner: false,
        winnerListId: null,
        positionFinal: null
      },
      {
        name: "Token3",
        numberOfTickets: new anchor.BN(0),
        symbol: "TK3",
        tokenAddress: new PublicKey("So11111111111111111111111111111111111111114"),
        isWinner: false,
        winnerListId: null,
        positionFinal: null
      },
    ];

    const tx = await program.methods
      .initializeGame(
        new anchor.BN(numberGameCreated),
        startDate,
        endDate,
        initialReward,
        name,
        tokens,
        winners
      )
      .accounts({
        game: gamePda,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const gameAccount = await program.account.game.fetch(gamePda);

    if (
      gameAccount.creator.toString() !== provider.wallet.publicKey.toString() ||
      gameAccount.startDate.toNumber() !== startDate.toNumber() ||
      gameAccount.endDate.toNumber() !== endDate.toNumber() ||
      gameAccount.initialReward !== initialReward ||
      gameAccount.name !== name ||
      gameAccount.tokens.length !== tokens.length ||
      gameAccount.tokens[0].name !== tokens[0].name ||
      gameAccount.tokens[0].symbol !== tokens[0].symbol ||
      gameAccount.tokens[0].tokenAddress.toString() !== tokens[0].tokenAddress.toString() ||
      gameAccount.tokens[1].name !== tokens[1].name ||
      gameAccount.tokens[1].symbol !== tokens[1].symbol ||
      gameAccount.tokens[1].tokenAddress.toString() !== tokens[1].tokenAddress.toString()
    ) {
      throw new Error("Initialization failed, attributes do not match");
    }
  });*/

  /*it("Buys a ticket and increments the count with bonding curve pricing, then sells one ticket", async () => {
    const numTicketsToBuy = 3;
    const numTicketsToSell = 1;

    const [userPda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("user"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const [masterPda, bumpMaster] = await PublicKey.findProgramAddress(
      [Buffer.from("master")],
      program.programId
    );

    // Fetch the current total number of tickets
    const masterAccountBefore = await program.account.master.fetch(masterPda);
    const currentTicketCount = masterAccountBefore.totalNumberTicket.toNumber();

    // Buy tickets
    await program.methods
      .buyTicket(new anchor.BN(numTicketsToBuy), 10)
      .accounts({
        userAccount: userPda,
        master: masterPda,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Fetch user and master account data after buying
    const userAccountAfterBuy = await program.account.user.fetch(userPda);
    const masterAccountAfterBuy = await program.account.master.fetch(masterPda);

    console.log("userAccountAfterBuy", userAccountAfterBuy);
    console.log("masterAccountAfterBuy", masterAccountAfterBuy);

    /*if (userAccountAfterBuy.numberTickets.toNumber() !== numTicketsToBuy) {
      throw new Error("Ticket buying failed, number_tickets is not numTicketsToBuy");
    }

    if (masterAccountAfterBuy.totalNumberTicket.toNumber() !== currentTicketCount + numTicketsToBuy) {
      throw new Error("Ticket buying failed, total_number_ticket is not numTicketsToBuy + currentTicketCount");
    }

    // Sell tickets
    await program.methods
      .sellTicket(new anchor.BN(numTicketsToSell), 10)
      .accounts({
        userAccount: userPda,
        master: masterPda,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Fetch user and master account data after selling
    const userAccountAfterSell = await program.account.user.fetch(userPda);
    const masterAccountAfterSell = await program.account.master.fetch(masterPda);

    console.log("userAccountAfterSell", userAccountAfterSell);
    console.log("masterAccountAfterSell", masterAccountAfterSell);

    /*if (userAccountAfterSell.numberTickets.toNumber() !== numTicketsToBuy - numTicketsToSell) {
      throw new Error("Ticket selling failed, number_tickets is not numTicketsToBuy - numTicketsToSell");
    }

    if (masterAccountAfterSell.totalNumberTicket.toNumber() !== currentTicketCount + numTicketsToBuy - numTicketsToSell) {
      throw new Error("Ticket selling failed, total_number_ticket is not numTicketsToBuy - numTicketsToSell + currentTicketCount");
    }
  });*/

  /*it("Multiple users buy tickets simultaneously", async () => {
    const users = Array.from({ length: 100 }, () => Keypair.generate());
    const ticketNumbers = users.map(() => Math.floor(Math.random() * 1) + 1);

    const [masterPda, bumpMaster] = await PublicKey.findProgramAddress(
      [Buffer.from("master")],
      program.programId
    );

    const masterAccount = await program.account.master.fetch(masterPda);
    console.log("masterAccount", masterAccount.totalNumberTicket.toNumber());

    const masterBalanceBefore = await provider.connection.getBalance(masterPda);

    // Airdrop SOL to users for testing
    await Promise.all(users.map(async user => {
      const airdropSignature = await provider.connection.requestAirdrop(user.publicKey, 10000 * anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(airdropSignature);
    }));

    // Perform transactions for each user concurrently
    await Promise.all(users.map(async (user, index) => {
      const numTickets = ticketNumbers[index];
      const [userPda, bump] = await PublicKey.findProgramAddress(
        [Buffer.from("user"), user.publicKey.toBuffer()],
        program.programId
      );

      // Check initial balances
      const initialUserBalance = await provider.connection.getBalance(user.publicKey);

      // Fetch the current total number of tickets
      const masterAccountBefore = await program.account.master.fetch(masterPda);
      const currentTicketCount = masterAccountBefore.totalNumberTicket.toNumber();

      const totalCost = calculateBuyPrice(currentTicketCount, numTickets);

      await program.methods
        .buyTicket(new anchor.BN(numTickets), 10)
        .accounts({
          userAccount: userPda,
          master: masterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const userAccount = await program.account.user.fetch(userPda);
      //console.log("userAccount", userAccount.numberTickets.toNumber());
      const masterAccount = await program.account.master.fetch(masterPda);

      if (userAccount.numberTickets.toNumber() !== numTickets) {
        throw new Error("Ticket buying failed, number_tickets is not numTickets");
      }
    }));
  });*/

  /*it("Full cycle: Creates a game, user buys ticket then joins the game", async () => {
    const numTicketsToBuy = 10;
    const tokenAddress1 = new PublicKey("So11111111111111111111111111111111111111112");
    const tokenAddress2 = new PublicKey("So11111111111111111111111111111111111111113");
    const userFake = Keypair.generate();
    const airdropSignature = await provider.connection.requestAirdrop(userFake.publicKey, 100 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(airdropSignature);

    let [userPda, userBump] = await PublicKey.findProgramAddress(
      [Buffer.from("user"), userFake.publicKey.toBuffer()],
      program.programId
    );
    const gameId = "0";

    const [masterPda, masterBump] = await PublicKey.findProgramAddress(
      [Buffer.from("master")],
      program.programId
    );

    const gameSeed = "game";
    const numberGameCreated = 0;

    const [gamePda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(gameSeed), userFake.publicKey.toBuffer(), new anchor.BN(numberGameCreated).toArrayLike(Buffer, 'le', 4)],
      program.programId
    );

    const [participationPda1, participationBump1] = await PublicKey.findProgramAddress(
      [Buffer.from("participation"), gamePda.toBuffer(), userFake.publicKey.toBuffer(), tokenAddress1.toBuffer()],
      program.programId
    );

    const [participationPda2, participationBump2] = await PublicKey.findProgramAddress(
      [Buffer.from("participation"), gamePda.toBuffer(), userFake.publicKey.toBuffer(), tokenAddress2.toBuffer()],
      program.programId
    );

    // Initialize master PDA if not already done
    try {
      await program.account.master.fetch(masterPda);
    } catch (e) {
      await program.methods
        .initializeMaster()
        .accounts({
          master: masterPda,
          user: userFake.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([userFake])
        .rpc();
    }

    // Initialize game PDA
    const startDate = new anchor.BN(Date.now() / 1000);
    const endDate = new anchor.BN(Date.now() / 1000);
    const bigBlind = 0.1;
    const name = "Test Game";

    const winners = [
      {
        position:1,
        percentage: 75,
        winnerDistribution: [
          {
            percentage: 100,
            numWinners: 1,
            fairDistributionAll: true,
          }
        ],
      },
      {
        position:2,
        percentage: 25,
        winnerDistribution: [
          {
            percentage: 100,
            numWinners: 2,
            fairDistributionAll: false,
          },
        ],
      },
    ];

    const tokens = [
      {
        name: "Token1",
        numberOfTickets: new anchor.BN(0),
        symbol: "TK1",
        tokenAddress: tokenAddress1,
        isWinner: false,
        winnerListId: null,
        positionFinal: null
      },
      {
        name: "Token2",
        numberOfTickets: new anchor.BN(0),
        symbol: "TK2",
        tokenAddress: tokenAddress2,
        isWinner: false,
        winnerListId: null,
        positionFinal: null
      },
    ];

    await program.methods
      .initializeGame(
        new anchor.BN(numberGameCreated),
        startDate,
        endDate,
        bigBlind,
        name,
        tokens,
        winners
      )
      .accounts({
        game: gamePda,
        user: userFake.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([userFake])
      .rpc();
      
    // Fetch the current total number of tickets
    const masterAccountBefore = await program.account.master.fetch(masterPda);
    const currentTicketCount = masterAccountBefore.totalNumberTicket.toNumber();

    // Buy tickets if user doesn't have them already
    let userAccountBefore;
    await program.methods
    .buyTicket(new anchor.BN(numTicketsToBuy), 10)
    .accounts({
      userAccount: userPda,
      master: masterPda,
      user: userFake.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([userFake])
    .rpc();
    userAccountBefore = await program.account.user.fetch(userPda);

    let user = await program.account.user.fetch(userPda);

    const gameBalanceBefore = await provider.connection.getBalance(gamePda);
    console.log("Game balance before join:", gameBalanceBefore);

    // Join the game first time with tokenAddress1
    const numTicketsToJoin1 = 3;
    const tx1 = await program.methods
      .joinGame(gamePda.toString(), tokenAddress1, new anchor.BN(numTicketsToJoin1))
      .accounts({
        participation: participationPda1,
        userAccount: userPda,
        master: masterPda,
        game: gamePda,
        user: userFake.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([userFake])
      .rpc();

    await provider.connection.confirmTransaction(tx1);

    console.log("tx1", tx1);

    const numTicketsToJoin2 = 2;
    const tx2 = await program.methods
      .joinGame(gameId, tokenAddress2, new anchor.BN(numTicketsToJoin2))
      .accounts({
        participation: participationPda2,
        userAccount: userPda,
        master: masterPda,
        game: gamePda,
        user: userFake.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([userFake])
      .rpc();

    await provider.connection.confirmTransaction(tx2);

    const gameBalance2 = await provider.connection.getBalance(gamePda);
    console.log("gameBalance2", gameBalance2);

    user = await program.account.user.fetch(userPda);

    let gameAccount = await program.account.game.fetch(gamePda);

    // Pick winners
    /*const tx3 = await program.methods
    .pickWinner()
    .accounts({
      game: gamePda,
      creator: new PublicKey(gameAccount.creator),
      master: masterPda,
      admin: new PublicKey(masterAccountBefore.admin),
      user: userFake.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([userFake])
    .rpc();

    console.log("gameAccount", JSON.stringify(gameAccount, null, 2));

    await provider.connection.confirmTransaction(tx3);

    const gameBalanceBeforeClaim = await provider.connection.getBalance(gamePda);
    console.log("Game balance before claiming prize:", gameBalanceBeforeClaim);*/

    // Claim prize
    /*const tx4 = await program.methods
    .claimPrize()
    .accounts({
      game: gamePda,
      participation: participationPda1,
      user: userFake.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([userFake])
    .rpc();

    await provider.connection.confirmTransaction(tx4);

    const gameBalanceAfterClaim = await provider.connection.getBalance(gamePda);
    console.log("Game balance after claiming prize:", gameBalanceAfterClaim);

    gameAccount = await program.account.game.fetch(gamePda);

    if (gameBalanceAfterClaim >= gameBalanceBeforeClaim) {
      throw new Error("game balance did not decrease after giving prize to user");
    }

    const tx5 = await program.methods
    .claimPrize()
    .accounts({
      game: gamePda,
      participation: participationPda2,
      user: userFake.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([userFake])
    .rpc();

    await provider.connection.confirmTransaction(tx5);

    const gameBalance2AfterClaim = await provider.connection.getBalance(gamePda);
    console.log("Game balance after second claiming prize:", gameBalance2AfterClaim);

    gameAccount = await program.account.game.fetch(gamePda);

    if (gameBalance2AfterClaim >= gameBalanceAfterClaim) {
      throw new Error("game balance did not decrease after giving prize to user");
    }

    // Fetch updated accounts
    const participationAccount1 = await program.account.participation.fetch(participationPda1);    
    const userAccount = await program.account.user.fetch(userPda);
    const masterAccount = await program.account.master.fetch(masterPda);
    
    // Verify participation1 is claimed
    if (!participationAccount1.isClaimed) {
      throw new Error("Participation1 is not marked as claimed");
    }

    // Verify participation for tokenAddress1
    if (participationAccount1.ranges.length === 0) {
      throw new Error("Participation update failed for tokenAddress1");
    }

    // Verify user account tickets
    if (userAccount.numberTickets.toNumber() !== (userAccountBefore.numberTickets.toNumber() - numTicketsToJoin1 - numTicketsToJoin2)) {
      throw new Error("User tickets not updated correctly");
    }

    // Verify master account tickets
    if (masterAccount.totalNumberTicket.toNumber() !== (currentTicketCount + numTicketsToBuy - numTicketsToJoin1 - numTicketsToJoin2)) {
      throw new Error("Master tickets not updated correctly");
    }

    // Verify game account token info for tokenAddress1
    const gameTokenInfo1 = gameAccount.tokens.find(token => token.tokenAddress.toString() === tokenAddress1.toString());
    if (!gameTokenInfo1 || gameTokenInfo1.numberOfTickets.toNumber() !== (numTicketsToJoin1)) {
      throw new Error("Game token info not updated correctly for tokenAddress1");
    }

    const gameBalance = await provider.connection.getBalance(gamePda);
    console.log("gameBalance", gameBalance);
    console.log("gameAccount", JSON.stringify(gameAccount, null, 2));
    console.log("participationAccount1", participationAccount1);

    const masterAccount1 = await program.account.master.fetch(masterPda);
    console.log("masterAccount1", masterAccount1.totalNumberTicket.toNumber());*/
  //});

  /*it("Simulate user joining the game multiple times in parallel with random delays and third token", async () => {
    const numTicketsToBuy = 2000; // Buy more tickets for the simulation
    const tokenAddress1 = new PublicKey("FV6etEFawMhJrGB656y6Bb6vGfi7qicq6iNk6x86NFWT");
    const tokenAddress2 = new PublicKey("bzSvVHBjJFE3jDNJ5fhgNG23HZBW2jDUWHUaYLYdbv5");
    const tokenAddress3 = new PublicKey("GoMNscKYCyVfhPiB9G1krh5FeDcGBYH3J4jhJ1jeShNp");
    const masterAdminFees = new PublicKey(process.env.MASTER_ADMIN_FEES || "");
    const userFake = Keypair.generate();
  
    let [userPda] = await PublicKey.findProgramAddress(
      [Buffer.from("user"), userFake.publicKey.toBuffer()],
      program.programId
    );
  
    const [masterPda] = await PublicKey.findProgramAddress(
      [Buffer.from("master")],
      program.programId
    );
  
    const gameSeed = "game";
    const numberGameCreated = 38;
    const creatorGamePubkey = new PublicKey(process.env.GAME_CREATOR_WALLET || "");
  
    const [gamePda] = await PublicKey.findProgramAddress(
      [Buffer.from(gameSeed), creatorGamePubkey.toBuffer(), new anchor.BN(numberGameCreated).toArrayLike(Buffer, 'le', 4)],
      program.programId
    );
  
    const [participationPda1] = await PublicKey.findProgramAddress(
      [Buffer.from("participation"), gamePda.toBuffer(), userFake.publicKey.toBuffer(), tokenAddress1.toBuffer()],
      program.programId
    );
  
    const [participationPda2] = await PublicKey.findProgramAddress(
      [Buffer.from("participation"), gamePda.toBuffer(), userFake.publicKey.toBuffer(), tokenAddress2.toBuffer()],
      program.programId
    );
  
    const [participationPda3] = await PublicKey.findProgramAddress(
      [Buffer.from("participation"), gamePda.toBuffer(), userFake.publicKey.toBuffer(), tokenAddress3.toBuffer()],
      program.programId
    );
  
    // Buy tickets
    await program.methods
      .buyTicket(new anchor.BN(numTicketsToBuy), 10)
      .accounts({
        userAccount: userPda,
        master: masterPda,
        user: userFake.publicKey,
        admin: masterAdminFees,
        systemProgram: SystemProgram.programId,
      })
      .signers([userFake])
      .rpc();
  
    let user = await program.account.user.fetch(userPda);
    console.log("Initial number of tickets:", Number(user.numberTickets));
  
    const numSimulations = 100; // Number of times to join the game
  
    // Helper function for a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
    const promises = Array.from({ length: numSimulations }).map(async (_, i) => {
      // Randomly select a token and delay
      const randomTokenIdx = Math.floor(Math.random() * 3); // 0, 1, or 2
      const randomToken = [tokenAddress1, tokenAddress2, tokenAddress3][randomTokenIdx];
      const randomTickets = Math.floor(Math.random() * 100) + 1; // 1 to 5 tickets per join
      const randomDelay = Math.floor(Math.random() * 15000) + 500; // 500ms to 5000ms delay
  
      try {
        // Wait for a random delay before proceeding
        await delay(randomDelay);
  
        const [participationPda] = randomToken.equals(tokenAddress1)
          ? [participationPda1]
          : randomToken.equals(tokenAddress2)
          ? [participationPda2]
          : [participationPda3];
  
        const tx = await program.methods
          .joinGame(gamePda.toString(), randomToken, new anchor.BN(randomTickets))
          .accounts({
            participation: participationPda,
            userAccount: userPda,
            master: masterPda,
            game: gamePda,
            user: userFake.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([userFake])
          .rpc();
  
        const blockhash = await provider.connection.getLatestBlockhash();
        await connection.confirmTransaction(
          { signature: tx, ...blockhash },
          'confirmed'
        );
  
        console.log(`Joined game ${i + 1}: Token ${randomToken.toString()}, Tickets ${randomTickets}, Tx ${tx}, Delay ${randomDelay}ms`);
      } catch (error) {
        console.error(`Error during parallel simulation ${i + 1}:`, error);
      }
    });
  
    await Promise.all(promises);
  
    user = await program.account.user.fetch(userPda);
    console.log("Remaining number of tickets:", Number(user.numberTickets));
  });  */
});