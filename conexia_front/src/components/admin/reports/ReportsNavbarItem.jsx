import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import Link from 'next/link';

export default function ReportsNavbarItem() {
  const { roleName } = useUserStore();
  if (![ROLES.ADMIN, ROLES.MODERATOR].includes(roleName)) return null;
  return (
    <Link href="/reports" className="font-semibold px-4 py-2 hover:bg-gray-100 rounded transition text-conexia-green">
      Reportes
    </Link>
  );
}
