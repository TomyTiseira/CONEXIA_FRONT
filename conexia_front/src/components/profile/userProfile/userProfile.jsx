// src/components/profile/UserProfile.jsx
"use client";
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getProfileById } from "@/service/profiles/profilesFetch";
import Image from "next/image";
import { useAcceptConnectionRequest } from '@/hooks/connections/useAcceptConnectionRequest';
import { useRejectConnectionRequest } from '@/hooks/connections/useRejectConnectionRequest';
import { useConnectionRequests } from '@/hooks/connections/useConnectionRequests';
import { HiUserAdd } from 'react-icons/hi';
import { config } from "@/config";
import { NotFound } from "@/components/ui";
import Navbar from "@/components/navbar/Navbar";
import Toast from '@/components/ui/Toast';

import EditProfileForm from "./EditProfileForm";
import { updateUserProfile } from "@/service/profiles/updateProfile";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import SkillsDisplay from "@/components/skills/SkillsDisplay";
import UserCollaborativeProjects from "./UserCollaborativeProjects";
import UserServices from "./UserServices";
import UserActivity from "./UserActivity";
import ProfileConnectionButtons from "./ProfileConnectionButtons";
import UserConnections from "./UserConnections"
import MessagingWidget from "@/components/messaging/MessagingWidget";

export default function UserProfile() {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const { acceptRequest, loading: acceptLoading } = useAcceptConnectionRequest();
  const { rejectRequest, loading: rejectLoading } = useRejectConnectionRequest();
  const { refreshRequests } = useConnectionRequests();
  const { user: authUser, updateUser } = useAuth();
  const { user: storeUser, profile: storeProfile, roleName, setProfile: setProfileStore } = useUserStore();
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showMyProjects, setShowMyProjects] = useState(false);
  const [toast, setToast] = useState(null); // Toast de feedback de actualización de perfil

  // Detección robusta de roles (igual que en Navbar)
  // Se toma de useUserStore y se chequea tanto roleName como user?.role
  let isAdmin = false;
  let isModerator = false;
  if (storeUser) {
    isAdmin = storeUser.roleName === ROLES.ADMIN || storeUser.role === ROLES.ADMIN;
    isModerator = storeUser.roleName === ROLES.MODERATOR || storeUser.role === ROLES.MODERATOR;
  }
  // Fallback: si no está en storeUser, intentar con authUser
  if (!isAdmin && !isModerator && authUser) {
    isAdmin = authUser.role === ROLES.ADMIN;
    isModerator = authUser.role === ROLES.MODERATOR;
  }
  // LOG para depuración de navbar y roles
  useEffect(() => {
  }, [storeUser, roleName, authUser, isAdmin, isModerator]);

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
  }, [id, searchParams, authUser, roleName]);

  // Efecto para mostrar toast después de actualizar el perfil (solo dueño, clave escopada)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!authUser || String(authUser.id) !== String(id)) return; // Solo dueño
    const key = `profileUpdateToast:${id}`;
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        if (String(data.userId) === String(id)) setToast(data);
        sessionStorage.removeItem(key);
      }
    } catch {}
  }, [authUser, id]);

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

  // Build avatar like ClientCommunity / Navbar
  const avatar = storeProfile?.profilePicture
    ? `${config.IMAGE_URL}/${storeProfile.profilePicture}`
    : '/images/default-avatar.png';

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
      
      // Si es el perfil del usuario logueado, también actualizar el store para el navbar
      if (authUser && authUser.id === parseInt(id)) {
        setProfileStore(data.data.profile);
      }
      // Guardar estado para mostrar toast en la vista del perfil tras la edición (solo dueño)
      if (typeof window !== 'undefined') {
        const toastKey = `profileUpdateToast:${id}`;
        sessionStorage.setItem(toastKey, JSON.stringify({
          type: response.success ? 'success' : 'warning',
            message: response.success ? 'Perfil actualizado correctamente.' : 'El perfil se guardó con advertencias.',
          isVisible: true,
          userId: id
        }));
      }
      // Mostrar inmediatamente el toast sin esperar re-mount
      setToast({
        type: response.success ? 'success' : 'warning',
        message: response.success ? 'Perfil actualizado correctamente.' : 'El perfil se guardó con advertencias.',
        isVisible: true
      });
      // Forzar refresco de datos (App Router) para garantizar consistencia visual
      try { router.refresh && router.refresh(); } catch {}
    } catch (err) {
      // Persistir error para mostrar toast luego (solo dueño)
      if (typeof window !== 'undefined') {
        const toastKey = `profileUpdateToast:${id}`;
        sessionStorage.setItem(toastKey, JSON.stringify({
          type: 'error',
          message: err.message || 'Error al actualizar el perfil',
          isVisible: true,
          userId: id
        }));
      }
      setToast({ type: 'error', message: err.message || 'Error al actualizar el perfil', isVisible: true });
    } finally {
      setLoading(false);
    }
  };

  // Navbar único, detecta el rol internamente
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

  if (showMyProjects) {
    const MyProjects = require('@/components/project/search/MyProjectsView').default;
    return (
      <div className="bg-conexia-soft min-h-screen">
  <Navbar />
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6 mt-4 mx-6 md:mx-auto">
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
      <div className="max-w-5xl mx-auto flex flex-col gap-0 mt-4 px-2 md:px-0">
        {/* Toast global para feedback de actualización */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            isVisible={toast.isVisible}
            onClose={() => setToast(null)}
            position="top-center"
            duration={4000}
          />
        )}
        {/* Rectángulo de datos personales */}
        <div className="bg-white rounded-xl shadow p-6 border border-[#e0e0e0]">
          {/* Portada y foto de perfil */}
          <div className="relative h-48 rounded overflow-hidden bg-gray-100 mb-8">
            <Image
              src={user.coverPicture ? `${config.IMAGE_URL}/${user.coverPicture}` : '/bg-smoke.png'}
              alt="Foto de portada"
              layout="fill"
              objectFit="cover"
              className="object-cover"
              priority
            />
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-center mb-4 sm:justify-between" style={{ minHeight: 64 }}>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="w-[100px] h-[100px] flex-shrink-0 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200 flex items-center justify-center mx-auto sm:mx-0 mb-4 sm:mb-0">
                <div className="relative w-full h-full">
                  <Image
                    src={user.profilePicture ? `${config.IMAGE_URL}/${user.profilePicture}` : '/images/default-avatar.png'}
                    alt="Foto de perfil"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="sm:ml-8 flex flex-col justify-center h-full text-center sm:text-left">
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
                {/* Botones de conexión y mensaje (la lógica de visibilidad está dentro del componente) */}
                <ProfileConnectionButtons 
                  profile={profile} 
                  id={storeUser?.id} 
                  isOwner={isOwner} 
                  receiverId={Number(id)}
                />
              </div>
            </div>
            {/* Botón de editar (solo dueño) y botón para ver proyectos (todos) */}
            <div className="flex gap-2 justify-center sm:justify-end mt-4 sm:mt-0">
              {isOwner && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center justify-center w-10 h-10 bg-conexia-green hover:bg-conexia-green/90 text-white rounded-full transition-colors duration-200 shadow-sm flex-shrink-0"
                  title="Editar perfil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {/* Banner horizontal refinado para solicitud de conexión */}
          {!isOwner && !isAdmin && !isModerator && profile.profile?.connectionData?.state === 'pending' && profile.profile?.connectionData?.senderId !== storeUser?.id && !accepting && (
            <div className="w-full py-2 px-4 mb-4 rounded-lg shadow-sm border border-[#d0ecec] bg-[#e6f7f7] flex flex-col sm:flex-row sm:items-center sm:justify-between">
              {/* Texto e ícono */}
              <div className="flex items-center gap-2 mb-2 sm:mb-0 justify-center sm:justify-start text-center sm:text-left">
                <HiUserAdd className="w-5 h-5 text-conexia-green" />
                <span className="text-conexia-green text-sm font-medium">
                  {(() => {
                    const name = profile.profile?.name?.split(' ')[0] || '';
                    const lastName = profile.profile?.lastName?.split(' ')[0] || '';
                    return `${name} ${lastName} quiere conectar con vos`;
                  })()}
                </span>
              </div>
              {/* Botones y Enviar mensaje en desktop */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end justify-center items-center">
                <div className="flex gap-2">
                  <button
                    className="flex items-center justify-center bg-conexia-green text-white font-semibold rounded-lg border border-[#e0f0f0] hover:bg-[#285c5c] transition-colors focus:outline-none shadow-sm px-4 py-1 text-sm"
                    type="button"
                    onClick={async () => {
                      setAccepting(true);
                      await acceptRequest(profile.profile?.connectionData?.id);
                      await refreshRequests();
                      const data = await getProfileById(id);
                      setProfile(data.data);
                      setAccepting(false);
                      setToast({ type: 'success', message: 'Conexión aceptada.', isVisible: true });
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('connectionAcceptedToast', JSON.stringify({ type: 'success', message: 'Conexión aceptada.', isVisible: true }));
                      }
                    }}
                    disabled={acceptLoading || accepting}
                    style={{ minWidth: 80 }}
                  >
                    {acceptLoading || accepting ? 'Aceptando...' : 'Aceptar'}
                  </button>
                  <button
                    className="flex items-center justify-center bg-[#f5f6f6] text-[#777d7d] hover:bg-[#f1f2f2] border border-[#e1e4e4] font-semibold rounded-lg focus:outline-none shadow-sm px-4 py-1 text-sm"
                    type="button"
                    onClick={async () => {
                      setRejecting(true);
                      await rejectRequest(profile.profile?.connectionData?.id);
                      await refreshRequests();
                      const data = await getProfileById(id);
                      setProfile(data.data);
                      setRejecting(false);
                      setToast({ type: 'rejected', message: 'Solicitud rechazada.', isVisible: true });
                    }}
                    disabled={rejectLoading || rejecting}
                    style={{ minWidth: 80 }}
                  >
                    {rejectLoading || rejecting ? 'Rechazando...' : 'Rechazar'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Información en bloques */}
          <div className="mt-6 space-y-6">
            {user.description && (
              <Section title="Descripción">
                <p className="whitespace-pre-line break-words overflow-x-auto max-w-full">{user.description}</p>
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
                    <li key={idx} className="break-words max-w-full">
                      <span className="font-semibold mr-2 align-top">{link.platform}:</span>
                      <a
                        href={link.url}
                        target="_blank"
                        className="text-conexia-coral underline align-top break-words inline-block max-w-full"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          display: 'inline-block',
                          verticalAlign: 'top',
                          maxWidth: '100%'
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        {link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>
  {/* Apartado de conexiones del usuario */}
  <UserConnections userId={id} profile={profile} isOwner={isOwner} />
        {/* Rectángulo de proyectos colaborativos */}
        <UserCollaborativeProjects userId={id} />
        {/* Rectángulo de servicios */}
        <UserServices userId={id} />
        {/* Rectángulo de actividad */}
        <UserActivity userId={id} isOwner={isOwner} />
      </div>
      {/* Margen inferior verde */}
      <div className="bg-conexia-soft w-full" style={{ height: 65 }} />
      {/* NUEVO: Widget de Mensajes flotante en perfil (solo para usuarios normales) */}
      {!(isAdmin || isModerator) && (
        <MessagingWidget
          avatar={avatar}
        />
      )}
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

// Efecto para recoger el toast guardado en sessionStorage al volver de la edición
// (Se coloca después de la declaración del componente para mantener el archivo organizado)
if (typeof window !== 'undefined') {
  // Usamos un microtask para no interferir con SSR hydration
  Promise.resolve().then(() => {
    try {
      const evt = new Event('__profile_update_toast_init__');
      window.dispatchEvent(evt);
    } catch {}
  });
}

// Listener aislado para inicializar el toast cuando se monta el componente (solo en navegador)
// Se agrega fuera para no recrear lógica en cada render
// Nota: Accede al DOM indirectamente, sin romper reglas de hooks.

