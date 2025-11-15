'use client';

import { useRef, useState } from 'react';
import Toast from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProjectCategories } from '@/hooks/project/useProjectCategories';
import { useCreateProject } from '@/hooks/project/useCreateProject';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import DateRangePicker from '@/components/form/DateRangePicker';
import Button from '@/components/ui/Button';
import LocalitySelector from '@/components/localities/LocalitySelector';
import RequireVerification from '@/components/common/RequireVerification';
import { ProjectRolesManager } from '@/components/project/roles';

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
  // Local toast state for error (success handled after redirect)
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });

  const [form, setForm] = useState({
    title: '',
    description: '',
    locationId: '', // id de la provincia seleccionada
    locationName: '', // nombre para mostrar en el input
    category: '',
    maxCollaborators: '',
    image: null,
    dates: { startDate: '', endDate: '' },
    roles: [], // Nuevo: roles del proyecto (ahora incluyen collaborationType y contractType)
    needsPartners: false, // Indica si el proyecto necesita socios
    needsInvestors: false, // Indica si el proyecto necesita inversores
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imgError, setImgError] = useState('');
  const [isIndefinite, setIsIndefinite] = useState(false);
  const { data: categories } = useProjectCategories();
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

  const handleRolesChange = (roles) => {
    setForm((prev) => ({ ...prev, roles }));
    if (touched['roles']) validateField('roles', roles);
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

    if (field === 'category' && !value) {
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

    // Validación para roles: debe tener al menos un rol
    if (field === 'roles') {
      if (!value || value.length === 0) {
        error = 'Debe definir al menos un rol para el proyecto';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateAll = () => {
    const fields = ['title', 'description', 'category', 'dates', 'roles'];
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
    const requiredFields = ['title', 'description', 'category'];
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
      // Guardar mensaje para mostrar en /project/search
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('projectCreationToast', JSON.stringify({
          type: 'success',
            message: 'Proyecto publicado con éxito.'
        }));
      }
      router.push('/project/search');
    } catch (err) {
      setToast({ visible: true, type: 'error', message: err.message || 'Error al publicar el proyecto' });
    }
  };


  return (
    <form onSubmit={handleSubmit} noValidate className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
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

      {/* Descripción e Imagen - lado a lado */}
      <div className="md:col-span-1 flex flex-col justify-start min-h-[72px] gap-1.5 -mt-6">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Descripción del proyecto
        </label>
        <InputField
          name="description"
          placeholder="Describí brevemente tu idea"
          multiline
          rows={7}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          error={touched.description && errors.description}
          required
          showCharCount={true}
          maxLength={1000}
        />
      </div>

      {/* Imagen representativa */}
      <div className="md:col-span-1 flex flex-col justify-start gap-1.5 -mt-6">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Imagen representativa del proyecto (Opcional)
        </label>

        {/* Estructura idéntica al InputField para alineación */}
        <div className="min-h-[64px] relative">
          {/* Contenedor con borde similar a los inputs */}
          <div className="border border-gray-300 rounded-lg p-3 bg-white h-[182px] flex flex-col justify-between">
            {/* Vista previa de la imagen */}
            <div className="flex flex-col items-center justify-center flex-1 mb-2">
              <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                {form.image ? (
                  <Image
                    src={URL.createObjectURL(form.image)}
                    alt="Vista previa"
                    width={200}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-sm text-gray-400 block">Sin imagen</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de selección y eliminación */}
            <div className="flex flex-col gap-1.5">
              <input
                type="file"
                accept="image/jpeg, image/png"
                ref={imageInputRef}
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#367d7d] rounded-lg hover:bg-[#2b6a6a] transition-colors"
              >
                Seleccionar archivo
              </label>
              
              {form.image && (
                <button
                  type="button"
                  className="text-red-600 text-sm hover:underline text-center"
                  onClick={handleRemoveImage}
                >
                  Eliminar imagen
                </button>
              )}
            </div>
          </div>
          
          {/* Leyendas fuera del contenedor, estructura idéntica al InputField */}
          <span className="text-xs text-gray-500 block mt-2">
            Formato permitido: JPG, PNG. Máx. 1 archivo y hasta 5MB.
          </span>
          <p className="text-xs text-red-600 mt-1 text-left h-[30px]">{imgError}</p>
        </div>
      </div>

      {/* Ubicación */}
      <div className="md:col-span-2 flex flex-col justify-center min-h-[120px] gap-1.5 -mt-8">
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

      {/* Roles del proyecto */}
      <div className="md:col-span-2">
        <ProjectRolesManager
          roles={form.roles}
          onChange={handleRolesChange}
          error={touched.roles && errors.roles}
        />
      </div>

      {/* Checkboxes para socios e inversores */}
      <div className="md:col-span-2 w-full flex flex-col md:flex-row gap-8 mb-2">
        <div className="w-full md:w-1/2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.needsPartners}
              onChange={(e) => handleChange('needsPartners', e.target.checked)}
              className="w-4 h-4 text-conexia-green border-gray-300 rounded focus:ring-conexia-green focus:ring-2 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-conexia-green transition-colors">
              El proyecto necesita socios
            </span>
          </label>
        </div>

        <div className="w-full md:w-1/2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.needsInvestors}
              onChange={(e) => handleChange('needsInvestors', e.target.checked)}
              className="w-4 h-4 text-conexia-green border-gray-300 rounded focus:ring-conexia-green focus:ring-2 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-conexia-green transition-colors">
              El proyecto necesita inversores
            </span>
          </label>
        </div>
      </div>

      {/* Fechas */}
      <div className="md:col-span-2 flex flex-col min-h-[75px] gap-1.5">
        <label className="block text-sm font-semibold text-conexia-green-dark mb-0.5">
          Plazo estimado de ejecución (Opcional)
        </label>
        <DateRangePicker
          start={form.dates.startDate}
          end={form.dates.endDate}
          onStartChange={(e) => handleDateChange('startDate', e.target.value)}
          onEndChange={(e) => handleDateChange('endDate', e.target.value)}
          isIndefinite={isIndefinite}
          onIndefiniteChange={handleIndefiniteChange}
          errorStart={''}
          errorEnd={errors.dates || ''}
          containerClassName="gap-8"
        />
      </div>

      {/* Categoría */}
      <div className="flex flex-col justify-center min-h-[72px] gap-1.5 -mt-6">
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
      <div className="flex flex-col justify-center min-h-[72px] gap-1.5 -mt-6">
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

      {/* Botones */}
      <div className="md:col-span-2 flex justify-end gap-4 pt-4">
        <Button type="button" variant="cancel" onClick={() => router.push('/project/search')}>
          Cancelar
        </Button>
        <RequireVerification action="publicar un proyecto">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar proyecto'}
          </Button>
        </RequireVerification>
      </div>

      {/* Toast de error (success se muestra tras redirect) */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
        position="top-center"
        duration={5000}
      />
    </form>
  );
}
