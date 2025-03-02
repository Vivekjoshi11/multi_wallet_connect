

"use client";

import React, { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3 from "web3";
import { getBalance, sendTransaction } from "../services/TransactionService"; // Import your existing service functions

const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0"; // Replace with your actual client ID

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Sepolia Testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

interface Transaction {
  hash: string;
  to: string;
  amount: string;
  timestamp: string;
}

export default function Login() {
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [toAddress, setToAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loginMethod, setLoginMethod] = useState<"web3auth" | "metamask" | null>(null);

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
          if (web3AuthInstance.provider) {
              const web3Instance = new Web3(web3AuthInstance.provider);
              const accounts = await web3Instance.eth.getAccounts();
              if (accounts.length > 0) {
                  await handleLogin(web3AuthInstance.provider, "web3auth");
              } else {
                  console.warn("Web3Auth provider is available, but no accounts found. User might need to log in again.");
              }
          }
      } catch (error) {
          console.error("Web3Auth initialization error:", error);
      }
  };
  
    initWeb3Auth();
  }, []);

  const handleLogin = async (connectedProvider?: any, method: "web3auth" | "metamask" = "web3auth") => {
    try {
      let connection = connectedProvider;
      if (!connection) {
        connection = await web3Auth?.connect();
      }

      if (!connection) {
        console.error("No provider found during login.");
        return;
      }

      const web3Instance = new Web3(connection);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length === 0) {
        console.error("No accounts found.");
        return;
      }

      const address = accounts[0];
      setProvider(connection);
      setIsAuthenticated(true);
      setCurrentAccount(address);
      setLoginMethod(method);

      const balance = await getBalance(connection, address);
      setBalance(balance);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleMetaMaskLogin = async () => {
    if ((window as any).ethereum) {
      const provider = (window as any).ethereum;
      await provider.request({ method: "eth_requestAccounts" });
      await handleLogin(provider, "metamask");
    } else {
      alert("MetaMask is not installed.");
    }
  };

  const handleLogout = async () => {
    if (loginMethod === "web3auth") {
      await web3Auth?.logout();
    }
    setProvider(null);
    setWeb3(null);
    setIsAuthenticated(false);
    setBalance("0");
    setCurrentAccount("");
    setTransactions([]);
    setLoginMethod(null);
  };

  const handleSendTransaction = async () => {
    if (!provider || !currentAccount) {
      alert("No wallet connected!");
      return;
    }

    try {
      const receipt = await sendTransaction(provider, currentAccount, toAddress, amount);
      alert(`Transaction successful: ${receipt.transactionHash}`);

      const newTransaction: Transaction = {
        hash: receipt.transactionHash,
        to: toAddress,
        amount,
        timestamp: new Date().toLocaleString(),
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      const updatedBalance = await getBalance(provider, currentAccount);
      setBalance(updatedBalance);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed");
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">Web3Auth + MetaMask - Send ETH & Transaction History</h1>

      {isAuthenticated ? (
        <div>
          <p>Connected ✅</p>
          <p>Account: {currentAccount}</p>
          <p>Balance: {balance} ETH</p>

          {/* Send ETH Form */}
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
              className="bg-blue-500 text-black px-4 py-2 mt-3"
              onClick={handleSendTransaction}
            >
              Send Transaction
            </button>
          </div>

          {/* Transaction History */}
          <div className="mt-5">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <table className="w-full mt-2 border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-black">
                  <th className="border border-gray-300 p-2">Hash</th>
                  <th className="border border-gray-300 p-2">To</th>
                  <th className="border border-gray-300 p-2">Amount (ETH)</th>
                  <th className="border border-gray-300 p-2">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{tx.hash.slice(0, 10)}...</td>
                    <td className="border border-gray-300 p-2">{tx.to}</td>
                    <td className="border border-gray-300 p-2">{tx.amount}</td>
                    <td className="border border-gray-300 p-2">{tx.timestamp}</td>
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
        <div className="flex gap-3">
          <button className="bg-green-500 text-white px-4 py-2 mt-3" onClick={() => handleLogin()}>
            Login with Web3Auth
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 mt-3" onClick={handleMetaMaskLogin}>
            Login with MetaMask
          </button>
        </div>
      )}
    </div>
  );
}

