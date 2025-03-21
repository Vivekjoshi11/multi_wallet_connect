/* eslint-disable react/no-unescaped-entities */
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const SolanaLogin = dynamic(() => import('../components/SolanaLogin'), { ssr: false });
const Login = dynamic(() => import("../components/Login"), { ssr: false });

export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<"solana" | "ethereum">("solana");


    return (
        <div className="h-screen flex justify-center items-center bg-black text-white">
            <div className="w-full max-w-screen-xl px-10"> 
                <h1 className="text-3xl font-bold text-center mb-2">Web3Auth Multi-Chain Demo</h1>
                <p className="text-gray-400 text-center mb-6">Connect to both Solana and Ethereum chains with a single Web3Auth account</p>

                <div className="flex justify-center  rounded-md mb-6 w-full">
                    <button
                        className={`w-40 py-2 font-medium ${selectedTab === "solana" ? "bg-white text-black" : "bg-gray-900 text-gray-400"}`}
                        onClick={() => setSelectedTab("solana")}
                    >
                        Solana
                    </button>
                    <button
                        className={`w-40 py-2 font-medium ${selectedTab === "ethereum" ? "bg-white text-black" : "bg-gray-900 text-gray-400"}`}
                        onClick={() => setSelectedTab("ethereum")}
                    >
                        EVM
                    </button>
                </div>

                <div className="w-full max-w-3xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg">
                    {selectedTab === "solana" ? (
                        <SolanaLogin />
                    ) : (
                        <Login />
                    )}
                </div>
            </div>
            <div className="p-6">
            <h2 className="text-xl font-bold">About Native Wallet Integration</h2>
            <div className="mt-4 space-y-4">
                <h1>Taks</h1>
                <p>1. PoC NextJS app where web3auth is used to control two different wallets for the same logged-in user, one for Solana and the other for any EVM chain. Make sure the transactions are going out and are mined. </p>
                <p>2. Is it possible to enable web3auth to support native wallets, such as MetaMask for EVM chains and Phantom for Solana?</p>
                <p>3. Suppose that the user uses native wallet integration in our web app. Would we get their wallet address in our app as it is visible in MM/Phantom, or is w3a still generating another wallet for that user? Is their native wallet used only for authentication into w3a?</p>
                <h1>Queations</h1>
                <div>
                    <p className="font-semibold">Q: Is it possible to enable Web3Auth to support native wallets?</p>
                    <p>Yes, Web3Auth supports native wallet integration through wallet adapters. This demo shows integration with MetaMask for EVM chains and Phantom for both Solana and EVM.</p>
                </div>
                <div>
                    <p className="font-semibold">Q: When using native wallet integration, do we get the user's actual wallet address?</p>
                    <p>Yes, when using native wallet adapters (MetaMask/Phantom), Web3Auth provides access to the user's actual wallet address from their native wallet, not a Web3Auth-generated wallet.</p>
                </div>
                <div>
                    <p className="font-semibold">Q: Is the native wallet used only for authentication?</p>
                    <p>No, when using native wallet adapters, the user's actual wallet is used for both authentication and transactions. The wallet's private key remains in the native wallet (MetaMask/Phantom) and is never exposed to Web3Auth or your application.</p>
                </div>
            </div>
        </div>
        </div>
    );
}
