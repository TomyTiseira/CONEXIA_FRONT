/**
 * AdminClaimsTable Component
 * Tabla de reclamos para administradores y moderadores
 */

'use client';

import React from 'react';
import { FaRegEye, FaEllipsisH, FaRegCopy } from 'react-icons/fa';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { config } from '@/config';

export const AdminClaimsTable = ({ claims, onViewDetail, onOpenActions }) => {
  const DEFAULT_AVATAR_SRC = '/images/default-avatar.png';

  const formatShortId = (id) => {
    const value = String(id ?? '');
    if (value.length <= 10) return value;
    return `${value.slice(0, 8)}…`;
  };

  const copyToClipboard = async (text) => {
    const value = String(text ?? '');
    if (!value) return false;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_) {
      // fallback below
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch (_) {
      return false;
    }
  };

  const getFirstName = (fullName) => {
    if (!fullName) return '';
    const trimmed = String(fullName).trim();
    if (!trimmed) return '';
    return trimmed.split(/\s+/)[0] || '';
  };

  const getDisplayName = (profile) => {
    if (!profile) return 'N/A';
    const firstName = getFirstName(profile.name);
    const lastName = profile.lastName ? String(profile.lastName).trim() : '';
    const composed = `${firstName} ${lastName}`.trim();
    return composed || profile.name || 'N/A';
  };

  const titleCase = (value) => {
    if (!value) return '';
    return String(value)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getModeratorNameFromEmail = (email) => {
    if (!email) return 'Sin asignar';
    const [prefixRaw] = String(email).toLowerCase().split('@');
    if (!prefixRaw) return 'Sin asignar';

    const parts = prefixRaw
      .split('.')
      .map((p) => p.trim())
      .filter(Boolean);

    const roleSuffixes = new Set(['moderador', 'administrador', 'admin']);
    const cleanedParts = parts.filter((p) => !roleSuffixes.has(p));

    if (cleanedParts.length === 0) return 'Sin asignar';

    const firstName = cleanedParts[0];
    const lastName = cleanedParts.slice(1).join(' ');
    return titleCase(`${firstName} ${lastName}`.trim()) || 'Sin asignar';
  };

  const getProfileImageSrc = (profile) => {
    if (profile?.profilePicture) return `${config.IMAGE_URL}/${profile.profilePicture}`;
    return DEFAULT_AVATAR_SRC;
  };

  const getTableClaimTypeLabelOverride = (claim) => {
    if (!claim) return null;
    const isOtherType = claim.claimType === 'client_other' || claim.claimType === 'provider_other';
    if (isOtherType && claim.otherReason) return 'Otro';
    return null;
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reclamante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reclamado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {claims.map((claimData) => {
                const claim = claimData.claim;
                const claimant = claimData.claimant?.profile;
                const otherUser = claimData.otherUser?.profile;
                const assignedModerator = claimData.assignedModerator;
                
                return (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-mono font-semibold text-gray-900"
                          title={String(claim.id)}
                        >
                          {formatShortId(claim.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(claim.id)}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Copiar ID completo"
                        >
                          <FaRegCopy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ClaimTypeBadge
                        claimType={claim.claimType}
                        labelOverride={getTableClaimTypeLabelOverride(claim)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={getProfileImageSrc(claimant)}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR_SRC;
                          }}
                          alt={getDisplayName(claimant)}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="max-w-[220px]">
                          <p className="text-sm font-medium text-gray-900 whitespace-normal break-words leading-snug">
                            {getDisplayName(claimant)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={getProfileImageSrc(otherUser)}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR_SRC;
                          }}
                          alt={getDisplayName(otherUser)}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="max-w-[220px]">
                          <p className="text-sm font-medium text-gray-900 whitespace-normal break-words leading-snug">
                            {getDisplayName(otherUser)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignedModerator?.email ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={DEFAULT_AVATAR_SRC}
                            alt="Moderador"
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="max-w-[220px]">
                            <p className="text-sm font-medium text-gray-900 whitespace-normal break-words leading-snug">
                              {getModeratorNameFromEmail(assignedModerator.email)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Sin asignar</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ClaimStatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewDetail(claimData)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <FaRegEye size={18} />
                        </button>
                        <button
                          onClick={() => onOpenActions(claimData)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Más acciones"
                        >
                          <FaEllipsisH size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {claims.map((claimData) => {
          const claim = claimData.claim;
          const claimant = claimData.claimant?.profile;
          const otherUser = claimData.otherUser?.profile;
          const assignedModerator = claimData.assignedModerator;
          
          return (
            <div key={claim.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono font-semibold text-gray-900" title={String(claim.id)}>
                      {formatShortId(claim.id)}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(claim.id)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="Copiar ID completo"
                    >
                      <FaRegCopy size={14} />
                    </button>
                  </div>
                  <ClaimTypeBadge
                    claimType={claim.claimType}
                    labelOverride={getTableClaimTypeLabelOverride(claim)}
                  />
                </div>
                <ClaimStatusBadge status={claim.status} />
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Reclamante</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={getProfileImageSrc(claimant)}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_SRC;
                      }}
                      alt={getDisplayName(claimant)}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <p className="text-sm font-medium text-gray-900">{getDisplayName(claimant)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Reclamado</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={getProfileImageSrc(otherUser)}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_SRC;
                      }}
                      alt={getDisplayName(otherUser)}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <p className="text-sm font-medium text-gray-900">{getDisplayName(otherUser)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Asignado</p>
                  {assignedModerator?.email ? (
                    <p className="text-sm font-medium text-gray-900">
                      {getModeratorNameFromEmail(assignedModerator.email)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Sin asignar</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() => onViewDetail(claimData)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Ver Detalle
                </button>
                <button
                  onClick={() => onOpenActions(claimData)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FaEllipsisH size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
