// components/skills/RubroSkillsSelector.jsx
import { useState, useEffect } from 'react';
import { getRubros, getSkillsByRubro } from '@/service/projects/rubrosFetch';

export default function RubroSkillsSelector({ selectedSkills = [], onSkillsChange, maxSkills = 20, className = '' }) {
  const [rubros, setRubros] = useState([]);
  const [selectedRubro, setSelectedRubro] = useState('');
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingRubros, setLoadingRubros] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingRubros(true);
    getRubros()
      .then(setRubros)
      .catch(err => setError(err.message))
      .finally(() => setLoadingRubros(false));
  }, []);

  useEffect(() => {
    if (!selectedRubro) {
      setSkills([]);
      return;
    }
    setLoadingSkills(true);
    getSkillsByRubro(selectedRubro)
      .then(setSkills)
      .catch(err => setError(err.message))
      .finally(() => setLoadingSkills(false));
  }, [selectedRubro]);

  const handleRubroChange = e => {
    setSelectedRubro(e.target.value);
    onSkillsChange([]); // Limpiar habilidades al cambiar rubro
  };

  const handleSkillToggle = skill => {
    let newSkills;
    if (selectedSkills.some(s => s.id === skill.id)) {
      newSkills = selectedSkills.filter(s => s.id !== skill.id);
    } else {
      if (selectedSkills.length >= maxSkills) return;
      newSkills = [...selectedSkills, skill];
    }
    onSkillsChange(newSkills);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Combo Rubro */}
      <div>
        <label className="block font-medium text-conexia-green mb-1">Rubro</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-conexia-green focus:border-transparent disabled:bg-gray-100"
          value={selectedRubro}
          onChange={handleRubroChange}
          disabled={loadingRubros}
        >
          <option value="" style={{ fontWeight: 600 }}>Selecciona un rubro...</option>
          {rubros.map(rubro => (
            <option key={rubro.id} value={rubro.id}>{rubro.name}</option>
          ))}
        </select>
      </div>
      {/* Buscador y selección de habilidades */}
      <div>
        <label className="block font-medium text-conexia-green mb-1">Habilidades</label>
        <input
          type="text"
          placeholder="Buscar habilidad..."
          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-conexia-green"
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={!selectedRubro || loadingSkills}
        />
        <div className="relative max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white">
          {loadingSkills ? (
            <div className="p-2 text-gray-400 text-sm">Cargando...</div>
          ) : (
            skills
              .filter(skill => skill.name.toLowerCase().includes(search.toLowerCase()))
              .map(skill => (
                <label key={skill.id} className="flex items-center px-3 py-1 cursor-pointer hover:bg-conexia-green/10">
                  <input
                    type="checkbox"
                    className="accent-conexia-green mr-2"
                    checked={selectedSkills.some(s => s.id === skill.id)}
                    onChange={() => handleSkillToggle(skill)}
                    disabled={selectedSkills.length >= maxSkills && !selectedSkills.some(s => s.id === skill.id)}
                  />
                  <span>{skill.name}</span>
                </label>
              ))
          )}
        </div>
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSkills.map(skill => (
              <span key={skill.id} className="inline-flex items-center px-3 py-1 bg-conexia-green text-white text-sm rounded-full">
                {skill.name}
                <button type="button" className="ml-2 text-white hover:text-gray-200 focus:outline-none" onClick={() => handleSkillToggle(skill)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
          </div>
        )}
        {selectedSkills.length >= maxSkills && (
          <div className="text-amber-600 text-xs mt-1">Has alcanzado el límite máximo de {maxSkills} habilidades.</div>
        )}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  );
}
