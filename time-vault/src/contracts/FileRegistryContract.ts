import { ethers } from 'ethers';
import { FileRegistryABI } from './FileRegistryABI';

export const fileRegistryConfig = {
  address: "0x55191Fa9c937E97759F1cef854F331F84040406e",
  abi: FileRegistryABI,
  chainId: 421614 // Arbitrum Sepolia
};

export const createFileRegistryContract = (provider: ethers.providers.Web3Provider | null) => {
  if (!provider) {
    throw new Error('Provider is not initialized');
  }
  
  const signer = provider.getSigner();
  return new ethers.Contract(
    fileRegistryConfig.address,
    fileRegistryConfig.abi,
    signer
  );
};