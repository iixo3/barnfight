import { Connection } from "@solana/web3.js";
import {
  classToPlainObject,
  deserializeGame,
  deserializeMaster,
  deserializeParticipation,
  deserializeUser,
  detectAccountType,
} from "../../utils/anchor/index.js";
import admin from "firebase-admin";

import { onTaskDispatched } from "firebase-functions/v2/tasks";

const connection_devnet = new Connection(
  process.env.SOLANA_RPC_URL_DEVNET,
  "confirmed"
);
const connection = new Connection(
  process.env.SOLANA_RPC_URL_MAINNET,
  "confirmed"
);

async function handleAccountChange(accountInfo, signature) {
  const {
    accountId,
    accountInfo: { data },
  } = accountInfo;
  const dataBuffer = Buffer.from(data);
  const db = admin.firestore();
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
  } catch (error) {
    console.error("Error decoding account data:", error);
    console.error("Account ID:", accountId.toString());
    console.error("Signature:", signature);
  }
}

const syncAccountTask = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 5,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 6,
    },
  },
  async (event) => {
    const { accountId, signature } = event.data;
    console.log(`Syncing account ${accountId} for transaction ${signature}`);
    //const accountInfo = await connection.getAccountInfo(accountId);

    const doAccountInfo =
      process.env.NEXT_PUBLIC_CLUSTER_MEMETANK_PROGRAM === "devnet" &&
      (await connection_devnet.getAccountInfo(accountId));

    if (process.env.NEXT_PUBLIC_CLUSTER_MEMETANK_PROGRAM === "devnet") {
      await handleAccountChange(
        { accountId, accountInfo: doAccountInfo },
        signature
      );
    }

    // if (accountInfo) {
    //await handleAccountChange({accountId, accountInfo}, signature);
    // }
  }
);

export default syncAccountTask;
