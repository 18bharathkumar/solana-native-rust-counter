# Solana On-Chain Counter dApp

A modern, full-stack decentralized application (dApp) featuring a native Rust Solana program and a beautiful React + Tailwind CSS frontend. This project demonstrates how to build, deploy, and interact with a custom Solana smart contract (program) using the latest web technologies.

---

## 🚀 Overview

- **Native Rust Solana Program:**
  - Implements a simple, secure on-chain counter using Rust and Borsh serialization.
  - Supports increment and decrement operations by arbitrary values.
- **Modern React Frontend:**
  - Clean, responsive UI built with React and Tailwind CSS.
  - Connects to Phantom Wallet for secure transactions.
  - Displays live counter value, transaction history, and explorer links.

---

## ✨ Features

- **Native Rust Smart Contract:**
  - Written in idiomatic Rust for maximum performance and safety.
  - Uses Borsh for efficient serialization/deserialization.
  - Handles increment and decrement instructions with custom values.
- **User-Friendly Web App:**
  - Connect/disconnect Phantom Wallet.
  - Increment or decrement the counter by any value.
  - View program and account addresses with direct Solana Explorer links.
  - See transaction status and history instantly.
  - Fully responsive and accessible design.

---

## 🛠️ Tech Stack

- **Solana Program:** Rust, Borsh, Solana SDK
- **Frontend:** React, TypeScript, Tailwind CSS, @solana/web3.js
- **Testing:** Bun, Jest (for integration and unit tests)

---

## 🏗️ Project Structure

```
native-rust/
├── program/         # Native Rust Solana program (on-chain logic)
│   └── src/
│       └── lib.rs   # Main Rust program logic
├── client/          # React frontend (modern dApp UI)
│   └── src/
│       └── App.tsx  # Main React app
├── tests/           # Integration and utility tests (Bun, TypeScript)
├── readme.md        # This file
└── ...
```

---

## 🏁 Getting Started

### 1. **Clone the Repository**
```sh
git clone https://github.com/your-username/solana-native-rust-counter.git
cd solana-native-rust-counter
```

### 2. **Build and Deploy the Rust Program**
- Navigate to `program/` and build/deploy using Solana CLI:
```sh
cd program
cargo build-bpf
# Deploy to devnet or localnet
solana program deploy ./target/deploy/native_rust.so
```

### 3. **Install Frontend Dependencies**
```sh
cd ../client
bun install
```

### 4. **Run the Frontend**
```sh
bun run dev
```

### 5. **Open in Browser**
- Visit [http://localhost:5173](http://localhost:5173) and connect your Phantom Wallet.

---

## 📚 Learn More
- [Solana Docs](https://docs.solana.com/)
- [Rust Programming Language](https://www.rust-lang.org/)
- [Phantom Wallet](https://phantom.app/)
- [Borsh Serialization](https://borsh.io/)

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

**Built with ❤️ using native Rust and modern web technologies.**
