import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { createFileRegistryContract } from '../contracts/FileRegistryContract';

export const useFileRegistry = (provider: ethers.providers.Web3Provider | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerFile = useCallback(async (
    cid: string,
    fileName: string,
    fileType: string,
    size: number
  ) => {
    if (!provider) throw new Error('Provider not connected');
    setIsLoading(true);
    setError(null);

    try {
      const contract = createFileRegistryContract(provider);
      const tx = await contract.registerUpload(cid, fileName, fileType, size);
      await tx.wait();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error registering file';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  const recordDownload = useCallback(async (cid: string) => {
    if (!provider) throw new Error('Provider not connected');
    setIsLoading(true);
    setError(null);

    try {
      const contract = createFileRegistryContract(provider);
      const tx = await contract.registerDownload(cid);
      await tx.wait();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error recording download';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  const getFileDetails = useCallback(async (cid: string) => {
    if (!provider) throw new Error('Provider not connected');
    try {
      const contract = createFileRegistryContract(provider);
      const file = await contract.getFileByCID(cid);
      return file;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error getting file details';
      setError(message);
      throw new Error(message);
    }
  }, [provider]);

  const getFilesList = useCallback(async (offset: number, limit: number) => {
    if (!provider) throw new Error('Provider not connected');
    try {
      const contract = createFileRegistryContract(provider);
      const files = await contract.getFilesBatch(offset, limit);
      return files;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error getting files list';
      setError(message);
      throw new Error(message);
    }
  }, [provider]);

  return {
    registerFile,
    recordDownload,
    getFileDetails,
    getFilesList,
    isLoading,
    error
  };
};