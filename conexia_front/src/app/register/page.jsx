import { Suspense } from "react";
import RegisterForm from "@/components/register/RegisterForm";
import { Footer } from "@/components/Footer";
import HeroPanel from "@/components/hero/HeroPanel";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col md:flex-row flex-grow min-h-[720px] bg-conexia-soft md:bg-transparent">
        <HeroPanel
          title="¡Crea tu cuenta y súmate!"
          subtitle="Conecta con talentos, proyectos y oportunidades reales."
        />
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
              <p className="text-conexia-green">Cargando formulario...</p>
            </div>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}
