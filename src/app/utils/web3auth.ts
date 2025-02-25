import { Web3AuthNoModal } from "@web3auth/no-modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { SolanaWallet } from "@web3auth/solana-provider";
import { ethers, providers } from "ethers";

const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0"; // Replace with your Web3Auth Client ID

export const initWeb3Auth = async () => {
  const web3auth = new Web3AuthNoModal({
    clientId,
    web3AuthNetwork: "testnet",
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155, // EVM Chain
      chainId: "0x5", // Goerli Testnet (Use "0x1" for Ethereum mainnet)
      rpcTarget: "https://goerli.infura.io/v3/6bdc9b51f0eb42b1a9cde9946407da4d", // Replace with Infura Key
    },
  });

  const openloginAdapter = new OpenloginAdapter({
    adapterSettings: {
      network: "testnet",
      clientId,
      uxMode: "popup",
    },
  });

  web3auth.configureAdapter(openloginAdapter as any); // ✅ Fix TypeScript type error
  await web3auth.init();
  return web3auth;
};

export const getSolanaWallet = async (web3auth: Web3AuthNoModal) => {
  if (!web3auth.provider) return null;
  return new SolanaWallet(web3auth.provider);
};

export const getEVMWallet = async (web3auth: Web3AuthNoModal) => {
  if (!web3auth.provider) return null;
  const provider = new providers.Web3Provider(web3auth.provider as any);
  return provider;
};
