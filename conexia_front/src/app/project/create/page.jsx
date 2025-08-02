'use client';


import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui/NotFound';
import CreateProjectForm from '@/components/project/createProject/CreateProjectForm';
import NavbarCommunity from '@/components/navbar/NavbarCommunity';

export default function CreateProjectPage() {
  const { user, roleName } = useUserStore();

  if (!user || roleName !== ROLES.USER) {
    return <NotFound />;
  }

  return (
    <div className="relative min-h-screen w-full bg-conexia-soft overflow-hidden flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <NavbarCommunity />
      </div>

      {/* Fondo de niebla y decoraciones */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[url('/bg-smoke.png')] bg-cover bg-center opacity-90" />
        {/* Burbujas decorativas */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-conexia-green/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-conexia-green/30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-0 w-16 h-16 bg-conexia-green/10 rounded-full blur-xl" />
        <div className="absolute bottom-0 right-1/3 w-24 h-24 bg-conexia-green/10 rounded-full blur-xl" />
      </div>

      {/* Contenedor para centrar el formulario */}
      <div className="flex-1 flex items-center justify-center relative z-10 pt-8 md:pt-24 pb-8">
        <section className="w-full max-w-3xl bg-white/90 border border-conexia-green/30 rounded-xl shadow-lg px-6 py-10 flex flex-col animate-fadeIn backdrop-blur-sm">
          <div className="mb-8 text-center">
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight leading-tight">Publica tu proyecto</h1>
            <p className="text-conexia-green-dark mt-2 text-base md:text-lg">Encontra personas que se sumen a tu causa.</p>
          </div>
          <div className="w-full flex-1 flex flex-col justify-center">
            <CreateProjectForm />
          </div>
        </section>
      </div>
    </div>
  );
}
