"use client";
import { useState } from "react";

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    // Aquí iría la lógica para subir a IPFS y registrar en el smart contract
    alert(`Archivo "${file.name}" preparado para subir (IPFS + contrato)`);
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-2">
      <input type="file" onChange={handleFileChange} />
      <button
        type="submit"
        className="bg-accent text-primary px-4 py-2 rounded hover:bg-secondary transition font-bold"
      >
        Subir a IPFS
      </button>
    </form>
  );
};

export default UploadForm;