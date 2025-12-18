'use client';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Package,
  Activity
} from 'lucide-react';
import { FiStar, FiZap } from 'react-icons/fi';
import { useServiceMetrics } from '@/hooks/dashboard/useServiceMetrics';
import { KPICard } from './KPICard';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState, EmptyState } from './ErrorStates';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Componente para mostrar estrellas de calificación
 */
const StarRating = ({ rating, maxStars = 5 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = rating >= starValue;
        const isPartial = rating > index && rating < starValue;
        
        return (
          <div key={index} className="relative">
            {isPartial ? (
              <>
                <Star className="w-5 h-5 text-gray-300" />
                <div 
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${(rating - index) * 100}%` }}
                >
                  <Star className="w-5 h-5 text-[#f4d81d] fill-current" />
                </div>
              </>
            ) : (
              <Star 
                className={`w-5 h-5 ${
                  isFilled 
                    ? 'text-[#f4d81d] fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Banner de upgrade para planes inferiores (estilo UpgradePlanButton)
 */
export const UpgradeBanner = ({ currentPlan }) => {
  const targetPlanName = currentPlan === 'Free' ? 'Basic' : 'Premium';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-6"
    >
      <div className="relative bg-gradient-to-r from-[#367d7d]/15 via-[#48a6a7]/20 to-[#367d7d]/15 border-2 border-[#48a6a7]/40 rounded-xl overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg3MiwxNjYsMTY3LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#48a6a7]/20 to-[#367d7d]/20 border border-[#48a6a7]/30">
                <FiZap className="w-5 h-5 text-[#367d7d]" />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs sm:text-sm font-semibold text-[#2b6a6a] mb-1">
                  Suscribite a {targetPlanName}
                </p>
                <p className="text-sm sm:text-base font-bold text-[#367d7d] leading-tight">
                  {currentPlan === 'Free' 
                    ? 'Accede a métricas completas de ingresos, servicios y proyectos'
                    : 'Desbloquea análisis avanzado con distribución detallada y rankings'}
                </p>
                <p className="text-xs sm:text-sm text-gray-700 mt-1">
                  Visualiza estadísticas completas de todas tus actividades
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#48a6a7]/30 via-[#419596]/40 to-[#367d7d]/30 rounded-xl blur-xl opacity-60 animate-pulse"></div>
              
              <Link
                href="/settings/my-plan"
                className="relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#48a6a7] to-[#419596] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:from-[#419596] hover:to-[#367d7d] transition-all shadow-[0_4px_15px_rgba(72,166,167,0.4)] hover:shadow-[0_6px_20px_rgba(65,149,150,0.5)] transform hover:scale-105 group whitespace-nowrap"
              >
                <FiStar className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Mejorar plan</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Gráfico de distribución de servicios (Premium)
 */
const ServicesDistributionChart = ({ completed, cancelled, withClaims }) => {
  const data = [
    { name: 'Completados', value: completed || 0, color: '#35ba5b' },
    { name: 'Cancelados', value: cancelled || 0, color: '#db3228' },
    { name: 'Reclamados', value: withClaims || 0, color: '#f4d81d' },
  ];

  const COLORS = data.map(entry => entry.color);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-purple-50">
          <Activity className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          Distribución de Servicios
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Sección de métricas de servicios
 */
export const ServiceMetricsSection = () => {
  const { data, isLoading, error, refetch } = useServiceMetrics();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-[#48a6a7]" />
          Métricas de Servicios
        </h2>
        <DashboardSkeleton cards={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-[#48a6a7]" />
          Métricas de Servicios
        </h2>
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data || data.totalServicesPublished === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-[#48a6a7]" />
          Métricas de Servicios
        </h2>
        <EmptyState
          message="Aún no tienes servicios publicados. Comienza a ofrecer tus servicios para ver tus métricas aquí."
          actionLabel="Publicar servicio"
          onAction={() => router.push('/services/create')}
        />
      </div>
    );
  }

  const { userPlan } = data;
  const isPremium = userPlan === 'Premium';
  const hasRevenue = userPlan === 'Basic' || userPlan === 'Premium';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-[#48a6a7]" />
          <h2 className="text-2xl font-bold text-gray-900">
            Métricas de Servicios
          </h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${
          userPlan === 'Premium'
            ? 'bg-purple-100 text-purple-800'
            : userPlan === 'Basic'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          Plan {userPlan}
        </span>
      </div>

      {/* KPIs Base - Disponibles para todos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Servicios contratados"
          value={data.totalServicesHired}
          icon={Package}
          color="blue"
          subtitle={`de ${data.totalServicesPublished} publicados`}
        />
        
        <KPICard
          title="Tasa de contratación"
          value={`${data.hiringPercentage.toFixed(1)}%`}
          icon={TrendingUp}
          color="purple"
          subtitle="Porcentaje de éxito"
          showProgressBar
          progressValue={data.hiringPercentage}
        />
        
        {/* Calificación con estrellas */}
        <KPICard
          title="Calificación promedio"
          value={
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-1">
                <span>{data.averageRating > 0 ? data.averageRating.toFixed(1) : 'N/A'}</span>
                <span className="text-lg text-gray-600">/ 5.0</span>
              </div>
              {data.averageRating > 0 && (
                <div className="flex items-center">
                  <StarRating rating={data.averageRating} />
                </div>
              )}
            </div>
          }
          icon={Star}
          color="gold"
          subtitle={`Entre todos tus servicios • ${data.totalReviews} ${data.totalReviews === 1 ? 'reseña' : 'reseñas'}`}
        />
      </div>

      {/* Sección de Ingresos - Solo BASIC y PREMIUM */}
      {hasRevenue && data.totalRevenueGenerated !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Ingreso Total - Izquierda */}
          <div className="lg:col-span-4">
            <KPICard
              title="Ingresos generados"
              value={`$${data.totalRevenueGenerated.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={DollarSign}
              color="green"
              subtitle="Pesos Argentinos (ARS)"
            />
          </div>

          {/* Desglose por Servicio - Derecha con scroll */}
          {data.serviceRevenueBreakdown && data.serviceRevenueBreakdown.length > 0 && (
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100 h-full hover:shadow-xl hover:border-green-200 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Ingresos por Servicio
                  </h3>
                </div>
                
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="sticky top-0 bg-white border-b-2 border-gray-200">
                      <tr>
                        <th className="pb-3 pr-4 text-sm font-semibold text-gray-700">#</th>
                        <th className="pb-3 pr-4 text-sm font-semibold text-gray-700">Servicio</th>
                        <th className="pb-3 pr-4 text-sm font-semibold text-gray-700 text-right whitespace-nowrap">
                          Ingresos
                        </th>
                        <th className="pb-3 pr-4 text-sm font-semibold text-gray-700 text-right whitespace-nowrap">
                          Completados
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-700 text-right whitespace-nowrap">
                          Promedio
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.serviceRevenueBreakdown.map((service, index) => {
                        const avgRevenue = service.timesCompleted > 0
                          ? service.totalRevenue / service.timesCompleted
                          : 0;
                        
                        return (
                          <tr
                            key={service.serviceId}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 pr-4">
                              <span className="text-gray-400 font-semibold text-sm">
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-gray-900 font-medium text-sm">
                                {service.serviceTitle}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <span className="text-green-600 font-bold text-sm whitespace-nowrap">
                                ${service.totalRevenue.toLocaleString('es-AR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <span className="text-gray-700 font-medium text-sm">
                                {service.timesCompleted}x
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <span className="text-gray-600 text-sm whitespace-nowrap">
                                ${avgRevenue.toLocaleString('es-AR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Métricas Premium - Solo PREMIUM */}
      {isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Estado de servicios + Gráfico */}
          <div className="space-y-6">
            {/* Tarjetas horizontales - Arriba */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard
                title="Servicios completados"
                value={data.servicesCompleted || 0}
                icon={CheckCircle}
                color="green"
                subtitle="Finalizados exitosamente"
              />
              
              <KPICard
                title="Servicios cancelados"
                value={data.servicesCancelled || 0}
                icon={XCircle}
                color="red"
                subtitle="No completados"
              />
              
              <KPICard
                title="Servicios reclamados"
                value={data.servicesWithClaims || 0}
                icon={AlertTriangle}
                color="gold"
                subtitle="Servicios con disputas"
              />
            </div>

            {/* Gráfico - Abajo (ancho completo pero limitado) */}
            <div className="max-w-3xl mx-auto">
              <ServicesDistributionChart
                completed={data.servicesCompleted}
                cancelled={data.servicesCancelled}
                withClaims={data.servicesWithClaims}
              />
            </div>
          </div>

          {/* Top 5 Servicios Más Contratados - Fila completa */}
          {data.topHiredServices && data.topHiredServices.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#48a6a7]/20 hover:shadow-xl hover:border-[#48a6a7]/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-[#48a6a7]/10">
                  <TrendingUp className="w-6 h-6 text-[#48a6a7]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Top Servicios más contratados
                </h3>
              </div>
              
              <div className="space-y-3">
                {data.topHiredServices.map((service, index) => (
                  <motion.div
                    key={service.serviceId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-[#edf6f6] to-white rounded-lg border border-[#48a6a7]/20 hover:shadow-md transition-shadow gap-3 sm:gap-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#48a6a7] to-[#419596] text-white font-bold text-sm flex-shrink-0">
                        #{index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {service.serviceTitle}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {service.timesHired} contrataciones
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            {service.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right ml-13 sm:ml-2 flex-shrink-0">
                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        ${service.revenue.toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-gray-500">Ingresos totales</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Última actualización */}
      <p className="text-xs text-gray-500 text-right">
        Última actualización: {new Date(data.lastUpdated).toLocaleString('es-AR')}
      </p>
    </div>
  );
};
