// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import MemetankIDL from '../target/idl/memetank.json';
import type { Memetank } from '../target/types/memetank';

// Re-export the generated IDL and type
export { Memetank, MemetankIDL };

// The programId is imported from the program IDL.
export const MEMETANK_PROGRAM_ID = new PublicKey(MemetankIDL.address);

// This is a helper function to get the Memetank Anchor program.
export function getMemetankProgram(provider: any) {
  return new Program(MemetankIDL as Memetank, provider);
}

// This is a helper function to get the program ID for the Memetank program depending on the cluster.
export function getMemetankProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Memetank program on devnet and testnet.
      return new PublicKey('PROGRAM_ID_REMOVED');
    case 'mainnet-beta':
    default:
      return MEMETANK_PROGRAM_ID;
  }
}
