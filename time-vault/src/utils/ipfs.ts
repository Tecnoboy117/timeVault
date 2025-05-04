import axios from 'axios';

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

// Add this function to test the token
async function testPinataConnection() {
  try {
    const response = await axios.get(`${PINATA_API_URL}/data/testAuthentication`, {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });
    console.log('Pinata connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('Pinata authentication error:', error);
    return false;
  }
}

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
    // Test connection first
    const isConnected = await testPinataConnection();
    if (!isConnected) {
      throw new Error('No se pudo autenticar con Pinata');
    }

    console.log('Preparando archivo para subir:', file.name);
    console.log('Using JWT:', PINATA_JWT?.substring(0, 20) + '...');

    const formData = new FormData();
    formData.append('file', file);

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

    const res = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data;`,
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        maxBodyLength: Infinity
      }
    );

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

export async function listUploads(): Promise<FileMetadata[]> {
  try {
    console.log('Obteniendo lista global de archivos desde Pinata...');
    
    const res = await axios.get(`${PINATA_API_URL}/data/pinList?status=pinned`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
      }
    });

    console.log('Respuesta de Pinata:', res.data);

    // Mapear todos los archivos sin filtrar por dirección
    const allFiles = res.data.rows.map((pin: any) => ({
      name: pin.metadata?.name || 'Unknown',
      type: pin.metadata?.keyvalues?.type || 'Unknown',
      size: Number(pin.metadata?.keyvalues?.size) || 0,
      uploadDate: pin.metadata?.keyvalues?.uploadDate || new Date().toISOString(),
      cid: pin.ipfs_pin_hash,
      owner: pin.metadata?.keyvalues?.owner || 'Unknown'
    }));

    console.log('Total archivos encontrados:', allFiles.length);
    return allFiles;
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