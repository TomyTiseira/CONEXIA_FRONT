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
      try {
        const [cat, skl, col, cont] = await Promise.all([
          fetchCategories(),
          fetchSkills(),
          fetchCollabTypes(),
          fetchContractTypes(),
        ]);
        setCategories(Array.isArray(cat) ? cat : (Array.isArray(cat?.data) ? cat.data : []));
        setSkills(Array.isArray(skl) ? skl : (Array.isArray(skl?.data) ? skl.data : []));
        setCollabTypes(Array.isArray(col) ? col : (Array.isArray(col?.data) ? col.data : []));
        setContractTypes(Array.isArray(cont) ? cont : (Array.isArray(cont?.data) ? cont.data : []));
      } catch (e) {
        setCategories([]);
        setSkills([]);
        setCollabTypes([]);
        setContractTypes([]);
      }
      setLoading(false);
    }
    loadFilters();
    // Radio para tipo de contrato
    // (mover handleContract fuera del useEffect)
  }, []);

  // Checkbox múltiple para tipo de contrato
  const handleContract = (typeId) => {
    let newContracts = Array.isArray(filters.contract) ? [...filters.contract] : [];
    if (newContracts.includes(typeId)) {
      newContracts = newContracts.filter((id) => id !== typeId);
    } else {
      newContracts.push(typeId);
    }
    onChange({ ...filters, contract: newContracts });
  };

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
  // Checkbox múltiple para tipo de colaboración
  const handleCollab = (typeId) => {
    let newCollabs = Array.isArray(filters.collaboration) ? [...filters.collaboration] : [];
    if (newCollabs.includes(typeId)) {
      newCollabs = newCollabs.filter((id) => id !== typeId);
    } else {
      newCollabs.push(typeId);
    }
    onChange({ ...filters, collaboration: newCollabs });
  };

  if (loading) {
    return <div className="text-conexia-green text-center py-8">Cargando filtros...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[200px] min-w-[180px]">
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
          {/* Opción Todas */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!Array.isArray(filters.skills) || filters.skills.length === 0}
              onChange={() => onChange({ ...filters, skills: [] })}
              className="accent-conexia-green"
            />
            Todas
          </label>
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
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!Array.isArray(filters.contract) || filters.contract.length === 0}
              onChange={() => onChange({ ...filters, contract: [] })}
              className="accent-conexia-green"
            />
            Todos
          </label>
          {contractTypes.map((type) => (
            <label key={type.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Array.isArray(filters.contract) && filters.contract.includes(type.id)}
                onChange={() => handleContract(type.id)}
                className="accent-conexia-green"
              />
              {type.name}
            </label>
          ))}
        </div>
      </div>
      {/* Tipo de colaboración */}
      <div>
        <div className="font-semibold text-conexia-green mb-2">Tipo de colaboración</div>
        <div className="flex flex-col gap-1 ml-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!Array.isArray(filters.collaboration) || filters.collaboration.length === 0}
              onChange={() => onChange({ ...filters, collaboration: [] })}
              className="accent-conexia-green"
            />
            Todas
          </label>
          {collabTypes.map((type) => (
            <label key={type.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Array.isArray(filters.collaboration) && filters.collaboration.includes(type.id)}
                onChange={() => handleCollab(type.id)}
                className="accent-conexia-green"
              />
              {type.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
