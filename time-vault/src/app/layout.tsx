import "../styles/globals.css";

export const metadata = {
  title: "TimeVault",
  description: "Plataforma de preservación digital retro",
};

export default function RootLayout({
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