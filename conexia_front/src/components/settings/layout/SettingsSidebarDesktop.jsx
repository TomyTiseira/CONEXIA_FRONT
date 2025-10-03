'use client';
import { useRouter } from 'next/navigation';
import { useRoleValidation } from '@/hooks/useRoleValidation';
import { User, ShieldCheck, Eye, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';

export default function SettingsSidebarDesktop({ active }) {
	const { hasAnyRole } = useRoleValidation();
	const router = useRouter();
	const sections = [
		{ id: 'account', label: 'Cuenta', icon: User, path: '/settings/account' },
		{ id: 'security', label: 'Seguridad', icon: ShieldCheck, path: '/settings/security' },
		{ id: 'privacy', label: 'Privacidad', icon: Eye, path: '/settings/privacy' },
		// Solo mostrar 'Datos de cobro' si el usuario tiene rol 'user'
		...(hasAnyRole(['user']) ? [{ id: 'payment', label: 'Datos de cobro', icon: CreditCard, path: '/settings/payment' }] : [])
	];

	return (
		<nav className="p-4">
			<ul className="flex flex-col gap-2">
				{sections.map(({ id, label, icon: Icon, path }) => (
					<li key={id}>
						<button
							onClick={() => router.push(path)}
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
			<div className="mt-8 flex justify-center">
				<BackButton onClick={() => router.push('/')} text="Volver al inicio" />
			</div>
		</nav>
	);
}
