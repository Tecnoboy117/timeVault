'use client';

import { useState, useEffect, useRef } from 'react';
import { useWalletSession } from '../hooks/useWalletSession';
import Image from 'next/image';

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileInfo, setSelectedFileInfo] = useState<UploadedFile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { isConnected, address, connectWallet, disconnectWallet } = useWalletSession();

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

  const handleUpload = async () => {
    if (!selectedFile || !isConnected) {
      alert('Please connect your wallet and select a file first!');
      return;
    }

    // Add the file to our uploaded files list
    const newFile: UploadedFile = {
      name: selectedFile.name,
      type: selectedFile.type || 'unknown',
      size: selectedFile.size,
      uploadDate: new Date(),
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setSelectedFile(null); // Reset file input
    
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFileClick = (file: UploadedFile) => {
    setSelectedFileInfo(file);
    setIsModalOpen(true);
  };

  const handleDownload = (file: UploadedFile) => {
    // Aquí iría la lógica de descarga del archivo
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['contenido del archivo']));
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFileInfo(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header responsive */}
      <header className="border-b border-[#40E0D0] sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
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
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-[#001A1A] rounded-lg cursor-pointer
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#40E0D0] file:text-[#001A1A]
                    hover:file:opacity-90"
                />
              </div>
              
              <div className="w-full sm:w-auto">
                <button 
                  onClick={handleUpload}
                  className="baul-button w-full sm:w-auto px-6 py-2 rounded-lg font-semibold inline-flex items-center justify-center"
                  disabled={!selectedFile || !isConnected}
                >
                  Subir
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Archivos subidos responsive */}
        {uploadedFiles.length > 0 && (
          <div className="baul-container rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#FFA500]">
              Archivos Subidos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  onClick={() => handleFileClick(file)}
                  className="border border-[#40E0D0] p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div>
                    <h3 className="font-medium text-[#001A1A] truncate">{file.name}</h3>
                    <div className="space-y-1 mt-2">
                      <p className="text-sm text-[#001A1A]/70">Tipo: {file.type}</p>
                      <p className="text-sm text-[#001A1A]/70">
                        Tamaño: {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
      </main>
    </div>
  );
}