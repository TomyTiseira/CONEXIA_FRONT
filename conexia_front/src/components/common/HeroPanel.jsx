import Image from "next/image";

export default function HeroPanel({ title, subtitle }) {
  return (
    <div className="hidden md:flex flex-col justify-start items-start p-10 w-[60%] relative min-h-full min-h-[720px]">
      <Image
        src="/hero-login.png"
        alt="Fondo"
        fill
        priority
        className="object-cover object-[65%] -z-10"
      />
      <div className="z-10">
        <h2 className="text-4xl font-extrabold mb-4 text-white">{title}</h2>
        <p className="text-lg text-white">{subtitle}</p>
      </div>
    </div>
  );
}
