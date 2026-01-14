'use client';

import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui/NotFound';
import CreateProjectForm from '@/components/project/createProject/CreateProjectForm';
import NavbarCommunity from '@/components/navbar/NavbarCommunity';
import { PublicationLimitBanner } from '@/components/plans';
import { useSubscriptionLimits } from '@/hooks/memberships';

export default function CreateProjectPage() {
  const { user, roleName } = useUserStore();
  const { projectsLimit, planName, isLoading: limitsLoading } = useSubscriptionLimits();

  if (!user || roleName !== ROLES.USER) {
    return <NotFound />;
  }

  return (
    <div className="relative min-h-screen w-full bg-conexia-soft overflow-hidden flex flex-col">
      <div className="fixed top-0 left-0 w-full z-30">
        <NavbarCommunity />
      </div>

      <div className="absolute inset-0 z-0">
      </div>

      {/* Contenedor para centrar el formulario */}
      <div className="flex-1 flex items-center justify-center relative z-10 pt-20 sm:pt-24 pb-8">
        <div className="w-full max-w-4xl px-4 flex flex-col gap-6">
          {/* Indicador de límites - Nuevo estilo */}
          <PublicationLimitBanner 
            type="project"
            current={projectsLimit.current}
            limit={projectsLimit.limit}
            planName={planName}
            isLoading={limitsLoading}
          />

          {/* Formulario principal */}
          <section className="w-full bg-white/90 border border-conexia-green/30 rounded-xl shadow-lg px-6 py-10 flex flex-col animate-fadeIn backdrop-blur-sm">
            <div className="mb-8 text-center">
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight leading-tight">
                Publica tu proyecto
              </h1>
              <p className="text-conexia-green-dark mt-2 text-base md:text-lg">
                Encontra personas que se sumen a tu causa.
              </p>
            </div>
            <div className="w-full flex-1 flex flex-col justify-center">
              <CreateProjectForm />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
