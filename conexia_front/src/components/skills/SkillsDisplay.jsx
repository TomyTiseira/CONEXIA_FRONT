// components/skills/SkillsDisplay.jsx
const SkillsDisplay = ({ skills = [], className = '' }) => {
  if (!skills || skills.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No hay habilidades registradas
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <div
            key={skill.id}
            className="inline-flex items-center px-3 py-1 bg-conexia-green text-white rounded-full text-sm"
          >
            {skill.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsDisplay;
