// src/components/profile/UserProfile.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getProfileById } from "@/service/profiles/profilesFetch";
import Image from "next/image";
import { config } from "@/config";
import { NotFound } from "@/components/ui";
import NavbarHome from "@/components/navbar/NavbarHome";
import NavbarAdmin from "@/components/navbar/NavbarAdmin";
import NavbarCommunity from "@/components/navbar/NavbarCommunity";

import EditProfileForm from "./EditProfileForm";
import { updateUserProfile } from "@/service/profiles/updateProfile";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";



export default function UserProfile() {
  const { user: authUser } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileById(id);
        setProfile(data.data);
        // Forzar edición si el usuario autenticado es el dueño y ?edit=1
        const isOwnerLocal = authUser && (String(authUser.id) === String(id));
        setIsOwner(isOwnerLocal);
        if (isOwnerLocal && searchParams.get('edit') === '1') {
          setEditing(true);
        } else {
          setEditing(false);
        }
      } catch (err) {         
        setError(err.message || "Error al cargar el perfil");
        setProfile(null);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, searchParams, authUser]);

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

  // Manejar actualización inmediata del perfil
  const handleUpdate = async (formData) => {
    setEditing(false);
    setLoading(true);
    try {
      // Crear objeto solo con los campos que realmente cambiaron
      const changedFields = {};
      
      // Comparar campos de texto simples
      const textFields = {
        name: user.name,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        country: user.country,
        state: user.state,
        description: user.description
      };
      
      Object.keys(textFields).forEach(field => {
        const originalValue = textFields[field] || '';
        const newValue = formData[field] || '';
        if (originalValue !== newValue) {
          changedFields[field] = newValue;
          console.log(`Campo cambiado - ${field}: "${originalValue}" -> "${newValue}"`);
        }
      });
      
      // Comparar skills con función más robusta
      const originalSkills = user.skills || [];
      const newSkills = formData.skills || [];
      
      // Función para comparar arrays de strings
      const arraysEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((item, index) => item === arr2[index]);
      };
      
      if (!arraysEqual(originalSkills, newSkills)) {
        changedFields.skills = newSkills;
        console.log('Skills cambiaron:', originalSkills, '->', newSkills);
      }
      
      // Limpiar experiencias del formulario
      const cleanedExperience = [];
      if (Array.isArray(formData.experience)) {
        formData.experience.forEach((exp) => {
          if (exp && typeof exp === 'object' && exp.title?.trim() && exp.project?.trim() && exp.startDate?.trim()) {
            const experienceItem = {
              title: String(exp.title).trim(),
              project: String(exp.project).trim(),
              startDate: String(exp.startDate).trim(),
              isCurrent: Boolean(exp.isCurrent)
            };
            
            if (!exp.isCurrent && exp.endDate?.trim()) {
              experienceItem.endDate = String(exp.endDate).trim();
            }
            
            cleanedExperience.push(experienceItem);
          }
        });
      }
      
      // Limpiar experiencias originales para comparación justa
      const cleanedOriginalExperience = [];
      const originalExperience = user.experience || [];
      if (Array.isArray(originalExperience)) {
        originalExperience.forEach((exp) => {
          if (exp && typeof exp === 'object') {
            const experienceItem = {
              title: String(exp.title || '').trim(),
              project: String(exp.project || '').trim(),
              startDate: String(exp.startDate || '').trim(),
              isCurrent: Boolean(exp.isCurrent)
            };
            
            if (!exp.isCurrent && exp.endDate) {
              experienceItem.endDate = String(exp.endDate).trim();
            }
            
            cleanedOriginalExperience.push(experienceItem);
          }
        });
      }
      
      // Comparar experiencias con función profunda
      const experienceChanged = JSON.stringify(cleanedOriginalExperience.sort((a,b) => a.title.localeCompare(b.title))) !== 
                               JSON.stringify(cleanedExperience.sort((a,b) => a.title.localeCompare(b.title)));
      
      if (experienceChanged) {
        changedFields.experience = cleanedExperience;
        console.log('Experience cambió:', cleanedOriginalExperience, '->', cleanedExperience);
      }
      
      // Limpiar socialLinks del formulario
      const cleanedSocialLinks = [];
      if (Array.isArray(formData.socialLinks)) {
        formData.socialLinks.forEach((link) => {
          if (link && typeof link === 'object' && link.platform?.trim() && link.url?.trim()) {
            cleanedSocialLinks.push({
              platform: String(link.platform).trim(),
              url: String(link.url).trim()
            });
          }
        });
      }
      
      // Limpiar socialLinks originales para comparación justa
      const cleanedOriginalSocialLinks = [];
      const originalSocialLinks = user.socialLinks || [];
      if (Array.isArray(originalSocialLinks)) {
        originalSocialLinks.forEach((link) => {
          if (link && typeof link === 'object') {
            cleanedOriginalSocialLinks.push({
              platform: String(link.platform || '').trim(),
              url: String(link.url || '').trim()
            });
          }
        });
      }
      
      // Comparar socialLinks con función profunda
      const socialLinksChanged = JSON.stringify(cleanedOriginalSocialLinks.sort((a,b) => a.platform.localeCompare(b.platform))) !== 
                                 JSON.stringify(cleanedSocialLinks.sort((a,b) => a.platform.localeCompare(b.platform)));
      
      if (socialLinksChanged) {
        changedFields.socialLinks = cleanedSocialLinks;
        console.log('SocialLinks cambió:', cleanedOriginalSocialLinks, '->', cleanedSocialLinks);
      }
      
      // Agregar archivos si son nuevos
      if (formData.profilePicture instanceof File) {
        changedFields.profilePicture = formData.profilePicture;
        console.log('Nueva foto de perfil:', formData.profilePicture.name);
      }
      if (formData.coverPicture instanceof File) {
        changedFields.coverPicture = formData.coverPicture;
        console.log('Nueva foto de portada:', formData.coverPicture.name);
      }
      
      // Solo enviar si hay cambios
      if (Object.keys(changedFields).length === 0) {
        console.log('No hay cambios para enviar');
        alert('No se detectaron cambios en el perfil');
        return;
      }
      
      console.log('Campos que cambiaron:', Object.keys(changedFields));
      
      // Preparar payload solo con campos cambiados (sin incluir token aquí)
      const payload = {
        ...changedFields
      };

      // Solo agregar archivos si son Files nuevos (no strings)
      if (formData.profilePicture instanceof File) {
        payload.profilePicture = formData.profilePicture;
      }
      if (formData.coverPicture instanceof File) {
        payload.coverPicture = formData.coverPicture;
      }
      
      await updateUserProfile(payload);
      // Refrescar perfil desde backend
      const data = await getProfileById(id);
      setProfile(data.data);
    } catch (err) {
      alert(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  let Navbar = NavbarHome;
  if (authUser?.role === 'admin') Navbar = NavbarAdmin;
  else if (authUser) Navbar = NavbarCommunity;
  if (editing && isOwner) {
    return (
      <div className="bg-conexia-soft min-h-screen">
        <Navbar />
        <div className="w-full max-w-2xl mx-auto mt-4">
          <EditProfileForm user={user} onSubmit={handleUpdate} isEditing={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-conexia-soft min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6 mt-4">        
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
        <div className="relative flex items-center mb-4 justify-between" style={{ minHeight: 64 }}>
          <div className="flex items-center">
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
          
          {/* Botón de editar alineado a la derecha */}
          {isOwner && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center justify-center w-10 h-10 bg-conexia-green hover:bg-conexia-green/90 text-white rounded-full transition-colors duration-200 shadow-sm mr-4"
              title="Editar perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          )}
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
          {isOwner && user.phoneNumber && (
            <Section title="Número de teléfono">
              <p>{user.phoneNumber}</p>
            </Section>
          )}
          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <Section title="Habilidades">
              <div className="flex flex-wrap gap-2">
                {user.skills.map((h, idx) => {
                  let skillText = h;
                  // Si es string, limpiar llaves y comillas
                  if (typeof h === 'string') {
                    skillText = h.replace(/[{"}]}/g, '').trim();
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

        </div>
      </div>
      {/* Botón de volver a la derecha, fuera del contenedor */}
      <div className="max-w-5xl mx-auto flex justify-end mt-6">
        <Button variant="primary" onClick={() => router.push('/')}>← Volver a la comunidad</Button>
      </div>
      {/* Margen inferior verde */}
      <div className="bg-conexia-soft w-full" style={{ height: 20 }} />
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
