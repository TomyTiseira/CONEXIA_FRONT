/**
 * ClaimsListItem Component
 * Item de lista de reclamos para el panel de admin
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, User, FileText, ChevronRight } from 'lucide-react';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import {
  CLIENT_CLAIM_TYPE_LABELS,
  PROVIDER_CLAIM_TYPE_LABELS,
} from '@/constants/claims';

export const ClaimsListItem = ({ claim }) => {
  const router = useRouter();

  const claimTypeLabel = claim.claimantRole === 'client'
    ? CLIENT_CLAIM_TYPE_LABELS[claim.claimType] || claim.claimType
    : PROVIDER_CLAIM_TYPE_LABELS[claim.claimType] || claim.claimType;

  const handleClick = () => {
    router.push(`/claims/${claim.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {claim.hiring?.service?.title || claim.hiring?.serviceTitle || 'Servicio'}
            </h3>
            <ClaimStatusBadge status={claim.status} />
          </div>
          <p className="text-xs text-gray-500">
            Reclamo #{claim.id.slice(0, 8)}
          </p>
        </div>
        <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <User size={14} className="mr-2 flex-shrink-0" />
          <span className="truncate">
            <span className="font-medium">
              {claim.claimantFirstName && claim.claimantLastName
                ? `${claim.claimantFirstName} ${claim.claimantLastName}`
                : claim.claimantName || claim.claimantUser?.name || 'Usuario'}
            </span>
            {' '}({claim.claimantRole === 'client' ? 'Cliente' : 'Proveedor'})
          </span>
        </div>

        <div className="flex items-center text-gray-600">
          <FileText size={14} className="mr-2 flex-shrink-0" />
          <span className="truncate">{claimTypeLabel}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <Calendar size={14} className="mr-2 flex-shrink-0" />
          <span>{new Date(claim.createdAt).toLocaleDateString('es-AR')}</span>
        </div>
      </div>

      {claim.description && (
        <p className="text-xs text-gray-500 mt-3 line-clamp-2">
          {claim.description}
        </p>
      )}
    </div>
  );
};

export default ClaimsListItem;
