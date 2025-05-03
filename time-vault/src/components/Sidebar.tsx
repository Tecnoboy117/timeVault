import UploadForm from "./UploadForm";

const Sidebar = () => (
  <aside className="w-72 bg-primary p-4 border-r border-secondary flex flex-col gap-4">
    <input
      type="text"
      placeholder="Buscar archivos..."
      className="bg-secondary text-primary px-3 py-2 rounded"
    />
    <div className="flex flex-col items-center border-2 border-dashed border-accent rounded p-4 bg-gray-900">
      <span className="mb-2 text-accent">Arrastra tu archivo aquí</span>
      <UploadForm />
    </div>
  </aside>
);

export default Sidebar;