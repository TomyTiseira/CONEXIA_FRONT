import CreateProfileForm from "@/components/profile/createProfile/createProfileForm";
import { Footer } from "@/components/Footer";
import HeroPanel from "@/components/common/HeroPanel";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col md:flex-row flex-grow min-h-[720px] bg-conexia-soft md:bg-transparent">
        <HeroPanel
          title="¡Crea tu perfil y distinguite de los demas!"
          subtitle="Conecta con talentos, proyectos y oportunidades reales."
        />
        <CreateProfileForm />
      </section>
      <Footer />
    </main>
  );
}