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
import SkillsDisplay from "@/components/skills/SkillsDisplay";



export default function UserProfile() {
  const { user: authUser, updateUser } = useAuth();
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
        birthDate: user.birthDate,
        phoneNumber: user.phoneNumber,
        country: user.country,
        state: user.state,
        description: user.description,
        profession: user.profession
      };
      
      Object.keys(textFields).forEach(field => {
        const originalValue = textFields[field] || '';
        const newValue = formData[field] || '';
        // Incluir el campo siempre para permitir vaciar campos opcionales
        if (originalValue !== newValue) {
          changedFields[field] = newValue;
        }
      });
      
      // Comparar skills con función más robusta
      const originalSkills = user.skills || [];
      const newSkills = formData.skills || [];
      
      // Función para comparar arrays de objetos/strings
      const arraysEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        
        // Si ambos arrays están vacíos
        if (arr1.length === 0 && arr2.length === 0) return true;
        
        // Si uno está vacío y el otro no
        if (arr1.length !== arr2.length) return false;
        
        // Si arr1 son objetos (skills del backend) y arr2 son objetos (del selector)
        if (arr1[0] && typeof arr1[0] === 'object' && arr1[0].id && 
            arr2[0] && typeof arr2[0] === 'object' && arr2[0].id) {
          return arr1.every((item, index) => {
            const item2 = arr2[index];
            return item2 && item.id === item2.id;
          });
        }
        
        // Si arr1 son objetos pero arr2 son IDs
        if (arr1[0] && typeof arr1[0] === 'object' && arr1[0].id && 
            arr2[0] && typeof arr2[0] === 'number') {
          return arr1.every((item, index) => item.id === arr2[index]);
        }
        
        // Si son arrays de IDs o strings
        return arr1.every((item, index) => item === arr2[index]);
      };
      
      // Solo incluir skills si hay cambios o si se están vaciando
      if (!arraysEqual(originalSkills, newSkills)) {
        changedFields.skills = newSkills;
      }
      
      // Siempre incluir experiencias (todas, no solo las que cambiaron)
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
            
            // Solo agregar endDate si no es actual y tiene valor
            if (!exp.isCurrent && exp.endDate?.trim()) {
              experienceItem.endDate = String(exp.endDate).trim();
            }
            
            cleanedExperience.push(experienceItem);
          }
        });
      }
      
      // Siempre incluir las experiencias para asegurar que se mantenga el estado
      changedFields.experience = cleanedExperience;
      
      // Siempre incluir redes sociales (todas, no solo las que cambiaron)
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
      
      // Siempre incluir las redes sociales para asegurar que se mantenga el estado
      changedFields.socialLinks = cleanedSocialLinks;
      
      // Siempre incluir educación (todas, no solo las que cambiaron)
      // Limpiar educación del formulario
      const cleanedEducation = [];
      if (Array.isArray(formData.education)) {
        formData.education.forEach((edu) => {
          if (edu && typeof edu === 'object' && edu.institution?.trim() && edu.title?.trim() && edu.startDate?.trim()) {
            const educationItem = {
              institution: String(edu.institution).trim(),
              title: String(edu.title).trim(),
              startDate: String(edu.startDate).trim(),
              isCurrent: Boolean(edu.isCurrent)
            };
            
            // Solo agregar endDate si no es actual y tiene valor
            if (!edu.isCurrent && edu.endDate?.trim()) {
              educationItem.endDate = String(edu.endDate).trim();
            }
            
            cleanedEducation.push(educationItem);
          }
        });
      }
      
      // Siempre incluir las educaciones para asegurar que se mantenga el estado
      changedFields.education = cleanedEducation;

      // Siempre incluir certificaciones (todas, no solo las que cambiaron)
      // Limpiar certificaciones del formulario
      const cleanedCertifications = [];
      if (Array.isArray(formData.certifications)) {
        formData.certifications.forEach((cert) => {
          if (cert && typeof cert === 'object' && cert.name?.trim() && cert.url?.trim()) {
            cleanedCertifications.push({
              name: String(cert.name).trim(),
              url: String(cert.url).trim()
            });
          }
        });
      }
      
      // Siempre incluir las certificaciones para asegurar que se mantenga el estado
      changedFields.certifications = cleanedCertifications;
      
      // Agregar archivos si son nuevos
      if (formData.profilePicture instanceof File) {
        changedFields.profilePicture = formData.profilePicture;
      }
      if (formData.coverPicture instanceof File) {
        changedFields.coverPicture = formData.coverPicture;
      }
      
      // Solo salir si NO hay cambios Y NO hay datos de formulario relevantes
      // Los arrays siempre se incluyen para asegurar sincronización
      const hasRelevantData = Object.keys(changedFields).length > 0;
      
      if (!hasRelevantData) {
        return;
      }
      
      // Preparar payload solo con campos cambiados
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
      
      const response = await updateUserProfile(payload);
      
      // Si el backend devuelve el usuario actualizado y es el perfil del usuario logueado,
      // actualizar el estado de autenticación
      if (response.success && response.data?.user && authUser && authUser.id === parseInt(id)) {
        updateUser(response.data.user);
      }
      
      // Refrescar perfil desde backend para mostrar los cambios
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
          <EditProfileForm 
            user={user} 
            onSubmit={handleUpdate} 
            onCancel={() => setEditing(false)}
            isEditing={true} 
          />
        </div>
      </div>
    );
  }

  const [showMyProjects, setShowMyProjects] = useState(false);

  if (showMyProjects) {
    const MyProjects = require('@/components/project/search/MyProjectsView').default;
    return (
      <div className="bg-conexia-soft min-h-screen">
        <Navbar />
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6 mt-4">
          <MyProjects />
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => setShowMyProjects(false)}>Volver a mi perfil</Button>
          </div>
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
              {user.profession && (
                <p className="text-conexia-coral font-medium text-lg mt-1">
                  {user.profession}
                </p>
              )}
              {(user.state || user.country) && (
                <p className="text-gray-600 mt-1">{user.state}{user.state && user.country ? ", " : ""}{user.country}</p>
              )}
            </div>
          </div>
          
          {/* Botón de editar (solo dueño) y botón para ver proyectos (todos) */}
          <div className="flex gap-2">
            {isOwner && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center justify-center w-10 h-10 bg-conexia-green hover:bg-conexia-green/90 text-white rounded-full transition-colors duration-200 shadow-sm mr-2"
                title="Editar perfil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
            )}
            <Button variant="secondary" onClick={() => router.push(`/projects/user/${user.id}`)}>
              Ver proyectos de este usuario
            </Button>
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
          {isOwner && user.phoneNumber && (
            <Section title="Número de teléfono">
              <p>{user.phoneNumber}</p>
            </Section>
          )}
          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <Section title="Habilidades">
              <SkillsDisplay skills={user.skills} />
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
          {Array.isArray(user.education) && user.education.length > 0 && (
            <Section title="Educación">
              <ul className="ml-2">
                {user.education.map((edu, idx) => {
                  const start = edu.startDate ? new Date(edu.startDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'short' }) : '';
                  const end = edu.isCurrent
                    ? 'Actualidad'
                    : edu.endDate
                      ? new Date(edu.endDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'short' })
                      : '';
                  return (
                    <li key={idx} className="mb-2">
                      <div className="font-semibold text-conexia-green">{edu.title}</div>
                      {edu.institution && <div className="text-sm text-conexia-coral">{edu.institution}</div>}
                      <div className="text-xs text-gray-500">
                        {start} - {end}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}
          {Array.isArray(user.certifications) && user.certifications.length > 0 && (
            <Section title="Certificaciones">
              <ul className="list-disc ml-6">
                {user.certifications.map((cert, idx) => (
                  <li key={idx}>
                    <span className="font-semibold mr-2">{cert.name}:</span>
                    <a href={cert.url} target="_blank" className="text-conexia-coral underline">
                      Ver certificación
                    </a>
                  </li>
                ))}
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
