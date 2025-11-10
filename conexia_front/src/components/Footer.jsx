import Link from 'next/link';

export function Footer() {
  const links = [
    { label: "Condiciones de uso", href: "/terms" },
    { label: "Políticas de privacidad", href: "/privacy" },
    { label: "Política de cookies", href: "/cookies" },
    { label: "Política de derechos", href: "/rights" },
    { label: "Centro de ayuda", href: "/help" },
  ];

  return (
    <footer className="bg-conexia-green text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 text-sm flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col md:flex-row md:items-center md:gap-2 text-center md:text-left">
          <span className="font-bold tracking-wide text-xl md:text-2xl">CONEXIA</span>
          <span className="text-xs md:text-sm">© {new Date().getFullYear()}</span>
        </div>
        <ul className="flex flex-wrap justify-center gap-3 md:gap-3 text-xs md:text-sm">
          {links.map(link => (
            <li key={link.label}>
              <Link href={link.href} className="hover:underline whitespace-nowrap">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}