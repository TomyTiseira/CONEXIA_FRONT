'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateService, useServiceCategories } from '@/hooks/services';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import Button from '@/components/ui/Button';
import ImageUploadZone from '@/components/services/ImageUploadZone';
import ImageCarousel from '@/components/services/ImageCarousel';
import ServicePreviewModal from '@/components/services/ServicePreviewModal';
import { validateImageFiles } from '@/utils/imageValidation';

export default function CreateServiceForm({ onShowPreview, onClosePreview, showPreview, onShowImageZoom, onConfirmPublish }) {
  const router = useRouter();
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useServiceCategories();
  const { publishService, loading } = useCreateService();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    estimatedHours: '',
    images: []
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [msg, setMsg] = useState(null);

  // Borrador automático en localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('serviceDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setForm(prev => ({ ...prev, ...draft, images: [] })); // No restaurar imágenes por seguridad
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
    
    // Guardar borrador automáticamente (excepto imágenes)
    if (field !== 'images') {
      const updatedForm = { ...form, [field]: value };
      const { images, ...formToSave } = updatedForm;
      localStorage.setItem('serviceDraft', JSON.stringify(formToSave));
    }
  };

  const handleImagesChange = (images) => {
    setForm((prev) => ({ ...prev, images }));
    if (touched.images) {
      validateField('images', images);
    }
    
    // Validar imágenes adicionales
    if (images.length > 0) {
      const validation = validateImageFiles(images, 5);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, images: validation.errors.join(', ') }));
      } else {
        setErrors(prev => ({ ...prev, images: '' }));
      }
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    handleImagesChange(newImages);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'title':
        if (!value || !value.trim()) {
          error = 'Este campo es obligatorio';
        } else if (value.length > 50) {
          error = 'Máximo 50 caracteres';
        }
        break;

      case 'description':
        if (!value || !value.trim()) {
          error = 'Este campo es obligatorio';
        } else if (value.length > 500) {
          error = 'Máximo 500 caracteres';
        }
        break;

      case 'price':
        if (!value || !value.trim()) {
          error = 'Este campo es obligatorio';
        } else {
          const numPrice = Number(value);
          if (isNaN(numPrice) || numPrice <= 1) {
            error = 'El precio debe ser mayor a 1';
          }
        }
        break;

      case 'categoryId':
        if (!value) {
          error = 'Este campo es obligatorio';
        }
        break;

      case 'estimatedHours':
        if (value && value.trim()) {
          const numHours = Number(value);
          if (isNaN(numHours) || numHours < 1) {
            error = 'Debe ser un número mayor o igual a 1';
          }
        }
        break;

      case 'images':
        // Las imágenes son opcionales, no hay validación requerida
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateAll = () => {
    const requiredFields = ['title', 'description', 'price', 'categoryId'];
    const allFields = [...requiredFields, 'estimatedHours'];
    const newTouched = {};
    let isValid = true;

    allFields.forEach((field) => {
      newTouched[field] = true;
      const fieldValue = form[field];
      if (!validateField(field, fieldValue)) {
        isValid = false;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    const isValid = validateAll();
    if (!isValid) {
      return;
    }

    // Mostrar vista previa antes de publicar
    onShowPreview(form, categories);
  };

  const handleConfirmPublish = async () => {
    try {
      await publishService(form);
      onClosePreview();
      setMsg({ ok: true, text: 'Servicio publicado con éxito.' });
      
      // Limpiar borrador del localStorage
      localStorage.removeItem('serviceDraft');
      
      // Redireccionar después de un tiempo
      setTimeout(() => {
        router.push('/services');
      }, 1500);
    } catch (err) {
      onClosePreview();
      setMsg({ ok: false, text: err.message || 'Error al publicar el servicio' });
    }
  };

  // Expose handleConfirmPublish to parent
  if (onConfirmPublish) {
    onConfirmPublish.current = handleConfirmPublish;
  }

  // Función para limpiar borrador
  const clearDraft = () => {
    localStorage.removeItem('serviceDraft');
    setForm({
      title: '',
      description: '',
      price: '',
      categoryId: '',
      estimatedHours: '',
      images: []
    });
    setTouched({});
    setErrors({});
  };

  return (
    <div className="w-full space-y-8">
      <form onSubmit={handleSubmit} noValidate className="w-full space-y-8">
        {/* Información del servicio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-conexia-green-dark mb-2">
              Título del servicio *
            </label>
            <InputField
              name="title"
              placeholder="Ej: Desarrollo Web Personalizado"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              error={touched.title && errors.title}
              required
              maxLength={50}
              showCharCount={true}
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-conexia-green-dark mb-2">
              Descripción *
            </label>
            <InputField
              name="description"
              placeholder="Describe tu servicio detalladamente"
              multiline
              rows={4}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              error={touched.description && errors.description}
              required
              maxLength={500}
              showCharCount={true}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-conexia-green-dark mb-2">
              Categoría del servicio *
            </label>
            <SelectField
              name="categoryId"
              placeholder={categoriesLoading ? "Cargando categorías..." : categoriesError ? "Error al cargar categorías" : "Selecciona una categoría"}
              options={Array.isArray(categories) ? categories.map((cat) => ({ value: cat.id, label: cat.name })) : []}
              value={form.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              onBlur={() => handleBlur('categoryId')}
              error={touched.categoryId && errors.categoryId}
            />
            {categoriesError && (
              <p className="text-xs text-red-600 mt-1">
                Error al cargar categorías: {categoriesError}
              </p>
            )}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-semibold text-conexia-green-dark mb-2">
              Precio aproximado (ARS) *
            </label>
            <InputField
              name="price"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ej: 150"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              onBlur={() => handleBlur('price')}
              error={touched.price && errors.price}
              required
            />
          </div>

          {/* Tiempo estimado */}
          <div>
            <label className="block text-sm font-semibold text-conexia-green-dark mb-2">
              Tiempo de finalización aproximado (Opcional)
            </label>
            <InputField
              name="estimatedHours"
              type="number"
              placeholder="Ej: 40 horas"
              value={form.estimatedHours}
              onChange={(e) => handleChange('estimatedHours', e.target.value)}
              onBlur={() => handleBlur('estimatedHours')}
              error={touched.estimatedHours && errors.estimatedHours}
            />
          </div>
        </div>

        {/* Galería de Imágenes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
          <h2 className="text-xl font-semibold text-conexia-green-dark mb-4 flex items-center gap-2">
            Galería de Imágenes
          </h2>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Sube imágenes de trabajos realizados para que las personas puedan ver ejemplos de tu trabajo 
              (Máximo 5 imágenes, JPG/PNG, 5MB cada una)
            </p>

            {/* Zona de subida */}
            <ImageUploadZone
              images={form.images}
              onImagesChange={handleImagesChange}
              maxImages={5}
              maxSizePerImage={5 * 1024 * 1024} // 5MB
              acceptedFormats={['image/jpeg', 'image/png']}
            />

            {/* Carrusel de vista previa */}
            {form.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h3>
                <ImageCarousel
                  images={form.images}
                  onRemove={handleRemoveImage}
                  showZoom={true}
                  onZoomImage={onShowImageZoom}
                />
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
          <Button 
            type="button" 
            variant="cancel" 
            onClick={() => router.push('/')}
            className="sm:w-auto w-full"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="informative" 
            onClick={clearDraft}
            className="sm:w-auto w-full"
          >
            Limpiar formulario
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="sm:w-auto w-full"
          >
            Vista previa
          </Button>
        </div>

        {/* Mensaje de resultado */}
        {msg && (
          <div className="text-center mt-4">
            <p className={`text-sm ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>
              {msg.text}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}