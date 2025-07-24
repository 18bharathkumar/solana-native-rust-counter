import { Connection, PublicKey, Transaction, TransactionInstruction, Keypair,SystemProgram } from '@solana/web3.js';
import * as fs from 'fs';
import * as borsh from 'borsh';
import { schema, CounterAccount, COUNTER_SIZE} from './types';


const program_id = new PublicKey('GLVqW7Da29RRr6rnwAe6eEDGNJW8mKygrasHzkBQC2Vz');


const connection = new Connection('https://api.devnet.solana.com');

// Import admin_account from keypair path
const admin_account = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync('/home/bharath/.config/solana/id.json', 'utf-8')))
);


// create data account with counter program as owner

const data_account = Keypair.generate();

try{

const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);
    const createAccounttxn = SystemProgram.createAccount({
        fromPubkey: admin_account.publicKey,
        newAccountPubkey: data_account.publicKey,
        lamports,
        space: COUNTER_SIZE,
        programId: program_id,
    });
    const txn2 = new Transaction().add(createAccounttxn);
    txn2.feePayer = admin_account.publicKey;
    txn2.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    txn2.sign(admin_account, data_account);
    const rawTransaction = txn2.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction);
    await connection.confirmTransaction(signature);

    console.log("signature",signature);

    console.log("data account pubkey",data_account.publicKey.toBase58());

}
catch(error){
    console.log(error);
}

