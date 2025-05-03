const Header = () => (
    <header className="w-full flex items-center justify-between p-4 bg-primary border-b border-secondary">
      <div className="flex items-center">
        <img
          src="/logo.png"
          alt="Logo de la compañía"
          className="h-10 w-10 mr-2"
        />
        <span className="text-accent text-xl font-bold font-retro">TimeVault</span>
      </div>
      {/* Puedes agregar aquí el buscador y el botón de wallet */}
    </header>
  );
  
  export default Header;