/**
 * Tipos TypeScript para métricas de servicios
 */

export type UserPlan = 'Free' | 'Basic' | 'Premium';

export interface TopHiredService {
  serviceId: number;
  serviceTitle: string;
  timesHired: number;
  revenue: number;
  averageRating: number;
}

export interface ServiceRevenueBreakdown {
  serviceId: number;
  serviceTitle: string;
  totalRevenue: number;
  timesCompleted: number;
}

export interface ServiceMetricsData {
  // ✅ Métricas BASE (disponibles para todos los planes)
  totalServicesPublished: number;
  totalServicesHired: number;
  hiringPercentage: number;
  averageRating: number;
  totalReviews: number;
  
  // 💰 Métricas BASIC y PREMIUM (opcional)
  totalRevenueGenerated?: number;
  serviceRevenueBreakdown?: ServiceRevenueBreakdown[];
  
  // 🏆 Métricas solo PREMIUM (opcional)
  servicesCompleted?: number;
  servicesCancelled?: number;
  servicesWithClaims?: number;
  topHiredServices?: TopHiredService[];
  
  // Metadata
  userPlan: UserPlan;
  lastUpdated: string;
}

export interface ServiceMetricsResponse {
  success: boolean;
  data: ServiceMetricsData;
  timestamp: string;
  path: string;
}

/**
 * Helper para verificar si tiene acceso a métricas premium
 */
export const hasPremiumMetrics = (data: ServiceMetricsData): boolean => {
  return data.userPlan === 'Premium';
};

/**
 * Helper para verificar si tiene acceso a métricas de ingresos
 */
export const hasRevenueAccess = (data: ServiceMetricsData): boolean => {
  return data.userPlan === 'Basic' || data.userPlan === 'Premium';
};

/**
 * Formatea cantidad en pesos argentinos
 */
export const formatARS = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
