import Image from "next/image";
import Link from "next/link";

export default function ConexiaLogo({ 
  width = 100, 
  height = 40, 
  className = "", 
  showText = true, 
  textClassName = "text-conexia-green text-lg font-bold mt-2",
  clickable = true 
}) {
  const logoImage = (
    <Image 
      src="/logo-conexia.png" 
      alt="Logo Conexia" 
      width={width} 
      height={height}
      style={{ width: 'auto', height: 'auto' }}
    />
  );

  if (clickable) {
    return (
      <Link href="/" className={`flex flex-col items-center transition-opacity hover:opacity-80 ${className}`}>
        {logoImage}
      </Link>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {logoImage}
    </div>
  );
}
