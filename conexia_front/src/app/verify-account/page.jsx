import VerifyForm from "@/components/verify-account/VerifyForm";
import { Footer } from "@/components/Footer";
import HeroPanel from "@/components/hero/HeroPanel";
import { Suspense } from "react";

export default function VerifyAccountPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col md:flex-row flex-grow min-h-[720px] bg-conexia-soft md:bg-transparent">
        <HeroPanel
            title="¡Crea tu cuenta y súmate!"
            subtitle="Conecta con talentos, proyectos y oportunidades reales."
        />
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full">
            <div className="loader"></div>
          </div>
        }>
          <VerifyForm />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}