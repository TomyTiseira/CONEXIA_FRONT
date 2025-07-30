'use client';

import CreateProjectForm from '@/components/project/createProject/CreateProjectForm';
import NavbarCommunity from '@/components/navbar/NavbarCommunity';

export default function CreateProjectPage() {
  return (
    <main className="min-h-screen bg-conexia-soft">
      <NavbarCommunity />

      <section className="relative">
        {/* Líneas laterales decorativas */}
        <div className="hidden md:block absolute top-0 left-0 h-full w-20 bg-gradient-to-b from-[#0d4e4e] to-[#094242] opacity-70 rounded-r-md" />
        <div className="hidden md:block absolute top-0 right-0 h-full w-20 bg-gradient-to-b from-[#0d4e4e] to-[#094242] opacity-70 rounded-l-md" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Formulario */}
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fadeIn">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-conexia-green">Crea tu proyecto</h1>
                <p className="text-gray-600 text-sm">Encontrá colaboradores con tus mismos valores</p>
              </div>
              <CreateProjectForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
