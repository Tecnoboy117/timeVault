import { useState, useEffect } from 'react';

interface WalletSession {
  isConnected: boolean;
  address: string;
}

export const useWalletSession = () => {
  const [session, setSession] = useState<WalletSession>(() => {
    // Intentar recuperar la sesión del localStorage al iniciar
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('walletSession');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return { isConnected: false, address: '' };
  });

  // Actualizar localStorage cuando cambia la sesión
  useEffect(() => {
    localStorage.setItem('walletSession', JSON.stringify(session));
  }, [session]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setSession({ isConnected: true, address: accounts[0] });
        return true;
      } catch (error) {
        console.error('Error connecting wallet:', error);
        return false;
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet!');
      return false;
    }
  };

  const disconnectWallet = () => {
    setSession({ isConnected: false, address: '' });
    localStorage.removeItem('walletSession');
  };

  return {
    isConnected: session.isConnected,
    address: session.address,
    connectWallet,
    disconnectWallet
  };
};