'use client';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, Eye, CreditCard } from 'lucide-react';
import { FiAward } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';

const sections = [
  { id: 'account', label: 'Cuenta', icon: User, path: '/settings/account' },
  { id: 'payment', label: 'Datos de cobro', icon: CreditCard, path: '/settings/payment' },
  { id: 'security', label: 'Seguridad', icon: ShieldCheck, path: '/settings/security' },
  { id: 'privacy', label: 'Privacidad', icon: Eye, path: '/settings/privacy' },
  { id: 'my-plan', label: 'Mi plan', icon: FiAward, path: '/settings/my-plan' },
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
        <BackButton
          onClick={() => handleClick('/')}
          text="Volver al inicio"
        />
      </div>
    </div>
  );
}
