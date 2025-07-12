// import UserProfile from "@/components/profile/userProfile/userProfile";
// import { getProfileById } from "@/service/profiles/profilesFetch";
// import { Footer } from "@/components/Footer";
// import { cookies } from "next/headers";

// export default async function ProfilePage({ params }) {
//   const { id } = params;

//   let currentUserId = null;
//   try {
//     const cookieStore = cookies();
//     const userId = cookieStore.get("userId");
//     currentUserId = userId?.value || null;
//   } catch {
//     currentUserId = null;
//   }

//   let profile = null;
//   try {
//     profile = await getProfileById(id);
//   } catch (err) {
//     console.error("Error al cargar perfil:", err);
//   }

//   if (!profile) {
//     return (
//       <main className="min-h-screen flex flex-col bg-conexia-soft">
//         <div className="flex-grow flex flex-col items-center justify-center px-4">
//           <p className="text-red-600">Perfil no disponible.</p>
//         </div>
//         <Footer />
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen flex flex-col bg-conexia-soft">
//       <div className="flex-grow flex flex-col items-center justify-center px-4">
//         <UserProfile user={profile} currentUserId={currentUserId} />
//       </div>
//       <Footer />
//     </main>
//   );
// }

import UserProfile from "@/components/profile/userProfile/userProfile";
import { Footer } from "@/components/Footer";

export default async function ProfilePage({ params }) {
  const { id } = params;

  // 🔧 Perfil simulado
  const profile = {
    nombre: "Ana",
    apellido: "Pérez",
    fechaNacimiento: "1995-06-21",
    ciudad: "Buenos Aires",
    pais: "Argentina",
    descripcion: "Desarrolladora frontend apasionada por la accesibilidad.",
    habilidades: ["React", "Next.js", "Tailwind"],
    experiencia: "3 años en desarrollo web. Proyectos en empresas fintech.",
    redes: "@anaperez.dev",
    telefono: "+54 9 11 1234-5678",
    fotoPerfil: "/mock/perfil.jpg",
    fotoPortada: "/mock/portada.jpg",
  };

  const currentUserId = "mock-user-id";
  const isOwnProfile = currentUserId === id;

  return (
    <main className="min-h-screen flex flex-col bg-conexia-soft">
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <UserProfile user={profile} currentUserId={isOwnProfile ? id : "otro-id"} />
      </div>
      <Footer />
    </main>
  );
}
