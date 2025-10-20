import Image from "next/image";

export default function ConexiaLogo({ 
  width = 100, 
  height = 40, 
  className = "", 
  showText = true, 
  textClassName = "text-conexia-green text-lg font-bold mt-2" 
}) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Image 
        src="/logo.png" 
        alt="Logo" 
        width={width} 
        height={height}
        style={{ width: 'auto', height: 'auto' }}
      />
      {showText && (
        <span className={textClassName}>
          CONEXIA
        </span>
      )}
    </div>
  );
}
