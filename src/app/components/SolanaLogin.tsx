
// "use client";

// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { WalletProvider, useWallet } from "@solana/wallet-adapter-react";
// import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

// // Import wallet styles
// import '@solana/wallet-adapter-react-ui/styles.css';

// // Devnet RPC Connection
// const network = WalletAdapterNetwork.Devnet;
// const endpoint = clusterApiUrl(network);
// const connection = new Connection(endpoint);

// // Define the type for transaction history entries
// interface TransactionRecord {
//     recipient: string;
//     amount: string;
//     signature: string;
//     timestamp: string;
// }

// function SignInComponent() {
//     const { publicKey, signMessage, sendTransaction } = useWallet();

//     const [signature, setSignature] = useState<string | null>(null);
//     const [balance, setBalance] = useState<number | null>(null);
//     const [recipient, setRecipient] = useState<string>("");
//     const [amount, setAmount] = useState<string>("");
//     const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>([]); // New: History table

//     // Fetch balance whenever wallet is connected
//     useEffect(() => {
//         const fetchBalance = async () => {
//             if (publicKey) {
//                 const lamports = await connection.getBalance(publicKey);
//                 setBalance(lamports / 1e9); // Convert lamports to SOL
//             }
//         };

//         if (publicKey) {
//             fetchBalance();
//         }
//     }, [publicKey]);

//     const handleSignMessage = useCallback(async () => {
//         if (!publicKey || !signMessage) {
//             alert("Wallet not connected or doesn't support message signing.");
//             return;
//         }

//         try {
//             const message = new TextEncoder().encode(`Sign this message to verify your identity.`);
//             const signedMessage = await signMessage(message);
//             setSignature(Buffer.from(signedMessage).toString("hex"));
//         } catch (error) {
//             console.error("Error signing message:", error);
//         }
//     }, [publicKey, signMessage]);

//     const handleTransfer = async () => {
//         if (!publicKey) {
//             alert("Please connect your wallet first.");
//             return;
//         }

//         if (!recipient || !amount) {
//             alert("Please enter recipient address and amount.");
//             return;
//         }

//         const transaction = new Transaction().add(
//             SystemProgram.transfer({
//                 fromPubkey: publicKey,
//                 toPubkey: new PublicKey(recipient),
//                 lamports: parseFloat(amount) * 1e9,
//             })
//         );

//         try {
//             const signature = await sendTransaction(transaction, connection);
//             await connection.confirmTransaction(signature, "confirmed");

//             alert(`Transaction successful! Check on explorer:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);

//             // Save transaction to history table
//             const newTransaction: TransactionRecord = {
//                 recipient,
//                 amount,
//                 signature,
//                 timestamp: new Date().toLocaleString(),
//             };

//             setTransactionHistory((prev) => [newTransaction, ...prev]);

//             // Clear inputs after successful transaction
//             setRecipient("");
//             setAmount("");

//             // Refresh balance
//             const newBalance = await connection.getBalance(publicKey);
//             setBalance(newBalance / 1e9);
//         } catch (error) {
//             alert(`Transaction failed: ${error.message}`);
//         }
//     };

//     return (
//         <div className="p-4 space-y-4 border rounded">
//             <h2 className="text-xl font-bold">Sign In with Solana (Devnet)</h2>
//             <WalletMultiButton />

//             {publicKey && (
//                 <div className="space-y-4">
//                     <p><strong>Connected Wallet:</strong> {publicKey.toBase58()}</p>
//                     <p><strong>Balance:</strong> {balance !== null ? `${balance} SOL` : "Loading..."}</p>

//                     {/* Sign message section */}
//                     <button onClick={handleSignMessage} className="p-2 bg-blue-500 text-white rounded">
//                         Sign Message
//                     </button>
//                     {signature && <p><strong>Signed Message:</strong> {signature}</p>}

//                     {/* Transfer Section */}
//                     <div className="border-t pt-4">
//                         <h3 className="font-semibold">Transfer SOL</h3>
//                         <input
//                             type="text"
//                             placeholder="Recipient Address"
//                             value={recipient}
//                             onChange={(e) => setRecipient(e.target.value)}
//                             className="p-2 border rounded w-full mt-2"
//                         />
//                         <input
//                             type="number"
//                             placeholder="Amount (SOL)"
//                             value={amount}
//                             onChange={(e) => setAmount(e.target.value)}
//                             className="p-2 border rounded w-full mt-2"
//                         />
//                         <button onClick={handleTransfer} className="mt-2 p-2 bg-green-500 text-white rounded">
//                             Send SOL
//                         </button>
//                     </div>

//                     {/* Transaction History Table */}
//                     <div className="border-t pt-4">
//                         <h3 className="font-semibold">Transaction History</h3>
//                         <table className="w-full text-sm text-left mt-2 border">
//                             <thead className="bg-gray-100 text-black">
//                                 <tr>
//                                     <th className="border p-2">Date & Time</th>
//                                     <th className="border p-2">Recipient</th>
//                                     <th className="border p-2">Amount (SOL)</th>
//                                     <th className="border p-2">Tx Signature</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {transactionHistory.length === 0 ? (
//                                     <tr>
//                                         <td colSpan={4} className="p-2 text-center">No transactions yet.</td>
//                                     </tr>
//                                 ) : (
//                                     transactionHistory.map((tx, index) => (
//                                         <tr key={index} className="border-t">
//                                             <td className="p-2">{tx.timestamp}</td>
//                                             <td className="p-2">{tx.recipient}</td>
//                                             <td className="p-2">{tx.amount}</td>
//                                             <td className="p-2">
//                                                 <a
//                                                     href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="text-blue-500 underline"
//                                                 >
//                                                     View
//                                                 </a>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// function SolanaSignIn() {
//     const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

//     return (
//         <WalletProvider wallets={wallets} autoConnect>
//             <WalletModalProvider>
//                 <SignInComponent />
//             </WalletModalProvider>
//         </WalletProvider>
//     );
// }

// export default SolanaSignIn;


"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

// Import wallet styles
import '@solana/wallet-adapter-react-ui/styles.css';

const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);
const connection = new Connection(endpoint);

interface TransactionRecord {
    recipient: string;
    amount: string;
    signature: string;
    timestamp: string;
}

function SignInComponent() {
    const { publicKey, signMessage, sendTransaction, disconnect } = useWallet();

    const [signature, setSignature] = useState<string | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [recipient, setRecipient] = useState<string>("");
    const [amount, setAmount] = useState<string>("");

    const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>([]);

    // Load transaction history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem("solanaTransactionHistory");
        if (savedHistory) {
            setTransactionHistory(JSON.parse(savedHistory));
        }
    }, []);

    const saveTransactionHistory = (history: TransactionRecord[]) => {
        setTransactionHistory(history);
        localStorage.setItem("solanaTransactionHistory", JSON.stringify(history));
    };

    // Fetch balance
    useEffect(() => {
        const fetchBalance = async () => {
            if (publicKey) {
                const lamports = await connection.getBalance(publicKey);
                setBalance(lamports / 1e9);
            }
        };

        if (publicKey) {
            fetchBalance();
        }
    }, [publicKey]);

    const handleSignMessage = useCallback(async () => {
        if (!publicKey || !signMessage) {
            alert("Wallet not connected or doesn't support signing.");
            return;
        }

        try {
            const message = new TextEncoder().encode(`Sign this message to verify your identity.`);
            const signedMessage = await signMessage(message);
            setSignature(Buffer.from(signedMessage).toString("hex"));
        } catch (error) {
            console.error("Message signing failed:", error);
        }
    }, [publicKey, signMessage]);

    const handleTransfer = async () => {
        if (!publicKey) {
            alert("Connect your wallet first.");
            return;
        }

        if (!recipient || !amount) {
            alert("Recipient address and amount are required.");
            return;
        }

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(recipient),
                lamports: parseFloat(amount) * 1e9,
            })
        );

        try {
            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, "confirmed");

            alert(`Transaction successful! Check explorer:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);

            const newTransaction: TransactionRecord = {
                recipient,
                amount,
                signature,
                timestamp: new Date().toLocaleString(),
            };

            const updatedHistory = [newTransaction, ...transactionHistory];
            saveTransactionHistory(updatedHistory);

            setRecipient("");
            setAmount("");

            const newBalance = await connection.getBalance(publicKey);
            setBalance(newBalance / 1e9);
        } catch (error: any) {
            alert(`Transaction failed: ${error.message}`);
        }
    };

    const handleLogout = async () => {
        await disconnect();
        setBalance(null);
        setRecipient("");
        setAmount("");
        setSignature(null);
    };

    return (
        <div className="p-4 space-y-4 border rounded">
            <h2 className="text-xl font-bold">Sign In with Solana (Devnet)</h2>
            <WalletMultiButton />

            {publicKey && (
                <div className="space-y-4">
                    <p><strong>Wallet Address:</strong> {publicKey.toBase58()}</p>
                    <p><strong>Balance:</strong> {balance !== null ? `${balance} SOL` : "Loading..."}</p>

                    <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded">
                        Logout
                    </button>

                    <button onClick={handleSignMessage} className="p-2 bg-blue-500 text-white rounded">
                        Sign Message
                    </button>
                    {signature && <p><strong>Signed Message:</strong> {signature}</p>}

                    {/* Transfer Section */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold">Transfer SOL</h3>
                        <input
                            type="text"
                            placeholder="Recipient Address"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="p-2 border rounded w-full mt-2"
                        />
                        <input
                            type="number"
                            placeholder="Amount (SOL)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="p-2 border rounded w-full mt-2"
                        />
                        <button onClick={handleTransfer} className="mt-2 p-2 bg-green-500 text-white rounded">
                            Send SOL
                        </button>
                    </div>

                    {/* Transaction History Table */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold">Transaction History</h3>
                        <table className="w-full text-sm text-left mt-2 border">
                            <thead className="bg-gray-100 text-black">
                                <tr>
                                    <th className="border p-2">Date & Time</th>
                                    <th className="border p-2">Recipient</th>
                                    <th className="border p-2">Amount (SOL)</th>
                                    <th className="border p-2">Tx Signature</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-2 text-center">No transactions yet.</td>
                                    </tr>
                                ) : (
                                    transactionHistory.map((tx, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-2">{tx.timestamp}</td>
                                            <td className="p-2">{tx.recipient}</td>
                                            <td className="p-2">{tx.amount}</td>
                                            <td className="p-2">
                                                <a
                                                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 underline"
                                                >
                                                    View
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function SolanaSignIn() {
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

    if (typeof window === "undefined") {
        return null;  // Prevent SSR entirely
    }
    return (
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <SignInComponent />
            </WalletModalProvider>
        </WalletProvider>
    );
}

export default SolanaSignIn;
