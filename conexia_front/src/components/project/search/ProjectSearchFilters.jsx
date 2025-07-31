// Filtros: categoría, habilidades, tipo de colaboración

const CATEGORIES = [
  "Tecnología e Innovación",
  "Diseño y Creatividad",
  "Marketing y Contenidos",
  "Impacto Social",
  "Educación",
  "Todas"
];
const SKILLS = [
  "React",
  "Node.js",
  "Python",
  "Comunicación",
  "Creatividad"
];
const COLLAB_TYPES = ["Remunerada", "Voluntaria"];


export default function ProjectSearchFilters({ filters, onChange }) {
  // Checkbox para categorías (solo una seleccionada a la vez, pero visual tipo checkbox)
  const handleCategory = (cat) => {
    onChange({ ...filters, category: filters.category === cat ? '' : cat });
  };
  // Checkbox múltiple para skills
  const handleSkill = (skill) => {
    const exists = filters.skills.includes(skill);
    onChange({
      ...filters,
      skills: exists ? filters.skills.filter((s) => s !== skill) : [...filters.skills, skill],
    });
  };
  // Radio para tipo de colaboración
  const handleCollab = (type) => {
    onChange({ ...filters, collaboration: filters.collaboration === type ? '' : type });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Categoría */}
      <div>
        <div className="font-semibold text-conexia-green mb-2">Categoría del proyecto</div>
        <div className="flex flex-col gap-1 ml-1">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category === cat || (cat === 'Todas' && !filters.category)}
                onChange={() => handleCategory(cat === 'Todas' ? '' : cat)}
                className="accent-conexia-green"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>
      {/* Habilidades */}
      <div>
        <div className="font-semibold text-conexia-green mb-2">Habilidades requeridas</div>
        <div className="flex flex-col gap-1 ml-1">
          {SKILLS.map((skill) => (
            <label key={skill} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.skills.includes(skill)}
                onChange={() => handleSkill(skill)}
                className="accent-conexia-green"
              />
              {skill}
            </label>
          ))}
        </div>
      </div>
      {/* Tipo de colaboración */}
      <div>
        <div className="font-semibold text-conexia-green mb-2">Tipo de colaboración</div>
        <div className="flex flex-col gap-1 ml-1">
          {COLLAB_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="collabType"
                checked={filters.collaboration === type}
                onChange={() => handleCollab(type)}
                className="accent-conexia-green"
              />
              {type}
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
