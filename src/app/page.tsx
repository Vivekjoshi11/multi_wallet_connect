// "use client";
// import dynamic from "next/dynamic";
// const SolanaLogin = dynamic(() => import('./components/SolanaLogin'), { ssr: false })

// const Login = dynamic(() => import("./components/Login"), { ssr: false });

// export default function Home() {
//   return (
//     <div>
//       <h1>Web3Auth Multi-Wallet Login</h1>
//       <Login />
//       <SolanaLogin />
//     </div>
//   );
// }



"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Lazy load components
const SolanaLogin = dynamic(() => import('./components/SolanaLogin'), { ssr: false });
const Login = dynamic(() => import("./components/Login"), { ssr: false });

export default function Home() {
    const [selectedTab, setSelectedTab] = useState<"solana" | "ethereum">("solana");

    return (
        <div className="h-screen flex justify-center items-center bg-black text-white">
            <div className="w-full max-w-screen-xl px-10"> {/* 10% margin on both sides */}
                {/* Header */}
                <h1 className="text-3xl font-bold text-center mb-2">Web3Auth Multi-Chain Demo</h1>
                <p className="text-gray-400 text-center mb-6">Connect to both Solana and Ethereum chains with a single Web3Auth account</p>

                {/* Tab Buttons */}
                {/* <div className="flex justify-center space-x-1 border border-gray-700 rounded-md mb-6 w-full"> */}
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
                        Ethereum
                    </button>
                </div>

                {/* Content Card */}
                <div className="w-full max-w-3xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg">
                    {selectedTab === "solana" ? (
                        <SolanaLogin />
                    ) : (
                        <Login />
                    )}
                </div>
            </div>
        </div>
    );
}
