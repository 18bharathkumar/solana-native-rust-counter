// create_counter_account.ts
import { Connection, Keypair, SystemProgram, Transaction, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import * as fs from "fs";

// Replace with your program ID and funder keypair path
const PROGRAM_ID = new PublicKey("GLVqW7Da29RRr6rnwAe6eEDGNJW8mKygrasHzkBQC2Vz");
const connection = new Connection("https://api.devnet.solana.com");
const funder = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync("/home/bharath/.config/solana/id.json", "utf-8")))
);

// Generate a new keypair for the data account
const dataAccount = Keypair.generate();
fs.writeFileSync("counter-data-keypair.json", JSON.stringify(Array.from(dataAccount.secretKey)));

// 8 bytes for a u32 counter (safe for Borsh)
const space = 8;
const lamports = await connection.getMinimumBalanceForRentExemption(space);

const tx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: funder.publicKey,
    newAccountPubkey: dataAccount.publicKey,
    lamports,
    space,
    programId: PROGRAM_ID,
  })
);

const sig = await sendAndConfirmTransaction(connection, tx, [funder, dataAccount]);
console.log("Created data account:", dataAccount.publicKey.toBase58());
console.log("Tx signature:", sig);