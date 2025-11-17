/**
 * Valida los datos de una cotización según la modalidad de pago
 * @param {Object} formData - Datos del formulario
 * @param {Object} modality - Modalidad de pago seleccionada
 * @returns {Object} Objeto con los errores encontrados
 */
export function validateQuotationWithModality(formData, modality) {
  const errors = {};

  // Validar modalidad de pago
  if (!formData.paymentModalityId) {
    errors.paymentModalityId = 'Selecciona una modalidad de pago';
  }

  // Validar duración estimada
  const duration = parseInt(formData.estimatedHours);
  if (!formData.estimatedHours || isNaN(duration) || duration < 1) {
    errors.estimatedHours = 'La duración estimada es requerida y debe ser al menos 1';
  }

  // Validar unidad de tiempo
  if (!formData.estimatedTimeUnit) {
    errors.estimatedTimeUnit = 'La unidad de tiempo es requerida';
  }

  // Validar vigencia
  const validity = parseInt(formData.quotationValidityDays);
  if (!formData.quotationValidityDays || isNaN(validity) || validity < 1) {
    errors.quotationValidityDays = 'La vigencia es requerida y debe ser al menos 1 día';
  }

  // Validar notas (opcional pero con límite)
  if (formData.quotationNotes && formData.quotationNotes.length > 1000) {
    errors.quotationNotes = 'Las notas no pueden exceder 1000 caracteres';
  }

  // Validaciones específicas según la modalidad
  if (modality) {
    if (modality.code === 'full_payment') {
      // Validar precio para pago total
      const price = parseFloat(formData.quotedPrice);
      if (!formData.quotedPrice || isNaN(price) || price <= 0) {
        errors.quotedPrice = 'El precio es requerido y debe ser mayor a 0';
      }
    }

    if (modality.code === 'by_deliverables') {
      // Validar entregables
      if (!formData.deliverables || formData.deliverables.length === 0) {
        errors.deliverables = 'Agrega al menos un entregable';
      } else {
        // Validar cada entregable
        formData.deliverables.forEach((deliverable, index) => {
          // Título
          if (!deliverable.title?.trim()) {
            errors[`deliverables[${index}].title`] = 'Título requerido';
          } else if (deliverable.title.length > 100) {
            errors[`deliverables[${index}].title`] = 'Máximo 100 caracteres';
          }

          // Descripción
          if (!deliverable.description?.trim()) {
            errors[`deliverables[${index}].description`] = 'Descripción requerida';
          } else if (deliverable.description.length > 500) {
            errors[`deliverables[${index}].description`] = 'Máximo 500 caracteres';
          }

          // Fecha
          if (!deliverable.estimatedDeliveryDate) {
            errors[`deliverables[${index}].estimatedDeliveryDate`] = 'Fecha requerida';
          } else {
            // Validar que la fecha no sea en el pasado
            const deliveryDate = new Date(deliverable.estimatedDeliveryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (deliveryDate < today) {
              errors[`deliverables[${index}].estimatedDeliveryDate`] = 'La fecha no puede ser en el pasado';
            }
          }

          // Precio
          const price = parseFloat(deliverable.price);
          if (!deliverable.price || isNaN(price) || price <= 0) {
            errors[`deliverables[${index}].price`] = 'Precio requerido y mayor a 0';
          }
        });
      }
    }
  }

  return errors;
}

/**
 * Valida un entregable individual
 * @param {Object} deliverable - Datos del entregable
 * @returns {Object} Objeto con los errores encontrados
 */
export function validateDeliverable(deliverable) {
  const errors = {};

  if (!deliverable.title?.trim()) {
    errors.title = 'Título requerido';
  } else if (deliverable.title.length > 100) {
    errors.title = 'Máximo 100 caracteres';
  }

  if (!deliverable.description?.trim()) {
    errors.description = 'Descripción requerida';
  } else if (deliverable.description.length > 500) {
    errors.description = 'Máximo 500 caracteres';
  }

  if (!deliverable.estimatedDeliveryDate) {
    errors.estimatedDeliveryDate = 'Fecha requerida';
  } else {
    const deliveryDate = new Date(deliverable.estimatedDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deliveryDate < today) {
      errors.estimatedDeliveryDate = 'La fecha no puede ser en el pasado';
    }
  }

  const price = parseFloat(deliverable.price);
  if (!deliverable.price || isNaN(price) || price <= 0) {
    errors.price = 'Precio requerido y mayor a 0';
  }

  return errors;
}

/**
 * Prepara los datos del formulario para enviar al API
 * @param {Object} formData - Datos del formulario
 * @param {Object} modality - Modalidad de pago seleccionada
 * @returns {Object} Datos formateados para el API
 */
export function prepareQuotationData(formData, modality) {
  const data = {
    paymentModalityId: formData.paymentModalityId,
    estimatedHours: parseInt(formData.estimatedHours),
    estimatedTimeUnit: formData.estimatedTimeUnit,
    quotationValidityDays: parseInt(formData.quotationValidityDays),
  };

  // Agregar campo de días hábiles si está definido
  if (formData.isBusinessDays !== undefined) {
    data.isBusinessDays = Boolean(formData.isBusinessDays);
  }

  // Agregar horas por día si están definidas
  if (formData.hoursPerDay && formData.hoursPerDay !== '') {
    data.hoursPerDay = parseFloat(formData.hoursPerDay);
  }

  // Agregar campo de trabajo solo días hábiles si está definido
  if (formData.workOnBusinessDaysOnly !== undefined) {
    data.workOnBusinessDaysOnly = Boolean(formData.workOnBusinessDaysOnly);
  }

  // Agregar notas si existen
  if (formData.quotationNotes?.trim()) {
    data.quotationNotes = formData.quotationNotes.trim();
  }

  // Agregar campos específicos según la modalidad
  if (modality) {
    if (modality.code === 'full_payment') {
      data.quotedPrice = parseFloat(formData.quotedPrice);
    }

    if (modality.code === 'by_deliverables') {
      data.deliverables = formData.deliverables.map(d => ({
        title: d.title.trim(),
        description: d.description.trim(),
        estimatedDeliveryDate: d.estimatedDeliveryDate,
        price: parseFloat(d.price)
      }));
    }
  }

  return data;
}
