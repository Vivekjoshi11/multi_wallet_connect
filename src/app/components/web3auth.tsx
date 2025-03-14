/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3 from "web3";

const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", 
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

export default function Web3AuthComponent() {
  const router = useRouter();
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);

  useEffect(() => {
    const initializeWeb3Auth = async () => {
      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

        const web3AuthInstance = new Web3Auth({
          clientId,
          chainConfig,
          web3AuthNetwork: "sapphire_devnet",
          privateKeyProvider,
        });

        await web3AuthInstance.initModal();

        setWeb3Auth(web3AuthInstance);
      } catch (error) {
        console.error("Web3Auth initialization failed:", error);
      }
    };

    initializeWeb3Auth();
  }, []);

  const handleLogin = async () => {
    try {
      if (!web3Auth) return;

      const provider = await web3Auth.connect();
      if (!provider) return;

      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length > 0) {
        console.log("Logged in as:", accounts[0]);
        router.push("/Dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h6 className="text-2xl">Wellcome to Multiwallet connect app</h6>
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
      >
        Login with Web3Auth
      </button>
    </div>
  );
}
