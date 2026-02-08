'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Filter, Search, Download } from 'lucide-react';
import { APPLICATION_TYPE_LABELS } from '@/components/project/roles/ProjectRolesManager';
import ApplicationDetailModal from './ApplicationDetailModal';
import Button from '@/components/ui/Button';

/**
 * Panel de gestión de postulaciones agrupadas por rol
 */
export default function RoleBasedPostulationsPanel({ 
  projectTitle,
  roles = [], 
  postulations = [],
  onApprove,
  onReject,
  loading 
}) {
  const [expandedRoles, setExpandedRoles] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  // Agrupar postulaciones por rol
  const groupedPostulations = roles.map(role => {
    const roleApplications = postulations.filter(p => p.roleId === role.id);
    return {
      ...role,
      applications: roleApplications,
      pendingCount: roleApplications.filter(p => p.status === 'pending').length,
      approvedCount: roleApplications.filter(p => p.status === 'approved').length,
      rejectedCount: roleApplications.filter(p => p.status === 'rejected').length,
      totalCount: roleApplications.length
    };
  });

  const toggleRole = (roleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleApprove = async (applicationId) => {
    await onApprove(applicationId);
    setShowDetailModal(false);
  };

  const handleReject = async (applicationId, feedback) => {
    await onReject(applicationId, feedback);
    setShowDetailModal(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filterApplications = (applications) => {
    let filtered = applications;

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Postulaciones</h2>
            <p className="text-sm text-gray-600 mt-1">
              Proyecto: <span className="font-semibold text-conexia-green">{projectTitle}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex items-center gap-2">
              <Download size={18} />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green"
            />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green appearance-none bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen de roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupedPostulations.map((roleGroup) => (
          <div key={roleGroup.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{roleGroup.title}</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-conexia-green/10 text-conexia-green">
                {roleGroup.vacancies} vacante{roleGroup.vacancies !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{roleGroup.totalCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Pendientes:</span>
                <span className="font-semibold text-yellow-700">{roleGroup.pendingCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Aprobados:</span>
                <span className="font-semibold text-green-700">{roleGroup.approvedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Rechazados:</span>
                <span className="font-semibold text-red-700">{roleGroup.rejectedCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de roles con postulaciones */}
      <div className="space-y-4">
        {groupedPostulations.map((roleGroup) => {
          const filteredApps = filterApplications(roleGroup.applications);
          const isExpanded = expandedRoles[roleGroup.id];

          return (
            <div key={roleGroup.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Header del rol */}
              <button
                onClick={() => toggleRole(roleGroup.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Users className="text-conexia-green" size={20} />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{roleGroup.title}</h3>
                    <p className="text-sm text-gray-600">
                      {APPLICATION_TYPE_LABELS[roleGroup.applicationType]} • {filteredApps.length} postulacion{filteredApps.length !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {roleGroup.pendingCount > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                        {roleGroup.pendingCount} pendiente{roleGroup.pendingCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {/* Contenido expandido */}
              {isExpanded && (
                <div className="p-6">
                  {filteredApps.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto mb-3 text-gray-400" size={48} />
                      <p>No hay postulaciones que coincidan con los filtros</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredApps.map((application) => (
                        <div
                          key={application.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-conexia-green transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {application.applicantName || 'Candidato'}
                                </h4>
                                {getStatusBadge(application.status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {application.applicantEmail || 'email@example.com'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Postulado el: {new Date(application.createdAt).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>

                            <Button
                              onClick={() => handleViewApplication({ ...application, role: roleGroup })}
                              variant="primary"
                              className="text-sm"
                            >
                              Ver detalle
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de detalle */}
      {showDetailModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          role={selectedApplication.role}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading}
        />
      )}
    </div>
  );
}
