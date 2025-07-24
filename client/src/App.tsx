import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import * as borsh from 'borsh';
import { CounterAccount, schema } from './types';

// Required for Buffer to work in browser
declare global {
  interface Window { Buffer: typeof Buffer }
}
window.Buffer = window.Buffer || Buffer;

function encodeManualInstruction(variant: 0 | 1, value: number) {
  const variantBuf = Buffer.from([variant]);
  const valueArray = new Uint32Array([value]);
  const valueBuf = Buffer.from(new Uint8Array(valueArray.buffer));
  return Buffer.concat([variantBuf, valueBuf]);
}

const SOL_EXPLORER = 'https://explorer.solana.com';

const PROGRAM_ID = 'GLVqW7Da29RRr6rnwAe6eEDGNJW8mKygrasHzkBQC2Vz';
const COUNTER_PUBKEY = 'BQwuXFqJagyZf9FgH6sdKXAGoxucm6CGYwVPV2vEYgWu';

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);
  const [inputValue, setInputValue] = useState<number>(1);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [latestTxns, setLatestTxns] = useState<string[]>([]); // Placeholder for future

  const programId = new PublicKey(PROGRAM_ID);
  const counterPubkey = new PublicKey(COUNTER_PUBKEY);
  const connection = new Connection('https://api.devnet.solana.com');

  const connectWallet = async () => {
    const { solana } = window as any;
    if (solana && solana.isPhantom) {
      try {
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());
      } catch (err) {
        setError('Wallet connection failed');
      }
    } else {
      alert('Phantom Wallet not found!');
    }
  };

  const getCounter = async () => {
    setError(null);
    try {
      const accountInfo = await connection.getAccountInfo(counterPubkey);
      if (accountInfo === null) {
        setError('Account not found');
        return;
      }
      const counter = borsh.deserialize(schema, accountInfo.data) as CounterAccount;
      setCount(counter.count);
      // Get block height for last updated
      const slot = await connection.getSlot();
      setLastUpdated(`Slot #${slot}`);
    } catch (e) {
      setError('Failed to fetch counter');
    }
  };

  const sendCounterTx = async (variant: 0 | 1, value: number) => {
    setLoading(true);
    setError(null);
    setTxSignature(null);
    const { solana } = window as any;
    if (!walletAddress || !solana) {
      setError('Wallet not connected');
      setLoading(false);
      return;
    }
    try {
      const { blockhash } = await connection.getLatestBlockhash();
      const instructionData = encodeManualInstruction(variant, value);
      const transaction = new Transaction().add({
        keys: [{ pubkey: counterPubkey, isSigner: false, isWritable: true }],
        programId,
        data: instructionData,
      });
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress);
      const signedTx = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature);
      setTxSignature(signature);
      await getCounter(); // Ensure counter is refreshed after tx
      setLatestTxns((prev) => [signature, ...prev.slice(0, 4)]);
    } catch (error: any) {
      setError('Transaction failed: ' + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      getCounter();
    }
    // eslint-disable-next-line
  }, [walletAddress]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-indigo-900">
      {/* Navbar */}
      <nav className="w-full bg-white/80 shadow flex items-center justify-between px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-extrabold text-indigo-700 tracking-tight">🔢</span>
          <span className="font-bold text-lg text-slate-800">OnChain Counter</span>
          <a href="/" className="ml-6 text-slate-600 hover:text-indigo-600 font-medium">Home</a>
          <a href="https://docs.solana.com/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-indigo-600 font-medium">Docs</a>
          <a href="https://github.com/solana-labs/solana" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-indigo-600 font-medium">GitHub</a>
        </div>
        <div>
          {walletAddress ? (
            <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-mono text-xs">{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
          ) : (
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg transition"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
        <div className="bg-white/90 shadow-2xl rounded-3xl p-12 w-full max-w-2xl flex flex-col items-center">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2 flex items-center gap-2">🔢 On-Chain Counter</h2>
          <div className="mb-8" />
          <div className="w-full flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-base font-semibold text-gray-700">
              <span className="text-lg">🧾</span>
              <span>Program ID:</span>
              <span className="font-mono text-lg text-indigo-700 select-all">{PROGRAM_ID.slice(0, 6)}...{PROGRAM_ID.slice(-6)}</span>
              <span className="flex-1" />
              <a
                href={`${SOL_EXPLORER}/address/${PROGRAM_ID}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 font-semibold transition-all text-base shadow-sm"
                title="View in Explorer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v4a1 1 0 001 1h4m-5 8v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-6a2 2 0 00-2 2z" /></svg>
                <span>View in Explorer</span>
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-base font-semibold text-gray-700">
              <span className="text-lg">🧾</span>
              <span>Counter Account:</span>
              <span className="font-mono text-lg text-indigo-700 select-all">{COUNTER_PUBKEY.slice(0, 6)}...{COUNTER_PUBKEY.slice(-6)}</span>
              <span className="flex-1" />
              <a
                href={`${SOL_EXPLORER}/address/${COUNTER_PUBKEY}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 font-semibold transition-all text-base shadow-sm"
                title="View in Explorer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v4a1 1 0 001 1h4m-5 8v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-6a2 2 0 00-2 2z" /></svg>
                <span>View in Explorer</span>
              </a>
            </div>
          </div>
          {walletAddress && (
            <div className="flex flex-col items-center mb-6">
              <span className="text-lg text-gray-500 mb-1">Current Value:</span>
              <span className="text-6xl font-extrabold text-indigo-700 mb-2">{count}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Enter value:</span>
                <input
                  type="number"
                  min={1}
                  value={inputValue}
                  onChange={e => setInputValue(Math.max(1, Number(e.target.value)))}
                  className="w-20 text-center border border-gray-300 rounded-md px-2 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold text-lg shadow flex items-center gap-2"
                  onClick={() => sendCounterTx(1, inputValue)}
                  disabled={loading}
                >
                  <span className="text-xl">➖</span> Decrease
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold text-lg shadow flex items-center gap-2"
                  onClick={() => sendCounterTx(0, inputValue)}
                  disabled={loading}
                >
                  <span className="text-xl">➕</span> Increase
                </button>
              </div>
            </div>
          )}
          {txSignature && !error && (
            <div className="w-full text-center mb-2 flex flex-col items-center">
              <span className="text-green-600 font-semibold flex items-center gap-1">✅ Tx Success!</span>
              <a
                href={`${SOL_EXPLORER}/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-indigo-600 font-mono text-xs break-all hover:underline"
              >
                View on Explorer
              </a>
            </div>
          )}
          {error && (
            <div className="w-full text-center mb-2 flex flex-col items-center">
              <span className="text-red-600 font-semibold flex items-center gap-1">❌ Tx Failed</span>
              <span className="text-xs text-red-500">{error}</span>
            </div>
          )}
          <div className="w-full flex flex-col items-center mt-2 text-xs text-gray-500">
            <span>🔄 Last Updated: {lastUpdated}</span>
            {/* Optional: Latest Txns */}
            {latestTxns.length > 0 && (
              <div className="mt-1 w-full">
                <span className="font-semibold text-gray-600">📜 Latest Txns:</span>
                <ul className="list-disc ml-6">
                  {latestTxns.map((sig) => (
                    <li key={sig} className="font-mono text-indigo-600 hover:underline">
                      <a href={`${SOL_EXPLORER}/tx/${sig}?cluster=devnet`} target="_blank" rel="noopener noreferrer">
                        {sig.slice(0, 8)}...{sig.slice(-8)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/80 py-4 flex flex-col md:flex-row items-center justify-between px-6 text-xs text-gray-500 mt-8 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <span>© {new Date().getFullYear()} OnChain Counter</span>
        </div>
        <div className="flex gap-4">
          <a href="/" className="hover:text-indigo-600">About</a>
          <a href="https://docs.solana.com/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Docs</a>
          <a href="https://twitter.com/solana" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Twitter</a>
          <a href="https://github.com/solana-labs/solana" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
