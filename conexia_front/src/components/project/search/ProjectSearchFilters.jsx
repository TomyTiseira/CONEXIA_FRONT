import { useEffect, useState, useRef } from 'react';
import { fetchCategories, fetchCollabTypes, fetchContractTypes } from '@/service/projects/filtersFetch';
import { getRubros, getSkillsByRubro } from '@/service/projects/rubrosFetch';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProjectSearchFilters({ filters, onChange }) {
  const [categories, setCategories] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [skillsByRubro, setSkillsByRubro] = useState({});
  const [collabTypes, setCollabTypes] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  // By default, all collapsed (mobile). We'll expand on desktop in useEffect.
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    skills: false,
    contract: false,
    collaboration: false,
  });
  // Detect screen size on mount and set expanded/collapsed accordingly
  useEffect(() => {
    // Function to check if desktop (md: 768px+)
    const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;
    if (isDesktop()) {
      setExpandedSections({
        category: true,
        skills: true,
        contract: true,
        collaboration: true,
      });
    } else {
      setExpandedSections({
        category: false,
        skills: false,
        contract: false,
        collaboration: false,
      });
    }
    // Listen for resize to update expanded state if user resizes window
    const handleResize = () => {
      if (isDesktop()) {
        setExpandedSections(prev => ({
          category: true,
          skills: true,
          contract: true,
          collaboration: true,
        }));
      } else {
        setExpandedSections(prev => ({
          category: false,
          skills: false,
          contract: false,
          collaboration: false,
        }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Estado para saber si el usuario interactuó con los filtros
  const [touched, setTouched] = useState({
    category: false,
    contract: false,
    collaboration: false,
  });

  // Ref for 'Todas' skills checkbox
  const allSkillsRef = useRef(null);

  useEffect(() => {
    async function loadFilters() {
      setLoading(true);
      try {
        const [cat, col, cont, rubrosList] = await Promise.all([
          fetchCategories(),
          fetchCollabTypes(),
          fetchContractTypes(),
          getRubros(),
        ]);
        setCategories(Array.isArray(cat) ? cat : (Array.isArray(cat?.data) ? cat.data : []));
        setCollabTypes(Array.isArray(col) ? col : (Array.isArray(col?.data) ? col.data : []));
        setContractTypes(Array.isArray(cont) ? cont : (Array.isArray(cont?.data) ? cont.data : []));
        setRubros(rubrosList);
        // Cargar habilidades de todos los rubros
        const skillsPromises = rubrosList.map(rubro => getSkillsByRubro(rubro.id));
        const allSkills = await Promise.all(skillsPromises);
        const skillsMap = {};
        rubrosList.forEach((rubro, idx) => {
          skillsMap[rubro.id] = allSkills[idx];
        });
        setSkillsByRubro(skillsMap);
      } catch (e) {
        setCategories([]);
        setCollabTypes([]);
        setContractTypes([]);
        setRubros([]);
        setSkillsByRubro({});
      }
      setLoading(false);
    }
    loadFilters();
  }, []);

  // Handlers
  // Helper for 'Todas' logic
  const isAllSelected = (items, selected) => {
    const itemIds = items.map(i => i.id);
    return (
      Array.isArray(selected) &&
      selected.length === itemIds.length &&
      itemIds.every(id => selected.includes(id))
    );
  };

  const handleCategory = (catId) => {
    let current = Array.isArray(filters.category) ? [...filters.category] : [];
    const allIds = categories.map(c => c.id);
    if (catId === 'all') {
      if (isAllSelected(categories, filters.category)) {
        // Si ya están todos seleccionados, desmarcar todo
        onChange({ ...filters, category: [] });
      } else {
        // Seleccionar todos
        onChange({ ...filters, category: [...allIds] });
      }
      return;
    }
    if (isAllSelected(categories, filters.category)) {
      // Si estaba en 'Todas', seleccionar solo la nueva
      onChange({ ...filters, category: [catId] });
      return;
    }
    if (current.includes(catId)) {
      current = current.filter((id) => id !== catId);
    } else {
      current.push(catId);
    }
    onChange({ ...filters, category: current });
  };

  const handleContract = (typeId) => {
    let current = Array.isArray(filters.contract) ? [...filters.contract] : [];
    const allIds = contractTypes.map(c => c.id);
    if (typeId === 'all') {
      if (isAllSelected(contractTypes, filters.contract)) {
        onChange({ ...filters, contract: [] });
      } else {
        onChange({ ...filters, contract: [...allIds] });
      }
      return;
    }
    if (isAllSelected(contractTypes, filters.contract)) {
      onChange({ ...filters, contract: [typeId] });
      return;
    }
    if (current.includes(typeId)) {
      current = current.filter((id) => id !== typeId);
    } else {
      current.push(typeId);
    }
    onChange({ ...filters, contract: current });
  };

  const handleCollab = (typeId) => {
    let current = Array.isArray(filters.collaboration) ? [...filters.collaboration] : [];
    const allIds = collabTypes.map(c => c.id);
    if (typeId === 'all') {
      if (isAllSelected(collabTypes, filters.collaboration)) {
        onChange({ ...filters, collaboration: [] });
      } else {
        onChange({ ...filters, collaboration: [...allIds] });
      }
      return;
    }
    if (isAllSelected(collabTypes, filters.collaboration)) {
      onChange({ ...filters, collaboration: [typeId] });
      return;
    }
    if (current.includes(typeId)) {
      current = current.filter((id) => id !== typeId);
    } else {
      current.push(typeId);
    }
    onChange({ ...filters, collaboration: current });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando filtros..." fullScreen={false} />;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[200px] min-w-[180px]">
      {/* Categoría */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-conexia-green">Categoría del proyecto</div>
          <button
            onClick={() => setExpandedSections(prev => ({ ...prev, category: !prev.category }))}
            className="text-conexia-green hover:text-conexia-green/80 transition-colors p-1"
            aria-label={expandedSections.category ? 'Ocultar categorías' : 'Mostrar categorías'}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.category ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {expandedSections.category && (
          <div className="flex flex-col gap-1 ml-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={isAllSelected(categories, filters.category)}
                onChange={() => {
                  setTouched(t => ({ ...t, category: true }));
                  handleCategory('all');
                }}
                className="accent-conexia-green"
              />
              <span className="font-medium">Todas</span>
            </label>
            {categories.map((cat) => {
              // Si está en modo 'Todas', los individuales no se marcan visualmente
              const checked = isAllSelected(categories, filters.category) ? false : (Array.isArray(filters.category) && filters.category.includes(cat.id));
              return (
                <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCategory(cat.id)}
                    className="accent-conexia-green"
                  />
                  {cat.name}
                </label>
              );
            })}
          </div>
        )}
      </div>
      {/* Habilidades agrupadas por rubro en acordeón */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-conexia-green">Habilidades requeridas</div>
          <button
            onClick={() => setExpandedSections(prev => ({ ...prev, skills: !prev.skills }))}
            className="text-conexia-green hover:text-conexia-green/80 transition-colors p-1"
            aria-label={expandedSections.skills ? 'Ocultar habilidades' : 'Mostrar habilidades'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${expandedSections.skills ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {expandedSections.skills && (
          <div className="flex flex-col gap-1 ml-1">
            {/* Checkbox Todas general */}
            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
              <input
                type="checkbox"
                ref={allSkillsRef}
                checked={(() => {
                  // General 'Todas' está activo si todas las skills de todos los rubros están seleccionadas
                  const allSkillIds = rubros.flatMap(rubro => (skillsByRubro[rubro.id] || []).map(skill => skill.id));
                  return Array.isArray(filters.skills) && allSkillIds.length > 0 && allSkillIds.every(id => filters.skills.includes(id));
                })()}
                onChange={() => {
                  const allSkillIds = rubros.flatMap(rubro => (skillsByRubro[rubro.id] || []).map(skill => skill.id));
                  const allSelected = Array.isArray(filters.skills) && allSkillIds.length > 0 && allSkillIds.every(id => filters.skills.includes(id));
                  if (allSelected) {
                    onChange({ ...filters, skills: [] });
                  } else {
                    onChange({ ...filters, skills: [...allSkillIds] });
                  }
                }}
                className="accent-conexia-green"
              />
              <span className="font-medium">Todas</span>
            </label>
            {rubros.map((rubro) => {
              const rubroSkills = skillsByRubro[rubro.id] || [];
              const rubroSkillIds = rubroSkills.map(skill => skill.id);
              // El check 'Todas' de rubro está activo si todas las skills de ese rubro están seleccionadas
              const allSkillIds = rubros.flatMap(r => (skillsByRubro[r.id] || []).map(skill => skill.id));
              const allGeneralSelected = Array.isArray(filters.skills) && allSkillIds.length > 0 && allSkillIds.every(id => filters.skills.includes(id));
              const onlyThisRubro = Array.isArray(filters.skills) &&
                rubroSkillIds.length > 0 &&
                rubroSkillIds.every(id => filters.skills.includes(id));
              return (
                <div key={rubro.id} className="border-b border-conexia-green/20 pb-1 mb-1">
                  <button
                    type="button"
                    className="flex items-center w-full justify-between py-1 px-2 hover:bg-conexia-green/5 rounded"
                    onClick={() => setExpandedSections(prev => ({ ...prev, [`rubro_${rubro.id}`]: !prev[`rubro_${rubro.id}`] }))}
                    aria-expanded={!!expandedSections[`rubro_${rubro.id}`]}
                  >
                    <span className="font-semibold text-conexia-green text-sm">{rubro.name}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections[`rubro_${rubro.id}`] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {expandedSections[`rubro_${rubro.id}`] && (
                    <div className="flex flex-col gap-1 pl-4 mt-1">
                      {/* Checkbox Todas por rubro */}
                      <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={onlyThisRubro || allGeneralSelected}
                          onChange={() => {
                            let currentSkills = Array.isArray(filters.skills) ? [...filters.skills] : [];
                            if (onlyThisRubro || allGeneralSelected) {
                              // Quitar todas las skills de este rubro
                              currentSkills = currentSkills.filter(id => !rubroSkillIds.includes(id));
                            } else {
                              // Agregar todas las skills de este rubro
                              currentSkills = Array.from(new Set([...currentSkills, ...rubroSkillIds]));
                            }
                            onChange({ ...filters, skills: currentSkills });
                          }}
                          className="accent-conexia-green"
                        />
                        <span className="font-medium">Todas</span>
                      </label>
                      {rubroSkills.map(skill => {
                        // Si está en modo 'Todas' de este rubro o general, los individuales no se marcan visualmente
                        const checked = (onlyThisRubro || allGeneralSelected) ? false : (Array.isArray(filters.skills) && filters.skills.includes(skill.id));
                        return (
                          <label key={skill.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                let currentSkills = Array.isArray(filters.skills) ? [...filters.skills] : [];
                                // Si estaba en 'Todas' general o de rubro, seleccionar solo la nueva
                                if (onlyThisRubro || allGeneralSelected) {
                                  onChange({ ...filters, skills: [skill.id] });
                                  return;
                                }
                                const exists = currentSkills.includes(skill.id);
                                if (exists) {
                                  currentSkills = currentSkills.filter(id => id !== skill.id);
                                } else {
                                  currentSkills.push(skill.id);
                                }
                                onChange({ ...filters, skills: currentSkills });
                              }}
                              className="accent-conexia-green"
                            />
                            {skill.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
  {/* Tipo de contrato */}
  <div>
    <div className="flex items-center justify-between mb-2">
      <div className="font-semibold text-conexia-green">Tipo de contrato</div>
      <button
        onClick={() => setExpandedSections(prev => ({ ...prev, contract: !prev.contract }))}
        className="text-conexia-green hover:text-conexia-green/80 transition-colors p-1"
        aria-label={expandedSections.contract ? 'Ocultar tipos de contrato' : 'Mostrar tipos de contrato'}
      >
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${expandedSections.contract ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    {expandedSections.contract && (
      <div className="flex flex-col gap-1 ml-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={isAllSelected(contractTypes, filters.contract)}
            onChange={() => {
              setTouched(t => ({ ...t, contract: true }));
              handleContract('all');
            }}
            className="accent-conexia-green"
          />
          <span className="font-medium">Todos</span>
        </label>
        {contractTypes.map((type) => {
          const checked = isAllSelected(contractTypes, filters.contract) ? false : (Array.isArray(filters.contract) && filters.contract.includes(type.id));
          return (
            <label key={type.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleContract(type.id)}
                className="accent-conexia-green"
              />
              {type.name}
            </label>
          );
        })}
      </div>
    )}
  </div>

  {/* Tipo de colaboración */}
  <div>
    <div className="flex items-center justify-between mb-2">
      <div className="font-semibold text-conexia-green">Tipo de colaboración</div>
      <button
        onClick={() => setExpandedSections(prev => ({ ...prev, collaboration: !prev.collaboration }))}
        className="text-conexia-green hover:text-conexia-green/80 transition-colors p-1"
        aria-label={expandedSections.collaboration ? 'Ocultar tipos de colaboración' : 'Mostrar tipos de colaboración'}
      >
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${expandedSections.collaboration ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    {expandedSections.collaboration && (
      <div className="flex flex-col gap-1 ml-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={isAllSelected(collabTypes, filters.collaboration)}
            onChange={() => {
              setTouched(t => ({ ...t, collaboration: true }));
              handleCollab('all');
            }}
            className="accent-conexia-green"
          />
          <span className="font-medium">Todas</span>
        </label>
        {collabTypes.map((type) => {
          const checked = isAllSelected(collabTypes, filters.collaboration) ? false : (Array.isArray(filters.collaboration) && filters.collaboration.includes(type.id));
          return (
            <label key={type.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleCollab(type.id)}
                className="accent-conexia-green"
              />
              {type.name}
            </label>
          );
        })}
      </div>
    )}
  </div>

  </div>
  );
}
