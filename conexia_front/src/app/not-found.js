import { NotFound } from '@/components/ui';

export default function GlobalNotFound() {
  return (
    <NotFound 
      title="Página no encontrada"
      message="La página que buscas no existe o ha sido movida."
      showBackButton={true}
      showHomeButton={true}
    />
  );
} 