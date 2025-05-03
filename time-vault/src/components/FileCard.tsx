interface FileCardProps {
    name: string;
    type: string;
    isFree: boolean;
  }
  
  const FileCard = ({ name, type, isFree }: FileCardProps) => (
    <div className="bg-secondary rounded p-4 shadow-lg flex flex-col items-center font-retro">
      <div className="text-lg font-bold mb-2">{name}</div>
      <div className="text-xs mb-2">{type}</div>
      <div className={`px-2 py-1 rounded ${isFree ? "bg-accent text-primary" : "bg-primary text-accent"}`}>
        {isFree ? "Gratis" : "Con costo"}
      </div>
    </div>
  );
  
  export default FileCard;