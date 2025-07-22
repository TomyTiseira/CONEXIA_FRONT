'use client';

import { useState, useEffect } from 'react';
import { useInternalRoles } from '@/hooks/useInternalRoles';
import { useCreateInternalUser } from '@/hooks/useCreateInternalUser';
import InputField from '@/components/form/InputField';
import Button from '@/components/ui/Button';
import { validateEmail, validatePassword } from '@/utils/validation';
import { ROLES_NAME } from '@/constants/roles';
import SelectField from '@/components/form/SelectField';

export default function CreateInternalUserModal({ onClose }) {
  const { roles } = useInternalRoles();
  const { createUser, loading } = useCreateInternalUser();

  const [form, setForm] = useState({
    email: '',
    password: '',
    roleId: '',
  });

  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState({});
  const [showPwd, setShowPwd] = useState(false);

  // Mensaje de error o éxito: { ok: true | false, text: string }
  const [msg, setMsg] = useState(null);

  // Limpiar mensaje luego de 5 segundos
  useEffect(() => {
    if (msg) {
      const timeout = setTimeout(() => setMsg(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [msg]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getError = (field) => {
    if (!touched[field]) return '';
    return {
      email: validateEmail,
      password: validatePassword,
    }[field]?.(form[field]) || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, roleId: true });

    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const roleError = !form.roleId ? 'Debe seleccionar un rol.' : '';

    if (emailError || passwordError || roleError) {
      setMsg(null); // no mostrar mensaje general
      return;
    }

    try {
      await createUser({
        email: form.email,
        password: form.password,
        roleId: parseInt(form.roleId, 10),
      });

      setMsg({ ok: true, text: 'Usuario creado exitosamente.' });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      if (error.message.includes('already exists')) {
        setMsg({ ok: false, text: 'Este correo ya está registrado.' });
      } else {
        setMsg({ ok: false, text: 'Ocurrió un error al registrar el usuario.' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold text-center mb-4 text-conexia-green">
          Registrar usuario interno
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-conexia-green block mb-1">Email</label>
            <InputField
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onFocus={() => setFocused((prev) => ({ ...prev, email: true }))}
              onBlur={() => handleBlur('email')}
              error={getError('email')}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-sm font-semibold text-conexia-green block mb-1">Contraseña</label>
            <InputField
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
              onBlur={() => handleBlur('password')}
              error={getError('password')}
              showToggle
              show={showPwd}
              onToggle={() => setShowPwd(!showPwd)}
            />
          </div>

          {/* Rol */}
          <div>
            <label className="text-sm font-semibold text-conexia-green block mb-1">Rol</label>
            <SelectField
              name="roleId"
              value={form.roleId}
              onChange={(e) => handleChange('roleId', e.target.value)}
              onBlur={() => handleBlur('roleId')}
              options={roles.map((r) => ({
                value: r.key,
                label: ROLES_NAME[r.value] || r.value,
              }))}
              error={!form.roleId && touched.roleId ? 'Debe seleccionar un rol.' : ''}
              placeholder="Seleccione un rol"
            />
          </div>


          {/* Mensaje general */}
          <div className="min-h-[40px] text-center text-sm transition-all duration-300">
            {msg && (
              <p className={msg.ok ? 'text-green-600' : 'text-red-600'}>
                {msg.text}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creando...' : 'Aceptar'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
