<div align="center">
    <img src="https://files.catbox.moe/sdhgbl.png">
</div>

# Bubbl Wallet 🫧  
*AI-Powered Hardware Wallet with Built-In Offline Intelligence*  

Bubbl Wallet is a next-generation *hardware crypto wallet* designed with *offline AI assistance* and *multi-signature security*.  

Unlike traditional wallets, Bubbl Wallet doesn’t just store your assets — it *actively protects you* by analyzing your transactions and flagging anything suspicious before you sign.  

Every transaction is co-signed by *you* and an *offline AI model*, ensuring both usability and safety at the same time.  

---

## 🚀 Vision  
The future of Web3 security lies in *self-custody with intelligence*.  
While existing wallets rely heavily on users’ knowledge and centralized interfaces, Bubbl Wallet ensures:  
- *Maximum safety*: Funds remain protected even if frontends or dApps are compromised.  
- *Smarter decisions*: Our offline AI understands transaction context, ABIs, contacts, and prompts.  
- *True independence*: No reliance on external servers. Everything is stored and verified **inside the hardware wallet**.  

---

## ⚠️ The Problem  
- Crypto users often *cannot interpret raw transactions* (complex contract calls, misleading UI).  
- Past hacks (e.g., *Safe frontend compromise, Bybit exploit) proved that **even secure protocols can fail if frontends are attacked**.  
- Current hardware wallets only protect private keys — they *don’t help users know if a transaction is safe*.  

---

## 💡 Our Solution  
Bubbl Wallet introduces:  

- *Offline AI Validator* 🧠 → Every transaction is reviewed locally by an AI before approval.  
- *Multi-Signature by Design* 🔑 → Each account has *two signers*:  
  1. *The user*  
  2. *The AI co-signer*  
  A transaction only goes through when both agree.
- *Cross-Chain Support* 🌍 → Works seamlessly across multiple blockchains.  

---

## ✨ Features  
- 🔒 *Hardware-level security* for keys, data, and AI model  
- 🤖 *AI Co-Signer* to detect unsafe or malicious transactions
- 🌐 *Multi-chain support* (currently *Base, Flow, Rootstock*)  
- 🖥 *Desktop app* with [Tauri](https://tauri.app/)  
- 👥 *Contact manager*: Save and reuse frequent addresses safely  
- ⚡️ *Seamless UX*: Plug-and-play experience with your PC  

---

## 🛠 Tech Stack  
- *Frontend* → [Next.js](https://nextjs.org/)  
- *Backend* → [Express.js](https://expressjs.com/) + [Node.js](https://nodejs.org/)  
- *Desktop App* → [Tauri](https://tauri.app/)  
- *Smart Contracts* → Solidity / chain-specific contracts  
- *AI Runtime* → Offline LLM running on device  
- *Supported Chains* → Base, Flow, Rootstock

---

## 📂 Project Structure  
```bash
bubble-wallet/
│
├── contracts/   # Smart contracts (multisig logic, transfers, etc.)
├── client/      # Frontend (Next.js) + Desktop integration (Tauri)
├── server/      # Backend (Node.js + Express API)
└── hardware/    # Hardware wallet core (AI runtime, storage, signing)
```

## ⛓️ Supported Blockchains

- Base
- Flow
- Rootstock

(More chains coming soon!)

## 📜 Deployed Contracts

| Chain     | Contract | Address |
|-----------|----------|---------|
| Flow      | MasterCopy | [0x48f3b5dC20C0eb4F1eb70f5D6aBe2fD8E60d5259](https://evm-testnet.flowscan.io/address/0x48f3b5dC20C0eb4F1eb70f5D6aBe2fD8E60d5259?tab=contract)   |
| Rootstock | MasterCopy | [0x48f3b5dC20C0eb4F1eb70f5D6aBe2fD8E60d5259](https://rootstock-testnet.blockscout.com/address/0x48F3B5dc20C0EB4f1EB70F5d6ABe2fd8e60d5259)   |
| Flow      | ProxyFactory | [0xCdEfcE8B1b2fA23cbdd4c381B2D3b0A79366dA0a](https://evm-testnet.flowscan.io/address/0xCdEfcE8B1b2fA23cbdd4c381B2D3b0A79366dA0a?tab=contract)   |
| Rootstock | ProxyFactory | [0xCdEfcE8B1b2fA23cbdd4c381B2D3b0A79366dA0a](https://evm-testnet.flowscan.io/address/0xCdEfcE8B1b2fA23cbdd4c381B2D3b0A79366dA0a?tab=contract)   |


## ⚙️ Hardware Specifications (for hackathon)

The Bubbl Wallet device is purpose-built for security and offline intelligence.

- 21 mm × 51 mm form factor
- RP2040 microcontroller chip designed by Raspberry Pi in the UK
- Dual-core Arm Cortex-M0+ processor, flexible clock running up to 133 MHz
- 264kB on-chip SRAM
- 2MB on-board QSPI flash

## 🚧 Current Status

✅ Multisig wallet core logic complete

✅ Hardware prototype done

✅ AI integration

🔜 Expanding to more blockchains

🔜 Firmware and security audits

## 📥 Getting Started (Development Setup)

Clone the repository:

```bash
git clone https://github.com/Bubbl-Wallet/main.git
cd bubble-wallet
```


Install dependencies for the frontend:

```bash
cd client
npm install
npm run dev
```


Run backend:

```bash
cd server
npm install
npm run start
```


Compile contracts:

```bash
cd contracts
npm install
npx hardhat compile
```

Run desktop app (via Tauri):

```bash
npm run tauri dev
```

## 🗺 Roadmap

- Expand chain support (Ethereum, Solana, etc.)

- Full AI integration (contextual analysis + user prompt understanding)

- Independent firmware audit

- Mobile companion app

## 🌟 Why Bubbl Wallet?

Unlike traditional wallets, Bubbl Wallet doesn’t just secure your private keys — it secures your decisions.

By pairing hardware security with offline AI intelligence, Bubbl Wallet ensures you always know what you’re signing.