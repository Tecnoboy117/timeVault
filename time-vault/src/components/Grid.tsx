import FileCard from "./FileCard";

interface FileData {
  name: string;
  type: string;
  isFree: boolean;
}

interface GridProps {
  files: FileData[];
}

const Grid = ({ files }: GridProps) => (
  <main className="flex-1 p-6 overflow-y-auto">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {files.map((file, idx) => (
        <FileCard key={idx} {...file} />
      ))}
    </div>
  </main>
);

export default Grid;