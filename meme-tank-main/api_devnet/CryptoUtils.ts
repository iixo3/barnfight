// swapUtils.ts

import {
  Connection,
  VersionedTransaction,
  Keypair,
  LAMPORTS_PER_SOL
  
} from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import { transactionSenderAndConfirmationWaiter } from "./utils/transactionSender";
import { getSignature } from "./utils/getSignature";

const HELIUS_RPC_URL = process.env.SOLANA_RPC_URL || "";
const JUP_QUOTE_API_URL = "https://quote-api.jup.ag/v6/quote";
const JUP_SWAP_API_URL = "https://quote-api.jup.ag/v6/swap";

const connection = new Connection(
  process.env.SOLANA_RPC_URL_3 || "",
  "confirmed",
);

const walletKeypairArray = process.env.KEYPAIR_ADMIN_SWAP
  ? JSON.parse(process.env.KEYPAIR_ADMIN_SWAP)
  : [];

const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairArray));

interface SwapResult {
    success: boolean;
    tokenAmount?: number;
}

export async function performSwap(token: string, amount: number): Promise<SwapResult> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const mockTokenAmount = 1000000000 * amount;

  return {
      success: true,
      tokenAmount: mockTokenAmount,
  };

  // return jupiterSwapOptimized(token, amount);
}

export async function fetchTokenDataWithRetry(tokenAddress: string, retries: number = 3): Promise<any> {
    const tokenUrl = `https://tokens.jup.ag/token/${tokenAddress}`;
  
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(tokenUrl);
        const tokenData = await response.json();
  
        // Check if daily_volume is valid
        if (tokenData && typeof tokenData.daily_volume === 'number') {
          return tokenData;
        } else {
          console.warn(`No daily volume found for token ${tokenAddress}, setting to 0.`);
          return { daily_volume: 0 };  // Default to 0 if no daily volume is found
        }
      } catch (error) {
        console.error(`Error fetching data for token ${tokenAddress}, attempt ${attempt}:`, error);
  
        // If max retries reached, throw the error
        if (attempt === retries) {
          throw error;
        }
  
        // Wait for 2 seconds before retrying
        console.log(`Retrying fetching data for token ${tokenAddress} in 2 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  export async function jupiterSwapOptimized(token: string, amount: number): Promise<SwapResult>{
    const wallet = new Wallet(walletKeypair);
    const quote = await getQuote(token, amount);
    const swapObj = await getSwapObj(wallet, quote);

     // Serialize the transaction
    const swapTransactionBuf = Buffer.from(swapObj.swapTransaction, "base64");
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign the transaction
    transaction.sign([wallet.payer]);
    const signature = getSignature(transaction);

    // We first simulate whether the transaction would be successful
    const { value: simulatedTransactionResponse } =
    await connection.simulateTransaction(transaction, {
      replaceRecentBlockhash: true,
      commitment: "processed",
    });

    const { err, logs } = simulatedTransactionResponse;

    if (err) {
      console.error("Simulation Error:");
      console.error({ err, logs });
      return {
        success: false,
        tokenAmount: 0,
      };
    }

    const serializedTransaction = Buffer.from(transaction.serialize());
    const blockhash = transaction.message.recentBlockhash;

    const transactionResponse = await transactionSenderAndConfirmationWaiter({
      connection,
      serializedTransaction,
      blockhashWithExpiryBlockHeight: {
        blockhash,
        lastValidBlockHeight: swapObj.lastValidBlockHeight,
      },
    });
  
    if (!transactionResponse) {
      console.error("Transaction not confirmed");
      return {
        success: false,
        tokenAmount: 0,
      };
    }
  
    if (transactionResponse.meta?.err) {
      console.error(transactionResponse.meta?.err);
      return {
        success: false,
        tokenAmount: 0,
      };
    }
  
    console.log(`https://solscan.io/tx/${signature}`);

    // Extract balances before and after the transaction
    const preTokenBalances = transactionResponse.meta?.preTokenBalances || [];
    const postTokenBalances = transactionResponse.meta?.postTokenBalances || [];

    // Find the pre-transaction balance for the specified wallet and token
    const preBalanceInfo = preTokenBalances.find(
      (balance) => balance.owner === process.env.MASTER_ADMIN_SWAP && balance.mint === token
    );
    const preUiTokenAmount = preBalanceInfo?.uiTokenAmount.amount || 0;

    // Find the post-transaction balance for the specified wallet and token
    const postBalanceInfo = postTokenBalances.find(
      (balance) => balance.owner === process.env.MASTER_ADMIN_SWAP && balance.mint === token
    );
    const postUiTokenAmount = postBalanceInfo?.uiTokenAmount.amount || 0;

    // Calculate the difference (after - before)
    const tokenAmountChange = Number(postUiTokenAmount) - Number(preUiTokenAmount);

    return {
      success: true,
      tokenAmount: tokenAmountChange,
    };
  }

  async function getSwapObj(wallet: Wallet, quote: any) {
    // Get serialized transaction
    const swapObj = await (
      await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: wallet.publicKey.toString(),
          dynamicComputeUnitLimit: true, // Set this to true to get the best optimized CU usage.
          dynamicSlippage: { // This will set an optimized slippage to ensure high success rate
            maxBps: 300 // Make sure to set a reasonable cap here to prevent MEV
          },
            prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 10000000,
              priorityLevel: "veryHigh" // If you want to land transaction fast, set this to use `veryHigh`. You will pay on average higher priority fee.
            }
          }
        })
      })
    ).json();
    //console.log("swapObj", swapObj);
    return swapObj;
  }

  async function getQuote(token: string, amount: number) {
    // auto slippage w/ minimizeSlippage params
    const params = {
      inputMint: "So11111111111111111111111111111111111111112",
      outputMint: token, // $WIF
      amount: (amount*LAMPORTS_PER_SOL).toString(), // SOL
      autoSlippage: 'true',
      autoSlippageCollisionUsdValue: '1000',
      maxAutoSlippageBps: '1000', // 10%
      minimizeSlippage: 'true',
      onlyDirectRoutes: 'false',
      asLegacyTransaction: 'false',
    };
    
    // Convert params to query string
    const queryParams = new URLSearchParams(params).toString();
    
    const quoteResponse = await (
      await fetch(`https://quote-api.jup.ag/v6/quote?${queryParams}`)
    ).json();
      
    if (!quoteResponse) {
      throw new Error("unable to quote");
    }
    return quoteResponse;
  }
