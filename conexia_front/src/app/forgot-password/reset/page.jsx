import HeroPanel from "@/components/hero/HeroPanel";
import ResetPasswordForm from "@/components/forgot-password/ResetPasswordForm";
import { Footer } from "@/components/Footer";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col md:flex-row flex-grow min-h-[720px] bg-conexia-soft md:bg-transparent">
        <HeroPanel
            title="Recupera tu contraseña"
            subtitle="Volve a conectarte con tu comunidad digital y accede a tus servicios."
        />
        <ResetPasswordForm />
      </section>
      <Footer />
    </main>
  );
}
