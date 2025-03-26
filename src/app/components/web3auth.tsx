/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3Auth } from "@web3auth/single-factor-auth";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential, signOut } from "firebase/auth";
import { decodeToken } from "@web3auth/single-factor-auth";

const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0";
const verifier = "web3auth_firebase";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: "0x3", // Devnet
  rpcTarget: "https://api.devnet.solana.com",
  displayName: "Solana Devnet",
  blockExplorer: "https://explorer.solana.com?cluster=devnet",
  ticker: "SOL",
  tickerName: "Solana",
  logo: "https://images.toruswallet.io/solana.svg",
};

const firebaseConfig = {
  apiKey: "AIzaSyBooLZcc1JAeL5dDE0zUxw_4Y99wNON3dA",
  authDomain: "web3auth-452217.firebaseapp.com",
  projectId: "web3auth-452217",
  storageBucket: "web3auth-452217.firebasestorage.app",
  messagingSenderId: "1086793009102",
  appId: "1:1086793009102:web:8883a0650e2fcdf39d4d9f",
  measurementId: "G-347JQVC3L5"
};

interface TransactionHistory {
  recipient: string;
  date: string;
  amount: number;
  signature: string;
}

export default function Web3AuthSolanaComponent() {
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [solanaWallet, setSolanaWallet] = useState<SolanaWallet | null>(null);
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [transactionSig, setTransactionSig] = useState<string | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);

  const app = initializeApp(firebaseConfig);

  // Load transaction history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('transactionHistory');
    if (storedHistory) {
      setTransactionHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Save transaction history to localStorage whenever it changes
  useEffect(() => {
    if (transactionHistory.length > 0) {
      localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    }
  }, [transactionHistory]);

  useEffect(() => {
    const initializeWeb3Auth = async () => {
      try {
        const privateKeyProvider = new SolanaPrivateKeyProvider({
          config: {
            chainConfig: { ...chainConfig },
          },
        });

        const web3AuthInstance = new Web3Auth({
          clientId,
          chainConfig,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });

        await web3AuthInstance.init();
        setWeb3Auth(web3AuthInstance);
        setProvider(web3AuthInstance.provider);

        const conn = new Connection(chainConfig.rpcTarget, 'confirmed');
        setConnection(conn);

        if (web3AuthInstance.status === ADAPTER_EVENTS.CONNECTED) {
          setLoggedIn(true);
          await fetchAccountInfo(web3AuthInstance.provider, conn);
        }
        setLoading(false);
      } catch (error) {
        console.error("Web3Auth initialization failed:", error);
        setErrorMessage("Web3Auth initialization failed. Please try again.");
        setLoading(false);
      }
    };

    initializeWeb3Auth();
  }, []);

  const fetchAccountInfo = async (provider: IProvider | null, conn?: Connection) => {
    if (!provider) return;

    try {
      const solWallet = new SolanaWallet(provider);
      setSolanaWallet(solWallet);

      const accounts = await solWallet.requestAccounts();
      setAccount(accounts[0]);

      const connectionToUse = conn || connection || new Connection(chainConfig.rpcTarget, 'confirmed');
      const balanceLamports = await connectionToUse.getBalance(new PublicKey(accounts[0]), 'confirmed');
      const balanceInSol = balanceLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSol);
      console.log(`Fetched balance: ${balanceInSol} SOL for account: ${accounts[0]}`);
    } catch (error) {
      console.error("Failed to fetch account info:", error);
      setErrorMessage("Failed to fetch account information: " + (error as Error).message);
    }
  };

  const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
      const auth = getAuth(app);
      const googleProvider = new GoogleAuthProvider();
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!web3Auth) {
        setErrorMessage("Web3Auth not initialized yet.");
        return;
      }
      setLoading(true);
      setErrorMessage(null);

      const loginRes = await signInWithGoogle();
      const idToken = await loginRes.user.getIdToken(true);
      const { payload } = decodeToken(idToken);

      const web3authProvider = await web3Auth.connect({
        verifier,
        verifierId: (payload as any).sub,
        idToken,
      });

      if (web3authProvider) {
        setLoggedIn(true);
        setProvider(web3authProvider);
        await fetchAccountInfo(web3authProvider);
      } else {
        setErrorMessage("Web3Auth connection failed.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Google login failed:", error);
      setErrorMessage("Google login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (!web3Auth) {
        setErrorMessage("Web3Auth not initialized yet.");
        return;
      }

      await web3Auth.logout();
      await signOut(getAuth(app));
      setProvider(null);
      setLoggedIn(false);
      setAccount(null);
      setBalance(null);
      setSolanaWallet(null);
      setTransactionSig(null);
      setConnection(null);
      // Don't clear transaction history on logout to persist it
      // Optionally clear localStorage if you want to reset on logout:
      // localStorage.removeItem('transactionHistory');
      // setTransactionHistory([]);
    } catch (error) {
      console.error("Logout failed:", error);
      setErrorMessage("Logout failed. Please try again.");
    }
  };

  const handleTransaction = async () => {
    if (!solanaWallet || !account || !recipient || !amount || !connection) {
      setErrorMessage("Please fill in all transaction details and ensure wallet is connected");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setTransactionSig(null);

      const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      if (isNaN(amountInLamports) || amountInLamports <= 0) {
        throw new Error("Invalid amount");
      }

      const block = await connection.getLatestBlockhash("confirmed");

      const transaction = new Transaction({
        blockhash: block.blockhash,
        lastValidBlockHeight: block.lastValidBlockHeight,
        feePayer: new PublicKey(account),
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account),
          toPubkey: new PublicKey(recipient),
          lamports: amountInLamports,
        })
      );

      const { signature } = await solanaWallet.signAndSendTransaction(transaction);
      
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: block.blockhash,
        lastValidBlockHeight: block.lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm");
      }

      setTransactionSig(signature);
      
      // Add to transaction history
      const newTransaction: TransactionHistory = {
        recipient,
        date: new Date().toLocaleString(),
        amount: parseFloat(amount),
        signature,
      };
      setTransactionHistory([newTransaction, ...transactionHistory]);

      await fetchAccountInfo(provider); // Refresh balance
      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error("Transaction failed:", error);
      setErrorMessage("Transaction failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (provider && connection) {
      setLoading(true);
      await fetchAccountInfo(provider);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h6 className="text-2xl mb-6">Welcome to Solana Wallet Connect (SFA) - Devnet</h6>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      
      {!loggedIn ? (
        <button
          onClick={handleGoogleLogin}
          className={`bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Login with Google (SFA)"}
        </button>
      ) : (
        <div className="text-center w-full max-w-2xl">
          <div className="mb-4">
            <p className="text-lg break-all">Account: {account}</p>
            <p className="text-lg">
              Balance: {balance !== null ? `${balance.toFixed(6)} SOL` : "Loading..."}
            </p>
            <button
              onClick={handleRefreshBalance}
              className="mt-2 bg-green-500 text-white px-4 py-1 rounded hover:bg-gray-600"
              disabled={loading}
            >
              Refresh Balance
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Recipient Address"
              className="w-full p-2 mb-2 border rounded text-black"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount in SOL"
              step="0.001"
              min="0"
              className="w-full p-2 mb-2 border rounded text-black"
            />
            <button
              onClick={handleTransaction}
              className={`bg-blue-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 w-full ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Send Transaction"}
            </button>
          </div>

          {transactionSig && (
            <p className="text-green-500 mb-4 break-all">
              Transaction successful! Signature: 
              <a 
                href={`https://explorer.solana.com/tx/${transactionSig}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {transactionSig.slice(0, 10)}...
              </a>
            </p>
          )}

          <div className="mb-4">
            <h3 className="text-xl mb-2">Transaction History</h3>
            {transactionHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black-200">
                      <th className="p-2 border">Recipient</th>
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Amount (SOL)</th>
                      <th className="p-2 border">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionHistory.map((tx, index) => (
                      <tr key={index} className="hover:bg-gray-800">
                        <td className="p-2 border truncate max-w-[150px]" title={tx.recipient}>
                          {tx.recipient.slice(0, 8)}...
                        </td>
                        <td className="p-2 border">{tx.date}</td>
                        <td className="p-2 border">{tx.amount.toFixed(6)}</td>
                        <td className="p-2 border">
                          <a
                            href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                            title={tx.signature}
                          >
                            {tx.signature.slice(0, 8)}...
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No transactions yet</p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 w-full ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

