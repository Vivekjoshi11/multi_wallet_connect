"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    // TODO: Add wallet connection logic here
    setIsConnected(true);
    console.log("Wallet connected");
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <button
        onClick={handleConnect}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
      >
        {isConnected ? "Connected" : "Connect Wallet"}
      </button>

      <button
        onClick={() => router.push("/")}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
      >
        Home
      </button>
    </nav>
  );
}
