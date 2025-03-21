/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3 from "web3";

const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0";
const infuraApiKey = "6bdc9b51f0eb42b1a9cde9946407da4d"; // Replace with your Infura API key
const infuraUrl = `https://sepolia.infura.io/v3/${infuraApiKey}`;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: infuraUrl,
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

export default function Web3AuthComponent() {
  const router = useRouter();
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Add error message state

  useEffect(() => {
    const initializeWeb3Auth = async () => {
      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

        const web3AuthInstance = new Web3Auth({
          clientId,
          chainConfig,
          web3AuthNetwork: "sapphire_devnet", // Verify this is correct
          privateKeyProvider,
        });

        await web3AuthInstance.initModal();

        setWeb3Auth(web3AuthInstance);
        setLoading(false); // Set loading to false after successful initialization
      } catch (error) {
        console.error("Web3Auth initialization failed:", error);
        setErrorMessage("Web3Auth initialization failed. Please try again.");
        setLoading(false); // Set loading to false even on error
      }
    };

    initializeWeb3Auth();
  }, []);

  const handleLogin = async () => {
    try {
      if (!web3Auth) return;
      setLoading(true); // Set loading to true during login process
      setErrorMessage(null); // Clear any previous error messages

      const provider = await web3Auth.connect();
      if (!provider) {
        setLoading(false); // Set loading to false if provider connection fails
        return;
      }

      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length > 0) {
        console.log("Logged in as:", accounts[0]);
        router.push("/Dashboard");
      } else {
          setErrorMessage("Could not retrieve accounts. Please try logging in again.");
      }
      setLoading(false); // Set loading to false after login attempt
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Login failed. Please try again.");
      setLoading(false); // Set loading to false on login error
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h6 className="text-2xl">Welcome to Multiwallet connect app</h6>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <button
        onClick={handleLogin}
        className={`bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? "Loading..." : "Login with Web3Auth"}
      </button>
    </div>
  );
}