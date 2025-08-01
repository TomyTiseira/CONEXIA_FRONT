// Filtros: categoría, habilidades, tipo de colaboración


import { useEffect, useState } from 'react';
import { fetchCategories, fetchSkills, fetchCollabTypes, fetchContractTypes } from '@/service/projects/filtersFetch';



export default function ProjectSearchFilters({ filters, onChange }) {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [collabTypes, setCollabTypes] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFilters() {
      setLoading(true);
      const [cat, skl, col, cont] = await Promise.all([
        fetchCategories(),
        fetchSkills(),
        fetchCollabTypes(),
        fetchContractTypes(),
      ]);
      setCategories(cat);
      setSkills(skl);
      setCollabTypes(col);
      setContractTypes(cont);
      setLoading(false);
    }
    loadFilters();
  // Radio para tipo de contrato
  const handleContract = (typeId) => {
    onChange({ ...filters, contract: filters.contract === typeId ? '' : typeId });
  };
  }, []);

  // Checkbox para categorías (solo una seleccionada a la vez, pero visual tipo checkbox)
  const handleCategory = (catId) => {
    onChange({ ...filters, category: filters.category === catId ? '' : catId });
  };
  // Checkbox múltiple para skills
  const handleSkill = (skillId) => {
    const exists = filters.skills.includes(skillId);
    onChange({
      ...filters,
      skills: exists ? filters.skills.filter((s) => s !== skillId) : [...filters.skills, skillId],
    });
  };
  // Radio para tipo de colaboración
  const handleCollab = (typeId) => {
    onChange({ ...filters, collaboration: filters.collaboration === typeId ? '' : typeId });
  };

  if (loading) {
    return <div className="text-conexia-green text-center py-8">Cargando filtros...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Categoría */}
      <div>
        <div className="font-semibold text-conexia-green mb-2">Categoría del proyecto</div>
        <div className="flex flex-col gap-1 ml-1">
          {/* Opción Todas */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!filters.category}
              onChange={() => handleCategory('')}
              className="accent-conexia-green"
            />
            Todas
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category === cat.id}
                onChange={() => handleCategory(cat.id)}
                className="accent-conexia-green"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>
      {/* Habilidades */}
      <div>
        <div className="font-semibold text-conexia-green mb-2">Habilidades requeridas</div>
        <div className="flex flex-col gap-1 ml-1">
          {skills.map((skill) => (
            <label key={skill.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.skills.includes(skill.id)}
                onChange={() => handleSkill(skill.id)}
                className="accent-conexia-green"
              />
              {skill.name}
            </label>
          ))}
        </div>
      </div>
      {/* Tipo de contrato */}
      <div>
        <div className="font-semibold text-conexia-green mb-2">Tipo de contrato</div>
        <div className="flex flex-col gap-1 ml-1">
          {contractTypes.map((type) => (
            <label key={type.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="contractType"
                checked={filters.contract === type.id}
                onChange={() => handleContract(type.id)}
                className="accent-conexia-green"
              />
              {type.name}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="contractType"
              checked={!filters.contract}
              onChange={() => handleContract('')}
              className="accent-conexia-green"
            />
            Todos
          </label>
        </div>
      </div>
      {/* Tipo de colaboración */}
      <div>
        <div className="font-semibold text-conexia-green mb-2">Tipo de colaboración</div>
        <div className="flex flex-col gap-1 ml-1">
          {collabTypes.map((type) => (
            <label key={type.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="collabType"
                checked={filters.collaboration === type.id}
                onChange={() => handleCollab(type.id)}
                className="accent-conexia-green"
              />
              {type.name}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="collabType"
              checked={!filters.collaboration}
              onChange={() => handleCollab('')}
              className="accent-conexia-green"
            />
            Todas
          </label>
        </div>
      </div>
    </div>
  );
}
