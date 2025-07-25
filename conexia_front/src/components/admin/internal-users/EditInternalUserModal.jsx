'use client';

import { useState, useEffect } from 'react';
import InputField from '@/components/form/InputField';
import Button from '@/components/ui/Button';
import SelectField from '@/components/form/SelectField';
import { validatePassword } from '@/utils/validation';
import { useInternalRoles } from '@/hooks/internal-users/useInternalRoles';
import useUpdateInternalUser from '@/hooks/internal-users/useUpdateInternalUser';
import { ROLES, ROLES_NAME } from '@/constants/roles';

export default function EditInternalUserModal({ user, onClose, onUserUpdated }) {
  const { roles } = useInternalRoles(); // [{ key: 1, value: 'admin' }, { key: 3, value: 'moderador' }]
  const { handleUpdate, updatingId } = useUpdateInternalUser();

  const [form, setForm] = useState({
    password: '',
    roleId: '',
  });

  const [initialRoleId, setInitialRoleId] = useState('');
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState(null);

  const isAdmin = user.role === ROLES.ADMIN;
  const isModerator = user.role === ROLES.MODERATOR;

  // ✅ Setear roleId inicial cuando los roles estén cargados
  useEffect(() => {
    if (roles.length > 0) {
      const roleEntry = roles.find((r) => r.value === user.role);
      if (roleEntry) {
        const roleIdStr = roleEntry.key.toString();
        setForm((prev) => ({ ...prev, roleId: roleIdStr }));
        setInitialRoleId(roleIdStr);
      }
    }
  }, [roles, user.role]);

  useEffect(() => {
    if (msg?.ok) {
      const timeout = setTimeout(() => {
        setMsg(null);
        onClose();
        if (onUserUpdated) onUserUpdated();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [msg, onClose, onUserUpdated]);

  useEffect(() => {
    if (msg && !msg.ok) {
      const timeout = setTimeout(() => setMsg(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [msg]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const getError = (field) => {
    if (!touched[field]) return '';

    if (field === 'password' && form.password.trim()) {
      return validatePassword(form.password);
    }

    if (field === 'roleId' && !form.roleId) {
      return 'Debe seleccionar un rol.';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    if (form.password.trim()) {
      const pwdError = validatePassword(form.password);
      if (pwdError) errors.password = pwdError;
    }

    if (!form.roleId) {
      errors.roleId = 'Debe seleccionar un rol.';
    }

    setTouched({
      password: !!form.password.trim(),
      roleId: true,
    });

    if (Object.keys(errors).length > 0) return;

    const isPasswordChanged = !!form.password.trim();
    const isRoleChanged = form.roleId.toString() !== initialRoleId.toString();

    if (!isPasswordChanged && !isRoleChanged) {
      setMsg({ ok: false, text: 'No se está haciendo ninguna actualización.' });
      return;
    }

    const payload = {
      ...(isPasswordChanged && { password: form.password }),
      ...(isRoleChanged && { roleId: parseInt(form.roleId, 10) }),
    };

    try {
      await handleUpdate(user.id, payload);

      let changedFields = [];
      if (isRoleChanged) changedFields.push('rol');
      if (isPasswordChanged) changedFields.push('contraseña');

      const fieldsText = changedFields.join(' y ');
      const successMessage = `Usuario actualizado correctamente. Se modifico ${fieldsText}.`;

      setMsg({ ok: true, text: successMessage });
    } catch (error) {
      const message = error.message || '';
      let userFriendlyMessage = 'Ocurrió un error al actualizar el usuario.';

      if (message.includes('not allowed to update')) {
        userFriendlyMessage = 'No puedes modificar tu propio usuario.';
      } else if (message.includes('New password cannot be the same')) {
        userFriendlyMessage = 'La nueva contraseña no puede ser igual a la contraseña actual.';
      }

      setMsg({ ok: false, text: userFriendlyMessage });
    }
  };

  // 🎯 Construir opciones según permisos
  const adminOption = roles.find((r) => r.value === ROLES.ADMIN);
  const modOption = roles.find((r) => r.value === ROLES.MODERATOR);

  const roleOptions = isAdmin
    ? adminOption
      ? [{ value: adminOption.key.toString(), label: ROLES_NAME[adminOption.value] }]
      : []
    : [modOption, adminOption]
        .filter(Boolean)
        .map((r) => ({
          value: r.key.toString(),
          label: ROLES_NAME[r.value],
        }));

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold text-center text-conexia-green mb-1">
          Editar usuario interno
        </h2>

        <p className="text-center text-conexia-bluegreen mb-6 mt-4 text-base">
          Estás editando a:{' '}
          <span className="font-semibold text-conexia-green">{user.email}</span>
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Campo rol */}
          <div>
            <label className="text-sm font-semibold text-conexia-green block mb-1">
              Rol
            </label>
            <SelectField
              name="roleId"
              value={form.roleId}
              onChange={(e) => handleChange('roleId', e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, roleId: true }))}
              options={roleOptions}
              error={getError('roleId')}
              placeholder="Seleccione un rol"
            />
          </div>

          {/* Campo contraseña */}
          <div>
            <label className="text-sm font-semibold text-conexia-green block mb-1">
              Nueva contraseña (opcional)
            </label>
            <InputField
              type="password"
              placeholder="Nueva contraseña"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              error={getError('password')}
              showToggle
              show={showPwd}
              onToggle={() => setShowPwd(!showPwd)}
            />
          </div>

          {/* Mensaje final */}
          <div className="min-h-[40px] text-center text-sm transition-all duration-300">
            {msg && (
              <p className={msg.ok ? 'text-green-600' : 'text-red-600'}>
                {msg.text}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-2">
            <Button type="submit" variant="primary" disabled={updatingId === user.id}>
              {updatingId === user.id ? 'Actualizando...' : 'Guardar'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={updatingId === user.id}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
