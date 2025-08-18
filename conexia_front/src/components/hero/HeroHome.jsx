"use client";
import { Users, Star, BadgeCheck, Settings } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroHome() {
  const IconBoxes = [Users, Star, BadgeCheck, Settings];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative min-h-[90vh] overflow-hidden flex items-start">
      <Image src={isMobile ? "/hero2.jpg" : "/hero.jpg"} alt="Reunión profesional" fill className="object-cover object-left md:object-center -z-10" priority />
      <div className="absolute inset-0 bg-conexia-green/30 mix-blend-multiply -z-10" />
      <div className="relative z-10 flex w-full justify-between px-4 pt-10 md:px-12 md:pt-20">
        <div className="max-w-xl text-white space-y-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">Conectamos talentos <br /> con oportunidades</h1>
        </div>
      </div>
    </section>
  );
}