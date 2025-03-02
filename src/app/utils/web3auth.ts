
// import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
// import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
// import { Web3AuthOptions } from "@web3auth/modal";

// const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0";

// const chainConfig = {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: "0xaa36a7",
//   rpcTarget: "https://rpc.ankr.com/eth_sepolia",
//   displayName: "Ethereum Sepolia Testnet",
//   blockExplorerUrl: "https://sepolia.etherscan.io",
//   ticker: "ETH",
//   tickerName: "Ethereum",
// };

// const privateKeyProvider = new EthereumPrivateKeyProvider({
//   config: {
//     chainConfig,
//   },
// });

// export const web3AuthOptions: Web3AuthOptions = {
//   clientId,
//   web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
//   chainConfig,
//   privateKeyProvider,
// };


import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { Web3AuthOptions } from "@web3auth/modal";

const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0"; // Your client ID

// Ethereum (Sepolia) Config
const ethereumChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Sepolia Testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig: ethereumChainConfig },
});

// Solana (Devnet) Config — FIXED
const solanaChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: "0x3", // Solana Devnet
  rpcTarget: "https://api.devnet.solana.com",
  displayName: "Solana Devnet",
  blockExplorer: "https://explorer.solana.com?cluster=devnet", // ✅ Correct key
  ticker: "SOL",
  tickerName: "Solana",
};

const solanaPrivateKeyProvider = new SolanaPrivateKeyProvider({
  config: { chainConfig: solanaChainConfig },
});

export const ethereumWeb3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
  chainConfig: ethereumChainConfig,
  privateKeyProvider: ethereumPrivateKeyProvider,
};

export const solanaWeb3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
  chainConfig: solanaChainConfig,
  privateKeyProvider: solanaPrivateKeyProvider,
};

export { ethereumChainConfig, solanaChainConfig };
