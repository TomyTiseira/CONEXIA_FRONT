'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSkills } from '@/hooks/useSkills';
import { useProjectCategories } from '@/hooks/project/useProjectCategories';
import { useCollaborationTypes } from '@/hooks/project/useCollaborationTypes';
import { useContractTypes } from '@/hooks/project/useContractTypes';
import { useCreateProject } from '@/hooks/project/useCreateProject';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import DateRangePicker from '@/components/form/DateRangePicker';
import RubroSkillsSelector from '@/components/skills/RubroSkillsSelector';
import Button from '@/components/ui/Button';
import LocalitySelector from '@/components/localities/LocalitySelector';

export default function CreateProjectForm() {
  // Handler para el selector de provincia
  const handleLocalityChange = (locality) => {
    setForm((prev) => ({
      ...prev,
      locationId: locality ? locality.id : '',
      locationName: locality ? locality.name : '',
    }));
    if (touched['locationId']) validateField('locationId', locality ? locality.id : '');
  };
  const router = useRouter();
  const imageInputRef = useRef(null);
  const [msg, setMsg] = useState(null); 

  const [form, setForm] = useState({
    title: '',
    description: '',
    locationId: '', // id de la provincia seleccionada
    locationName: '', // nombre para mostrar en el input
    category: '',
    contractType: '',
    collaborationType: '',
    maxCollaborators: '',
    image: null,
    skills: [],
    dates: { startDate: '', endDate: '' },
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imgError, setImgError] = useState('');
  const [isIndefinite, setIsIndefinite] = useState(false);

  const { skills } = useSkills();
  const { data: categories } = useProjectCategories();
  const { data: collaborationTypes } = useCollaborationTypes();
  const { data: contractTypes } = useContractTypes();
  const { publishProject, loading } = useCreateProject();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleDateChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      dates: {
        ...prev.dates,
        [field]: value,
      },
    }));
  };

  const handleIndefiniteChange = (checked) => {
    setIsIndefinite(checked);
    if (checked) {
      // Clear end date when indefinite is checked
      setForm((prev) => ({
        ...prev,
        dates: {
          ...prev.dates,
          endDate: '',
        },
      }));
    }
  };

  const handleSkillsChange = (skills) => {
    setForm((prev) => ({ ...prev, skills }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const validateField = (field, value) => {
    let error = '';

    if (field === 'title') {
      if (!value) error = 'Este campo es obligatorio';
      else if (value.trim().length < 3 || value.length > 100)
        error = 'Debe tener entre 3 y 100 caracteres';
    }

    if (field === 'description') {
      if (!value) error = 'Este campo es obligatorio';
      else if (value.trim().length < 50 || value.length > 1000)
        error = 'Debe tener entre 50 y 1000 caracteres';
    }

    // Solo mostrar error si el usuario escribió algo pero no seleccionó una provincia
    if (field === 'locationId') {
      if (form.locationName && !value) {
        error = 'Selecciona una provincia válida';
      }
    }

    if (['category', 'collaborationType', 'contractType'].includes(field) && !value) {
      error = 'Este campo es obligatorio';
    }

    if (field === 'dates') {
      if (
        form.dates.startDate &&
        form.dates.endDate &&
        !isIndefinite &&
        (form.dates.endDate < form.dates.startDate || form.dates.endDate === form.dates.startDate)
      ) {
        error = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    // Validación para maxCollaborators: debe ser entero mayor a 1 si se ingresa
    if (field === 'maxCollaborators' && value !== '') {
      const num = Number(value);
      if (!Number.isInteger(num) || num < 1) {
        error = 'Debe ingresar un número entero mayor o igual a 1';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateAll = () => {
    const fields = ['title', 'description', 'category', 'collaborationType', 'contractType', 'dates'];
    const newTouched = {};
    let isValid = true;

    fields.forEach((field) => {
      newTouched[field] = true;
      validateField(field, form[field]);
      if (errors[field]) isValid = false;
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    return isValid;
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setForm((prev) => ({ ...prev, image: file }));
      setImgError('');
    } else {
      setImgError('La imagen debe pesar menos de 5MB y ser JPG o PNG');
      setForm((prev) => ({ ...prev, image: null }));
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
      setForm((prev) => ({ ...prev, image: null }));
      setImgError('');
      if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateAll();
    // Validar campos obligatorios manualmente
    const requiredFields = ['title', 'description', 'category', 'collaborationType', 'contractType'];
    let missing = false;
    requiredFields.forEach((field) => {
      if (!form[field] || (typeof form[field] === 'string' && form[field].trim() === '')) {
        missing = true;
        setErrors((prev) => ({ ...prev, [field]: 'Este campo es obligatorio' }));
      }
    });
    // Bloquear envío si maxCollaborators tiene error y no está vacío
    if ((form.maxCollaborators !== '' && errors.maxCollaborators) || !isValid || missing) return;

    try {
      const formToSend = { 
        ...form, 
        location: form.locationId,
        dates: {
          ...form.dates,
          endDate: isIndefinite ? null : form.dates.endDate
        }
      };
      await publishProject(formToSend);
      setMsg({ ok: true, text: 'Proyecto publicado con éxito.' });
      setTimeout(() => {
        router.push('/project/search');
      }, 1500); // 1,5 segundos
    } catch (err) {
      setMsg({ ok: false, text: err.message || 'Error al publicar el proyecto' });
    }
  };


  return (
    <form onSubmit={handleSubmit} noValidate className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
      {/* Título del proyecto */}
      <div className="md:col-span-2 flex flex-col justify-center min-h-[72px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Título del proyecto
        </label>
        <InputField
          name="title"
          placeholder="Ingrese el título del proyecto"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          error={touched.title && errors.title}
          required
        />
      </div>

      {/* Descripción */}
      <div className="md:col-span-2 flex flex-col justify-center min-h-[72px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Descripción del proyecto
        </label>
        <InputField
          name="description"
          placeholder="Describí brevemente tu idea"
          multiline
          rows={4}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          error={touched.description && errors.description}
          required
          showCharCount={true}
          maxLength={1000}
        />
      </div>

      {/* Ubicación */}
      <div className="md:col-span-2 flex flex-col justify-center min-h-[120px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Ubicación del proyecto (Opcional)
        </label>
        <LocalitySelector
          selectedLocality={form.locationId ? { id: form.locationId, name: form.locationName } : null}
          onLocalityChange={handleLocalityChange}
          className=""
        />
        {touched.locationId && errors.locationId && (
          <div className="text-xs text-red-600 mt-1">{errors.locationId}</div>
        )}
      </div>

      {/* Habilidades */}
      <div className="md:col-span-2 flex flex-col justify-center min-h-[72px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Habilidades requeridas (Opcional)
        </label>
        <div className="min-h-[110px]">
          <RubroSkillsSelector selectedSkills={form.skills} onSkillsChange={handleSkillsChange} />
        </div>
      </div>

      {/* Fechas */}
      <div className="md:col-span-2 flex flex-col justify-center min-h-[75px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Plazo estimado de ejecución (Opcional)
        </label>
        <div className="w-full flex flex-row justify-center gap-3">
          <DateRangePicker
            start={form.dates.startDate}
            end={form.dates.endDate}
            onStartChange={(e) => handleDateChange('startDate', e.target.value)}
            onEndChange={(e) => handleDateChange('endDate', e.target.value)}
            isIndefinite={isIndefinite}
            onIndefiniteChange={handleIndefiniteChange}
            errorStart={''}
            errorEnd={errors.dates || ''}
          />
        </div>
      </div>

      {/* Tipo de colaboración */}
      <div className="flex flex-col justify-center min-h-[120px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Tipo de colaboración
        </label>
        <SelectField
          name="collaborationType"
          options={collaborationTypes?.map((t) => ({ value: t.id, label: t.name })) || []}
          value={form.collaborationType}
          onChange={(e) => handleChange('collaborationType', e.target.value)}
          error={touched.collaborationType && errors.collaborationType}
        />
      </div>

      {/* Tipo de contrato */}
      <div className="flex flex-col justify-center min-h-[120px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Tipo de contrato
        </label>
        <SelectField
          name="contractType"
          options={contractTypes?.map((t) => ({ value: t.id, label: t.name })) || []}
          value={form.contractType}
          onChange={(e) => handleChange('contractType', e.target.value)}
          error={touched.contractType && errors.contractType}
        />
      </div>

      {/* Categoría */}
      <div className="flex flex-col justify-center min-h-[72px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Categoría del proyecto
        </label>
        <SelectField
          name="category"
          options={categories?.map((t) => ({ value: t.id, label: t.name })) || []}
          value={form.category}
          onChange={(e) => handleChange('category', e.target.value)}
          error={touched.category && errors.category}
        />
      </div>

      {/* Máximo de colaboradores */}
      <div className="flex flex-col justify-center min-h-[72px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          N° máximo de colaboradores (Opcional)
        </label>
        <InputField
          name="maxCollaborators"
          type="number"
          placeholder="Ingrese un número entero mayor a 1"
          value={form.maxCollaborators}
          onChange={(e) => handleChange('maxCollaborators', e.target.value)}
          onBlur={() => handleBlur('maxCollaborators')}
          error={touched.maxCollaborators && errors.maxCollaborators}
        />
      </div>

      {/* Imagen representativa */}
      <div className="md:col-span-2 flex flex-col justify-center min-h-[72px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Imagen representativa del proyecto (Opcional)
        </label>

        <div className="flex items-center gap-4">
          <div className="w-[120px] h-[80px] border rounded bg-gray-100 flex items-center justify-center overflow-hidden">
            {form.image ? (
              <Image
                src={URL.createObjectURL(form.image)}
                alt="Vista previa"
                width={120}
                height={80}
                className="object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500">Sin imagen</span>
            )}
          </div>

          {form.image && (
            <button
              type="button"
              className="text-red-600 text-sm hover:underline"
              onClick={handleRemoveImage}
            >
              Eliminar imagen
            </button>
          )}
        </div>

        <input
          type="file"
          accept="image/jpeg, image/png"
          ref={imageInputRef}
          onChange={handleImageChange}
          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#367d7d] file:text-white
                    hover:file:bg-[#2b6a6a]"
        />
        <p className="text-xs text-red-600 mt-1 min-h-[20px]">
          {imgError || '\u00A0'}
        </p>
      </div>


      {/* Botones */}
      <div className="md:col-span-2 flex justify-end gap-4 pt-4">
        <Button type="button" variant="cancel" onClick={() => router.push('/project/search')}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Publicando...' : 'Publicar proyecto'}
        </Button>
      </div>

      {/* Mensaje de error o éxito */}
      <div className="md:col-span-2 min-h-[48px] mt-2">
        {msg && (
          // Ocultar mensaje en inglés de fechas
          msg.text && msg.text.toLowerCase().includes('start date must be before end date') ? null : (
            <p className={`text-sm text-center ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>
              {msg.text}
            </p>
          )
        )}
      </div>
    </form>
  );
}
