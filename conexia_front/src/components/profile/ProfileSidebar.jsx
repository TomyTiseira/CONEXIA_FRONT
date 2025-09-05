import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { FaLinkedin, FaCertificate, FaUniversity, FaBriefcase, FaBirthdayCake, FaMapMarkerAlt } from 'react-icons/fa';
import { config } from '@/config';


export default function ProfileSidebar({ profile }) {
  if (!profile) return null;
  const avatar = profile.profilePicture ? `${config.IMAGE_URL}/${profile.profilePicture}` : '/images/default-avatar.png';
  // Solo primer nombre y apellido
  const firstName = (profile.name || '').split(' ')[0];
  const lastName = profile.lastName || '';
  const displayName = `${firstName} ${lastName}`.trim();
  const location = [profile.state, profile.country].filter(Boolean).join(', ');
  // Educación y experiencia actuales
  const currentEducations = (profile.education || []).filter(e => e.isCurrent);
  const currentExperiences = (profile.experience || []).filter(e => e.isCurrent);

  return (
    <aside
      className="bg-white rounded-2xl shadow border border-[#c6e3e4] overflow-hidden flex flex-col w-full md:max-w-xs md:mx-auto mb-0 md:mb-4"
      style={{ minWidth: 220, maxWidth: '100%' }}
    >
      {/* Avatar y fondo decorativo MOBILE: alineado a la izquierda */}
      <div className="w-full h-20 bg-center bg-cover relative md:hidden" style={{ backgroundImage: 'url(/bg-smoke.png)' }}>
        <div
          className="absolute left-6 -bottom-10 w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center"
        >
          <Image src={avatar} alt="avatar" width={96} height={96} className="object-cover w-full h-full" />
        </div>
      </div>
      {/* Avatar y fondo decorativo DESKTOP: alineado a la izquierda */}
      <div className="w-full h-20 bg-center bg-cover relative hidden md:block" style={{ backgroundImage: 'url(/bg-smoke.png)' }}>
        <div
          className="absolute -bottom-10 w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center"
          style={{ left: '24px' }}
        >
          <Image src={avatar} alt="avatar" width={96} height={96} className="object-cover w-full h-full" />
        </div>
      </div>
      {/* MOBILE: solo datos básicos, alineados a la izquierda */}
      <div className="flex flex-col items-start w-full px-4 pb-4 pt-14 md:hidden" style={{ minHeight: 120 }}>
        <h2
          className={
            `font-bold text-conexia-green text-left leading-tight mb-1 ` +
            (displayName.length > 18 ? 'text-base' : 'text-lg')
          }
          style={displayName.length > 24 ? { fontSize: '1rem' } : {}}
        >
          {displayName}
        </h2>
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
      </div>
      {/* DESKTOP: datos completos, alineados a la izquierda */}
      <div className="hidden md:flex flex-col items-start w-full px-6 pb-4 pt-14">
        <h2
          className={
            `font-bold text-conexia-green text-left leading-tight mb-2 ` +
            (displayName.length > 18 ? 'text-base' : 'text-lg')
          }
          style={displayName.length > 24 ? { fontSize: '1rem' } : {}}
        >
          {displayName}
        </h2>
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
        {/* Experiencia actual */}
        {currentExperiences.map((exp, idx) => (
          <div key={"exp-"+idx} className="flex items-center w-full mt-2 mb-1">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e0f0f0] mr-3 border border-[#c6e3e4]">
              <FaBriefcase className="text-conexia-green text-xl" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-conexia-green leading-tight">{exp.project || ''}</span>
              <span className="text-xs text-gray-600 leading-tight">{exp.title}</span>
            </div>
          </div>
        ))}
        {/* Educación actual */}
        {currentEducations.map((edu, idx) => (
          <div key={"edu-"+idx} className="flex items-center w-full mt-2 mb-1">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e0f0f0] mr-3 border border-[#c6e3e4]">
              <FaUniversity className="text-conexia-green text-xl" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-conexia-green leading-tight">{edu.institution}</span>
              <span className="text-xs text-gray-600 leading-tight">{edu.title}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

ProfileSidebar.propTypes = {
  profile: PropTypes.object,
};
