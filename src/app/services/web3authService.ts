
import Web3 from "web3";

export const getBalance = async (provider: any, address: string) => {
  const web3 = new Web3(provider);
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance, "ether");
};

export const sendTransaction = async (
  provider: any,
  from: string,
  to: string,
  amountInEth: string
) => {
  const web3 = new Web3(provider);
  const amountInWei = web3.utils.toWei(amountInEth, "ether");

  const tx = {
    from,
    to,
    value: amountInWei,
    gas: 21000,
  };

  const receipt = await web3.eth.sendTransaction(tx);
  return receipt;
};
