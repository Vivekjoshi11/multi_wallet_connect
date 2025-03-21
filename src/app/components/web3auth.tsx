/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { decodeToken, Web3Auth } from "@web3auth/single-factor-auth";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential, signOut } from "firebase/auth";
import Web3 from "web3";

const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0";
const infuraApiKey = "6bdc9b51f0eb42b1a9cde9946407da4d";
const infuraUrl = `https://sepolia.infura.io/v3/${infuraApiKey}`;
const verifier = "web3auth_firebase";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: infuraUrl,
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const firebaseConfig = {
  apiKey: "AIzaSyBooLZcc1JAeL5dDE0zUxw_4Y99wNON3dA",
  authDomain: "web3auth-452217.firebaseapp.com",
  projectId: "web3auth-452217",
  storageBucket: "web3auth-452217.firebasestorage.app",
  messagingSenderId: "1086793009102",
  appId: "1:1086793009102:web:8883a0650e2fcdf39d4d9f",
  measurementId: "G-347JQVC3L5"
};


export default function Web3AuthSFAComponent() {
  const router = useRouter();
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const app = initializeApp(firebaseConfig);

  useEffect(() => {
    const initializeWeb3Auth = async () => {
      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

        const web3AuthInstance = new Web3Auth({
          clientId,
          chainConfig,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });

        await web3AuthInstance.init(); // Use init() for SFA
        setWeb3Auth(web3AuthInstance);
        setProvider(web3AuthInstance.provider);

        if (web3AuthInstance.status === ADAPTER_EVENTS.CONNECTED) {
          setLoggedIn(true);
        }
        setLoading(false);
      } catch (error) {
        console.error("Web3Auth initialization failed:", error);
        setErrorMessage("Web3Auth initialization failed. Please try again.");
        setLoading(false);
      }
    };

    initializeWeb3Auth();
  }, []);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
      const auth = getAuth(app);
      const googleProvider = new GoogleAuthProvider();
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!web3Auth) {
        setErrorMessage("Web3Auth not initialized yet.");
        return;
      }
      setLoading(true);
      setErrorMessage(null);

      const loginRes = await signInWithGoogle();
      const idToken = await loginRes.user.getIdToken(true);
      const { payload } = decodeToken(idToken);

      const web3authProvider = await web3Auth.connect({
        verifier,
        verifierId: (payload as any).sub,
        idToken,
      });

      if (web3authProvider) {
        setLoggedIn(true);
        setProvider(web3authProvider);
        const web3Instance = new Web3(web3authProvider);
        setWeb3(web3Instance);
        router.push("/Dashboard");
      } else {
        setErrorMessage("Web3Auth connection failed.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Google login failed:", error);
      setErrorMessage("Google login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (!web3Auth) {
        setErrorMessage("Web3Auth not initialized yet.");
        return;
      }

      await web3Auth.logout();
      await signOut(getAuth(app));
      setProvider(null);
      setLoggedIn(false);
      setWeb3(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setErrorMessage("Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h6 className="text-2xl mb-6">Welcome to Multiwallet Connect App (SFA)</h6>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      {!loggedIn ? (
        <button
          onClick={handleGoogleLogin}
          className={`bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Login with Google (SFA)"}
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className={`bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-600 transition duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          Logout
        </button>
      )}
    </div>
  );
}