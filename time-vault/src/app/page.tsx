import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Grid from "../components/Grid";
import "../styles/globals.css";

export const metadata = {
  title: "TimeVault",
  description: "Plataforma de preservación digital retro",
};

export function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

const mockFiles = [
  { name: "CD-ROM 1998", type: "ISO", isFree: true },
  { name: "Obra Digital", type: "PNG", isFree: false },
  { name: "Álbum Retro", type: "MP3", isFree: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo de la compañía" className="h-10 w-10" />
          <h1 className="text-2xl font-bold">TimeVault</h1>
        </div>
        <input
          type="text"
          placeholder="Buscar archivos..."
          className="w-1/3 px-4 py-2 border rounded-lg text-sm bg-gray-50"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Conecta tu wallet
        </button>
      </header>

      {/* Contenido */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-1/5 p-4 bg-white border-r min-h-[calc(100vh-64px)]">
          <h2 className="text-lg font-semibold mb-2">Buscador</h2>
          <input
            type="text"
            placeholder="Buscar archivo..."
            className="w-full px-3 py-2 border rounded mb-4"
          />
          <label className="block mb-2 text-sm">Seleccionar archivo</label>
          <input
            type="file"
            className="w-full mb-4"
          />
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Subir
          </button>
        </aside>

        {/* Main grid */}
        <main className="flex-1 p-6 overflow-y-auto grid grid-cols-3 gap-4">
          <FileCard title="CD-ROM 1998" type="ISO" price="Gratis" />
          <FileCard title="Obra Digital" type="PNG" price="Con costo" />
          <FileCard title="Álbum Retro" type="MP3" price="Gratis" />
          {/* Puedes mapear más <FileCard /> aquí */}
        </main>
      </div>
    </div>
  );
}

function FileCard({ title, type, price }: { title: string, type: string, price: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-gray-600">Tipo: {type}</p>
      <p className={`text-sm font-medium ${price === 'Gratis' ? 'text-green-600' : 'text-red-600'}`}>
        {price}
      </p>
    </div>
  );
}