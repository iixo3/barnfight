import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getDatabase } from "firebase-admin/database";
import { getFunctions } from "firebase-admin/functions";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const connection_devnet = new Connection(
  process.env.SOLANA_RPC_URL_DEVNET,
  "confirmed"
);
const connection = new Connection(
  process.env.SOLANA_RPC_URL_MAINNET,
  "confirmed"
);

const onConnection =
  process.env.NEXT_PUBLIC_CLUSTER_MEMETANK_PROGRAM === "devnet"
    ? connection_devnet
    : connection;

const onTransactionDocumentCreated = onDocumentCreated(
  "transaction/{transactionId}",
  async (event) => {
    const internalTransaction = event.data;
    console.log(`Transaction created: ${internalTransaction.id}`);

    const queue = getFunctions().taskQueue("syncAccountTask");
    const transaction = await onConnection.getTransaction(
      internalTransaction.id,
      { commitment: "confirmed" }
    );

    const enqueues = [];
    if (transaction && transaction.meta && transaction.meta.logMessages) {
      for (const log of transaction.meta.logMessages) {
        if (log.includes("ACCOUNT-UPDATE:")) {
          const match = log.match(/ACCOUNT-UPDATE: (\w+)/);
          if (match) {
            const accountId = new PublicKey(match[1]);
            enqueues.push(
              queue.enqueue({ accountId, signature: internalTransaction.id })
            );
            // const accountInfo = await connection.getAccountInfo(accountId);
            // if (accountInfo) {
            //     await handleAccountChange({accountId, accountInfo}, signatureInfo.signature);
            //     await new Promise(resolve => setTimeout(resolve, 300));
            // }
          }
        }
      }
    }
    await Promise.all(enqueues);

    //identify if transaction is tied to a project
    //get data from chain
    //update real time database
    //increment data
    const db = getDatabase();
    const ref = db.ref("games/1/stats");
    await ref.transaction((stats) => {
      //check stats.last_udpate
      //if stats.last_update is less than transaction.timestamp
      //update stats
      //demo object
      return {
        ...stats,
        pool: 1,
        streamers: 1,
        tickets: 100,
        users_registered: 100,
        funds: 10,
        //last_update: transaction.ti -> blockchain timestamp
      };
    });
  }
);
export default onTransactionDocumentCreated;
