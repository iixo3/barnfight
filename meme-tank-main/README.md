#  Barnfight

Welcome to **Barnfight**! A gamified prediction market where you can bet on your favorite memecoins, influencers can monetize their audience, and projects can attract and retain attention. Dive into the world of memecoins, compete against other users, and see if you can predict which meme will tank or moon!

Whether you're here to place a bet, build a reputation, or simply have fun with memes, Barnfight is your go-to platform.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** v18.18.0 or higher
- **Rust** v1.77.2 or higher
- **Anchor CLI** 0.30.0 or higher
- **Solana CLI** 1.18.9 or higher

### Installation

Follow these steps to set up the project locally:

#### 1. Clone the Repository

```bash
git clone <repo-url>
cd <repo-name>
```
#### 2. Install Dependencies

```bash
npm install
```
#### 3. Start the Web App

To run the app locally:

```bash
npm run dev
```
Now, you should see the app running on [http://localhost:3000](http://localhost:3000).

## 
### 🚧 Setting Up the Master of the Barnfight program

To set up a Master with a wallet, follow these steps:

1. **Create Master**: Use your admin wallet address to create the Master.
2. **Wallet Fees**: the wallet receiving the fees (`MASTER_ADMIN_FEES`).
3. **Wallet Swap**: the wallet doing the token swaps (`MASTER_ADMIN_SWAP`).

## 🧩 Apps

### 🔩 Anchor

The Solana program for Barnfight is built using Rust with the Anchor framework.

#### Key Commands

- **Sync Program ID**: Generate a new keypair and sync the program ID with:

  ```bash
  npm run anchor keys sync
  ```

- **Build the Program**:

  ```bash
  npm run anchor-build
  ```

- **Start a Local Validator**: Deploy the program to a local validator for testing:

  ```bash
  npm run anchor-localnet
  ```

- **Run Tests**:

  ```bash
  npm run anchor-test
  ```
- **Deploy to Devnet**:

  ```bash
  npm run anchor deploy --provider.cluster devnet
  ```
### 🌐 Web

The web app is a React-based frontend that interacts with the Solana program via the Anchor-generated client.

#### Commands

- **Start the Web App**:

  ```bash
  npm run dev
  ```
- **Build the Web App**:

  ```bash
  npm run build
  ```

- **Run the API**:

  ```bash
    npx ts-node index.ts 
  ```