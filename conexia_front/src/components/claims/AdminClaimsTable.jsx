/**
 * AdminClaimsTable Component
 * Tabla de reclamos para administradores y moderadores
 */

"use client";

import React from "react";
import { FaRegEye, FaEllipsisH, FaRegCopy } from "react-icons/fa";
import { ClaimTypeBadge } from "./ClaimTypeBadge";
import { ClaimStatusBadge } from "./ClaimStatusBadge";
import { ComplianceStatusBadge } from "./ComplianceStatusBadge";
import { config } from "@/config";

export const AdminClaimsTable = ({ claims, onViewDetail, onOpenActions }) => {
  const DEFAULT_AVATAR_SRC = "/images/default-avatar.png";

  const formatShortId = (id) => {
    const value = String(id ?? "");
    if (value.length <= 10) return value;
    return `${value.slice(0, 8)}…`;
  };

  const copyToClipboard = async (text) => {
    const value = String(text ?? "");
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
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch (_) {
      return false;
    }
  };

  const getFirstName = (fullName) => {
    if (!fullName) return "";
    const trimmed = String(fullName).trim();
    if (!trimmed) return "";
    return trimmed.split(/\s+/)[0] || "";
  };

  const getDisplayName = (profile) => {
    if (!profile) return "N/A";
    const firstName = getFirstName(profile.name);
    const lastName = profile.lastName ? String(profile.lastName).trim() : "";
    const composed = `${firstName} ${lastName}`.trim();
    return composed || profile.name || "N/A";
  };

  const titleCase = (value) => {
    if (!value) return "";
    return String(value)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getModeratorNameFromEmail = (email) => {
    if (!email) return "Sin asignar";
    const [prefixRaw] = String(email).toLowerCase().split("@");
    if (!prefixRaw) return "Sin asignar";

    const parts = prefixRaw
      .split(".")
      .map((p) => p.trim())
      .filter(Boolean);

    const roleSuffixes = new Set(["moderador", "administrador", "admin"]);
    const cleanedParts = parts.filter((p) => !roleSuffixes.has(p));

    if (cleanedParts.length === 0) return "Sin asignar";

    const firstName = cleanedParts[0];
    const lastName = cleanedParts.slice(1).join(" ");
    return titleCase(`${firstName} ${lastName}`.trim()) || "Sin asignar";
  };

  const getProfileImageSrc = (profile) => {
    if (!profile?.profilePicture) return DEFAULT_AVATAR_SRC;
    const imagePath = profile.profilePicture;
    if (imagePath.startsWith("http")) return imagePath;
    return `${config.IMAGE_URL}/${imagePath}`;
  };

  const getTableClaimTypeLabelOverride = (claim) => {
    if (!claim) return null;
    const isOtherType =
      claim.claimType === "client_other" ||
      claim.claimType === "provider_other";
    if (isOtherType && claim.otherReason) return "Otro";
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compromiso
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

                // Estado inteligente de compromisos sin iconos
                const getComplianceDisplay = () => {
                  if (
                    !claimData.compliances ||
                    claimData.compliances.length === 0
                  ) {
                    return (
                      <span className="text-xs text-gray-400 italic">
                        Sin compromisos
                      </span>
                    );
                  }

                  const total = claimData.compliances.length;
                  const pending = claimData.compliances.filter(
                    (c) => c.status === "pending",
                  ).length;
                  const approved = claimData.compliances.filter(
                    (c) => c.status === "approved",
                  ).length;
                  const submitted = claimData.compliances.filter(
                    (c) => c.status === "submitted",
                  ).length;

                  if (approved === total) {
                    return (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        {total} completado{total !== 1 ? "s" : ""}
                      </span>
                    );
                  }

                  if (pending > 0 || submitted > 0) {
                    return (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                        {pending + submitted} en curso
                      </span>
                    );
                  }

                  return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {total} {total === 1 ? "compromiso" : "compromisos"}
                    </span>
                  );
                };

                return (
                  <tr
                    key={claim.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
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
                        showIcon={false}
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
                              {getModeratorNameFromEmail(
                                assignedModerator.email,
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Sin asignar
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ClaimStatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getComplianceDisplay()}
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
            <div key={claim.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p
                      className="text-xs font-mono font-semibold text-gray-900 break-all"
                      title={String(claim.id)}
                    >
                      {String(claim.id)}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(claim.id)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded flex-shrink-0"
                      title="Copiar ID completo"
                    >
                      <FaRegCopy size={14} />
                    </button>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">
                      Tipo de reclamo
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      Tipo de reclamo
                    </p>
                    <ClaimTypeBadge
                      claimType={claim.claimType}
                      labelOverride={getTableClaimTypeLabelOverride(claim)}
                      showIcon={false}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ClaimStatusBadge status={claim.status} />
                </div>
              </div>

              <div className="mb-3">
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-1">Reclamante</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={getProfileImageSrc(claimant)}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_SRC;
                      }}
                      alt={getDisplayName(claimant)}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <p className="text-sm font-medium text-gray-900">
                      {getDisplayName(claimant)}
                    </p>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-1">Reclamado</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={getProfileImageSrc(otherUser)}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_SRC;
                      }}
                      alt={getDisplayName(otherUser)}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <p className="text-sm font-medium text-gray-900">
                      {getDisplayName(otherUser)}
                    </p>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-1">Asignado</p>
                  {assignedModerator?.email ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={DEFAULT_AVATAR_SRC}
                        alt="Moderador"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <p className="text-sm font-medium text-gray-900">
                        {getModeratorNameFromEmail(assignedModerator.email)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Sin asignar</p>
                  )}
                </div>
                {claimData.compliances && claimData.compliances.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">Compromisos</p>
                    {(() => {
                      const total = claimData.compliances.length;
                      const pending = claimData.compliances.filter(
                        (c) => c.status === "pending",
                      ).length;
                      const approved = claimData.compliances.filter(
                        (c) => c.status === "approved",
                      ).length;
                      const submitted = claimData.compliances.filter(
                        (c) => c.status === "submitted",
                      ).length;

                      if (approved === total) {
                        return (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            {total} completado{total !== 1 ? "s" : ""}
                          </span>
                        );
                      }

                      if (pending > 0 || submitted > 0) {
                        return (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            {pending + submitted} en curso
                          </span>
                        );
                      }

                      return (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {total} {total === 1 ? "compromiso" : "compromisos"}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center">
                <div className="flex items-center gap-1">
                  <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <button
                      onClick={() => onViewDetail(claimData)}
                      className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                      title="Ver detalle"
                      aria-label="Ver detalle"
                    >
                      <FaRegEye className="text-[15px] group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                      onClick={() => onOpenActions(claimData)}
                      className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                      title="Más acciones"
                      aria-label="Más acciones"
                    >
                      <FaEllipsisH className="text-[16px] group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
