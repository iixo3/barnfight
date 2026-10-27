"use server";

export async function isWalletWhitelisted(walletAddress: string) {
  const allowedWallets = (process.env.WHITELISTED_WALLETS || "")
    .split(",")
    .map((wallet) => wallet.trim())
    .filter(Boolean);

  return allowedWallets.includes(walletAddress);
}
