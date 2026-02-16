// src/hooks/project/useCreateProject.js
"use client";

import { useState } from "react";
import { createProject } from "@/service/project/projectFetch";

export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper para convertir File a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const publishProject = async (form) => {
    setLoading(true);
    setError(null);
    try {
      // Procesar roles para limpiar datos innecesarios
      const processedRoles = (form.roles || []).map((role, index) => {
        // Crear estructura base del rol según la API
        const processedRole = {
          title: role.title?.trim(),
          applicationTypes: role.applicationTypes || [],
        };

        // Validar campos requeridos del rol
        if (!processedRole.title) {
          throw new Error(`El título del rol ${index + 1} es requerido`);
        }
        if (
          !processedRole.applicationTypes ||
          processedRole.applicationTypes.length === 0
        ) {
          throw new Error(
            `El rol ${index + 1} debe tener al menos un tipo de postulación`,
          );
        }

        // Agregar IDs de tipos (siempre, incluso si están en 0/undefined)
        // Si no están presentes, enviar 0 como valor por defecto
        processedRole.collaborationTypeId = role.collaborationType
          ? parseInt(role.collaborationType)
          : 0;
        processedRole.contractTypeId = role.contractType
          ? parseInt(role.contractType)
          : 0;

        // Agregar campos opcionales del rol según la API
        if (role.description?.trim()) {
          processedRole.description = role.description.trim();
        }
        // maxCollaborators puede venir como 'vacancies' del formulario o como 'maxCollaborators'
        const maxCollab = role.vacancies || role.maxCollaborators;
        if (maxCollab && parseInt(maxCollab) > 0) {
          processedRole.maxCollaborators = parseInt(maxCollab);
        }
        if (
          role.skills &&
          Array.isArray(role.skills) &&
          role.skills.length > 0
        ) {
          // Convertir skills a array de IDs si no lo son ya
          processedRole.skills = role.skills.map((skill) =>
            typeof skill === "object" ? skill.id : parseInt(skill),
          );
        }

        // Procesar preguntas si existen
        if (
          role.questions &&
          Array.isArray(role.questions) &&
          role.questions.length > 0
        ) {
          processedRole.questions = role.questions.map((question) => {
            const processedQuestion = {
              questionText: question.questionText?.trim(),
              questionType: question.questionType,
            };

            // Validar pregunta
            if (!processedQuestion.questionText) {
              throw new Error(`Texto de pregunta vacío en rol ${index + 1}`);
            }
            if (
              !["OPEN", "MULTIPLE_CHOICE"].includes(
                processedQuestion.questionType,
              )
            ) {
              throw new Error(
                `Tipo de pregunta inválido en rol ${index + 1}: ${processedQuestion.questionType}`,
              );
            }

            // Procesar opciones para preguntas de opción múltiple
            if (
              question.questionType === "MULTIPLE_CHOICE" &&
              question.options &&
              Array.isArray(question.options)
            ) {
              if (question.hasCorrectAnswers === false) {
                // Sin respuestas correctas, usar optionText sin isCorrect
                processedQuestion.options = question.options
                  .map((option) => ({
                    optionText: option.text?.trim(),
                  }))
                  .filter((option) => option.optionText);
              } else {
                // Con respuestas correctas, usar optionText e isCorrect
                processedQuestion.options = question.options
                  .map((option) => ({
                    optionText: option.text?.trim(),
                    isCorrect: Boolean(option.isCorrect),
                  }))
                  .filter((option) => option.optionText);
              }

              // Validar que tenga al menos 2 opciones
              if (processedQuestion.options.length < 2) {
                throw new Error(
                  `La pregunta de opción múltiple en rol ${index + 1} debe tener al menos 2 opciones`,
                );
              }
            }

            return processedQuestion;
          });
        }

        // Procesar evaluación técnica si existe
        if (role.evaluation && role.evaluation.description?.trim()) {
          processedRole.evaluation = {
            description: role.evaluation.description.trim(),
          };

          // Manejar días (usar 7 por defecto si no está especificado o es inválido)
          let days = 7;
          if (
            role.evaluation.days !== "" &&
            role.evaluation.days !== null &&
            role.evaluation.days !== undefined
          ) {
            const parsedDays = parseInt(role.evaluation.days);
            if (!isNaN(parsedDays) && parsedDays >= 1 && parsedDays <= 30) {
              days = parsedDays;
            }
          }
          processedRole.evaluation.days = days;

          // Agregar link si existe (corregir nombre del campo)
          if (role.evaluation.link?.trim()) {
            processedRole.evaluation.link = role.evaluation.link.trim();
          }
        }

        // Asegurar que questions y evaluation sean null si no existen
        if (!processedRole.questions || processedRole.questions.length === 0) {
          processedRole.questions = null;
        }
        if (!processedRole.evaluation) {
          processedRole.evaluation = null;
        }

        return processedRole;
      });

      // Construir el objeto de proyecto según la nueva estructura de la API
      const projectData = {
        title: form.title?.trim(),
        description: form.description?.trim(),
        categoryId: parseInt(form.category, 10),
      };

      // Validar campos requeridos
      if (!projectData.title) {
        throw new Error("El título del proyecto es requerido");
      }
      if (!projectData.description) {
        throw new Error("La descripción del proyecto es requerida");
      }
      if (!projectData.categoryId || isNaN(projectData.categoryId)) {
        throw new Error("La categoría del proyecto es requerida");
      }

      // Agregar roles siempre (array vacío si no hay roles)
      projectData.roles = processedRoles || [];

      // Campos opcionales
      if (form.dates?.startDate) {
        projectData.startDate = form.dates.startDate;
      }
      if (form.dates?.endDate) {
        projectData.endDate = form.dates.endDate;
      }
      if (form.locationId) {
        projectData.location = parseInt(form.locationId, 10);
      }
      if (form.needsPartners) {
        projectData.requiresPartner = form.needsPartners;
      }
      if (form.needsInvestors) {
        projectData.requiresInvestor = form.needsInvestors;
      }

      // Enviar cada campo del proyecto por separado en el objeto
      // Campos opcionales
      if (projectData.startDate) {
        // Ya está en projectData
      }
      if (projectData.endDate) {
        // Ya está en projectData
      }
      if (projectData.location) {
        // Ya está en projectData
      }
      if (projectData.requiresPartner !== undefined) {
        // Ya está en projectData
      }
      if (projectData.requiresInvestor !== undefined) {
        // Ya está en projectData
      }

      // Procesar imagen del proyecto si existe
      if (form.image) {
        const base64Image = await fileToBase64(form.image);
        projectData.imageFile = {
          fileData: base64Image,
          originalName: form.image.name,
          mimeType: form.image.type,
        };
      }

      // Procesar archivos de evaluación si existen en algún rol
      if (form.roles && form.roles.length > 0) {
        for (let i = 0; i < form.roles.length; i++) {
          const role = form.roles[i];
          if (role.evaluation && role.evaluation.file) {
            const base64File = await fileToBase64(role.evaluation.file);
            // Agregar el archivo al rol correspondiente en projectData
            if (!projectData.roles[i].evaluation) {
              projectData.roles[i].evaluation = {};
            }
            projectData.roles[i].evaluation.evaluationFile = {
              fileData: base64File,
              originalName: role.evaluation.file.name,
              mimeType: role.evaluation.file.type,
            };
          }
        }
      }

      await createProject(projectData);
    } catch (err) {
      // Crear un objeto de error con información adicional
      const errorObj = {
        message: err.message || "Error al publicar el proyecto",
        statusCode: err.statusCode || null,
        isLimitExceeded:
          err.statusCode === 403 || err.message?.includes("límite"),
      };
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { publishProject, loading, error };
}
