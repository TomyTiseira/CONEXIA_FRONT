'use client';

import { useFetch } from "../hooks";
import { fetchPing } from "../service/user/userFetch";
import { colors } from "../constants";

export default function PingStatus() {
  const { data, isLoading, error } = useFetch(fetchPing);

  if (isLoading) return <span>Cargando...</span>;
  if (error) return <span style={{ color: colors.secondary.darker }}>Error: {error}</span>;
  
  return <span style={{ backgroundColor: colors.primary.normal, color: colors.primary.darker, padding: '10px', borderRadius: '5px' }}>{data.response}</span>;
} 