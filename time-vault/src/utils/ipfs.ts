import axios from 'axios';

const PINATA_API_URL = 'https://api.pinata.cloud';

export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  cid: string;
  owner: string;
}

export async function storeFile(file: File, address: string): Promise<FileMetadata> {
  try {
    console.log('Preparando archivo para subir:', file.name);

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata to Pinata
    const metadata = {
      name: file.name,
      keyvalues: {
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        owner: address
      }
    };

    formData.append('pinataMetadata', JSON.stringify(metadata));

    const res = await axios.post(`${PINATA_API_URL}/pinning/pinFileToIPFS`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
      }
    });

    const cid = res.data.IpfsHash;
    console.log('CID recibido:', cid);

    return {
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString(),
      cid: cid,
      owner: address
    };
  } catch (error) {
    console.error('Error en storeFile:', error);
    throw new Error(`Error al subir el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

export async function listUploads(address: string): Promise<FileMetadata[]> {
  try {
    console.log('Obteniendo lista de archivos desde Pinata...');
    
    const res = await axios.get(`${PINATA_API_URL}/data/pinList?status=pinned`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
      }
    });

    console.log('Respuesta de Pinata:', res.data);

    // Filtrar y mapear los archivos que pertenecen al usuario
    const userFiles = res.data.rows
      .filter((pin: any) => 
        pin.metadata?.keyvalues?.owner?.toLowerCase() === address?.toLowerCase()
      )
      .map((pin: any) => ({
        name: pin.metadata?.name || 'Unknown',
        type: pin.metadata?.keyvalues?.type || 'Unknown',
        size: Number(pin.metadata?.keyvalues?.size) || 0,
        uploadDate: pin.metadata?.keyvalues?.uploadDate || new Date().toISOString(),
        cid: pin.ipfs_pin_hash,
        owner: pin.metadata?.keyvalues?.owner || 'Unknown'
      }));

    console.log('Archivos filtrados del usuario:', userFiles);
    return userFiles;
  } catch (error) {
    console.error('Error listando archivos:', error);
    return [];
  }
}

export async function verifyUpload(cid: string): Promise<boolean> {
  try {
    const res = await axios.get(`${PINATA_API_URL}/data/pinList?hashContains=${cid}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
      }
    });
    return res.data.count > 0;
  } catch (error) {
    console.error('Error verifying upload:', error);
    return false;
  }
}