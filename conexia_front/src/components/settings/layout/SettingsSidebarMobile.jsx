'use client';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';

const sections = [
  { id: 'account', label: 'Cuenta', icon: User, path: '/settings/account' },
  { id: 'security', label: 'Seguridad', icon: ShieldCheck, path: '/settings/security' },
  { id: 'privacy', label: 'Privacidad', icon: Eye, path: '/settings/privacy' },
];

export default function SettingsSidebarMobile({ active, onChange }) {
  const router = useRouter();

  const handleClick = (path) => {
    router.push(path);
    onChange(); // cerrar menú
  };

  return (
    <div className="absolute z-50 top-full right-4 mt-2 bg-white shadow-lg rounded-md w-60 p-4">
      <ul className="flex flex-col gap-2">
        {sections.map(({ id, label, icon: Icon, path }) => (
          <li key={id}>
            <button
              onClick={() => handleClick(path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md w-full transition ${
                active === id
                  ? 'bg-conexia-green/10 text-conexia-green font-semibold'
                  : 'text-conexia-green/70 hover:bg-conexia-green/5'
              }`}
            >
              <Icon size={22} />
              <span className="text-base font-medium">{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => handleClick('/community')}
          variant="informative"
          className="w-fit"
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
