'use client';

import { useState, useEffect, useRef } from 'react';
import { useWalletSession } from '../hooks/useWalletSession';
import Image from 'next/image';
import { storeFile, listUploads, type FileMetadata, verifyUpload } from '../utils/ipfs';

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

  // Add new useEffect to load files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        console.log('Cargando todos los archivos...');
        const files = await listUploads();
        setUploadedFiles(files);
        console.log('Archivos cargados:', files.length);
      } catch (error) {
        console.error('Error loading files:', error);
      }
    };

    // Cargar archivos inicialmente
    loadFiles();

    // Configurar intervalo para actualizar la lista cada 30 segundos
    const interval = setInterval(loadFiles, 30000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, []); // Remove address and isConnected from dependencies

  // Update handleUpload to refresh the list after upload
  const handleUpload = async () => {
    if (!selectedFile || !isConnected || !address) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      await storeFile(selectedFile, address);
      
      // Recargar la lista completa después de subir
      const updatedFiles = await listUploads();
      setUploadedFiles(updatedFiles);
      setUploadSuccess(true);

      // Limpiar el input
      setSelectedFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileClick = (file: UploadedFile) => {
    setSelectedFileInfo(file);
    setIsModalOpen(true);
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      const response = await fetch(`https://${file.cid}.ipfs.dweb.link`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // TODO: Add error handling UI
    }
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
                  {isUploading ? 'Subiendo...' : 'Subir'}
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
                      <p className="text-sm text-[#001A1A]/70">
                        Subido por: {file.owner.slice(0, 6)}...{file.owner.slice(-4)}
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
      </main>
    </div>
  );
}