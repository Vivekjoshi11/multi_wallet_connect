
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthOptions } from "@web3auth/modal";

const clientId = "BIpSjjuBO_i7_SG8qpb1EM32Fblmg6Nr0filq1oNe8mpsrGVxrNisV1Wm6eLcGv4t_5pR4cR5NLgF9q1GHMR9K0"; // Replace with your actual client ID

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",  // Sepolia Testnet Chain ID
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png", // Optional
};

// ✅ This is required for v6.x
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,  // Change to SAPPHIRE_MAINNET for mainnet
  chainConfig,
  privateKeyProvider,
};

// ✅ Set up default adapters (MetaMask, WalletConnect, OpenLogin, etc.)
const adapters = getDefaultExternalAdapters({ options: web3AuthOptions });

const web3AuthContextConfig = {
  web3AuthOptions,
  adapters: [...adapters],
};

export default web3AuthContextConfig;
