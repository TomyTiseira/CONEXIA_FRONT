'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  ArrowLeft, 
  Download, 
  Users,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useProjectStatistics } from '@/hooks/project/useProjectStatistics';
import { RoleStatsCard } from '@/components/project/statistics';
import BackButton from '@/components/ui/BackButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Página de estadísticas de postulaciones de un proyecto
 */
export default function ProjectStatisticsPage({ params }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const { data, isLoading, error } = useProjectStatistics(projectId);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Cargando estad\u00edsticas..." fullScreen={true} />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f9f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-[#48a6a7] hover:bg-[#419596] text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // No data
  if (!data) {
    return (
      <div className="min-h-screen bg-[#f3f9f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sin datos</h2>
          <p className="text-gray-600 mb-6">No se encontraron estadísticas para este proyecto</p>
          <button
            onClick={() => router.back()}
            className="bg-[#48a6a7] hover:bg-[#419596] text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const {
    projectTitle,
    totalPostulations,
    postulationsByRole,
    evaluationStatsByRole
  } = data;

  // Si no hay roles seleccionado, seleccionar el primero
  const effectiveSelectedRoleId = selectedRoleId || evaluationStatsByRole?.[0]?.roleId;
  const selectedRoleStats = evaluationStatsByRole?.find(r => r.roleId === effectiveSelectedRoleId);

  return (
    <div className="min-h-screen bg-[#f3f9f8] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <BackButton
            text="Volver al proyecto"
            onClick={() => router.push(`/project/${projectId}`)}
            className="mb-4"
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-8 h-8 text-[#48a6a7]" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#48a6a7]">
                Estadísticas del proyecto
              </h1>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              {projectTitle}
            </h2>
            <p className="text-gray-600">
              Análisis detallado de las postulaciones recibidas
            </p>
          </motion.div>
        </div>

        {/* Resumen General */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#48a6a7]" />
            Resumen general
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total de postulaciones */}
            <div className="bg-gradient-to-br from-[#edf6f6] to-white rounded-lg p-4 border-2 border-[#48a6a7]/20">
              <div className="text-4xl font-bold text-[#48a6a7] mb-1">
                {totalPostulations}
              </div>
              <div className="text-sm font-medium text-gray-700">
                Postulaciones totales
              </div>
            </div>

            {/* Postulaciones por rol */}
            {postulationsByRole && postulationsByRole.map((role) => {
              return (
                <div
                  key={role.roleId}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border-2 border-blue-200"
                >
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {role.totalPostulations}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {role.roleName}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Sin postulaciones */}
        {totalPostulations === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aún no hay postulaciones
            </h3>
            <p className="text-gray-600 mb-6">
              Este proyecto aún no ha recibido postulaciones. Compártelo para atraer colaboradores.
            </p>
            <button
              onClick={() => router.push(`/project/${projectId}`)}
              className="bg-[#48a6a7] hover:bg-[#419596] text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Ver proyecto
            </button>
          </motion.div>
        )}

        {/* Tabs de roles */}
        {evaluationStatsByRole && evaluationStatsByRole.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Estadísticas por rol
              </h3>
              <div className="flex flex-wrap gap-3">
                {evaluationStatsByRole.map((roleStat) => (
                  <button
                    key={roleStat.roleId}
                    onClick={() => setSelectedRoleId(roleStat.roleId)}
                    className={`
                      px-6 py-3 rounded-lg font-semibold transition-all duration-200
                      ${effectiveSelectedRoleId === roleStat.roleId
                        ? 'bg-[#48a6a7] text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#48a6a7]'
                      }
                    `}
                  >
                    {roleStat.roleName}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Estadísticas del rol seleccionado */}
            {selectedRoleStats && (
              <motion.div
                key={effectiveSelectedRoleId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <RoleStatsCard roleStats={{ ...selectedRoleStats, projectId }} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
