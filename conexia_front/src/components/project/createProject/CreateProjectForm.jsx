'use client';

import { useState } from 'react';
import useLocationAutocomplete from '@/hooks/common/useLocationAutocomplete';
import useSkillsSearch from '@/hooks/common/useSkillsSearch';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import DateRangePicker from '@/components/form/DateRangePicker';
import SkillSelector from '@/components/common/SkillSelector';
import Button from '@/components/ui/Button';

export default function CreateProjectForm() {
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    contractType: '',
    collaborationType: '',
    maxCollaborators: '',
    image: null,
    skills: [],
    dates: { start: '', end: '' },
  });

  const [errors, setErrors] = useState({});
  const [locationQuery, setLocationQuery] = useState('');
  const locationOptions = useLocationAutocomplete(locationQuery);

  const handleChange = (field, value) => {
    setProjectData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field, value) => {
    setProjectData((prev) => ({
      ...prev,
      dates: { ...prev.dates, [field]: value },
    }));
  };

  const validate = () => {
    const errs = {};
    if (!projectData.title) errs.title = 'El título es obligatorio';
    if (!projectData.description) errs.description = 'Agregá una descripción';
    if (!projectData.location) errs.location = 'Ubicación requerida';
    if (!projectData.dates.start || !projectData.dates.end) errs.dates = 'Fechas requeridas';
    if (projectData.skills.length === 0) errs.skills = 'Seleccioná al menos una habilidad';
    if (!projectData.collaborationType) errs.collaborationType = 'Seleccioná un tipo';
    if (!projectData.category) errs.category = 'Seleccioná una categoría';
    if (!projectData.contractType) errs.contractType = 'Seleccioná un tipo de contrato';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      handleChange('image', file);
    } else {
      alert('La imagen debe ser JPG o PNG y pesar menos de 5MB');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    console.log(projectData);
    // enviar al backend
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField
        label="Título del proyecto"
        name="title"
        value={projectData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        required
      />

      <InputField
        label="Descripción del proyecto"
        name="description"
        multiline
        rows={4}
        value={projectData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        error={errors.description}
        required
      />

      <InputField
        label="Ubicación"
        name="location"
        placeholder="Ej: Córdoba, Argentina"
        value={locationQuery}
        onChange={(e) => {
          setLocationQuery(e.target.value);
          handleChange('location', e.target.value);
        }}
        error={errors.location}
      />
      {locationOptions.length > 0 && (
        <ul className="bg-white border rounded mt-1 shadow-sm max-h-48 overflow-y-auto">
          {locationOptions.map((loc, idx) => (
            <li
              key={idx}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                handleChange('location', loc.label);
                setLocationQuery(loc.label);
              }}
            >
              {loc.label}
            </li>
          ))}
        </ul>
      )}

      <div>
        <p className="font-medium text-sm text-gray-700 mb-1">Plazo estimado de ejecución</p>
        <DateRangePicker
          start={projectData.dates.start}
          end={projectData.dates.end}
          onChange={handleDateChange}
        />
        {errors.dates && <p className="text-xs text-red-600 mt-1">{errors.dates}</p>}
      </div>

      <SkillSelector
        selectedSkills={projectData.skills}
        setSelectedSkills={(skills) => handleChange('skills', skills)}
      />
      {errors.skills && <p className="text-xs text-red-600 mt-1">{errors.skills}</p>}

      <SelectField
        label="Tipo de colaboración"
        name="collaborationType"
        options={['Remunerada', 'Voluntaria', 'A definir']}
        value={projectData.collaborationType}
        onChange={(e) => handleChange('collaborationType', e.target.value)}
        error={errors.collaborationType}
      />

      <SelectField
        label="Categoría del proyecto"
        name="category"
        options={['Tecnología', 'Educación', 'Salud', 'Ambiental', 'Arte']}
        value={projectData.category}
        onChange={(e) => handleChange('category', e.target.value)}
        error={errors.category}
      />

      <SelectField
        label="Tipo de contrato"
        name="contractType"
        options={['Remoto', 'Híbrido', 'Presencial']}
        value={projectData.contractType}
        onChange={(e) => handleChange('contractType', e.target.value)}
        error={errors.contractType}
      />

      <InputField
        label="Número máximo de colaboradores (opcional)"
        name="maxCollaborators"
        type="number"
        value={projectData.maxCollaborators}
        onChange={(e) => handleChange('maxCollaborators', e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagen representativa del proyecto
        </label>
        <input
          type="file"
          accept="image/jpeg, image/png"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-conexia-green file:text-white
                     hover:file:bg-conexia-green/90"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="neutral" onClick={() => console.log('Cancelar')}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Publicar proyecto
        </Button>
      </div>
    </form>
  );
}
