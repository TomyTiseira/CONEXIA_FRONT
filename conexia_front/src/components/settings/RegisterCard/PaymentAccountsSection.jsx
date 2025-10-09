

'use client';
import React, { useState } from 'react';
import { useRoleValidation } from '@/hooks/useRoleValidation';
import Toast from '@/components/ui/Toast';
import AddBankAccountForm from './AddBankAccountForm';
import AddDigitalAccountForm from './AddDigitalAccountForm';
import Button from '@/components/ui/Button';
import { useFetch } from '@/hooks/useFetch';
import { fetchPaymentAccounts, deleteBankAccount, fetchBankAccountById, editAccountAliasAndName } from '@/service/payment/paymentFetch';
import EditAccountModal from './EditAccountModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function PaymentAccountsSection() {
  const { isInitialLoading, hasAnyRole } = useRoleValidation();
  const [toast, setToast] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [showBankForm, setShowBankForm] = useState(false);
  const [showDigitalForm, setShowDigitalForm] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { data: accounts, isLoading, error, refetch } = useFetch(fetchPaymentAccounts);
  if (isInitialLoading) return null;
  if (!hasAnyRole(['user'])) return null;

  // Abrir modal de confirmación
  const handleRequestDelete = (acc) => {
    setDeleteAccount(acc);
    setDeleteModalOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deleteAccount) return;
    setDeleteLoading(true);
    try {
      await deleteBankAccount(deleteAccount.id);
      setDeleteModalOpen(false);
      setDeleteAccount(null);
      refetch();
      setToast({
        type: 'success',
        message: 'Cuenta eliminada correctamente',
        isVisible: true
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err?.message || 'Error al eliminar la cuenta',
        isVisible: true
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Separar cuentas bancarias y digitales
  const bankAccounts = Array.isArray(accounts)
    ? accounts.filter(acc => acc.type === 'bank_account')
    : [];
  const digitalAccounts = Array.isArray(accounts)
    ? accounts.filter(acc => acc.type === 'digital_account')
    : [];

  // Cuando se agrega una cuenta, refrescar la lista
  const handleAddBank = (msg) => {
    setShowBankForm(false);
    refetch();
    if (msg) {
      setToast({ type: 'success', message: msg, isVisible: true });
    }
  };
  const handleAddDigital = (msg) => {
    setShowDigitalForm(false);
    refetch();
    if (typeof msg === 'string') {
      setToast({ type: 'success', message: msg, isVisible: true });
    } else if (msg && typeof msg.message === 'string') {
      setToast({ type: 'success', message: msg.message, isVisible: true });
    } else {
      setToast({ type: 'success', message: 'Cuenta digital registrada correctamente', isVisible: true });
    }
  };

  // Botón tipo radio para seleccionar formulario activo
  const activeType = showBankForm ? 'bank' : showDigitalForm ? 'digital' : null;
  const handleSelectType = (type) => {
    setShowBankForm(type === 'bank');
    setShowDigitalForm(type === 'digital');
  };

  // Handler para abrir modal de edición
  function handleEditAccount(acc) {
    setEditAccount(acc);
    setEditError('');
    setEditModalOpen(true);
  }

  // Guardar cambios de alias/customName
  async function handleSaveEditAccount({ alias, customName }) {
    setEditLoading(true);
    setEditError('');
    try {
      await editAccountAliasAndName(editAccount.id, { alias, customName });
      setEditModalOpen(false);
      setEditAccount(null);
      setToast({ type: 'success', message: 'Datos actualizados correctamente', isVisible: true });
      refetch();
    } catch (err) {
      let errorMsg = err?.message || 'Error al actualizar datos';
      if (errorMsg.toLowerCase().includes('invalid alias format')) {
        errorMsg = 'El alias debe tener entre 6 y 20 caracteres (letras, números, guiones y puntos).';
      } else if (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('alias already exists')) {
        errorMsg = 'El alias ingresado pertenece a otra cuenta registrada.';
      }
      setEditError(errorMsg);
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-conexia-green mb-6">Datos de cobro</h2>
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm mb-8">
        <div className="p-6">
          <h2 className="text-lg font-bold text-conexia-green mb-4">Cuentas bancarias</h2>
          <Button
            variant={showBankForm ? 'primary' : 'neutral'}
            onClick={() => handleSelectType('bank')}
            className="mb-4"
          >
            + Agregar cuenta bancaria
          </Button>
          {showBankForm && (
            <AddBankAccountForm
              onSubmit={handleAddBank}
              onCancel={() => handleSelectType(null)}
              existingAccounts={bankAccounts}
            />
          )}
          <div className="mt-4">
            {isLoading ? (
              <div className="text-gray-500">Cargando cuentas bancarias...</div>
            ) : error ? (
              <div className="text-red-600">Error al cargar cuentas</div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-gray-500">No hay cuentas bancarias registradas.</div>
            ) : (
              <ul className="space-y-2">
                {bankAccounts.map((acc) => (
                  <li key={acc.id} className="border rounded p-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      {acc.customName && (
                        <span className="text-lg font-bold mb-1" style={{ color: '#2b6a6a' }}>{acc.customName}</span>
                      )}
                      <span className="font-semibold">{acc.bankName} - {acc.bankAccountType === 'savings' ? 'Caja de ahorro' : 'Cuenta corriente'}</span>
                      <span className="text-gray-700">{acc.accountHolderName}</span>
                      <span className="text-gray-500">CBU: ****{acc.cbuLast4 || (acc.cbu ? acc.cbu.slice(-4) : '')}</span>
                      {acc.alias && <span className="text-gray-500">Alias: {acc.alias}</span>}
                    </div>
                    <div className="flex gap-2 items-center">
                      {/* Botón editar alias/customName */}
                      <button
                        className="group p-2 rounded hover:bg-blue-100 focus:outline-none relative"
                        onClick={() => handleEditAccount(acc)}
                        aria-label="Editar"
                      >
                        <span className="sr-only">Editar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213l-4.5 1.5 1.5-4.5 12.362-12.726z" />
                        </svg>
                        <span className="absolute z-10 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -top-8 left-1/2 -translate-x-1/2">Editar</span>
                      </button>
                      <Button
                        variant="delete"
                        type="button"
                        onClick={() => handleRequestDelete(acc)}
                        className="p-2 rounded-md bg-transparent hover:bg-red-500/20 active:bg-red-500/30 transition-colors flex items-center justify-center group focus:outline-none"
                        aria-label="Eliminar"
                      >
                        <span className="sr-only">Eliminar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v1.5M3.75 7.5h16.5M9.75 11.25v6m4.5-6v6M5.25 7.5v12a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-12" />
                        </svg>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-bold text-conexia-green mb-4">Cuentas digitales</h2>
          <Button
            variant={showDigitalForm ? 'primary' : 'neutral'}
            onClick={() => handleSelectType('digital')}
            className="mb-4"
          >
            + Agregar cuenta digital
          </Button>
          {showDigitalForm && (
            <AddDigitalAccountForm
              onSubmit={handleAddDigital}
              onCancel={() => handleSelectType(null)}
              existingAccounts={digitalAccounts}
            />
          )}
          <div className="mt-4">
            {isLoading ? (
              <div className="text-gray-500">Cargando cuentas digitales...</div>
            ) : error ? (
              <div className="text-red-600">Error al cargar cuentas</div>
            ) : digitalAccounts.length === 0 ? (
              <div className="text-gray-500">No hay cuentas digitales registradas.</div>
            ) : (
              <ul className="space-y-2">
                {digitalAccounts.map((acc) => (
                  <li key={acc.id} className="border rounded p-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      {acc.customName && (
                        <span className="text-lg font-bold mb-1" style={{ color: '#2b6a6a' }}>{acc.customName}</span>
                      )}
                      <span className="font-semibold">{acc.digitalPlatformName}</span>
                      <span className="text-gray-700">{acc.accountHolderName}</span>
                      <span className="text-gray-500">CVU: ****{acc.cvuLast4 || acc.cbuLast4 || (acc.cvu ? acc.cvu.slice(-4) : acc.cbu ? acc.cbu.slice(-4) : '')}</span>
                      {acc.alias && <span className="text-gray-500">Alias: {acc.alias}</span>}
                    </div>
                    <div className="flex gap-2 items-center">
                      {/* Botón editar alias/customName */}
                      <button
                        className="group p-2 rounded hover:bg-blue-100 focus:outline-none relative"
                        onClick={() => handleEditAccount(acc)}
                        aria-label="Editar"
                      >
                        <span className="sr-only">Editar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213l-4.5 1.5 1.5-4.5 12.362-12.726z" />
                        </svg>
                        <span className="absolute z-10 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -top-8 left-1/2 -translate-x-1/2">Editar</span>
                      </button>
                      {/* Botón eliminar */}
                      <Button
                        variant="delete"
                        type="button"
                        onClick={() => handleRequestDelete(acc)}
                        className="p-2 rounded-md bg-transparent hover:bg-red-500/20 active:bg-red-500/30 transition-colors flex items-center justify-center group focus:outline-none"
                        aria-label="Eliminar"
                      >
                        <span className="sr-only">Eliminar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v1.5M3.75 7.5h16.5M9.75 11.25v6m4.5-6v6M5.25 7.5v12a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-12" />
                        </svg>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {/* Modal de confirmación de eliminación (solo una vez, fuera de los map) */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteAccount(null); }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
      {/* Toast para notificaciones */}
      {toast?.isVisible && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="top-center"
          // z-index alto para que quede por delante del modal
          style={{ zIndex: 9999 }}
        />
      )}
      {/* Modal edición alias/customName */}
      <EditAccountModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditAccount(null); setEditError(''); }}
        account={editAccount}
        onSave={handleSaveEditAccount}
        loading={editLoading}
        error={editError}
      />
    </section>
  );
}
