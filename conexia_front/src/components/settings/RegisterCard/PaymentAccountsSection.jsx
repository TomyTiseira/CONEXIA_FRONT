

'use client';
import React, { useState } from 'react';
import { useRoleValidation } from '@/hooks/useRoleValidation';
import Toast from '@/components/ui/Toast';
import AddBankAccountForm from './AddBankAccountForm';
import AddDigitalAccountForm from './AddDigitalAccountForm';
import Button from '@/components/ui/Button';
import { useFetch } from '@/hooks/useFetch';
import { fetchPaymentAccounts, deleteBankAccount, fetchBankAccountById } from '@/service/payment/paymentFetch';

export default function PaymentAccountsSection() {
  const { isInitialLoading, hasAnyRole } = useRoleValidation();
  const [toast, setToast] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showDigitalForm, setShowDigitalForm] = useState(false);
  const { data: accounts, isLoading, error, refetch } = useFetch(fetchPaymentAccounts);
  if (isInitialLoading) return null;
  if (!hasAnyRole(['user'])) return null;
  // Eliminar cuenta bancaria
  const handleDeleteBank = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cuenta bancaria?')) return;
    try {
      const res = await deleteBankAccount(id);
      refetch();
      setToast({
        type: 'success',
        message: res?.message || 'Cuenta eliminada correctamente',
        isVisible: true
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err?.message || 'Error al eliminar la cuenta',
        isVisible: true
      });
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
    if (msg) {
      setToast({ type: 'success', message: msg, isVisible: true });
    }
  };

  // Botón tipo radio para seleccionar formulario activo
  const activeType = showBankForm ? 'bank' : showDigitalForm ? 'digital' : null;
  const handleSelectType = (type) => {
    setShowBankForm(type === 'bank');
    setShowDigitalForm(type === 'digital');
  };

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
                      <span className="font-semibold">{acc.bankName} - {acc.bankAccountType === 'savings' ? 'Caja de ahorro' : 'Cuenta corriente'}</span>
                      <span className="text-gray-700">{acc.accountHolderName}</span>
                      <span className="text-gray-500">CBU: ****{acc.cbuLast4 || (acc.cbu ? acc.cbu.slice(-4) : '')}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        className="group p-2 rounded hover:bg-red-100 focus:outline-none relative"
                        onClick={() => handleDeleteBank(acc.id)}
                        aria-label="Eliminar"
                      >
                        <span className="sr-only">Eliminar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v1.5M3.75 7.5h16.5M9.75 11.25v6m4.5-6v6M5.25 7.5v12a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-12" />
                        </svg>
                        <span className="absolute z-10 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -top-8 left-1/2 -translate-x-1/2">Eliminar</span>
                      </button>
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
                      <span className="font-semibold">{acc.digitalPlatformName}</span>
                      <span className="text-gray-700">{acc.accountHolderName}</span>
                      <span className="text-gray-500">CVU: ****{acc.cvuLast4 || acc.cbuLast4 || (acc.cvu ? acc.cvu.slice(-4) : acc.cbu ? acc.cbu.slice(-4) : '')}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      {/* Botón ver detalle con tooltip */}
                      {/* Botón ver detalle eliminado */}
                      {/* Botón eliminar con tooltip */}
                      <button
                        className="group p-2 rounded hover:bg-red-100 focus:outline-none relative"
                        onClick={() => handleDeleteBank(acc.id)}
                        aria-label="Eliminar"
                      >
                        <span className="sr-only">Eliminar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v1.5M3.75 7.5h16.5M9.75 11.25v6m4.5-6v6M5.25 7.5v12a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-12" />
                        </svg>
                        <span className="absolute z-10 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -top-8 left-1/2 -translate-x-1/2">Eliminar</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {/* Modal de detalle eliminado */}
      {/* Toast para notificaciones */}
      {toast?.isVisible && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="top-center"
        />
      )}
    </section>
  );
}
