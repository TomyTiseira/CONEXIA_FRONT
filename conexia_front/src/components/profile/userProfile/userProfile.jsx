// src/components/profile/UserProfile.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProfileById } from "@/service/profiles/profilesFetch";
import Image from "next/image";
import { config } from "@/config";

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // TODO: Manejo de errores

  // Ahora isOwner viene del backend

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileById(id);
        setProfile(data.data);
        setIsOwner(data.isOwner);
      } catch (err) {
        setError(err.message || "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;
  if (!profile) return <p className="text-center mt-10 text-red-500">Perfil no encontrado.</p>;

  // Extraer datos según nueva estructura
  const isOwner = profile.isOwner;
  const user = profile.profile;
  return (
    <div className="bg-conexia-soft min-h-screen py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Portada y foto de perfil */}
        <div className="relative h-48 rounded overflow-hidden bg-gray-100 mb-8">
          {user.coverPicture && (
            <Image
              src={`${config.IMAGE_URL}/${user.coverPicture}`}
              alt="Foto de portada"
              layout="fill"
              objectFit="cover"
              className="object-cover"
              priority
            />
          )}
        </div>
        <div className="relative flex items-center mb-4" style={{ minHeight: 64 }}>
          <div className="w-32 h-32">
            {user.profilePicture ? (
              <Image
                src={`${config.IMAGE_URL}/${user.profilePicture}`}
                alt="Foto de perfil"
                width={128}
                height={128}
                className="rounded-full border-4 border-white shadow-md bg-gray-200"
                priority
              />
            ) : (
              <div className="w-full h-full rounded-full border-4 border-white shadow-md bg-gray-200 flex items-center justify-center">
                {/* Espacio gris, puedes agregar un ícono SVG si lo deseas */}
              </div>
            )}
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-conexia-green">
              {user.name} {user.lastName}
            </h2>
            {(user.state || user.country) && (
              <p className="text-gray-600">{user.state}{user.state && user.country ? ", " : ""}{user.country}</p>
            )}
          </div>
        </div>

        {/* Información en bloques */}
        <div className="mt-6 space-y-6">
          {user.description && (
            <Section title="Descripción">
              <p>{user.description}</p>
            </Section>
          )}

          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <Section title="Habilidades">
              <div className="flex flex-wrap gap-2">
                {user.skills.map((h, idx) => {
                  let skillText = h;
                  // Si es string, limpiar llaves y comillas
                  if (typeof h === 'string') {
                    skillText = h.replace(/[{\}"]/g, '').trim();
                  } else if (h.name) {
                    skillText = h.name;
                  }
                  return (
                    <span key={idx} className="bg-conexia-soft text-conexia-green px-3 py-1 rounded-full text-sm">
                      {skillText}
                    </span>
                  );
                })}
              </div>
            </Section>
          )}

          {Array.isArray(user.experience) && user.experience.length > 0 && (
            <Section title="Experiencia">
              <ul className="list-disc ml-6">
                {user.experience.map((exp, idx) => (
                  <li key={idx}>
                    {exp.title} ({exp.years} año{exp.years > 1 ? 's' : ''})
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {user.birthDate && (
            <Section title="Fecha de nacimiento">
              <p>{new Date(user.birthDate).toLocaleDateString()}</p>
            </Section>
          )}

          {user.socialLinks && Array.isArray(user.socialLinks) && user.socialLinks.length > 0 && (
            <Section title="Redes sociales">
              <ul className="list-disc ml-6">
                {user.socialLinks.map((link, idx) => (
                  <li key={idx}>
                    <span className="font-semibold mr-2">{link.platform}:</span>
                    <a href={link.url} target="_blank" className="text-conexia-coral underline">
                      {link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {isOwner && user.phoneNumber && (
            <Section title="Número de teléfono">
              <p>{user.phoneNumber}</p>
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
