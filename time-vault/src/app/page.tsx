'use client';

import { useState, useEffect, useRef } from 'react';
import { useWalletSession } from '../hooks/useWalletSession';
import Image from 'next/image';
import { storeFile, listUploads, type FileMetadata } from '../utils/ipfs';
import { useFileRegistry } from '../hooks/useFileRegistry';
import { createFileRegistryContract } from '../contracts/FileRegistryContract';
import { ethers } from 'ethers';

// Update the UploadedFile interface
interface UploadedFile extends FileMetadata {
  cid: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileInfo, setSelectedFileInfo] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [transactionCancelled, setTransactionCancelled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [balance, setBalance] = useState<string>('0');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Update this line to get provider from useWalletSession
  const { isConnected, address, connectWallet, disconnectWallet, provider } = useWalletSession();
  
  // Now provider will be available
  const { registerFile, recordDownload, isLoading, error } = useFileRegistry(provider);

  // Add click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleWalletConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setSelectedFile(null);
    setIsDropdownOpen(false);
  };

  // Escuchar cambios de cuenta en MetaMask
  useEffect(() => {
    const provider = window.ethereum;
    
    if (provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
          setSelectedFile(null);
        }
      };

      provider.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        provider.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [disconnectWallet]);

  // Add new useEffect to load files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        console.log('Loading files...');
        const files = await listUploads();
        console.log('Files loaded:', files);
        setUploadedFiles(files || []); // Ensure we always set an array
      } catch (error) {
        console.error('Error loading files:', error);
        setUploadedFiles([]); // Set empty array on error
      }
    };

    loadFiles();

    // Refresh files every 30 seconds
    const interval = setInterval(loadFiles, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update handleUpload to refresh the list after upload
  const handleUpload = async () => {
    if (!selectedFile || !isConnected || !address || !provider) {
      setUploadError('Please connect your wallet first');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // 1. Register on blockchain first
      console.log('Registering on blockchain...');
      const contract = createFileRegistryContract(provider);
      
      // 2. Prepare transaction
      const tx = await contract.registerUpload(
        'pending', // temporary CID
        selectedFile.name,
        selectedFile.type,
        selectedFile.size
      ).catch((error: any) => {
        // Handle user rejection
        if (error.code === 4001) { // MetaMask user rejected
          throw new Error('Transacción cancelada por el usuario');
        }
        throw error; // Re-throw other errors
      });

      // 3. Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...');
      await tx.wait();
      console.log('Transaction confirmed');

      // 4. Only upload to IPFS after blockchain confirmation
      console.log('Uploading to IPFS...');
      const fileData = await storeFile(selectedFile, address);
      console.log('IPFS upload complete, CID:', fileData.cid);

      // 5. Update UI
      const updatedFiles = await listUploads();
      setUploadedFiles(updatedFiles);
      setUploadSuccess(true);

      // Clear file input
      setSelectedFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error) {
      console.error('Error:', error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('user rejected') || error.message.includes('cancelada')) {
          // Limpiar cualquier error previo
          setUploadError(null);
          // Mostrar notificación de cancelación
          setTransactionCancelled(true);
          // Programar la limpieza después de 4 segundos
          setTimeout(() => {
            setTransactionCancelled(false);
            setUploadError(null);
          }, 4000);
        } else {
          // Para otros errores, usar uploadError
          setTransactionCancelled(false);
          setUploadError(error.message);
        }
      } else {
        setTransactionCancelled(false);
        setUploadError('Error desconocido');
      }
    } finally {
      setIsUploading(false);
      // Limpiar el archivo seleccionado si hubo error
      if (error) {
        setSelectedFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    }
  };

  const handleFileClick = (file: UploadedFile) => {
    setSelectedFileInfo(file);
    setIsModalOpen(true);
  };

  // Actualizar la función handleDownload para usar el nuevo estado
  const handleDownload = async (file: UploadedFile) => {
    if (!provider || !isConnected) {
      setUploadError('Por favor conecta tu wallet primero');
      return;
    }

    try {
      setIsDownloading(true);
      setUploadError(null);
      
      // Primero registrar la descarga en el contrato
      const contract = createFileRegistryContract(provider);
      const tx = await contract.registerDownload(file.cid)
        .catch((error: any) => {
          // Handle user rejection
          if (error.code === 4001) { // MetaMask user rejected
            throw new Error('Transacción cancelada por el usuario');
          }
          throw error; // Re-throw other errors
        });
      
      await tx.wait(); // Esperar a que la transacción se confirme
      
      // Luego proceder con la descarga del archivo
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${file.cid}`;
      const response = await fetch(gatewayUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Download and blockchain registration completed for:', file.name);
    } catch (error) {
      console.error('Error during download:', error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('user rejected') || error.message.includes('cancelada')) {
          setUploadError(null);
          setTransactionCancelled(true);
          setTimeout(() => {
            setTransactionCancelled(false);
            setUploadError(null);
          }, 4000);
        } else {
          setTransactionCancelled(false);
          setUploadError(error.message);
        }
      } else {
        setTransactionCancelled(false);
        setUploadError('Error desconocido');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFileInfo(null);
  };

  // Añadir este useEffect después de las declaraciones de estado
  useEffect(() => {
    if (transactionCancelled) {
      const timer = setTimeout(() => {
        setTransactionCancelled(false);
      }, 4000);
      
      // Cleanup function
      return () => clearTimeout(timer);
    }
  }, [transactionCancelled]);

  // Add a search handler function
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Add this before the file list rendering
  const filteredFiles = uploadedFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Añade esta función para obtener el balance
  const getBalance = async () => {
    if (provider && address) {
      try {
        const balance = await provider.getBalance(address);
        // Convertir de wei a ETH y formatear a 4 decimales
        setBalance(parseFloat(ethers.utils.formatEther(balance)).toFixed(4));
      } catch (error) {
        console.error('Error getting balance:', error);
        setBalance('0');
      }
    }
  };

  // Añade este useEffect para actualizar el balance
  useEffect(() => {
    if (isConnected && provider && address) {
      getBalance();
      // Actualizar balance cada 30 segundos
      const interval = setInterval(getBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, provider, address]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header responsive */}
      <header className="border-b border-[#40E0D0] sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <Image 
                src="/logo.png"
                alt="Baul Time Logo"
                width={56}
                height={56}
                priority
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#001A1A] ml-4">
                Time Vault
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar archivos..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 rounded-lg border border-[#40E0D0] focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg 
                    className="w-5 h-5 text-[#40E0D0]" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Wallet Button */}
            {!isConnected ? (
              <button
                onClick={handleWalletConnect}
                className="baul-button w-full sm:w-auto px-4 py-2 rounded-lg font-semibold"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="baul-button w-full sm:w-auto px-4 py-2 rounded-lg font-semibold inline-flex items-center justify-center space-x-2"
                >
                  <span className="text-sm text-[#001A1A]/70 mr-2">
                    {balance} ETH
                  </span>
                  <span className="truncate">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 sm:right-0 mt-2 w-full sm:w-48 bg-white rounded-lg shadow-lg border border-[#40E0D0] py-1 z-10">
                    <button
                      onClick={handleDisconnect}
                      className="block w-full text-left px-4 py-2 text-sm text-[#001A1A] hover:bg-[#40E0D0]/10"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content responsive */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="baul-container p-4 sm:p-6 mb-6 rounded-lg">
          <div className="max-w-full">
            <form 
              className="flex flex-col gap-4" 
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="w-full">
                {/* Mostrar nombre del archivo seleccionado */}
                {selectedFile && (
                  <div className="mb-2 p-2 bg-[#40E0D0]/10 rounded-lg flex justify-between items-center">
                    <div className="flex-1 pr-4">
                      <p className="text-sm text-[#001A1A] flex items-center gap-2">
                        <svg 
                          className="w-4 h-4 text-[#40E0D0] flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                          />
                        </svg>
                        <span className="truncate">{selectedFile.name}</span>
                      </p>
                      <p className="text-xs text-[#001A1A]/70 mt-1 ml-6">
                        Tamaño: {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="text-[#40E0D0] hover:text-[#FF6B6B] transition-colors flex-shrink-0"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className="flex items-center gap-2 baul-button w-full sm:w-auto px-4 py-2 rounded-lg font-semibold"
                  >
                    <Image
                      src="/archivo.png"
                      alt="Select file icon"
                      width={24}
                      height={24}
                      className="inline-block"
                    />
                    <span>Seleccionar archivo</span>
                  </button>

                  <button 
                    onClick={handleUpload}
                    className={`baul-button w-full sm:w-auto px-6 py-2 rounded-lg font-semibold inline-flex items-center justify-center
                      ${(!selectedFile || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!selectedFile || !isConnected}
                  >
                    {isUploading ? 'Subiendo...' : 'Subir'}
                  </button>
                </div>

                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
            </form>
          </div>
        </div>

        {/* Archivos subidos responsive */}
        {Array.isArray(uploadedFiles) && uploadedFiles.length > 0 ? (
          <div className="baul-container rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#FFA500]">
              Archivos Subidos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file, index) => (
                <div
                  key={`${file.cid}-${index}`}
                  onClick={() => handleFileClick(file)}
                  className="bg-[#F0FFFF] border border-[#40E0D0] p-4 rounded-lg 
               shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
               hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
               transform hover:-translate-y-1
               transition-all duration-300 ease-in-out
               cursor-pointer"
                >
                  <div>
                    <h3 className="font-medium text-[#001A1A] truncate">{file.name}</h3>
                    <div className="space-y-1 mt-2">
                      <p className="text-sm text-[#001A1A]/70">
                        Tipo: {file.type}
                      </p>
                      <p className="text-sm text-[#001A1A]/70">
                        Tamaño: {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-sm text-[#001A1A]/70">
                        Subido por: {file.owner.slice(0, 6)}...{file.owner.slice(-4)}
                      </p>
                      <p className="text-sm text-[#001A1A]/70">
                        CID: {file.cid.slice(0, 6)}...{file.cid.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron archivos' : 'No hay archivos subidos aún'}
            </p>
          </div>
        )}

        {/* Modal de información */}
        {isModalOpen && selectedFileInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#001A1A]">
                  Información del Archivo
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-[#001A1A]">Nombre:</p>
                  <p className="text-sm text-[#001A1A]">{selectedFileInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#001A1A]">Tipo:</p>
                  <p className="text-sm text-[#001A1A]">{selectedFileInfo.type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#001A1A]">Tamaño:</p>
                  <p className="text-sm text-[#001A1A]">
                    {(selectedFileInfo.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#001A1A]">Fecha de subida:</p>
                  <p className="text-sm text-[#001A1A]">
                    {selectedFileInfo.uploadDate.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#001A1A]">CID:</p>
                  <p className="text-sm text-[#001A1A] break-all">{selectedFileInfo.cid}</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleDownload(selectedFileInfo)}
                  className="baul-button w-full py-2 px-4 rounded-lg font-semibold"
                >
                  Descargar Archivo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Status Notifications */}
        {isUploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40E0D0]"></div>
                <p className="text-[#001A1A]">Subiendo archivo...</p>
              </div>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>¡Archivo subido exitosamente!</span>
            </div>
          </div>
        )}

        {/* Add error notification */}
        {uploadError && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{uploadError}</span>
            </div>
          </div>
        )}

        {/* Add transaction cancelled notification */}
        {transactionCancelled && (
          <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Transacción cancelada por el usuario</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}