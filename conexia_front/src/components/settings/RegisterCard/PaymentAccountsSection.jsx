'use client';

import React, { useState } from 'react';
import AddBankAccountForm from './AddBankAccountForm';
import AddDigitalAccountForm from './AddDigitalAccountForm';
import Button from '@/components/ui/Button';

export default function PaymentAccountsSection() {
  const [showBankForm, setShowBankForm] = useState(false);
  const [showDigitalForm, setShowDigitalForm] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [digitalAccounts, setDigitalAccounts] = useState([]);

  const handleAddBank = (data) => {
    setBankAccounts([...bankAccounts, data]);
    setShowBankForm(false);
  };
  const handleAddDigital = (data) => {
    setDigitalAccounts([...digitalAccounts, data]);
    setShowDigitalForm(false);
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
            {bankAccounts.length === 0 ? (
              <div className="text-gray-500">No hay cuentas bancarias registradas.</div>
            ) : (
              <ul className="space-y-2">
                {bankAccounts.map((acc, i) => (
                  <li key={i} className="border rounded p-3 flex flex-col">
                    <span className="font-semibold">{acc.bank} - {acc.accountType}</span>
                    <span>Alias: {acc.alias || '-'}</span>
                    <span>CBU: {acc.cbu || '-'}</span>
                    <span>Titular: {acc.holder}</span>
                    <span>CUIT/CUIL: {acc.cuit}</span>
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
            {digitalAccounts.length === 0 ? (
              <div className="text-gray-500">No hay cuentas digitales registradas.</div>
            ) : (
              <ul className="space-y-2">
                {digitalAccounts.map((acc, i) => (
                  <li key={i} className="border rounded p-3 flex flex-col">
                    <span className="font-semibold">{acc.platform}</span>
                    <span>Alias: {acc.alias || '-'}</span>
                    <span>CVU: {acc.cvu || '-'}</span>
                    <span>Titular: {acc.holder}</span>
                    <span>CUIT/CUIL: {acc.cuit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
