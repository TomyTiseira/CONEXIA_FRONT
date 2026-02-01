'use client';
import { motion } from 'framer-motion';
import { FolderCheck, Award, TrendingUp } from 'lucide-react';
import { KPICard } from './KPICard';
import { PostulationsChart } from './PostulationsChart';

/**
 * Sección de métricas de proyectos (usa los datos actuales del dashboard)
 */
export const ProjectMetricsSection = ({ projectsData, postulationsData }) => {
  if (!projectsData && !postulationsData) {
    return null;
  }

  const hasProjectActivity = 
    (projectsData?.totalProjectsEstablished || 0) > 0 ||
    (postulationsData?.totalPostulations || 0) > 0;

  if (!hasProjectActivity) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FolderCheck className="w-7 h-7 text-[#48a6a7]" />
        <h2 className="text-2xl font-bold text-gray-900">
          Métricas de proyectos
        </h2>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Proyectos finalizados"
          value={projectsData?.totalProjectsEstablished || 0}
          icon={FolderCheck}
          color="purple"
          subtitle="Proyectos completados"
        />

        <KPICard
          title="Total de postulaciones"
          value={postulationsData?.totalPostulations || 0}
          icon={TrendingUp}
          color="blue"
          subtitle="Postulaciones enviadas"
        />

        <KPICard
          title="Tasa de éxito"
          value={`${(postulationsData?.successRate || 0).toFixed(1)}%`}
          icon={Award}
          color="gold"
          subtitle={`${postulationsData?.acceptedPostulations || 0} de ${postulationsData?.totalPostulations || 0} aceptadas`}
          showProgressBar
          progressValue={postulationsData?.successRate || 0}
        />
      </div>

      {/* Gráfico de postulaciones */}
      {postulationsData && postulationsData.totalPostulations > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PostulationsChart
            totalPostulations={postulationsData.totalPostulations}
            acceptedPostulations={postulationsData.acceptedPostulations}
            successRate={(postulationsData.successRate || 0).toFixed(1)}
          />

          {/* Placeholder para futuro gráfico */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <p className="text-gray-400 text-center">
              Más gráficos de proyectos próximamente...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
