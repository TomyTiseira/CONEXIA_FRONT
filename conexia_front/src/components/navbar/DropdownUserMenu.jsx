
'use client';

import { LogOut, Settings } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProfileById } from '@/service/profiles/profilesFetch';

export default function DropdownUserMenu({ onLogout }) {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const userId = user?.id;
    const defaultAvatar = '/images/default-avatar.png';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileById(userId);
                setProfile(data.data.profile);
            } catch (err) {
                setError(err.message || 'Error al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) {
        return null;
    }

    return (
        <div className="absolute right-0 top-12 w-56 bg-white border rounded shadow-md z-50 py-3 text-conexia-green">
            {/* Header del usuario solo si hay perfil */}
            {profile ? (
                <div className="px-4 py-3 flex items-center gap-3 border-b">
                    <div className="w-12 h-12 relative rounded-full overflow-hidden">
                        <Image
                        src={
                            profile.profilePicture
                            ? `${require('@/config').config.IMAGE_URL}/${profile.profilePicture}`
                            : defaultAvatar
                        }
                        alt="Foto de perfil"
                        fill
                        className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="font-semibold text-sm">{profile.name} {profile.lastName}</span>
                        <span className="text-xs text-conexia-green/80 mb-1">{profile.description || ''}</span>
                        <Button className="px-3 py-0.5 text-xs" onClick={() => router.push(`/profile/userProfile/${userId}`)}>Ver perfil</Button>
                    </div>
                </div>
            ) : null}

            {/* Opciones */}
            <button
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-conexia-green/10"
            >
                <Settings size={16} />
                Configuraciones y privacidad
            </button>

            <button
                onClick={onLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-conexia-green/10"
            >
                <LogOut size={16} />
                Cerrar sesión
            </button>
        </div>
    );
}
