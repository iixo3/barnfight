# Barnfight

Barnfight is a memecoin betting game on Solana. A host creates a game with a set of memecoins, and players buy tickets on the coins they back. Ticket prices follow a bonding curve: each ticket costs more than the last, and tickets can be sold back before the game ends. When time runs out, the on-chain program ranks the coins and pays the prize pool to the winning ticket holders. A host can stream the game live on Twitch or YouTube next to the betting panel.

The project is no longer developed. The code is published as it was, with keys, passwords and on-chain addresses (contract, games, wallets) removed.

## The two apps

| Folder | What it is |
|---|---|
| `meme-tank-main/` | The Solana program (smart contract), a background API that keeps the database in sync with the chain, and a small test web app |
| `game-frontend-nextjs-main/` | The player-facing web app, plus the Firebase Cloud Functions behind it |

### meme-tank-main

- `anchor/`: the Solana program, written in Rust with the Anchor framework. Its instructions cover setting up the master account, creating games, buying and selling tickets (`state/bonding_curve.rs`), joining a game, picking winners and claiming prizes.
- `api_devnet/` and `api_mainnet/`: the same Node.js service for each network. It watches the program's accounts on chain, copies their state into Firebase, picks winners when games end, and handles token swaps through the Jupiter swap API.
- `web/`: a minimal Next.js app for calling the program directly while developing it.

### game-frontend-nextjs-main

- `src/`: a Next.js app with the game lobby and search (Algolia), game pages with live stream and chat, ticket buying, a token swap page, player profiles and a multi-step "create game" flow. It reads game data from Firebase and sends transactions to the program through the player's Solana wallet.
- `firebase-functions/`: Cloud Functions for sign-in, game settings and stream requests, profile changes, price-chart updates, and syncing on-chain transactions into Firestore.
- `firestore.rules`, `database.rules.json`, `storage.rules`: Firebase security rules.

## How they fit together

1. A player acts in the front end (for example, buys a ticket). The wallet signs a transaction that goes to the Solana program.
2. The API (`meme-tank-main/api_*`) sees the account change on chain and writes the new state to Firebase.
3. The front end reads Firebase and updates the game page. The Cloud Functions handle the server-side jobs (sign-in, transaction sync, price chart).
4. When a game ends, the API calls the program to pick the winners. Players then claim their prizes from the front end.

## Running it

Every key and account setting has been removed. Each folder that needs settings has a `.env.example` listing the names; copy it to `.env` (or `.env.local` for the front end) and fill in your own values. Running it needs your own Firebase project, Solana RPC endpoints, and the program deployed under your own keys.

**Solana program** (needs Rust, the Solana CLI and the Anchor CLI; versions in `meme-tank-main/README.md`):

```bash
cd meme-tank-main
npm install
npm run anchor-build
npm run anchor-test
```

The contract address is marked `PROGRAM_ID_REMOVED`: run `npm run anchor keys sync` to set your own (see `meme-tank-main/README.md`). The wallets allowed to create and close games are placeholders (`ADMIN_WALLET_1` …) in `anchor/programs/memetank/src/instructions/initialize_game.rs` and `close_game_account.rs`.

**API** (from `meme-tank-main`, after `npm install`):

```bash
cd meme-tank-main/api_devnet
node index.js
```

It also needs a Firebase service-account file named `firebaseServiceAccount.json` in the same folder (never committed).

**Front end** (Node.js 18 or later):

```bash
cd game-frontend-nextjs-main
npm install
npm run dev
```

**Cloud Functions** (Node.js 20 and the Firebase CLI):

```bash
cd game-frontend-nextjs-main/firebase-functions
npm install
npm run serve
```

## Credits and use

The Solana program and API in `meme-tank-main` were built by odomart. The code is published to show the work: you're welcome to read it, but it is not licensed for reuse.
