import RegisterHero from "@/components/register/RegisterHero";
import RegisterForm from "@/components/register/RegisterForm";
import { Footer } from "@/components/Footer";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col md:flex-row flex-grow h-screen bg-conexia-soft md:bg-transparent">
        <RegisterHero />
        <RegisterForm />
      </section>
      <Footer />
    </main>
  );
}
