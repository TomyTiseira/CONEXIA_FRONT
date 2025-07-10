export function Footer() {
  const links = [
    "Condiciones de uso",
    "Políticas de privacidad",
    "Política de cookies",
    "Política de derechos",
    "Centro de ayuda",
  ];

  return (
    <footer className="bg-conexia-green text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 text-sm flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col md:flex-row md:items-center md:gap-2 text-center md:text-left">
          <span className="font-bold tracking-wide text-xl md:text-2xl">CONEXIA</span>
          <span className="text-xs md:text-sm">© {new Date().getFullYear()}</span>
        </div>
        <ul className="flex flex-wrap justify-center gap-3 md:gap-3 text-xs md:text-sm">
          {links.map(l => (
            <li key={l}><a href="#" className="hover:underline whitespace-nowrap">{l}</a></li>
          ))}
        </ul>
      </div>
    </footer>
  );
}