/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import Web3, { Bytes } from "web3";
import { getBalance, sendTransaction } from "../services/TransactionService";

interface Transaction {
    hash: string;
    to: string;
    amount: string;
    timestamp: string;
}

export default function Login() {
    const [provider, setProvider] = useState<any>(null);
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [balance, setBalance] = useState<string>("0");
    const [toAddress, setToAddress] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [currentAccount, setCurrentAccount] = useState<string>("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        // Load transactions from localStorage
        const savedTransactions = localStorage.getItem("transactions");
        if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
        }
    }, []);

    const handleMetaMaskLogin = async () => {
        if ((window as any).ethereum) {
            try {
                const provider = (window as any).ethereum;
                await provider.request({ method: "eth_requestAccounts" });

                const web3Instance = new Web3(provider);
                setWeb3(web3Instance);

                const accounts = await web3Instance.eth.getAccounts();
                if (accounts.length === 0) return;

                const address = accounts[0];
                setProvider(provider);
                setIsAuthenticated(true);
                setCurrentAccount(address);

                // Get balance
                const balance = await getBalance(provider, address);
                setBalance(balance);
            } catch (error) {
                console.error("MetaMask login failed:", error);
            }
        } else {
            alert("MetaMask is not installed.");
        }
    };

    const handleLogout = async () => {
        setProvider(null);
        setWeb3(null);
        setIsAuthenticated(false);
        setBalance("0");
        setCurrentAccount("");
    };

    const handleSendTransaction = async () => {
        if (!provider || !currentAccount) {
            alert("No wallet connected!");
            return;
        }

        setIsSending(true);

        try {
            const receipt = await sendTransaction(provider, currentAccount, toAddress, amount);
            alert(`Transaction successful: ${receipt.transactionHash}`);

            const newTransaction: Transaction = {
                hash: receipt.transactionHash as string,
                to: toAddress,
                amount,
                timestamp: new Date().toLocaleString(),
            };

            const updatedTransactions = [newTransaction, ...transactions];
            setTransactions(updatedTransactions);
            localStorage.setItem("transactions", JSON.stringify(updatedTransactions));

            // Update balance
            const updatedBalance = await getBalance(provider, currentAccount);
            setBalance(updatedBalance);

            // Clear input fields
            setToAddress("");
            setAmount("");
        } catch (error) {
            console.error("Transaction failed:", error);
            alert("Transaction failed");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-5">
            <h1 className="text-xl font-bold">MetaMask - Send ETH & Transaction History</h1>

            {isAuthenticated ? (
                <div>
                    <p>Connected ✅</p>
                    <p>Account: {currentAccount}</p>
                    <p>Balance: {balance} ETH</p>

                    <div className="mt-5">
                        <h2 className="text-lg font-semibold">Send ETH</h2>
                        <input
                            type="text"
                            placeholder="Recipient Address"
                            value={toAddress}
                            onChange={(e) => setToAddress(e.target.value)}
                            className="border text-black p-2 w-full mt-2"
                        />
                        <input
                            type="text"
                            placeholder="Amount in ETH"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="border text-black p-2 w-full mt-2"
                        />
                        <button
                            className={`px-4 py-2 mt-3 ${isSending ? "bg-gray-400" : "bg-blue-500"} text-white`}
                            onClick={handleSendTransaction}
                            disabled={isSending}
                        >
                            {isSending ? "Sending..." : "Send Transaction"}
                        </button>
                    </div>

                    <div className="mt-5">
                        <h2 className="text-lg font-semibold">Transaction History</h2>
                        <table className="w-full mt-2 border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 text-black">
                                    <th className="border p-2">Hash</th>
                                    <th className="border p-2">To</th>
                                    <th className="border p-2">Amount (ETH)</th>
                                    <th className="border p-2">Date/Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, index) => (
                                    <tr key={index}>
                                        <td className="border p-2">{tx.hash.slice(0, 10)}...</td>
                                        <td className="border p-2">{tx.to}</td>
                                        <td className="border p-2">{tx.amount}</td>
                                        <td className="border p-2">{tx.timestamp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button className="bg-red-500 text-white px-4 py-2 mt-5" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            ) : (
                <button className="bg-orange-500 text-white px-4 py-2 mt-3" onClick={handleMetaMaskLogin}>
                    Connect to MetaMask
                </button>
            )}
        </div>
    );
}
