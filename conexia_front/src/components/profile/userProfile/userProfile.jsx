// src/components/profile/UserProfile.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProfileById } from "@/service/profiles/profilesFetch";
import Image from "next/image";

export default function UserProfile({ currentUserId }) {
  const { id } = useParams();
  console.log("User ID from params:", id);
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
    <div className="bg-conexia-soft min-h-screen py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Portada y foto de perfil */}
        <div className="relative h-48 rounded overflow-hidden bg-gray-100">
          {profile.fotoPortada && (
            <Image
              src={profile.fotoPortada}
              alt="Foto de portada"
              layout="fill"
              objectFit="cover"
              className="object-cover"
            />
          )}
        </div>
        <div className="relative -mt-16 ml-6">
          {profile.fotoPerfil && (
            <Image
              src={profile.fotoPerfil}
              alt="Foto de perfil"
              width={128}
              height={128}
              className="rounded-full border-4 border-white shadow-md"
            />
          )}
        </div>

        {/* Datos básicos */}
        <div className="mt-4 ml-6">
          <h2 className="text-2xl font-bold text-conexia-green">
            {profile.nombre} {profile.apellido}
          </h2>
          <p className="text-gray-600">{profile.ciudad}, {profile.pais}</p>
        </div>

        {/* Información en bloques */}
        <div className="mt-6 space-y-6">

          {profile.descripcion && (
            <Section title="Descripción">
              <p>{profile.descripcion}</p>
            </Section>
          )}

          {profile.habilidades?.length > 0 && (
            <Section title="Habilidades">
              <div className="flex flex-wrap gap-2">
                {profile.habilidades.map((h, idx) => (
                  <span key={idx} className="bg-conexia-soft text-conexia-green px-3 py-1 rounded-full text-sm">
                    {h}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {profile.experiencia && (
            <Section title="Experiencia">
              <p>{profile.experiencia}</p>
            </Section>
          )}

          {profile.fechaNacimiento && (
            <Section title="Fecha de nacimiento">
              <p>{new Date(profile.fechaNacimiento).toLocaleDateString()}</p>
            </Section>
          )}

          {profile.redes && (
            <Section title="Redes sociales">
              <a href={profile.redes} target="_blank" className="text-conexia-coral underline">
                {profile.redes}
              </a>
            </Section>
          )}

          {isOwnProfile && profile.telefono && (
            <Section title="Número de teléfono">
              <p>{profile.telefono}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold text-conexia-green mb-1">{title}</h3>
      {children}
    </div>
  );
}
