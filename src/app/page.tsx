


"use client";

import { useRouter } from "next/navigation";
import Web3AuthComponent from "./components/web3auth";
// import SFAAuth from "./components/web3authPhantom";

export default function Home() {
    const router = useRouter();

    return (
        <div className="h-screen flex flex-col justify-center items-center bg-black text-white relative">
            {/* Top Right Button */}
            <button 
                onClick={() => router.push("/Dashboard")}
                className="absolute top-4 right-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md"
            >
                Connect Wallet
            </button>

            <Web3AuthComponent />
            {/* <SFAAuth /> */}
        </div>
    );
}
