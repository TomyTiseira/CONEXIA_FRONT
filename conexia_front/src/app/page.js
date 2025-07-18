import { validateSession } from "@/lib/validateSession";
import { NavbarHome } from "@/components/NavbarHome";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import HomeClientRedirect from "./home-client-redirect";

export default async function Home() {
  const isAuthenticated = await validateSession();
  
  return (
    <>
      {isAuthenticated && <HomeClientRedirect />}
      {!isAuthenticated && (
        <>
          <NavbarHome />
          <Hero />
          <Footer />
        </>
      )}
    </>
  );
}
