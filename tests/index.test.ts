import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { test, expect } from "bun:test";
import { COUNTER_SIZE, CounterAccount, schema } from "./types";
import * as borsh from "borsh";

let Admin_account = Keypair.generate();
let Data_account = Keypair.generate();

const connection = new Connection("http://127.0.0.1:8899");
const program_id = new PublicKey("GLVqW7Da29RRr6rnwAe6eEDGNJW8mKygrasHzkBQC2Vz");


function encodeManualInstruction(variant: 0 | 1, value: number) {
    // variant: 0 = Increment, 1 = Decrement
    const variantBuf = Buffer.from([variant]);
    const valueArray = new Uint32Array([value]);
    const valueBuf = Buffer.from(new Uint8Array(valueArray.buffer));
    return Buffer.concat([variantBuf, valueBuf]);
}

test("Counter program integration", async () => {
    // Fund admin
    const txn1 = await connection.requestAirdrop(Admin_account.publicKey, 1 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(txn1);

    // Create data account
    const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);
    const createAccounttxn = SystemProgram.createAccount({
        fromPubkey: Admin_account.publicKey,
        newAccountPubkey: Data_account.publicKey,
        lamports,
        space: COUNTER_SIZE,
        programId: program_id,
    });
    const txn2 = new Transaction().add(createAccounttxn);
    txn2.feePayer = Admin_account.publicKey;
    txn2.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    txn2.sign(Admin_account, Data_account);
    const rawTransaction = txn2.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction);
    await connection.confirmTransaction(signature);

    console.log("data account pubkey",Data_account.publicKey.toBase58());

    // Check initial value
    let data_account_info = await connection.getAccountInfo(Data_account.publicKey);
    if (!data_account_info || !data_account_info.data) throw new Error("Failed to fetch data account info or data is missing");
    let counter = borsh.deserialize(schema, data_account_info.data) as CounterAccount;

    
    expect(counter.count).toBe(0);

    // Increment by 5 (variant 0)
    const incrementIx = new TransactionInstruction({
        keys: [
            { pubkey: Data_account.publicKey, isSigner: false, isWritable: true }
        ],
        programId: program_id,
        data: encodeManualInstruction(0, 5)
    });



    const incrementTx = new Transaction().add(incrementIx);
    incrementTx.feePayer = Admin_account.publicKey;
    incrementTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    incrementTx.sign(Admin_account);
    const incSig = await connection.sendRawTransaction(incrementTx.serialize());
    await connection.confirmTransaction(incSig);


    // Check incremented value
    data_account_info = await connection.getAccountInfo(Data_account.publicKey);
    counter = borsh.deserialize(schema, data_account_info!.data) as CounterAccount;
    expect(counter.count).toBe(5);

    // Decrement by 2 (variant 1)
    const decrementIx = new TransactionInstruction({
        keys: [
            { pubkey: Data_account.publicKey, isSigner: false, isWritable: true }
        ],
        programId: program_id,
        data: encodeManualInstruction(1, 2)
    });

    const decrementTx = new Transaction().add(decrementIx);
    decrementTx.feePayer = Admin_account.publicKey;
    decrementTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    decrementTx.sign(Admin_account);
    const decSig = await connection.sendRawTransaction(decrementTx.serialize());
    await connection.confirmTransaction(decSig);

    // Check decremented value
    data_account_info = await connection.getAccountInfo(Data_account.publicKey);
    counter = borsh.deserialize(schema, data_account_info!.data) as CounterAccount;
    expect(counter.count).toBe(3);
}, 60000);








