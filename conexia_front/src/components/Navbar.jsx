"use client";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Servicios", href: "#servicios" },
    { label: "Proyectos", href: "#proyectos" },
    { label: "Conecta", href: "#conecta" },
  ];

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Conexia" width={30} height={30} />
          <span className="font-bold text-xl md:text-1xl text-conexia-coral">CONEXIA</span>
        </Link>

        {/* Mobile menu toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-conexia-green" aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6 font-semibold text-base text-conexia-green">
          {navItems.map(({ label, href }) => (
            <li key={label}><Link href={href}>{label}</Link></li>
          ))}
          <li>
            <Link href="/login" className="rounded bg-conexia-soft px-5 py-2 hover:bg-conexia-green hover:text-white">Iniciar sesión</Link>
          </li>
        </ul>
      </nav>

      {/* Mobile nav */}
      {open && (
        <ul className="md:hidden flex flex-col gap-4 bg-white px-6 pb-6 text-conexia-green font-medium shadow-inner">
          {navItems.map(({ label, href }) => (
            <li key={label}><Link href={href} onClick={() => setOpen(false)}>{label}</Link></li>
          ))}
          <li>
            <Link href="/login" className="rounded bg-conexia-soft px-4 py-2 text-center hover:bg-conexia-green hover:text-white" onClick={() => setOpen(false)}>
              Iniciar sesión
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}