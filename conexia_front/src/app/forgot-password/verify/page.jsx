import HeroPanel from "@/components/common/HeroPanel";
import VerifyCodeForm from "@/components/forgot-password/VerifyCodeForm";
import { Footer } from "@/components/Footer";

export default function VerifyCodePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col md:flex-row flex-grow min-h-[720px] bg-conexia-soft md:bg-transparent">
        <HeroPanel
            title="Recupera tu contraseña"
            subtitle="Volve a conectarte con tu comunidad digital y accede a tus servicios."
        />
        <VerifyCodeForm />
      </section>
      <Footer />
    </main>
  );
}
