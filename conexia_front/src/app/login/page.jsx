import HeroPanel from "@/components/common/HeroPanel";
import LoginForm from "@/components/login/LoginForm";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col md:flex-row flex-grow min-h-[720px] bg-conexia-soft md:bg-transparent">
        <HeroPanel
          title="¡Volve a conectarte con tu comunidad digital!"
          subtitle="Tu perfil, tus servicios, tus proyectos. Todo en un solo lugar."
        />
        <LoginForm />
      </section>
      <Footer />
    </main>
  );
}
