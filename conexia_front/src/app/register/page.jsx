import RegisterForm from "@/components/register/RegisterForm";
import { Footer } from "@/components/Footer";
import HeroPanel from "@/components/common/HeroPanel";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col md:flex-row flex-grow min-h-[720px] bg-conexia-soft md:bg-transparent">
        <HeroPanel
          title="¡Crea tu cuenta y súmate!"
          subtitle="Conecta con talentos, proyectos y oportunidades reales."
        />
        <RegisterForm />
      </section>
      <Footer />
    </main>
  );
}
