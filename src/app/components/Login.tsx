/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3 from "web3";

const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Sepolia Testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

export default function Login() {
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    const initWeb3Auth = async () => {
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig },
      });

      const web3AuthInstance = new Web3Auth({
        clientId,
        chainConfig,
        web3AuthNetwork: "sapphire_devnet",
        privateKeyProvider,
      });

      setWeb3Auth(web3AuthInstance);

      try {
        await web3AuthInstance.initModal();

        // ✅ Check if provider exists
        if (web3AuthInstance.provider) {
          console.log("Session found, checking wallet...");

          const web3 = new Web3(web3AuthInstance.provider);
          const accounts = await web3.eth.getAccounts();

          if (accounts.length > 0) {
            console.log("Wallet connected:", accounts[0]);
            setProvider(web3AuthInstance.provider);
            setIsAuthenticated(true);
            fetchBalance(web3AuthInstance.provider);
          } else {
            // ❌ No accounts = treat as logged out
            console.warn("No accounts found despite session");
            setIsAuthenticated(false);
            setProvider(null);
          }
        } else {
          console.log("No active session found.");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Web3Auth init failed", error);
        setIsAuthenticated(false);
      }
    };

    initWeb3Auth();
  }, []);

  const fetchBalance = async (currentProvider: any) => {
    const web3 = new Web3(currentProvider);
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
      const balanceInWei = await web3.eth.getBalance(accounts[0]);
      const balanceInEth = web3.utils.fromWei(balanceInWei, "ether");
      setBalance(balanceInEth);
    }
  };

  const handleLogin = async () => {
    if (!web3Auth) {
      console.error("Web3Auth not initialized");
      return;
    }

    try {
      const connectedProvider = await web3Auth.connect();
      setProvider(connectedProvider);
      setIsAuthenticated(true);

      await fetchBalance(connectedProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    if (!web3Auth) {
      console.error("Web3Auth not initialized");
      return;
    }

    try {
      await web3Auth.logout();
      setProvider(null);
      setIsAuthenticated(false);
      setBalance("");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">Web3Auth Demo</h1>

      {isAuthenticated ? (
        <div>
          <p>Connected ✅</p>
          <p>Balance: {balance} ETH</p>
          <button
            className="bg-red-500 text-white px-4 py-2 mt-3"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          className="bg-green-500 text-white px-4 py-2 mt-3"
          onClick={handleLogin}
        >
          Login with Web3Auth
        </button>
      )}
    </div>
  );
}
