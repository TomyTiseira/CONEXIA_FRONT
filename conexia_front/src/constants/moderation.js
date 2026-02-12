/**
 * Constantes para el módulo de moderación
 */

export const MODERATION_ACTIONS = {
  BAN_USER: 'ban_user',
  RELEASE_USER: 'release_user',
  KEEP_MONITORING: 'keep_monitoring',
};

export const MODERATION_CLASSIFICATIONS = {
  REVIEW: 'Revisar',
  BAN: 'Banear',
};

export const ACTION_LABELS = {
  [MODERATION_ACTIONS.BAN_USER]: 'Usuario baneado',
  [MODERATION_ACTIONS.RELEASE_USER]: 'Usuario liberado',
  [MODERATION_ACTIONS.KEEP_MONITORING]: 'En monitoreo',
};

export const ACTION_COLORS = {
  [MODERATION_ACTIONS.BAN_USER]: 'bg-red-100 text-red-800',
  [MODERATION_ACTIONS.RELEASE_USER]: 'bg-green-100 text-green-800',
  [MODERATION_ACTIONS.KEEP_MONITORING]: 'bg-yellow-100 text-yellow-800',
};

export const CLASSIFICATION_COLORS = {
  [MODERATION_CLASSIFICATIONS.BAN]: 'bg-red-100 text-red-800',
  [MODERATION_CLASSIFICATIONS.REVIEW]: 'bg-yellow-100 text-yellow-800',
};

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  LIMITS: [10, 25, 50],
};
