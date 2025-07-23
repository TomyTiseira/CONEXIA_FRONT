// src/components/profile/UserProfile.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProfileById } from "@/service/profiles/profilesFetch";
import Image from "next/image";
import { config } from "@/config";
import { NotFound } from "@/components/ui";

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileById(id);
        setProfile(data.data);
        setIsOwner(data.isOwner);
      } catch (err) {
        setError(err.message || "Error al cargar el perfil");
        setProfile(null);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;

  if (error) {
    return (
      <NotFound
        title="Error al cargar el perfil"
        message={error}
        showHomeButton={true}
        showBackButton={false}
      />
    );
  }

  if (!profile) {
    return (
      <NotFound
        title="Usuario no encontrado"
        message="No se encontró el usuario solicitado."
        showHomeButton={true}
        showBackButton={false}
      />
    );
  }

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
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200 flex items-center justify-center">
            {user.profilePicture ? (
              <div className="relative w-full h-full">
                <Image
                  src={`${config.IMAGE_URL}/${user.profilePicture}`}
                  alt="Foto de perfil"
                  fill
                  className="object-cover rounded-full"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-full" />
            )}
          </div>
          <div className="ml-8 flex flex-col justify-center h-full">
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

          {user.birthDate && (
            <Section title="Fecha de nacimiento">
              <p>{new Date(user.birthDate).toLocaleDateString()}</p>
            </Section>
          )}


          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <Section title="Habilidades">
              <div className="flex flex-wrap gap-2">
                {user.skills.map((h, idx) => {
                  let skillText = h;
                  // Si es string, limpiar llaves y comillas
                  if (typeof h === 'string') {
                    skillText = h.replace(/[{"]}/g, '').trim();
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
              <ul className="ml-2">
                {user.experience.map((exp, idx) => {
                  const start = exp.startDate ? new Date(exp.startDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'short' }) : '';
                  const end = exp.isCurrent
                    ? 'Actualidad'
                    : exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'short' })
                      : '';
                  return (
                    <li key={idx} className="mb-2">
                      <div className="font-semibold text-conexia-green">{exp.title}</div>
                      {exp.project && <div className="text-sm text-conexia-coral">{exp.project}</div>}
                      <div className="text-xs text-gray-500">
                        {start} - {end}
                      </div>
                    </li>
                  );
                })}
              </ul>
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
