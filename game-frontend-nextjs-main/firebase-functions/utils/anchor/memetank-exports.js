// Here we export some useful types and functions for interacting with the Anchor program.
import {  Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import MemetankIDL from './memetank.json' assert { type: "json" };
import bs58 from 'bs58';

// Re-export the generated IDL and type
export  { MemetankIDL };

// The programId is imported from the program IDL.
export const MEMETANK_PROGRAM_ID = new PublicKey(MemetankIDL.address);

// This is a helper function to get the Memetank Anchor program.
export function getMemetankProgram(provider) {
    return new Program(MemetankIDL, provider);
}

export const DISCRIMINATORS = {
    user: Buffer.from([0x9f, 0x75, 0x5f, 0xe3, 0xef, 0x97, 0x3a, 0xec]),
    game: Buffer.from([0x1b, 0x5a, 0xa6, 0x7d, 0x4a, 0x64, 0x79, 0x12]),
    master: Buffer.from([0xa8, 0xd5, 0xc1, 0x0c, 0x4d, 0xa2, 0x3a, 0xeb]),
    participation: Buffer.from([0xed, 0x9a, 0x8e, 0x2e, 0x8f, 0x3f, 0xbd, 0x12])
};
export function classToPlainObject(instance) {
    if (instance === null || typeof instance !== 'object') {
        return instance;
    }

    if (Array.isArray(instance)) {
        return instance.map(item => classToPlainObject(item));
    }

    const plainObject = {};
    for (const [key, value] of Object.entries(instance)) {
        if (value !== undefined) {
            if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
                plainObject[key] = bs58.encode(value);
            } else if (typeof value === 'bigint') {
                plainObject[key] = value <= Number.MAX_SAFE_INTEGER ? Number(value) : value.toString();
            } else if (Array.isArray(value)) {
                plainObject[key] = value.map(item => classToPlainObject(item));
            } else if (typeof value === 'object' && value !== null) {
                plainObject[key] = classToPlainObject(value);
            } else {
                plainObject[key] = value;
            }
        }
    }
    return plainObject;
}

// This is a helper function to get the program ID for the Memetank program depending on the cluster.
export function getMemetankProgramId(cluster) {
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

export function  deserializeUser(buffer) {
    let offset = 8; // Start after discriminator

    const user_pubkey = buffer.slice(offset, offset + 32);
    offset += 32;

    const number_tickets = buffer.readBigUInt64LE(offset);
    offset += 8;

    const number_game_created = buffer.readUInt32LE(offset);
    offset += 4;

    return {
        user_pubkey,
        number_tickets,
        number_game_created
    };
}

export function detectAccountType(buffer) {
    const discriminator = buffer.slice(0, 8);
    for (const [accountType, discr] of Object.entries(DISCRIMINATORS)) {
        if (discriminator.equals(discr)) {
            return accountType;
        }
    }
    return null;
}

function calculateTokenInfoSize(buffer, startOffset) {
    let offset = startOffset;
    offset += 4 + buffer.readUInt32LE(offset); // name
    offset += 8; // number_of_tickets
    offset += 4 + buffer.readUInt32LE(offset); // symbol
    offset += 32; // token_address
    offset += 1; // is_winner
    offset += 1; // has_winner_list_id
    if (buffer.readUInt8(offset - 1) !== 0) {
        offset += 4 + buffer.readUInt32LE(offset) * 8; // winner_list_id
    }
    offset += 1; // has_position_final
    if (buffer.readUInt8(offset - 1) !== 0) {
        offset += 1; // position_final
    }
    offset += 8; // total_amount_wallet
    return offset - startOffset;
}

export function deserializeWinnerInfo(buffer, startOffset) {
    let offset = startOffset;

    const position = buffer.readUInt8(offset);
    offset += 1;

    const percentage = buffer.readUInt8(offset);
    offset += 1;

    const distributionLength = buffer.readUInt32LE(offset);
    offset += 4;
    const winner_distribution = [];
    for (let i = 0; i < distributionLength; i++) {
        winner_distribution.push({
            percentage: buffer.readUInt8(offset++),
            num_winners: buffer.readUInt8(offset++),
            fair_distribution_all: buffer.readUInt8(offset++) !== 0
        });
    }

    return {
        position,
        percentage,
        winner_distribution
    };
}

export function deserializeTokenInfo(buffer, startOffset) {
    let offset = startOffset;

    const nameLength = buffer.readUInt32LE(offset);
    offset += 4;
    const name = buffer.slice(offset, offset + nameLength).toString('utf8');
    offset += nameLength;

    const number_of_tickets = buffer.readBigUInt64LE(offset);
    offset += 8;

    const symbolLength = buffer.readUInt32LE(offset);
    offset += 4;
    const symbol = buffer.slice(offset, offset + symbolLength).toString('utf8');
    offset += symbolLength;

    const token_address = buffer.slice(offset, offset + 32);
    offset += 32;

    const is_winner = buffer.readUInt8(offset) !== 0;
    offset += 1;

    // Read optional winner_list_id
    const hasWinnerListId = buffer.readUInt8(offset) !== 0;
    offset += 1;
    let winner_list_id = null;
    if (hasWinnerListId) {
        const winnerListIdLength = buffer.readUInt32LE(offset);
        offset += 4;
        winner_list_id = [];
        for (let i = 0; i < winnerListIdLength; i++) {
            winner_list_id.push(buffer.readBigUInt64LE(offset));
            offset += 8;
        }
    }

    // Read optional position_final
    const hasPositionFinal = buffer.readUInt8(offset) !== 0;
    offset += 1;
    const position_final = hasPositionFinal ? buffer.readUInt8(offset++) : null;

    const total_amount_wallet = buffer.readBigUInt64LE(offset);
    offset += 8;

    return {
        name,
        number_of_tickets,
        symbol,
        token_address,
        is_winner,
        winner_list_id,
        position_final,
        total_amount_wallet
    };
}

function calculateWinnerInfoSize(buffer, startOffset) {
    let offset = startOffset;
    offset += 2; // position and percentage
    const distributionLength = buffer.readUInt32LE(offset);
    offset += 4 + distributionLength * 3; // 3 bytes per distribution entry
    return offset - startOffset;
}
export function deserializeGame(buffer) {
    let offset = 8; // Start after discriminator

    const id = buffer.slice(offset, offset + 32);
    offset += 32;

    const creator = buffer.slice(offset, offset + 32);
    offset += 32;

    const num = buffer.readUInt32LE(offset);
    offset += 4;

    const is_ended = buffer.readUInt8(offset) !== 0;
    offset += 1;

    const start_date = buffer.readBigInt64LE(offset);
    offset += 8;

    const end_date = buffer.readBigInt64LE(offset);
    offset += 8;

    const total_reward = buffer.readDoubleLE(offset);
    offset += 8;

    const remaining_reward = buffer.readDoubleLE(offset);
    offset += 8;

    const initial_reward = buffer.readDoubleLE(offset);
    offset += 8;

    // Read optional name
    const hasName = buffer.readUInt8(offset) !== 0;
    offset += 1;
    let name = null;
    if (hasName) {
        const nameLength = buffer.readUInt32LE(offset);
        offset += 4;
        name = buffer.slice(offset, offset + nameLength).toString('utf8');
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
        num,
        is_ended,
        start_date,
        end_date,
        total_reward,
        remaining_reward,
        initial_reward,
        name,
        tokens,
        winners
    };
}

export function deserializeMaster(buffer) {
    let offset = 8; // Start after discriminator

    const total_number_ticket = buffer.readBigUInt64LE(offset);
    offset += 8;

    const admin = buffer.slice(offset, offset + 32);
    offset += 32;

    return {
        total_number_ticket,
        admin
    };
}

export function deserializeParticipation(buffer) {
    let offset = 8; // Start after discriminator

    const user_pubkey = buffer.slice(offset, offset + 32);
    offset += 32;

    const gameIdLength = buffer.readUInt32LE(offset);
    offset += 4;
    const game_id = buffer.slice(offset, offset + gameIdLength).toString('utf8');
    offset += gameIdLength;

    const token_address = buffer.slice(offset, offset + 32);
    offset += 32;

    const rangesLength = buffer.readUInt32LE(offset);
    offset += 4;
    const ranges = [];
    for (let i = 0; i < rangesLength; i++) {
        const start = buffer.readBigUInt64LE(offset);
        offset += 8;
        const end = buffer.readBigUInt64LE(offset);
        offset += 8;
        ranges.push({ start, end });
    }

    const is_claimed = buffer.readUInt8(offset) !== 0;
    offset += 1;

    return {
        user_pubkey,
        game_id,
        token_address,
        ranges,
        is_claimed
    };
}
