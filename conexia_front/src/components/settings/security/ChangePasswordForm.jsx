'use client';

import { useState } from 'react';
import Toast from '@/components/ui/Toast';
import InputField from '@/components/form/InputField';
import { validatePassword, validateRepeatPwd } from '@/utils/validation';
import { updatePassword } from '@/service/user/userFetch';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function ChangePasswordForm() {
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        repeatPassword: '',
    });
    const router = useRouter();

    const [touched, setTouched] = useState({});
    const [focused, setFocused] = useState({});
    // Eliminamos mensaje inline; usaremos Toast para error y sessionStorage para éxito
    const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });
    const [show, setShow] = useState({
        current: false,
        new: false,
        repeat: false,
    });

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (touched[field]) {
        setTouched((prev) => ({ ...prev, [field]: true }));
        }
    };

    const handleBlur = (field) => {
        setFocused((prev) => ({ ...prev, [field]: false }));
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const getError = (field) => {
        const value = form[field];
        if (!touched[field]) return '';

        if (field === 'currentPassword' && !value) return 'Ingrese su contraseña actual';
        if (field === 'newPassword') return validatePassword(value);
        if (field === 'repeatPassword') return validateRepeatPwd(form.newPassword, value);
        return '';
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
        currentPassword: true,
        newPassword: true,
        repeatPassword: true,
    });

    const currentPwdError = !form.currentPassword ? 'Ingrese su contraseña actual' : '';
    const newPwdError = validatePassword(form.newPassword);
    const repeatError = validateRepeatPwd(form.newPassword, form.repeatPassword);

    if (currentPwdError || newPwdError || repeatError) return;

    try {
        await updatePassword(form);
        // Guardar toast para pantalla anterior
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('passwordChangeToast', JSON.stringify({
            type: 'success',
            message: 'Contraseña actualizada correctamente.'
          }));
        }
        router.push('/settings/security');
    } catch (err) {
        let text = 'Ocurrió un error al cambiar la contraseña.';
        if (err.message === 'Invalid current password') {
            text = 'La contraseña actual es incorrecta.';
        } else if (err.message === 'New password cannot be the same as the current password') {
            text = 'La nueva contraseña no puede ser igual a la actual.';
        }
        setToast({ visible: true, type: 'error', message: text });
    }
    };


    return (
        <div className="w-full flex justify-center">
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-0 text-center">
            <h2 className="text-2xl font-bold text-conexia-green mb-6">
            Cambiar contraseña
            </h2>

            {/* Campo Contraseña Actual */}
            <div className="text-left max-w-sm mx-auto">
            <label className="inline-block text-sm font-medium text-conexia-green mb-1">
                Contraseña actual
            </label>
            <InputField
                type="password"
                placeholder="Contraseña actual"
                value={form.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                onFocus={() => setFocused((prev) => ({ ...prev, currentPassword: true }))}
                onBlur={() => handleBlur('currentPassword')}
                error={getError('currentPassword')}
                showToggle={true}
                show={show.current}
                onToggle={() => setShow((prev) => ({ ...prev, current: !prev.current }))}
            />
            </div>

            {/* Campo Nueva Contraseña */}
            <div className="text-left max-w-sm mx-auto">
            <label className="inline-block text-sm font-medium text-conexia-green mb-1">
                Nueva contraseña
            </label>
            <InputField
                type="password"
                placeholder="Nueva contraseña"
                value={form.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                onFocus={() => setFocused((prev) => ({ ...prev, newPassword: true }))}
                onBlur={() => handleBlur('newPassword')}
                error={getError('newPassword')}
                showToggle={true}
                show={show.new}
                onToggle={() => setShow((prev) => ({ ...prev, new: !prev.new }))}
            />
            </div>

            {/* Campo Repetir Contraseña */}
            <div className="text-left max-w-sm mx-auto">
            <label className="inline-block text-sm font-medium text-conexia-green mb-1">
                Repetir nueva contraseña
            </label>
            <InputField
                type="password"
                placeholder="Repetir nueva contraseña"
                value={form.repeatPassword}
                onChange={(e) => handleChange('repeatPassword', e.target.value)}
                onFocus={() => setFocused((prev) => ({ ...prev, repeatPassword: true }))}
                onBlur={() => handleBlur('repeatPassword')}
                error={getError('repeatPassword')}
                showToggle={true}
                show={show.repeat}
                onToggle={() => setShow((prev) => ({ ...prev, repeat: !prev.repeat }))}
            />
            </div>

            {/* Botones */}
            <div className="flex justify-center gap-4 mt-6">
                <Button type="submit" className="min-w-[100px] px-4 py-2">
                    Guardar cambios
                </Button>

              <Button
                type="button"
                onClick={() => router.push('/settings/security')}
                variant="cancel"
                className="min-w-[100px] px-4 py-2"
              >
                Cancelar
              </Button>
            </div>

                        <Toast
                            type={toast.type}
                            message={toast.message}
                            isVisible={toast.visible}
                            onClose={() => setToast(t => ({ ...t, visible: false }))}
                            position="top-center"
                            duration={5000}
                        />
        </form>
        </div>
    );
    }
