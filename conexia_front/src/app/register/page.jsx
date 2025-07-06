import RegisterHero from "./RegisterHero";
import RegisterForm from "./RegisterForm";
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
