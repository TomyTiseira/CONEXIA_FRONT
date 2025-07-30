import { useEffect, useState } from 'react';
import { getAllSkills } from '@/service/skill/skillFetch';

export default function useSkillsSearch(query) {
  const [allSkills, setAllSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);

  useEffect(() => {
    getAllSkills().then(setAllSkills).catch(() => {});
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setFilteredSkills([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allSkills.filter((skill) =>
      skill.name.toLowerCase().includes(lowerQuery)
    );
    setFilteredSkills(filtered);
  }, [query, allSkills]);

  return { filteredSkills, allSkills };
}
