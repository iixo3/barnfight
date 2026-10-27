import admin from "firebase-admin";
import serviceAccount from "./firebaseServiceAccount.json";
import { getMemetankProgram } from "./memetank-exports";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { performSwap, fetchTokenDataWithRetry } from "./CryptoUtils";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  ComputeBudgetProgram,
  
} from "@solana/web3.js";
import bs58 from "bs58";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, BN } from "@project-serum/anchor";
import { DocumentSnapshot } from "firebase-admin/firestore";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();
const connection = new Connection(
  process.env.SOLANA_RPC_URL || "",
  "confirmed",
);
const connection2 = new Connection(
  process.env.SOLANA_RPC_URL_2 || "",
  "confirmed",
);
const connection3 = new Connection(
  process.env.SOLANA_RPC_URL_3 || "",
  "confirmed",
);

const programId = new PublicKey(process.env.PROGRAM_ID || "");
const walletKeypairArray = process.env.KEYPAIR_ADMIN_SWAP
  ? JSON.parse(process.env.KEYPAIR_ADMIN_SWAP)
  : [];
const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairArray));
const wallet = new anchor.Wallet(walletKeypair);
let isLogsListenerRegistered = false;
let logId = 0;

const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
const program = getMemetankProgram(provider);

const DISCRIMINATORS = {
  user: Buffer.from([0x9f, 0x75, 0x5f, 0xe3, 0xef, 0x97, 0x3a, 0xec]),
  game: Buffer.from([0x1b, 0x5a, 0xa6, 0x7d, 0x4a, 0x64, 0x79, 0x12]),
  master: Buffer.from([0xa8, 0xd5, 0xc1, 0x0c, 0x4d, 0xa2, 0x3a, 0xeb]),
  participation: Buffer.from([0xed, 0x9a, 0x8e, 0x2e, 0x8f, 0x3f, 0xbd, 0x12]),
};

export async function run() {
  console.log("run method once");
  checkAccounts();
  checkAndPickWinners();
  processSwaps();
  //performSwap("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 0.001);
  processCompletedSwaps();
  setInterval(checkAccounts, 120000);
  setInterval(checkAndPickWinners, 30000);
  setInterval(processSwaps, 30000);
  setInterval(processCompletedSwaps, 30000);
}

if (!isLogsListenerRegistered) {
  connection.removeOnLogsListener(logId);
  logId = connection.onLogs(programId, async (logInfo) => {
    const { signature, logs } = logInfo;

    let instructionName = "";

    // First, extract the instruction name from the logs
    for (const log of logs) {
      if (log.includes("Instruction:")) {
        const methodMatch = log.match(/Instruction: (\w+)/);
        if (methodMatch) {
          instructionName = methodMatch[1];
          break;
        }
      }
    }

    // Process each log in parallel after determining instruction name
    await Promise.allSettled(
      logs.map(async (log) => {
        const match = log.match(/ACCOUNT-UPDATE: (\w+)/);
        if (match) {
          const accountId = new PublicKey(match[1]);

          let now = new Date();
          let timestamp = now.toLocaleTimeString('en-US', { hour12: false });
          console.log(`[${timestamp}] accountId: ${accountId.toString()}`);

          const accountInfo = await connection.getAccountInfo(accountId);

          now = new Date();
          timestamp = now.toLocaleTimeString('en-US', { hour12: false });

          if (accountInfo) {
            await handleAccountChange(
              { accountId, accountInfo },
              signature,
              instructionName,
            );
          }
        }
      }),
    );
  });
}

function detectAccountType(buffer: Buffer): string | null {
  const discriminator = buffer.slice(0, 8);
  for (const [accountType, discr] of Object.entries(DISCRIMINATORS)) {
    if (discriminator.equals(discr)) {
      return accountType;
    }
  }
  return null;
}

function deserializeUser(buffer: Buffer) {
  let offset = 8; // Start after discriminator

  const user_pubkey = buffer.slice(offset, offset + 32);
  offset += 32;

  const number_tickets = buffer.readBigUInt64LE(offset);
  offset += 8;

  const number_game_created = buffer.readUInt32LE(offset);
  offset += 4;

  // Deserialize free_ticket_received as an Option<bool>
  const free_ticket_received_flag = buffer.readUInt8(offset);
  offset += 1;
  const free_ticket_received = free_ticket_received_flag === 1 ? buffer.readUInt8(offset) === 1 : null;
  if (free_ticket_received_flag === 1) offset += 1;

  // Deserialize free_superteam_ticket_received as an Option<bool>
  const free_superteam_ticket_received_flag = buffer.readUInt8(offset);
  offset += 1;
  const free_superteam_ticket_received = free_superteam_ticket_received_flag === 1 ? buffer.readUInt8(offset) === 1 : null;
  if (free_superteam_ticket_received_flag === 1) offset += 1;

  // Deserialize points as an Option<u64>
  const points_present_flag = buffer.readUInt8(offset);
  offset += 1;
  const points = points_present_flag === 1 ? buffer.readBigUInt64LE(offset) : null;
  if (points_present_flag === 1) offset += 8;

  // Deserialize number_referrals_done as an Option<u32>
  const number_referrals_done_present_flag = buffer.readUInt8(offset);
  offset += 1;
  const number_referrals_done = number_referrals_done_present_flag === 1 ? buffer.readUInt32LE(offset) : null;
  if (number_referrals_done_present_flag === 1) offset += 4;

  // Deserialize referral_parent as an Option<Pubkey>
  const referral_parent_present_flag = buffer.readUInt8(offset);
  offset += 1;
  const referral_parent = referral_parent_present_flag === 1 ? buffer.slice(offset, offset + 32) : null;
  if (referral_parent_present_flag === 1) offset += 32;

  // Read optional referralCode
  const hasReferralCode = buffer.readUInt8(offset) !== 0;
  offset += 1;
  let referral_code: string | null = "";
  if (hasReferralCode) {
    const referralCodeLength = buffer.readUInt32LE(offset);
    offset += 4;
    referral_code = buffer.slice(offset, offset + referralCodeLength).toString("utf8");
    offset += referralCodeLength;
  }

  return {
    user_pubkey,
    number_tickets,
    number_game_created,
    free_ticket_received,
    free_superteam_ticket_received,
    points,
    number_referrals_done,
    referral_parent,
    referral_code
  };
}


function deserializeGame(buffer: Buffer) {
  let offset = 8; // Start after discriminator

  const id = buffer.slice(offset, offset + 32);
  offset += 32;

  const creator = buffer.slice(offset, offset + 32);
  offset += 32;

  const index_game_by_creator = buffer.readUInt32LE(offset);
  offset += 4;

  const num = buffer.readUInt32LE(offset);
  offset += 4;

  const is_ended = buffer.readUInt8(offset) !== 0;
  offset += 1;

  const start_date = buffer.readBigUInt64LE(offset);
  offset += 8;

  const end_date = buffer.readBigUInt64LE(offset);
  offset += 8;

  const total_reward = buffer.readFloatLE(offset).toFixed(6);
  offset += 4;

  const remaining_reward = buffer.readFloatLE(offset).toFixed(6);
  offset += 4;

  const initial_reward = buffer.readFloatLE(offset).toFixed(6);
  offset += 4;

  // Read optional name
  const hasName = buffer.readUInt8(offset) !== 0;
  offset += 1;
  let name: string | null = null;
  if (hasName) {
    const nameLength = buffer.readUInt32LE(offset);
    offset += 4;
    name = buffer.slice(offset, offset + nameLength).toString("utf8");
    offset += nameLength;
  }

  // Read tokens vector
  const tokensLength = buffer.readUInt32LE(offset);
  offset += 4;
  const tokens = [];
  for (let i = 0; i < tokensLength; i++) {
    tokens.push(deserializeTokenInfo(buffer, offset));
    offset += calculateTokenInfoSize(buffer, offset);
  }

  // Read winners vector
  const winnersLength = buffer.readUInt32LE(offset);
  offset += 4;
  const winners = [];
  for (let i = 0; i < winnersLength; i++) {
    winners.push(deserializeWinnerInfo(buffer, offset));
    offset += calculateWinnerInfoSize(buffer, offset);
  }

  return {
    id,
    creator,
    index_game_by_creator,
    num,
    is_ended,
    start_date,
    end_date,
    total_reward,
    remaining_reward,
    initial_reward,
    name,
    tokens,
    winners,
  };
}

function deserializeParticipation(buffer: Buffer) {
  let offset = 8; // Start after discriminator

  const user_pubkey = buffer.slice(offset, offset + 32);
  offset += 32;

  const gameIdLength = buffer.readUInt32LE(offset);
  offset += 4;
  const game_id = buffer.slice(offset, offset + gameIdLength).toString("utf8");
  offset += gameIdLength;

  const token_address = buffer.slice(offset, offset + 32);
  offset += 32;

  const rangesLength = buffer.readUInt32LE(offset);
  offset += 4;
  const ranges = [];
  for (let i = 0; i < rangesLength; i++) {
    const start = buffer.readUInt32LE(offset);
    offset += 4;
    const end = buffer.readUInt32LE(offset);
    offset += 4;
    ranges.push({ start, end });
  }

  const is_claimed = buffer.readUInt8(offset) !== 0;
  offset += 1;

  let total_spend = null;
  const totalSpendPresent = buffer.readUInt8(offset);
  offset += 1;
  if (totalSpendPresent === 1) {
    total_spend = buffer.readFloatLE(offset);
    offset += 4;
  }

  let total_tickets_entered = null;
  const totalTicketsPresent = buffer.readUInt8(offset);
  offset += 1;
  if (totalTicketsPresent === 1) {
    total_tickets_entered = buffer.readUInt32LE(offset);
    offset += 4;
  }

  return {
    user_pubkey,
    game_id,
    token_address,
    ranges,
    is_claimed,
    total_spend,
    total_tickets_entered
  };
}

function deserializeMaster(buffer: Buffer) {
  let offset = 8; // Start after discriminator

  const total_number_ticket = buffer.readBigUInt64LE(offset);
  offset += 8;

  const admin_fees = buffer.slice(offset, offset + 32);
  offset += 32;

  const admin_swap = buffer.slice(offset, offset + 32);
  offset += 32;

  const ticket_buy_price = buffer.readFloatLE(offset).toFixed(6);
  offset += 4;

  const ticket_sell_price = buffer.readFloatLE(offset).toFixed(6);
  offset += 4;

  const all_time_volume = buffer.readFloatLE(offset).toFixed(6);
  offset += 4;

  return {
    total_number_ticket,
    admin_fees,
    admin_swap,
    ticket_buy_price,
    ticket_sell_price,
    all_time_volume
  };
}

// Helper functions for Game deserialization
function deserializeTokenInfo(buffer: Buffer, startOffset: number) {
  let offset = startOffset;

  // Read `number_of_tickets`
  const number_of_tickets = buffer.readBigUInt64LE(offset);
  offset += 8;

  // Read `token_address`
  const token_address = buffer.slice(offset, offset + 32);
  offset += 32;

  // Read `is_winner`
  const is_winner = buffer.readUInt8(offset) !== 0;
  offset += 1;

  // Read `position_final` (Option<u8>)
  const hasPositionFinal = buffer.readUInt8(offset) !== 0;
  offset += 1;
  const position_final = hasPositionFinal ? buffer.readUInt8(offset++) : null;

  // Read `total_amount_wallet_sol`
  const total_amount_wallet_sol = buffer.readFloatLE(offset).toFixed(6);
  offset += 4;

  // Read `total_amount_wallet_token`
  const total_amount_wallet_token = buffer.readBigUInt64LE(offset).toString();
  offset += 8;

  // Read `swap_done`
  const swap_done = buffer.readUInt8(offset) !== 0;
  offset += 1;

  return {
    number_of_tickets,
    token_address,
    is_winner,
    position_final,
    total_amount_wallet_sol,
    total_amount_wallet_token,
    swap_done,
  };
}

function deserializeWinnerInfo(buffer: Buffer, startOffset: number) {
  let offset = startOffset;

  // Read `position`
  const position = buffer.readUInt8(offset);
  offset += 1;

  // Read `percentage`
  const percentage = buffer.readFloatLE(offset).toFixed(6);
  offset += 4;

  const token_address = buffer.slice(offset, offset + 32);
  offset += 32;

  // Read `winner_distribution` vector length and each element
  const distributionLength = buffer.readUInt32LE(offset);
  offset += 4;
  const winner_distribution: Array<{
    percentage: number;
    num_winners: number;
    fair_distribution_all: boolean;
    name: string;
    ticket_ids: number[];
    percentage_winners: number | null;
  }> = [];

  for (let i = 0; i < distributionLength; i++) {
    // Read percentage
    const percentage = buffer.readFloatLE(offset);
    offset += 4;

    // Read num_winners
    const num_winners = buffer.readUInt8(offset);
    offset += 1;

    // Read fair_distribution_all
    const fair_distribution_all = buffer.readUInt8(offset) !== 0;
    offset += 1;

    // Read `name` length and value
    const nameLength = buffer.readUInt32LE(offset);
    offset += 4;
    const name = buffer.slice(offset, offset + nameLength).toString("utf8");
    offset += nameLength;

    // Read `ticket_ids` vector length and values
    const ticketIdsLength = buffer.readUInt32LE(offset);
    offset += 4;
    const ticket_ids: number[] = [];
    for (let j = 0; j < ticketIdsLength; j++) {
      ticket_ids.push(buffer.readUInt32LE(offset));
      offset += 4;
    }

    // Read `percentage_winners` (Option<u8>)
    const percentageWinnersFlag = buffer.readUInt8(offset);
    offset += 1;
    const percentage_winners = percentageWinnersFlag === 1 ? buffer.readUInt8(offset) : null;
    if (percentageWinnersFlag === 1) offset += 1; // Move offset if `percentage_winners` exists

    winner_distribution.push({
      percentage,
      num_winners,
      fair_distribution_all,
      name,
      ticket_ids,
      percentage_winners
    });
  }

  return {
    position,
    percentage,
    token_address,
    winner_distribution,
  };
}

function calculateTokenInfoSize(buffer: Buffer, startOffset: number): number {
  let offset = startOffset;
  offset += 8; // number_of_tickets
  offset += 32; // token_address
  offset += 1; // is_winner

  offset += 1; // has_position_final
  if (buffer.readUInt8(offset - 1) !== 0) {
    offset += 1; // position_final
  }
  offset += 4; // total_amount_wallet_sol
  offset += 8; // total_amount_wallet_token
  offset += 1; // swap_done
  return offset - startOffset;
}

function calculateWinnerInfoSize(buffer: Buffer, startOffset: number): number {
  let offset = startOffset;

  // Size for `position` (1 byte) and `percentage` (4 bytes as f32)
  offset += 5;

  // Calculate size for `token_winner` field as a pubkey
  offset += 32; // 32 bytes for a pubkey

  // Calculate size for `winner_distribution` vector
  const distributionLength = buffer.readUInt32LE(offset);
  offset += 4; // 4 bytes for the length of the `winner_distribution` array

  for (let i = 0; i < distributionLength; i++) {
    // Size for `percentage` (4 bytes as f32), `num_winners` (1 byte), and `fair_distribution_all` (1 byte)
    offset += 6;

    // Calculate size for `name` field in WinnerDistribution
    offset += 4 + buffer.readUInt32LE(offset); // 4 bytes for length + name size

    // Calculate size for `ticket_ids` vector
    const ticketIdsLength = buffer.readUInt32LE(offset);
    offset += 4 + ticketIdsLength * 4; // 4 bytes for length + 4 bytes for each `ticket_id`

    // Calculate size for `percentage_winners` (Option<u8>)
    const percentageWinnersFlag = buffer.readUInt8(offset);
    offset += 1; // 1 byte for the option flag
    if (percentageWinnersFlag === 1) {
      offset += 1; // 1 additional byte if `percentage_winners` is present
    }
  }

  return offset - startOffset;
}

function classToPlainObject(instance: any): any {
  if (instance === null || typeof instance !== "object") {
    return instance;
  }

  if (Array.isArray(instance)) {
    return instance.map((item) => classToPlainObject(item));
  }

  const plainObject: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(instance)) {
    if (value !== undefined) {
      if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
        plainObject[key] = bs58.encode(value);
      } else if (typeof value === "bigint") {
        plainObject[key] =
          value <= Number.MAX_SAFE_INTEGER ? Number(value) : value.toString();
      } else if (Array.isArray(value)) {
        plainObject[key] = value.map((item) => classToPlainObject(item));
      } else if (typeof value === "object" && value !== null) {
        plainObject[key] = classToPlainObject(value);
      } else {
        plainObject[key] = value;
      }
    }
  }
  plainObject["last_updated_time"] = Date.now();
  return plainObject;
}

async function handleAccountChange(
  accountInfo: { accountId: PublicKey; accountInfo: { data: Buffer } },
  signature: string,
  instructionName: string,
) {
  const {
    accountId,
    accountInfo: { data },
  } = accountInfo;
  const dataBuffer = Buffer.from(data);

  try {
    const accountType = detectAccountType(dataBuffer);

    if (!accountType) {
      throw new Error("Account type not recognized");
    }

    let decodedData;
    switch (accountType) {
      case "user":
        decodedData = deserializeUser(dataBuffer);
        break;
      case "game":
        decodedData = deserializeGame(dataBuffer);
        break;
      case "master":
        decodedData = deserializeMaster(dataBuffer);
        break;
      case "participation":
        decodedData = deserializeParticipation(dataBuffer);
        break;
      default:
        throw new Error(`Unsupported account type: ${accountType}`);
    }

    const plainObjectData = classToPlainObject(decodedData);
    await db
      .collection(accountType)
      .doc(accountId.toString())
      .set(plainObjectData, { merge: true });
    await db.collection("transaction").doc(signature).set({ status: "done" });

    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
    console.log(`[${timestamp}] Object added to DB: ${accountType} ${accountId.toString()}`);
    if (accountType === "game" && instructionName === "PickWinner") {
      // @ts-ignore
      const winnerTokens = plainObjectData.tokens.filter(
        // @ts-ignore
        (token) => token.is_winner,
      );
      for (const winnerToken of winnerTokens) {
        if (winnerToken.number_of_tickets > 0) {
          console.log(`[${timestamp}] Swap added to DB: ${winnerToken.token_address.toString()} ${accountId.toString()}`);
          await db.collection("swaps").doc().set({
            // @ts-ignore
            game_id: plainObjectData.id.toString(),
            token_address: winnerToken.token_address.toString(),
            amount_in_SOL: winnerToken.total_amount_wallet_sol,
            tokenAmount: 0,
            status: "todo",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error decoding account data:", error);
  }
}

async function getLatestProcessedSignature(): Promise<string | null> {
  const doc = await db
    .collection("metadata")
    .doc("latestProcessedSignature")
    .get();
  return doc.exists ? doc.data()?.signature : null;
}

async function updateLatestProcessedSignature(
  signature: string,
): Promise<void> {
  await db
    .collection("metadata")
    .doc("latestProcessedSignature")
    .set({ signature });
}

async function checkAccounts(): Promise<void> {
  try {
    console.log("Checking accounts");
    const latestSignature = await getLatestProcessedSignature();
    const options = latestSignature
      ? { until: latestSignature, limit: 50 }
      : { limit: 100 };
    const signatures = await connection2.getSignaturesForAddress(
      programId,
      options,
    );

    signatures.sort((a, b) => (a.blockTime || 0) - (b.blockTime || 0));

    let signatureDocs: any[] = [];
    if (signatures.length > 0) {
      signatureDocs = await db.getAll(
        ...signatures.map((sig) =>
          db.collection("transaction").doc(sig.signature),
        ),
      );
    }

    const signatureMap = new Map<string, DocumentSnapshot>();
    signatures.forEach((sig, index) => {
      signatureMap.set(sig.signature, signatureDocs[index]);
    });

    const CHUNK_SIZE = 10;
    let processedCount = 0;

    for (const signatureInfo of signatures) {
      const signatureDoc = signatureMap.get(signatureInfo.signature);

      if (signatureDoc && !signatureDoc.exists) {
        const transaction = await connection2.getTransaction(
          signatureInfo.signature,
          {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
          },
        );

        if (transaction && transaction.meta && transaction.meta.logMessages) {
          let instructionName = "";

          for (const log of transaction.meta.logMessages) {
            if (log.includes("Instruction:")) {
              const methodMatch = log.match(/Instruction: (\w+)/);
              if (methodMatch) {
                instructionName = methodMatch[1];
                break;
              }
            }
          }

          // Process logs in parallel within this transaction
          await Promise.all(
            transaction.meta.logMessages.map(async (log) => {
              if (log.includes("ACCOUNT-UPDATE:")) {
                const match = log.match(/ACCOUNT-UPDATE: (\w+)/);
                if (match) {
                  const accountId = new PublicKey(match[1]);
                  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
                  console.log(`[${timestamp}] accountId previous: ${accountId.toString()}`);
                  
                  // Fetch account info and handle change concurrently
                  const accountInfo = await connection2.getAccountInfo(accountId);
                  if (accountInfo) {
                    await handleAccountChange(
                      { accountId, accountInfo },
                      signatureInfo.signature,
                      instructionName,
                    );
                  }
                }
              }
            })
          );
          await sleep(750);
        }

        // Mark this transaction as processed in the database
        await db
          .collection("transaction")
          .doc(signatureInfo.signature)
          .set({ status: "done" });
      }

      processedCount += 1;
      if (processedCount % CHUNK_SIZE === 0) {
        await updateLatestProcessedSignature(signatureInfo.signature);
      }
    }

    // Update the latest signature after all are processed
    if (signatures.length > 0) {
      await updateLatestProcessedSignature(
        signatures[signatures.length - 1].signature,
      );
    }
  } catch (error) {
    console.error("Error checking accounts:", error);
  }
}


async function checkAndPickWinners() {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const games = await db
      .collection("game")
      .where("is_ended", "==", false)
      .where("end_date", "<=", currentTime)
      .orderBy("end_date", "asc")
      .limit(20)
      .get();
    if (!games.empty) {
      const gamePickPromises = games.docs.map(async (gameDoc) => {
        const game = gameDoc.data();

        const randomDelay = Math.random() * (2000 - 200) + 200;
        await new Promise((resolve) => setTimeout(resolve, randomDelay));

        if (currentTime >= game.end_date && !game.is_ended) {
          console.log(`Picking winner for game ${game.id}`);

          const tokenVolumes: { [key: string]: number } = {};
          /* FIXME: TO REMOVE IN MAINNET */
          const tokenAddressMap: { [key: string]: string } = {
            "bzSvVHBjJFE3jDNJ5fhgNG23HZBW2jDUWHUaYLYdbv5": "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
            "GoMNscKYCyVfhPiB9G1krh5FeDcGBYH3J4jhJ1jeShNp": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
            "HrXSsRa3zKsAPNkdu9ZSsZvQXAfuZejvcCb2K3wox3Gz": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            "FV6etEFawMhJrGB656y6Bb6vGfi7qicq6iNk6x86NFWT": "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
          };

          const tokenFetchPromises = game.tokens.map(async (token: { token_address: any; }) => {
            let tokenAddress = token.token_address;

            const randomDelay = Math.random() * (2000 - 200) + 200;
            await new Promise((resolve) => setTimeout(resolve, randomDelay));

            /* FIXME: TO REMOVE IN MAINNET */
            if (tokenAddressMap[tokenAddress]) {
              tokenAddress = tokenAddressMap[tokenAddress];
            }
            /* FIXME: TO REMOVE IN MAINNET */
            
            try {
              // Fetch token data with retry logic
              //const tokenData = await fetchTokenDataWithRetry(tokenAddress); // MOCK VOLUME
              const tokenData = { daily_volume: 10000 } // MOCK VOLUME

              // Add the token address and its daily volume to the array
              tokenVolumes[tokenAddress] = tokenData.daily_volume;
            } catch (error) {
              console.error(`Failed to fetch token data for ${tokenAddress} after retries:`, error);
              tokenVolumes[tokenAddress] = 0; 
            }
          });

          await Promise.all(tokenFetchPromises);
          let tokenAddresses = Object.keys(tokenVolumes);
          
          /* FIXME: TO REMOVE IN MAINNET */
          const devnetTokenAddresses = tokenAddresses.map(address => {
            const devnetAddress = Object.keys(tokenAddressMap).find(
              devAddr => tokenAddressMap[devAddr] === address
            );
            return devnetAddress || address;
          });
          tokenAddresses = devnetTokenAddresses;
          /* FIXME: TO REMOVE IN MAINNET */

          const tokenVolumesArray = Object.values(tokenVolumes);

          const randomDelay = Math.random() * (3000 - 200) + 200;
          await new Promise((resolve) => setTimeout(resolve, randomDelay));

          try {
            const [gamePda] = await PublicKey.findProgramAddress(
              [
                Buffer.from("game"),
                new PublicKey(game.creator).toBuffer(),
                new anchor.BN(game.num).toArrayLike(Buffer, "le", 4),
              ],
              programId,
            );

            const [masterPda] = await PublicKey.findProgramAddress(
              [Buffer.from("master")],
              programId,
            );

            const masterAdminFees = new PublicKey(
              process.env.MASTER_ADMIN_FEES || "",
            );
            const masterAdminSwap = new PublicKey(
              process.env.MASTER_ADMIN_SWAP || "",
            );

            // @ts-ignore

            const transaction = new Transaction();
            const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
              units: 1_000_000,
            });
            transaction.add(computeUnitLimitIx);
            const pickWinnerIx = await program.methods
              .pickWinner(tokenAddresses, tokenVolumesArray)
              .accounts({
                // @ts-ignore
                game: gamePda,
                creator: new PublicKey(game.creator),
                // @ts-ignore
                master: masterPda,
                adminFees: masterAdminFees,
                adminSwap: masterAdminSwap,
                user: wallet.publicKey,
                systemProgram: SystemProgram.programId,
              })
              .instruction();

            /*console.log("tokenVolumesArray", tokenVolumesArray);
            console.log("gamePda", gamePda.toString());
            console.log("masterPda", masterPda.toString());
            console.log("masterAdminSwap", masterAdminSwap.toString());
            console.log("masterAdminFees", masterAdminFees.toString());
            console.log("game.creator", game.creator);
            console.log("wallet.publicKey", wallet.publicKey);*/

            transaction.add(pickWinnerIx);
            const signature = await connection3.sendTransaction(transaction, [walletKeypair]);
            await connection3.confirmTransaction(signature, 'confirmed');

            console.log(
              `Picked winner for game ${game.id}. Transaction signature: ${signature}`,
            );
            
          } catch (error) {
            console.error(`Error picking winner for game ${game.id}:`, error);
            await refreshAccount(new PublicKey(game.id), "PickWinner");
          }
        }
      });

      await Promise.all(gamePickPromises);
      console.log("Finished picking winners for all games.");
    }
  } catch (error) {
    console.error("Error checking and picking winners:");
  }
}

async function refreshAccount(accountId: PublicKey, instructionName: string){
  const options = { limit: 1 };
  const signatures = await connection3.getSignaturesForAddress(
    accountId,
    options,
  );
  if(signatures && signatures.length == 1){
    const accountInfo = await connection3.getAccountInfo(accountId);
    if (accountInfo) {
      await handleAccountChange(
        { accountId, accountInfo },
        signatures[0].signature,
        instructionName,
      );
    }
  }
}

async function processSwaps() {
  const swapsSnapshot = await db
    .collection("swaps")
    .where("status", "==", "todo")
    .get();

  swapsSnapshot.forEach(async (swapDoc) => {
    const swapData = swapDoc.data();

    await db.collection("swaps").doc(swapDoc.id).update({ status: "pending" });

    try {
      const swapResult = await performSwap(
        swapData.token_address,
        swapData.amount_in_SOL,
      );

      if (swapResult.success) {
        await db.collection("swaps").doc(swapDoc.id).update({
          status: "done",
          tokenAmount: swapResult.tokenAmount,
        });
        console.log(
          `Swap completed for game ${swapData.game_id}: ${swapResult.tokenAmount} ${swapData.token_address} received.`,
        );
      } else {
        await db
          .collection("swaps")
          .doc(swapDoc.id)
          .update({ status: "failed" });
        console.error(`Swap failed for game ${swapData.game_id}`);
      }
    } catch (error) {
      await db.collection("swaps").doc(swapDoc.id).update({ status: "todo" });
      console.error(`Error processing swap for game ${swapData.game_id}:`);
    }
    await sleep(250);
  });
}

async function processCompletedSwapForGame(swapData: any, swapId: any) {
  try {
    const gamePDA = new PublicKey(swapData.game_id);
    const mintAddress = new PublicKey(swapData.token_address);

    const gameTokenAccount = await getAssociatedTokenAddress(
      mintAddress, // Mint address
      gamePDA, // Owner (game PDA in this case)
      true, // Set `allowOwnerOffCurve` to true for PDAs
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const senderTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const signatureTransferTokens = await program.methods
      .transferTokensToGame(new BN(swapData.tokenAmount))
      .accounts({
        game: gamePDA, // Game PDA
        master: new PublicKey(process.env.MASTER_PDA || ""),
        user: wallet.publicKey, // User wallet
        mintAccount: mintAddress, // The mint account
        // @ts-ignore
        gameTokenAccount: gameTokenAccount, // Derived ATA for game PDA
        senderTokenAccount: senderTokenAccount, // Derived ATA for wallet
        adminSwap: new PublicKey(process.env.MASTER_ADMIN_SWAP || ""), // Admin Swap account
        tokenProgram: TOKEN_PROGRAM_ID, // Token program ID
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, // Associated token program ID
        systemProgram: SystemProgram.programId, // System program ID
      })
      .rpc();

    console.log(
      `Swap tokens sent to game ${swapData.game_id}. Transaction signature: ${signatureTransferTokens}`,
    );

    // Update the swap status in the database
    await db.collection("swaps").doc(swapId).update({ status: "processed" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.toString().includes("TokenSwapAlreadyDone")) {
        await db
          .collection("swaps")
          .doc(swapId)
          .update({ status: "processed" });
      }
    }
    console.error(
      `Error processing completed swap for game ${swapData.game_id}:`,
      error?.toString().substring(0, 50),
    );
  }
}

async function processCompletedSwaps() {
  const swapsSnapshot = await db
    .collection("swaps")
    .where("status", "==", "done")
    .get();

  swapsSnapshot.forEach(async (swapDoc) => {
    const swapData = swapDoc.data();
    const swapId = swapDoc.id;

    await processCompletedSwapForGame(swapData, swapId);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}