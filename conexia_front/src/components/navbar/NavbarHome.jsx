"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function NavbarHome() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Servicios", href: "/services" },
    { label: "Proyectos", href: "/project/search" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8 h-[64px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Conexia" width={36} height={36} className="w-8 h-8 sm:w-9 sm:h-9" />
          <span className="text-xl font-bold text-conexia-green hidden sm:block">CONEXIA</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-conexia-green hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-conexia-green font-semibold hover:bg-gray-50 rounded-lg transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-conexia-green text-white font-semibold rounded-lg hover:bg-conexia-green/90 shadow-sm hover:shadow transition-all"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <ul className="flex flex-col py-4 px-4 space-y-1">
            <li className="pt-3">
              <Link
                href="/login"
                className="block px-4 py-2.5 text-center text-conexia-green font-semibold hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="block px-4 py-2.5 text-center bg-conexia-green text-white font-semibold rounded-lg hover:bg-conexia-green/90 shadow-sm transition-all"
                onClick={() => setOpen(false)}
              >
                Registrarse
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
