import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { FaLinkedin, FaCertificate, FaUniversity, FaBriefcase, FaBirthdayCake, FaMapMarkerAlt } from 'react-icons/fa';
import { CheckCircle } from 'lucide-react';
import { config } from '@/config';


export default function ProfileSidebar({ profile, userId}) {
  if (!profile) return null;
  const avatar = profile.profilePicture ? `${config.IMAGE_URL}/${profile.profilePicture}` : '/images/default-avatar.png';
  // Portada personalizada - usar coverPicture del perfil si existe
  const coverImage = profile.coverPicture 
    ? `${config.IMAGE_URL}/${profile.coverPicture}` 
    : '/bg-smoke.png';
  // Solo primer nombre y primer apellido
  const firstName = (profile.name || '').trim().split(' ')[0];
  const firstLastName = (profile.lastName || '').trim().split(' ')[0] || '';
  const displayName = `${firstName} ${firstLastName}`.trim();
  const location = [profile.state, profile.country].filter(Boolean).join(', ');
  // Educación y experiencia actuales - solo mostrar la más reciente
  const currentEducations = (profile.education || []).filter(e => e.isCurrent);
  const currentExperiences = (profile.experience || []).filter(e => e.isCurrent);
  
  // Obtener solo la experiencia más reciente (basada en startDate)
  const latestExperience = currentExperiences.length > 0 
    ? currentExperiences.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0))[0]
    : null;
    
  // Obtener solo la educación más reciente (basada en startDate)
  const latestEducation = currentEducations.length > 0 
    ? currentEducations.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0))[0]
    : null;
  // Usar siempre el id del usuario para la redirección
  const profileUrl = `/profile/userProfile/${userId}`;

  return (
    <aside
      className="bg-white rounded-2xl shadow border border-[#c6e3e4] overflow-hidden flex flex-col w-full md:max-w-xs md:mx-auto mb-0 md:mb-4"
      style={{ minWidth: 220, maxWidth: '100%' }}
    >
      {/* Avatar y fondo decorativo MOBILE: alineado a la izquierda */}
      <a
        href={profileUrl}
        className="w-full h-20 bg-center bg-cover relative md:hidden block"
        style={{ backgroundImage: `url(${coverImage})` }}
        tabIndex={0}
      >
        <div
          className="absolute left-6 -bottom-10 w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center"
        >
          <Image src={avatar} alt="avatar" width={96} height={96} className="object-cover w-full h-full" />
        </div>
      </a>
      {/* Avatar y fondo decorativo DESKTOP: alineado a la izquierda */}
      <a
        href={profileUrl}
        className="w-full h-20 bg-center bg-cover relative hidden md:block"
        style={{ backgroundImage: `url(${coverImage})` }}
        tabIndex={0}
      >
        <div
          className="absolute -bottom-10 w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center"
          style={{ left: '24px' }}
        >
          <Image src={avatar} alt="avatar" width={96} height={96} className="object-cover w-full h-full" />
        </div>
      </a>
      {/* MOBILE: solo datos básicos, alineados a la izquierda */}
      <a
        href={profileUrl}
        className="flex flex-col items-start w-full px-4 pb-4 pt-14 md:hidden no-underline"
        style={{ minHeight: 120 }}
        tabIndex={0}
      >
        <div className="flex items-center gap-2 mb-1">
          <h2
            className={
              `font-bold text-conexia-green text-left leading-tight ` +
              (displayName.length > 18 ? 'text-base' : 'text-lg')
            }
            style={displayName.length > 24 ? { fontSize: '1rem' } : {}}
          >
            {displayName}
          </h2>
          {profile.verified && (
            <div 
              className="flex-shrink-0 bg-green-100 rounded-full p-0.5" 
              title="Identidad verificada"
            >
              <CheckCircle className="text-green-600" size={16} />
            </div>
          )}
        </div>
        {profile.profession && (
          <div
            className="text-[0.95rem] text-conexia-green/80 text-left mb-1"
            style={{ lineHeight: '1.13', maxWidth: 180 }}
          >
            {profile.profession}
          </div>
        )}
        {location && (
          <div className="flex items-center text-xs text-gray-500 mb-1 mt-1 justify-start"><FaMapMarkerAlt className="mr-1" />{location}</div>
        )}
      </a>
      {/* DESKTOP: datos completos, alineados a la izquierda */}
      <a
        href={profileUrl}
        className="hidden md:flex flex-col items-start w-full px-6 pb-4 pt-14 no-underline"
        tabIndex={0}
      >
        <div className="flex items-center gap-2 mb-2">
          <h2
            className={
              `font-bold text-conexia-green text-left leading-tight ` +
              (displayName.length > 18 ? 'text-base' : 'text-lg')
            }
            style={displayName.length > 24 ? { fontSize: '1rem' } : {}}
          >
            {displayName}
          </h2>
          {profile.verified && (
            <div 
              className="flex-shrink-0 bg-green-100 rounded-full p-0.5" 
              title="Identidad verificada"
            >
              <CheckCircle className="text-green-600" size={16} />
            </div>
          )}
        </div>
        {profile.profession && (
          <div
            className="text-[0.85rem] text-conexia-green/80 text-left mb-2"
            style={{ lineHeight: '1.13' }}
          >
            {profile.profession}
          </div>
        )}
        {location && (
          <div className="flex items-center text-xs text-gray-500 mb-2 mt-1 justify-start"><FaMapMarkerAlt className="mr-1" />{location}</div>
        )}
        {/* Experiencia actual más reciente */}
        {latestExperience && (
          <div className="flex items-start w-full mt-2 mb-1">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e0f0f0] mr-3 border border-[#c6e3e4] flex-shrink-0">
              <FaBriefcase className="text-conexia-green text-xl" />
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-conexia-green leading-tight break-words">{latestExperience.project || ''}</span>
              <span className="text-xs text-gray-600 leading-tight break-words">{latestExperience.title}</span>
            </div>
          </div>
        )}
        {/* Educación actual más reciente */}
        {latestEducation && (
          <div className="flex items-start w-full mt-2 mb-1">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e0f0f0] mr-3 border border-[#c6e3e4] flex-shrink-0">
              <FaUniversity className="text-conexia-green text-xl" />
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-conexia-green leading-tight break-words">{latestEducation.institution}</span>
              <span className="text-xs text-gray-600 leading-tight break-words">{latestEducation.title}</span>
            </div>
          </div>
        )}
      </a>
    </aside>
  );
}

ProfileSidebar.propTypes = {
  profile: PropTypes.object,
};
