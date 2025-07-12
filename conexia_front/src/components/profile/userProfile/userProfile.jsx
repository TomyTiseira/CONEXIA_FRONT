// src/components/profile/UserProfile.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProfileById } from "@/service/profiles/profilesFetch";
import Image from "next/image";

export default function UserProfile({ currentUserId }) {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUserId === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileById(id);
        setProfile(data);
      } catch (err) {
        console.error("Error al obtener el perfil", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;

  if (!profile) return <p className="text-center mt-10 text-red-500">Perfil no encontrado.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Foto de portada */}
      <div className="relative h-40 bg-gray-200 rounded-md overflow-hidden">
        {profile.fotoPortada && (
          <Image
            src={profile.fotoPortada}
            alt="Foto de portada"
            layout="fill"
            objectFit="cover"
          />
        )}
      </div>

      {/* Foto de perfil */}
      <div className="-mt-16 flex items-center gap-4">
        {profile.fotoPerfil && (
          <Image
            src={profile.fotoPerfil}
            alt="Foto de perfil"
            width={96}
            height={96}
            className="rounded-full border-4 border-white shadow-md"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-conexia-green">{profile.nombre} {profile.apellido}</h2>
          <p className="text-gray-600 text-sm">{profile.ciudad}, {profile.pais}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Descripción */}
        {profile.descripcion && (
          <div>
            <h3 className="font-semibold text-conexia-green">Descripción</h3>
            <p>{profile.descripcion}</p>
          </div>
        )}

        {/* Habilidades */}
        {profile.habilidades?.length > 0 && (
          <div>
            <h3 className="font-semibold text-conexia-green">Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {profile.habilidades.map((h, idx) => (
                <span key={idx} className="bg-conexia-soft text-conexia-green px-3 py-1 rounded-full text-sm">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experiencia */}
        {profile.experiencia && (
          <div>
            <h3 className="font-semibold text-conexia-green">Experiencia</h3>
            <p>{profile.experiencia}</p>
          </div>
        )}

        {/* Educación */}
        {profile.fechaNacimiento && (
          <div>
            <h3 className="font-semibold text-conexia-green">Fecha de nacimiento</h3>
            <p>{new Date(profile.fechaNacimiento).toLocaleDateString()}</p>
          </div>
        )}

        {/* Redes sociales */}
        {profile.redes && (
          <div>
            <h3 className="font-semibold text-conexia-green">Redes sociales</h3>
            <p>{profile.redes}</p>
          </div>
        )}

        {/* Teléfono (solo si es el dueño del perfil) */}
        {isOwnProfile && profile.telefono && (
          <div>
            <h3 className="font-semibold text-conexia-green">Número de teléfono</h3>
            <p>{profile.telefono}</p>
          </div>
        )}
      </div>
    </div>
  );
}
