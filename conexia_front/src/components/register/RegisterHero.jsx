import Image from "next/image";

export default function RegisterHero() {
  return (
    <div className="hidden md:flex flex-col justify-start items-start p-10 w-[60%] relative h-full">
      <Image
        src="/hero-login.jpg"
        alt="Fondo"
        fill
        className="object-cover object-[65%] -z-10"
      />
      <div className="z-10">
        <h2 className="text-4xl font-extrabold mb-4 text-white">¡Crea tu cuenta y súmate!</h2>
        <p className="text-lg text-white">Conecta con talento, proyectos y oportunidades reales.</p>
      </div>
    </div>
  );
}
