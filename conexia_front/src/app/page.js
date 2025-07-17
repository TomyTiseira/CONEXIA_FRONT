import { NavbarHome } from "@/components/NavbarHome";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import HomeClientRedirect from "./home-client-redirect";

export default function Home() {
  return (
    <>
      <HomeClientRedirect />
      <NavbarHome />
      <Hero />
      <Footer />
    </>
  );
}