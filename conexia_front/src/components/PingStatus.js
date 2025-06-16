'use client';

import { useFetch } from "../hooks";
import { fetchPing } from "../service/users/usersFetch";

export default function PingStatus() {
  const { data, isLoading, error } = useFetch(fetchPing);

  if (isLoading) return <span>Cargando...</span>;
  if (error) return <span>Error: {error}</span>;
  
  return <span>{data.response}</span>;
} 