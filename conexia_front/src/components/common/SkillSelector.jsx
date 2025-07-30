'use client';

import { useEffect, useState } from 'react';
import useSkillsSearch from '@/hooks/common/useSkillsSearch';

export default function SkillSelector({ selectedSkills, setSelectedSkills }) {
  const [query, setQuery] = useState('');
  const { filteredSkills, allSkills } = useSkillsSearch(query);

  const addSkill = (skill) => {
    if (!selectedSkills.find((s) => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
      setQuery('');
    }
  };

  const removeSkill = (id) => {
    setSelectedSkills(selectedSkills.filter((s) => s.id !== id));
  };

  return (
    <div>
      <label className="text-sm font-medium text-conexia-green block mb-1">Habilidades requeridas</label>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar habilidades..."
        className="w-full px-4 py-2 border rounded shadow-sm mb-2"
      />

      {query.length > 1 && (
        <ul className="bg-white border rounded shadow max-h-48 overflow-y-auto">
          {filteredSkills.map((skill) => (
            <li
              key={skill.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => addSkill(skill)}
            >
              {skill.name}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedSkills.map((skill) => (
          <span
            key={skill.id}
            className="bg-conexia-green text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {skill.name}
            <button onClick={() => removeSkill(skill.id)} className="text-white hover:text-red-200">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
