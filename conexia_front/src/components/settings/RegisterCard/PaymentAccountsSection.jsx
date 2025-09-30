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
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeType === 'bank' ? 'primary' : 'neutral'}
            onClick={() => handleSelectType('bank')}
          >
            + Agregar cuenta bancaria
          </Button>
          <Button
            variant={activeType === 'digital' ? 'primary' : 'neutral'}
            onClick={() => handleSelectType('digital')}
          >
            + Agregar cuenta digital
          </Button>
        </div>
        {showBankForm && (
          <AddBankAccountForm
            onSubmit={handleAddBank}
            onCancel={() => handleSelectType(null)}
            existingAccounts={bankAccounts}
          />
        )}
        {showDigitalForm && (
          <AddDigitalAccountForm
            onSubmit={handleAddDigital}
            onCancel={() => handleSelectType(null)}
            existingAccounts={digitalAccounts}
          />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Cuentas bancarias registradas</h2>
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
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Cuentas digitales registradas</h2>
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
    </section>
  );
}
