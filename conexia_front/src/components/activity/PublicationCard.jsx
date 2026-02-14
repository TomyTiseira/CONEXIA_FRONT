import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { config } from "@/config";
import {
  MoreVertical,
  AlertCircle,
  Trash2,
  Pencil,
  Check,
  Flag,
  UserPlus,
} from "lucide-react";
import { HiOutlinePlus } from "react-icons/hi";
import { BsEmojiSmile } from "react-icons/bs";
import { useSendConnectionRequest } from "@/hooks/connections/useSendConnectionRequest";
import {
  FaGlobeAmericas,
  FaUsers,
  FaThumbsUp,
  FaCommentAlt,
  FaRegHandPaper,
  FaHeart,
  FaRegLightbulb,
  FaLaughBeam,
  FaHandsHelping,
  FaUser,
} from "react-icons/fa";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useUserStore } from "@/store/userStore";
import DeletePublicationModal from "./DeletePublicationModal";
import EditPublicationModalMultiple from "./EditPublicationModalMultiple";
import CommentSection from "./CommentSection";
import MediaCarousel from "@/components/ui/MediaCarousel";
import { deletePublication } from "@/service/publications/deletePublication";
import { editPublication } from "@/service/publications/editPublication";
import {
  createComment,
  getPublicationComments,
  updateComment,
  deleteComment,
} from "@/service/publications/comments";
import {
  createOrUpdateReaction,
  deleteReaction,
  getPublicationReactions,
} from "@/service/publications/reactions";
import { createPublicationReport } from "@/service/reports/publicationReportsFetch";
import { createCommentReport } from "@/service/reports/commentReportsFetch";
import { ROLES } from "@/constants/roles";
import { closeAllPublicationCommentsExcept } from "@/utils/publicationUtils";
import ReportPublicationModal from "./report/ReportPublicationModal";
import ReportCommentModal from "./report/ReportCommentModal";
import Toast from "@/components/ui/Toast";

const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// Helpers para validar Node y usar contains de forma segura
const isDomNode = (v) => v && typeof v === "object" && "nodeType" in v;
const safeContains = (parent, child) =>
  !!parent && isDomNode(child) && parent.contains(child);

const getMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return null;
  if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://"))
    return mediaUrl;

  // Detectar si es media de publicación (filename contiene 'publication-')
  const isPublicationMedia = mediaUrl.includes("publication-");
  const baseUrl = isPublicationMedia
    ? config.PUBLICATIONS_URL
    : config.IMAGE_URL;

  if (mediaUrl.startsWith("/uploads"))
    return `${baseUrl}${mediaUrl.replace("/uploads", "")}`;
  if (mediaUrl.startsWith("/")) return `${baseUrl}${mediaUrl}`;
  return `${baseUrl}/${mediaUrl}`;
};

// Esta función se ha eliminado y reemplazado por código directo
// en los lugares donde se usaba, para un mejor manejo de las URL de imágenes

function PublicationCard({
  publication,
  isGridItem = false,
  onShowToast,
  searchParams,
  sentConnectionRequests = new Set(),
  onConnectionRequestSent,
  onPublicationDeleted,
}) {
  const {
    sendRequest,
    loading: connectLoading,
    success: connectSuccess,
    error: connectError,
  } = useSendConnectionRequest();
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const router = useRouter();
  const publicationId = publication?.id;

  // Extraer datos del owner ANTES de usarlos en hooks (mejores prácticas)
  const ownerId = publication.owner?.id;
  const ownerProfilePicture = publication.owner?.profilePicture;
  const ownerName = publication.owner?.name;
  const ownerLastName = publication.owner?.lastName;
  const ownerProfession = publication.owner?.profession;

  // Avatar del owner
  const avatar = ownerProfilePicture
    ? ownerProfilePicture.startsWith("http")
      ? ownerProfilePicture
      : `${config.IMAGE_URL}${ownerProfilePicture.startsWith("/") ? "" : "/"}${ownerProfilePicture}`
    : "/images/default-avatar.png";

  // Nombres para display
  let displayName = "Usuario";
  let displayNameMobile = "Usuario";

  if (ownerName && ownerLastName) {
    displayName = `${ownerName} ${ownerLastName}`;
    displayNameMobile = `${ownerName} ${ownerLastName}`;
  } else if (ownerName) {
    displayName = ownerName;
    displayNameMobile = ownerName;
  }

  const profession = ownerProfession || "";

  // Verificar lógica de permisos
  const isOwner =
    user &&
    publication.userId &&
    String(user.id) === String(publication.userId);
  const isAdmin = roleName === ROLES.ADMIN;
  const isModerator = roleName === ROLES.MODERATOR;

  // Verificar si ya se envió solicitud a este usuario
  const hasRequestBeenSent =
    sentConnectionRequests.has(ownerId) || connectSuccess;

  // Función de utilidad para manejar eventos de forma segura
  const safelyHandleTooltip = (element, action, tooltipClass) => {
    try {
      const tooltip = element?.parentElement?.querySelector(tooltipClass);
      if (tooltip) {
        if (action === "show") {
          tooltip.classList.remove("hidden");
        } else if (action === "hide") {
          tooltip.classList.add("hidden");
        }
      }
    } catch (error) {}
  };

  // Estados para menú y modales
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [comments, setComments] = useState(publication.latestComments || []);
  const [allComments, setAllComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPagination, setCommentsPagination] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [commentMenuOpen, setCommentMenuOpen] = useState({});
  const [showEmojiPickerForComment, setShowEmojiPickerForComment] =
    useState(false);
  const editCommentTextareaRef = useRef(null);
  // Estados para la eliminación de comentarios
  const [commentToDelete, setCommentToDelete] = useState(null); // ID del comentario a eliminar
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false); // Modal visible/oculto
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [reactionsLoading, setReactionsLoading] = useState(false);
  const [selectedReactionType, setSelectedReactionType] = useState("all");
  const menuRef = React.useRef(null);
  const commentMenuRef = React.useRef({});

  // Referencias que persisten entre renderizados
  const editingRef = React.useRef({
    commentId: null,
    content: "",
    isEditing: false,
  });
  const emojiPickerRef = React.useRef(null);

  // Observar cambios en estados importantes
  useEffect(() => {
    // Los estados se observan para reaccionar a sus cambios
  }, [
    editingComment,
    commentToDelete,
    showDeleteCommentModal,
    publicationId,
    user,
    publication,
  ]);

  // Manejar cierre del selector de emojis al hacer clic fuera
  useEffect(() => {
    if (!showEmojiPickerForComment) return;

    function handleClickOutside(event) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        event.target.getAttribute("aria-label") !== "Agregar emoji"
      ) {
        setShowEmojiPickerForComment(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPickerForComment]);

  // Manejador global para cerrar el menú de reacciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      const reactionMenu = document.getElementById("reaction-options");
      if (reactionMenu && !reactionMenu.classList.contains("hidden")) {
        const isClickInsideMenu = reactionMenu.contains(e.target);
        const isClickInsideButton = e.target
          .closest(".group")
          ?.contains(reactionMenu);

        if (!isClickInsideMenu && !isClickInsideButton) {
          reactionMenu.classList.add("hidden");
          reactionMenu.setAttribute("data-hover", "false");
          reactionMenu.setAttribute("data-active", "false");
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Sincronizar editingRef.current con editingComment
  useEffect(() => {
    if (editingComment !== null) {
      // Buscar el comentario correspondiente
      const commentToEdit =
        allComments.length > 0
          ? allComments.find((c) => c.id === editingComment)
          : comments.find((c) => c.id === editingComment);

      if (commentToEdit) {
        const content = commentToEdit.content || "";
        editingRef.current = {
          commentId: editingComment,
          content: content,
          isEditing: true,
        };
      }
    }
  }, [editingComment, comments, allComments]);

  // Ya no necesitamos sincronizar con deleteModalRef.current porque ahora usamos commentToDelete

  // Cerrar menú al hacer click fuera - Mejorado y corregido
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar menú de publicación si está abierto
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      // Cerrar menús de comentarios si están abiertos
      if (Object.keys(commentMenuOpen).length > 0) {
        // Verificar si el clic fue dentro de algún menú o botón de menú
        const clickedInsideMenu = event.target.closest(
          ".comment-menu-dropdown",
        );
        const clickedOnMenuButton = Object.keys(commentMenuRef.current).some(
          (id) =>
            commentMenuRef.current[id] &&
            commentMenuRef.current[id].contains(event.target),
        );

        // Si el clic no fue dentro del menú ni en el botón de menú, cerramos todos los menús
        if (!clickedInsideMenu && !clickedOnMenuButton) {
          setCommentMenuOpen({});
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [commentMenuOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Notificar al padre cuando se envía exitosamente una solicitud de conexión
  useEffect(() => {
    if (connectSuccess && ownerId && onConnectionRequestSent) {
      onConnectionRequestSent(ownerId);
    }
  }, [connectSuccess, ownerId, onConnectionRequestSent]);

  // Inicializar datos de reacciones y comentarios al montar
  useEffect(() => {
    if (publication.userReaction) {
      setUserReaction(publication.userReaction);
    }
    if (publication.reactionsSummary) {
      setReactionsSummary(publication.reactionsSummary);
    }
    if (publication.reactionsCount !== undefined) {
      if (typeof publication.reactionsCount === "object") {
        // Nueva estructura: objeto con conteos por tipo
        setReactionsCount(calculateTotalReactions(publication.reactionsCount));

        // Si no hay reactionsSummary, generar desde reactionsCount
        if (!publication.reactionsSummary) {
          const summary = Object.entries(publication.reactionsCount)
            .filter(([type, count]) => count > 0)
            .map(([type, count]) => ({ type, count }));
          setReactionsSummary(summary);
        }
      } else {
        // Estructura anterior: número total
        setReactionsCount(publication.reactionsCount);
      }
    }
    if (publication.latestComments) {
      // Enriquecer los comentarios iniciales con la información del usuario
      const enrichedComments = publication.latestComments.map((comment) => {
        // Si el comentario ya viene con información de usuario completa del backend
        if (comment.user && comment.user.name && comment.user.profilePicture) {
          return {
            ...comment,
            user: {
              ...comment.user,
              profilePicture: getProfilePictureUrl(comment.user.profilePicture),
            },
          };
        }

        // Si el comentario es del usuario actual, añadir su información
        if (user && String(comment.userId) === String(user.id)) {
          return {
            ...comment,
            user: {
              id: user.id,
              name: user.name,
              profilePicture: getProfilePictureUrl(user.profilePicture),
              profession: user.profession || user.title || user.role || "",
              position: user.position || "",
            },
          };
        }

        // Si el comentario ya tiene información de usuario, mantenerla
        if (comment.user) {
          return {
            ...comment,
            user: {
              ...comment.user,
              profilePicture: comment.user.profilePicture
                ? getProfilePictureUrl(comment.user.profilePicture)
                : null,
            },
          };
        }

        return comment;
      });

      setComments(enrichedComments);
    }
  }, [
    publication.userReaction,
    publication.reactionsSummary,
    publication.reactionsCount,
    publication.latestComments,
    publicationId,
    user,
  ]);

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http")) return profilePicture;
    return `${config.IMAGE_URL}${profilePicture.startsWith("/") ? "" : "/"}${profilePicture}`;
  };

  // Cargar los comentarios completos cuando se monta el componente
  useEffect(() => {
    if (publicationId) {
      loadAllComments();
    }
  }, [publicationId]);

  // Si recibimos un commentId o highlightCommentId en searchParams, abrimos la sección de comentarios,
  // cargamos todos los comentarios y hacemos scroll hacia el comentario objetivo.
  useEffect(() => {
    const targetCommentId =
      searchParams?.commentId || searchParams?.highlightCommentId;
    if (!targetCommentId || !publicationId) return;

    // Intentar cargar todos los comentarios y abrir la vista
    (async () => {
      try {
        await loadAllComments();
        setShowCommentSection(true);
        setShowAllComments(true);
        // Esperar un pequeño intervalo para que el DOM renderice los comentarios
        setTimeout(() => {
          const el = document.getElementById(`comment-${targetCommentId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // Opcional: resaltar temporalmente
            el.classList.add("ring-2", "ring-conexia-green");
            setTimeout(
              () => el.classList.remove("ring-2", "ring-conexia-green"),
              2500,
            );
          }
        }, 300);
      } catch (err) {
        // No bloquear si falla; simplemente no hacer scroll
        console.error("No se pudo navegar al comentario solicitado:", err);
      }
    })();
  }, [
    searchParams?.commentId,
    searchParams?.highlightCommentId,
    publicationId,
  ]);

  // Fecha relativa o absoluta
  function getRelativeOrAbsoluteDate(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays >= 1) {
      return date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } else if (diffHrs >= 1) {
      return `hace ${diffHrs} ${diffHrs === 1 ? "hora" : "horas"}`;
    } else if (diffMin >= 1) {
      return `hace ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
    } else {
      return "hace unos segundos";
    }
  }

  // Formato de tiempo para comentarios (similar a la anterior pero puede ser más conciso)
  function formatTimeDifference(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays >= 1) {
      return date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
      });
    } else if (diffHrs >= 1) {
      return `${diffHrs}h`;
    } else if (diffMin >= 1) {
      return `${diffMin}m`;
    } else {
      return "ahora";
    }
  }

  // Icono de privacidad (igual que en crear publicación)
  let privacyIcon = null;
  if (publication.privacy === "public") {
    privacyIcon = (
      <FaGlobeAmericas
        size={16}
        className="inline text-conexia-green ml-1 align-text-bottom"
        title="Público"
      />
    );
  } else if (
    publication.privacy === "onlyFriends" ||
    publication.privacy === "contacts"
  ) {
    privacyIcon = (
      <FaUsers
        size={16}
        className="inline text-conexia-green ml-1 align-text-bottom"
        title="Solo amigos"
      />
    );
  }

  // Estados para reacciones
  const [userReaction, setUserReaction] = useState(
    publication.userReaction || null,
  );
  const [reactionsSummary, setReactionsSummary] = useState(
    publication.reactionsSummary || [],
  );

  // Calcular el total de reacciones desde reactionsCount object
  const calculateTotalReactions = (reactionsObj) => {
    if (!reactionsObj || typeof reactionsObj !== "object") return 0;
    return Object.values(reactionsObj).reduce(
      (sum, count) => sum + (count || 0),
      0,
    );
  };

  const [reactionsCount, setReactionsCount] = useState(
    typeof publication.reactionsCount === "object"
      ? calculateTotalReactions(publication.reactionsCount)
      : publication.reactionsCount || 0,
  );

  // ID del usuario actual para filtrar reacciones
  const currentUserId = user?.id;

  // Helper para obtener el emoji correcto para cada tipo de reacción
  const getReactionEmoji = (type) => {
    switch (type) {
      case "like":
        return "👍";
      case "love":
        return "❤️";
      case "support":
        return "🤝";
      case "insightful":
        return "💡";
      case "celebrate":
        return "🎉";
      case "fun":
        return "😂";
      default:
        return "👍";
    }
  };

  // Helper para obtener el nombre de cada tipo de reacción
  const getReactionName = (type) => {
    switch (type) {
      case "like":
        return "Me gusta";
      case "love":
        return "Me encanta";
      case "support":
        return "Apoyo";
      case "insightful":
        return "Interesante";
      case "celebrate":
        return "Celebro";
      case "fun":
        return "Divierte";
      default:
        return "Reacción";
    }
  };

  // Función utilitaria para interactuar de forma segura con elementos del DOM
  const handleSafeElementInteraction = (elementId, action) => {
    try {
      const element =
        typeof elementId === "string"
          ? document.getElementById(elementId)
          : elementId;
      if (element) {
        action(element);
      }
    } catch (error) {
      console.error("Error en interacción con elemento:", error);
    }
  };

  // Maneja las reacciones
  const handleReaction = async (type) => {
    try {
      // Ocultar menú de reacciones al hacer clic de forma segura
      handleSafeElementInteraction("reaction-options", (menu) => {
        menu.classList.add("hidden");
        menu.setAttribute("data-active", "false");
        menu.setAttribute("data-hover", "false");
      });

      // Si el usuario ya reaccionó con este tipo, eliminar la reacción
      if (userReaction && userReaction.type === type) {
        // Eliminar la reacción existente
        await deleteReaction(userReaction.id);

        // Actualizar estado local
        setUserReaction(null);

        // Actualizar contador y resumen
        setReactionsCount((prev) => Math.max(0, prev - 1));
        setReactionsSummary((prev) => {
          const newSummary = prev
            .map((r) =>
              r.type === type ? { ...r, count: Math.max(0, r.count - 1) } : r,
            )
            .filter((r) => r.count > 0);
          return newSummary;
        });
        // Salir de la función ya que eliminamos la reacción
        return;
      }
      // Si no reaccionó o usó otro tipo, crear/actualizar
      else {
        const response = await createOrUpdateReaction(publication.id, type);

        // Verificar que la respuesta contiene un ID válido
        if (!response || !response.data || !response.data.id) {
          throw new Error(
            "La respuesta del servidor no incluye el ID de la reacción",
          );
        }

        // Si tenía una reacción previa de otro tipo, ajustar los contadores
        if (userReaction) {
          // Eliminar la reacción anterior del usuario y agregar la nueva
          setReactionsSummary((prev) => {
            // Filtrar la reacción anterior del usuario
            const filteredSummary = prev.filter(
              (r) => r.type !== userReaction.type,
            );

            // Buscar si ya existe el nuevo tipo de reacción
            const existingReactionIndex = filteredSummary.findIndex(
              (r) => r.type === type,
            );

            if (existingReactionIndex >= 0) {
              // Si ya existe, incrementar su contador
              return filteredSummary.map((r, idx) =>
                idx === existingReactionIndex
                  ? { ...r, count: r.count + 1 }
                  : r,
              );
            } else {
              // Si no existe, agregar la nueva reacción
              return [...filteredSummary, { type, count: 1 }];
            }
          });
        }
        // Si no tenía reacción previa
        else {
          setReactionsCount((prev) => prev + 1);

          // Actualizar o agregar al resumen
          setReactionsSummary((prev) => {
            const typeExists = prev.some((r) => r.type === type);
            if (typeExists) {
              return prev.map((r) =>
                r.type === type ? { ...r, count: r.count + 1 } : r,
              );
            } else {
              return [...prev, { type, count: 1 }];
            }
          });
        }

        // Actualizar la reacción del usuario con ID de la respuesta
        setUserReaction({ id: response.data.id, type });
      }
    } catch (error) {
      console.error("Error al gestionar reacción:", error);

      // Mostrar mensaje de error más específico
      const errorMessage = error.message || "Error desconocido";
      // Error silencioso - no mostramos alertas
      console.error("Error al procesar reacción:", errorMessage);
    }
  };

  // Comprueba si una reacción está activa
  const isReactionActive = (type) => {
    return userReaction && userReaction.type === type;
  };

  const handleEdit = async (result) => {
    setShowEditModal(false);
    if (result?.success) {
      // Actualizar publicación en memoria sin reload si tenemos data
      if (result.data) {
        // Merge simple de campos cambiados (description, privacy, media)
        publication.description =
          result.data.description ?? publication.description;
        publication.privacy = result.data.privacy ?? publication.privacy;
        if (Array.isArray(result.data.media))
          publication.media = result.data.media;
        if (result.data.mediaUrl) publication.mediaUrl = result.data.mediaUrl;
      }
      onShowToast &&
        onShowToast({
          type: "success",
          message: "Publicación actualizada",
          isVisible: true,
        });
      // Forzar re-render ligero cambiando un estado local
      setRerenderTick((t) => t + 1);
    } else if (result?.error) {
      onShowToast &&
        onShowToast({
          type: "error",
          message: result.error || "Error al actualizar",
          isVisible: true,
        });
      console.error("Error al editar publicación:", result.error);
    }
  };

  const [rerenderTick, setRerenderTick] = useState(0); // usado para forzar re-render tras mutación directa

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      if (!publicationId) {
        throw new Error("No se puede eliminar: ID de publicación no válido");
      }

      // Iniciar proceso de eliminación
      await deletePublication(publicationId);
      setShowDeleteModal(false);
      onShowToast &&
        onShowToast({
          type: "success",
          message: "Publicación eliminada",
          isVisible: true,
        });
      setDeleted(true);

      // Notificar al componente padre que la publicación fue eliminada
      if (onPublicationDeleted) {
        onPublicationDeleted(publicationId);
      }
    } catch (err) {
      // Error silencioso - no mostramos alertas
      console.error("Error al eliminar publicación:", err);
      onShowToast &&
        onShowToast({
          type: "error",
          message: "Error al eliminar publicación",
          isVisible: true,
        });
    } finally {
      setDeleteLoading(false);
    }
  };

  const [deleted, setDeleted] = useState(false);

  // Cargar todos los comentarios
  const loadAllComments = async () => {
    if (!publicationId) {
      console.error("No hay publicationId definido para cargar comentarios");
      return;
    }

    setCommentsLoading(true);
    try {
      // Cargar todos los comentarios desde el servidor
      const response = await getPublicationComments(publicationId);

      // Asegurarnos de que obtenemos los datos correctamente de la estructura anidada
      const responseData = response.data || response;

      // Extraemos los comentarios de la respuesta
      const commentsData = responseData.comments || [];

      // Enriquecer los comentarios con la información de usuario
      const enrichedComments = commentsData.map((comment) => {
        // Si el comentario ya viene con información de usuario completa del backend
        if (comment.user && comment.user.name && comment.user.profilePicture) {
          // Solo asegurarnos de que la URL de la foto de perfil sea correcta
          return {
            ...comment,
            user: {
              ...comment.user,
              profilePicture: getProfilePictureUrl(comment.user.profilePicture),
            },
          };
        }

        // Si es un comentario del usuario actual, usar su información
        if (user && String(comment.userId) === String(user.id)) {
          return {
            ...comment,
            user: {
              id: user.id,
              name: user.name,
              profilePicture: getProfilePictureUrl(user.profilePicture),
              profession: user.profession || user.title || user.role || "",
              position: user.position || "",
            },
          };
        }

        // Para otros comentarios, mantener la información que ya tienen
        if (comment.user) {
          return {
            ...comment,
            user: {
              ...comment.user,
              profilePicture: getProfilePictureUrl(comment.user.profilePicture),
            },
          };
        }

        return comment;
      });

      setAllComments(enrichedComments);
      setCommentsPagination(responseData.pagination || {});
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
      // Error silencioso - no mostramos alertas
    } finally {
      setCommentsLoading(false);
    }
  };

  // Cargar reacciones para mostrar en el modal
  const loadReactions = async (type = "all") => {
    if (!publicationId) {
      console.error("No hay publicationId definido para cargar reacciones");
      return;
    }

    setReactionsLoading(true);
    try {
      const params = type !== "all" ? { type } : {};

      // Construir parámetros de consulta
      const queryParams = `page=1&limit=20${type !== "all" ? `&type=${type}` : ""}`;

      const response = await getPublicationReactions(
        publicationId,
        1,
        20,
        params,
      );

      // Obtener los datos de la respuesta, considerando la estructura anidada
      const responseData = response.data || response;

      // Procesamos las reacciones para asegurar que todas tengan su emoji correcto
      if (responseData.reactions && responseData.reactions.length > 0) {
        // Asegurar que cada reacción tenga el emoji correcto, incluso si ya viene de la API
        const processedReactions = responseData.reactions.map((reaction) => ({
          ...reaction,
          emoji: getReactionEmoji(reaction.type), // Asignar siempre el emoji correcto según nuestro helper
        }));
        setReactions(processedReactions);
      } else {
        // Si no hay reacciones, establecer array vacío
        setReactions([]);
      }

      setSelectedReactionType(type);
    } catch (error) {
      console.error("Error al cargar reacciones:", error);
    } finally {
      setReactionsLoading(false);
    }
  };

  // Cargar más comentarios (paginación)
  const loadMoreComments = async () => {
    if (!commentsPagination?.hasNextPage || commentsLoading || !publicationId)
      return;

    setCommentsLoading(true);
    try {
      // Cargar la siguiente página de comentarios
      const response = await getPublicationComments(
        publicationId,
        commentsPagination.nextPage,
        commentsPagination.itemsPerPage,
      );

      // Extraemos correctamente los datos de la estructura anidada
      const responseData = response.data || response;

      // Obtener nuevos comentarios
      const newCommentsData = responseData.comments || [];

      // Enriquecer los nuevos comentarios con la información de usuario
      const enrichedNewComments = newCommentsData.map((comment) => {
        // Si el comentario ya viene con información de usuario completa del backend
        if (comment.user && comment.user.name && comment.user.profilePicture) {
          // Solo asegurarnos de que la URL de la foto de perfil sea correcta
          return {
            ...comment,
            user: {
              ...comment.user,
              profilePicture: getProfilePictureUrl(comment.user.profilePicture),
            },
          };
        }

        // Si es un comentario del usuario actual, usar su información
        if (user && String(comment.userId) === String(user.id)) {
          return {
            ...comment,
            user: {
              id: user.id,
              name: user.name,
              profilePicture: getProfilePictureUrl(user.profilePicture),
              profession: user.profession || user.title || user.role || "",
              position: user.position || "",
            },
          };
        }

        // Para otros comentarios, mantener la información que ya tienen
        if (comment.user) {
          return {
            ...comment,
            user: {
              ...comment.user,
              profilePicture: getProfilePictureUrl(comment.user.profilePicture),
            },
          };
        }

        return comment;
      });

      setAllComments((prev) => [...prev, ...enrichedNewComments]);
      setCommentsPagination(responseData.pagination || {});
    } catch (error) {
      console.error("Error al cargar más comentarios:", error);
      // Error silencioso - no mostramos alertas
    } finally {
      setCommentsLoading(false);
    }
  };

  // Añadir un nuevo comentario
  const handleAddComment = async (text) => {
    if (text.trim().length === 0) return;

    try {
      // Acceso directo al ID basado en la estructura del backend
      const id = publication?.id;

      // Solo verificamos que el texto no esté vacío
      if (!text.trim()) {
        return;
      }

      // Crear el comentario - sin tratar de manipular la respuesta
      await createComment(id, text);

      // En lugar de manipular manualmente los datos, recargamos todos los comentarios
      // Esto garantiza que obtenemos la estructura correcta directamente del backend
      await loadAllComments();

      // Incrementar contador de comentarios si existe
      if (publication.commentsCount !== undefined) {
        publication.commentsCount += 1;
      }

      // Si hay más de 2 comentarios después de agregar este, asegurar que solo se muestren 2
      if (allComments.length > 1 || comments.length > 1) {
        setShowAllComments(false);
      }
    } catch (error) {
      console.error("Error al añadir comentario:", error);

      // Error silencioso - no mostramos alertas
      const errorMessage = error.message || "Error desconocido";
      console.error("No se pudo agregar el comentario:", errorMessage);
    }
  };

  // Ya no usamos toggleCommentMenu - implementamos la lógica directamente en los botones

  // Iniciar edición de comentario
  const handleEditCommentStart = (comment) => {
    // Verificar que el comentario y sus propiedades son válidos
    if (!comment) {
      console.error("Error: comentario es null o undefined");
      return;
    }

    if (!comment.id) {
      console.error("Error: comentario no tiene ID", comment);
      return;
    }

    try {
      const content = comment.content || "";

      // Primero actualizar la referencia para asegurar que persista
      editingRef.current = {
        commentId: comment.id,
        content: content,
        isEditing: true,
      };

      // Luego actualizar el estado
      setEditingComment(comment.id);
      setEditCommentText(content);

      // Forzar una actualización de la UI con un timeout
      setTimeout(() => {
        // Comprobar si la edición sigue activa
        if (
          editingRef.current.isEditing !== true ||
          editingRef.current.commentId !== comment.id
        ) {
          editingRef.current = {
            commentId: comment.id,
            content: content,
            isEditing: true,
          };
        }
      }, 500);
    } catch (error) {
      console.error("Error al iniciar edición:", error);
    }
  };

  // Guardar comentario editado - Implementación mejorada
  const handleEditCommentSave = async (commentId) => {
    if (!commentId || editCommentText.trim().length === 0) {
      console.error("Error: ID de comentario no válido o texto vacío");
      return;
    }

    try {
      // Llamada a la API con retry en caso de fallo
      let response;
      try {
        response = await updateComment(commentId, editCommentText);
      } catch (apiError) {
        console.error("Error en la primera llamada a la API:", apiError);
        // Intentar una vez más
        response = await updateComment(commentId, editCommentText);
      }

      const updatedComment = response.data || response;

      // Encontrar el comentario que estamos editando para obtener su información de usuario
      const commentToUpdate =
        allComments.length > 0
          ? allComments.find((c) => c.id === commentId)
          : comments.find((c) => c.id === commentId);

      if (!commentToUpdate) {
        console.error("No se pudo encontrar el comentario a actualizar");
        return;
      }

      // Si el comentario es del usuario actual pero no tiene información de usuario, añadírsela
      let userInfo = commentToUpdate.user;

      if (
        user &&
        String(commentToUpdate.userId) === String(user.id) &&
        (!userInfo || !userInfo.name)
      ) {
        const profilePictureUrl = user.profilePicture
          ? user.profilePicture.startsWith("http")
            ? user.profilePicture
            : `${config.IMAGE_URL}${user.profilePicture.startsWith("/") ? "" : "/"}${user.profilePicture}`
          : null;

        userInfo = {
          id: user.id,
          name: user.name || `Usuario ${user.id}`,
          profilePicture: profilePictureUrl,
          profession: user.profession || user.title || user.role || "",
          position: user.position || "",
        };
      }

      // Mantener toda la información original del comentario, actualizar el contenido y enriquecer con usuario
      const enrichedUpdatedComment = {
        ...commentToUpdate,
        content: editCommentText,
        updatedAt: updatedComment.updatedAt || new Date().toISOString(),
        user: userInfo,
      };

      // Actualizar en el estado local
      if (allComments.length > 0) {
        setAllComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? enrichedUpdatedComment : comment,
          ),
        );
      } else {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? enrichedUpdatedComment : comment,
          ),
        );
      }

      // Limpieza después de una edición exitosa
      setEditingComment(null);
      setEditCommentText("");

      // Limpiar localStorage
      try {
        localStorage.removeItem("editingCommentId");
        localStorage.removeItem("editingCommentText");
        localStorage.removeItem("editingCommentPublicationId");
      } catch (error) {
        console.error("Error al limpiar localStorage:", error);
      }

      // Limpiar la referencia
      if (editingRef.current) {
        editingRef.current = {
          commentId: null,
          content: "",
          isEditing: false,
        };
      }
    } catch (error) {
      console.error("Error al editar comentario:", error);
      // Error silencioso - no mostramos alertas
    }
  };

  // Eliminar comentario - Implementación mejorada y robusta
  const handleDeleteComment = async (commentId) => {
    if (!commentId) {
      console.error("Error: ID de comentario no válido");
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
      return;
    }

    try {
      // Primero cerramos el modal para mejor UX
      setShowDeleteCommentModal(false);

      // Eliminar inmediatamente del estado local para feedback inmediato
      // Actualizar AMBOS arrays independientemente de su longitud
      setAllComments((prev) =>
        prev.filter((comment) => comment.id !== commentId),
      );
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      // Decrementar contador de comentarios si existe
      if (
        publication.commentsCount !== undefined &&
        publication.commentsCount > 0
      ) {
        publication.commentsCount -= 1;
      }

      // Luego eliminar del backend
      await deleteComment(commentId);

      // Limpiar el ID del comentario
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error al eliminar comentario:", error);

      // Cerrar el modal de eliminación incluso en caso de error
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    }
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportCommentModal, setShowReportCommentModal] = useState(false);
  const [reportCommentLoading, setReportCommentLoading] = useState(false);
  const [commentToReport, setCommentToReport] = useState(null);
  // Toast local de respaldo si el padre no provee onShowToast
  const [internalToast, setInternalToast] = useState(null);

  // Handler para enviar el reporte
  const handleReportSubmit = async (data) => {
    setReportLoading(true);
    // Cerramos el modal inmediatamente para feedback consistente (como eliminar / crear etc.)
    setShowReportModal(false);
    const showToast = (payload) => {
      if (onShowToast) {
        onShowToast({ ...payload, isVisible: true });
      } else {
        setInternalToast({ ...payload, isVisible: true });
      }
    };
    try {
      await createPublicationReport({
        publicationId: publication.id,
        reason: data.reason,
        otherReason: data.other,
        description: data.description,
      });

      // Actualizar el estado local para marcar como reportado y forzar re-render
      publication.hasReported = true;
      setRerenderTick((prev) => prev + 1);

      showToast({ type: "success", message: "Reporte enviado correctamente." });
    } catch (err) {
      const alreadyReportedRegex =
        /User \d+ has already reported publication \d+/;
      const isConflictError =
        (err.message && err.message.toLowerCase().includes("conflict")) ||
        (err.message && alreadyReportedRegex.test(err.message)) ||
        (err.message && err.message.includes("has already reported"));
      if (isConflictError) {
        showToast({
          type: "warning",
          message: "Ya habías reportado esta publicación.",
        });
      } else {
        console.error("Error al reportar publicación:", err);
        showToast({
          type: "error",
          message: "Error al enviar el reporte. Inténtalo más tarde.",
        });
      }
    } finally {
      setReportLoading(false);
    }
  };

  // Handler para enviar el reporte de comentario
  const handleReportCommentSubmit = async (data) => {
    setReportCommentLoading(true);
    setShowReportCommentModal(false);
    const showToast = (payload) => {
      if (onShowToast) {
        onShowToast({ ...payload, isVisible: true });
      } else {
        setInternalToast({ ...payload, isVisible: true });
      }
    };
    try {
      await createCommentReport({
        commentId: commentToReport,
        reason: data.reason,
        otherReason: data.otherReason,
        description: data.description,
      });

      // Actualizar el estado local para marcar el comentario como reportado
      setAllComments((prev) =>
        prev.map((c) =>
          c.id === commentToReport ? { ...c, hasReported: true } : c,
        ),
      );
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentToReport ? { ...c, hasReported: true } : c,
        ),
      );

      showToast({
        type: "success",
        message:
          "Reporte enviado exitosamente. Nuestro equipo lo revisará pronto.",
      });
      setCommentToReport(null);
    } catch (err) {
      const isAlreadyReported =
        err.message &&
        (err.message.includes("Ya has reportado este comentario") ||
          err.message.includes("already reported"));
      const isNotFound =
        err.message &&
        (err.message.includes("no encontrado") ||
          err.message.includes("not found") ||
          err.message.includes("no está disponible"));

      if (isAlreadyReported) {
        showToast({
          type: "warning",
          message: "Ya has reportado este comentario anteriormente.",
        });
      } else if (isNotFound) {
        showToast({
          type: "error",
          message: "Este comentario ya no está disponible.",
        });
      } else {
        console.error("Error al reportar comentario:", err);
        showToast({
          type: "error",
          message:
            "No se pudo enviar el reporte. Por favor, intenta nuevamente.",
        });
      }
      setCommentToReport(null);
    } finally {
      setReportCommentLoading(false);
    }
  };

  // Early return moved here so all hooks above run every render
  if (deleted) return null;

  return (
    <div
      id={`pub-${publicationId}`}
      className={`publication-card bg-white rounded-2xl shadow border border-[#c6e3e4] flex flex-col relative w-full max-w-2xl mx-auto mb-2 box-border transition-shadow hover:shadow-xl ${showCommentSection ? "publication-card-open" : ""} ${isGridItem ? "grid-publication-card" : ""}`}
      style={{
        minWidth: 0,
        height: isGridItem && !showCommentSection ? "auto" : "auto",
      }}
    >
      {/* Header autor y menú */}
      <div className="flex items-center gap-2 px-5 pt-3 pb-2 relative min-h-0">
        <img
          src={avatar}
          alt="avatar"
          className="w-12 h-12 rounded-full border-2 border-[#c6e3e4] object-cover bg-white cursor-pointer"
          onClick={() =>
            ownerId && router.push(`/profile/userProfile/${ownerId}`)
          }
        />
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex flex-col items-start">
            <span
              className="text-conexia-green font-semibold text-base truncate max-w-xs flex items-center gap-1 leading-tight cursor-pointer transition-colors hover:text-[#367d7d] rounded"
              style={{ lineHeight: "1.05" }}
              onClick={() =>
                ownerId && router.push(`/profile/userProfile/${ownerId}`)
              }
            >
              <span className="block sm:hidden">{displayNameMobile}</span>
              <span className="hidden sm:block">{displayName}</span>
              {/* LinkedIn badge, opcional: <span className=\"ml-1 bg-[#e0f0f0] text-[#1e6e5c] text-xs px-1.5 py-0.5 rounded font-bold\">in</span> */}
            </span>
            {profession && (
              <span
                className="text-xs text-conexia-green/80 truncate max-w-xs leading-tight mt-0.5"
                style={{ lineHeight: "1.25" }}
              >
                {profession}
              </span>
            )}
            <span
              className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"
              style={{ lineHeight: "1.1" }}
            >
              {getRelativeOrAbsoluteDate(publication.createdAt)}
              <span className="mx-1 text-[18px] font-bold leading-none text-conexia-green">
                ·
              </span>
              {privacyIcon}
            </span>
          </div>
        </div>
        {/* Botones en la esquina superior derecha: Conectar y menú */}
        <div className="absolute top-3 right-5 z-30 flex flex-row items-center gap-2">
          <div className="flex flex-row items-center gap-2">
            {!publication.isContact &&
              publication.connectionStatus == null &&
              !isOwner &&
              !isAdmin &&
              !isModerator && (
                <button
                  onClick={async () => {
                    if (hasRequestBeenSent || connectLoading) return;
                    try {
                      await sendRequest(publication.owner?.id);
                    } catch {}
                  }}
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    hasRequestBeenSent || connectLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-conexia-green/10 text-conexia-green hover:bg-conexia-green hover:text-white hover:scale-110"
                  }`}
                  disabled={hasRequestBeenSent || connectLoading}
                  title={
                    hasRequestBeenSent || connectLoading
                      ? "Solicitud enviada"
                      : "Conectar"
                  }
                  type="button"
                >
                  {hasRequestBeenSent || connectLoading ? (
                    <Check size={18} />
                  ) : (
                    <UserPlus size={18} />
                  )}
                </button>
              )}
            <button
              className="p-1 rounded-full focus:outline-none"
              style={{ background: "transparent" }}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreVertical size={22} className="text-conexia-green" />
            </button>
          </div>
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 min-w-[220px] bg-white border border-[#c6e3e4] rounded-lg shadow-lg py-1 flex flex-col animate-fade-in z-20"
            >
              {/* Usuario general (no admin/moderador/owner): reportar */}
              {!isAdmin && !isModerator && !isOwner && (
                <button
                  className="flex items-center gap-2 px-4 py-2 text-conexia-green hover:bg-[#eef6f6] text-base font-semibold w-full whitespace-nowrap"
                  onClick={() => {
                    setMenuOpen(false);
                    // Verificar si ya fue reportada
                    if (publication.hasReported) {
                      const showToast = (payload) => {
                        if (onShowToast) {
                          onShowToast({ ...payload, isVisible: true });
                        } else {
                          setInternalToast({ ...payload, isVisible: true });
                        }
                      };
                      showToast({
                        type: "warning",
                        message: "Ya has reportado esta publicación",
                      });
                      return;
                    }
                    setShowReportModal(true);
                  }}
                  style={{ maxWidth: "none" }}
                >
                  <span className="flex-shrink-0 flex items-center justify-center">
                    <AlertCircle
                      size={22}
                      strokeWidth={2}
                      className="text-conexia-green"
                    />
                  </span>
                  <span>Reportar publicación</span>
                </button>
              )}
              {/* Admin o moderador: solo ver reportes */}
              {(isAdmin || isModerator) && (
                <button
                  className="flex items-center gap-2 px-4 py-2 text-conexia-green hover:bg-[#eef6f6] text-base font-semibold w-full whitespace-nowrap"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(`/reports/publication/${publication.id}`);
                  }}
                  style={{ maxWidth: "none" }}
                >
                  <span className="flex-shrink-0 flex items-center justify-center">
                    <AlertCircle
                      size={22}
                      strokeWidth={2}
                      className="text-conexia-green"
                    />
                  </span>
                  <span>Ver reportes</span>
                </button>
              )}
              {/* Dueño: editar y eliminar */}
              {isOwner && (
                <div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-conexia-green hover:bg-[#eef6f6] text-base font-semibold w-full whitespace-nowrap"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowEditModal(true);
                    }}
                    style={{ maxWidth: "none" }}
                  >
                    <Pencil size={22} className="" />
                    <span>Editar publicación</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-[#fff0f0] text-base font-semibold w-full whitespace-nowrap"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowDeleteModal(true);
                    }}
                    style={{ maxWidth: "none" }}
                  >
                    <Trash2 size={22} className="" />
                    <span>Eliminar publicación</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Modal edición */}
      <EditPublicationModalMultiple
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={handleEdit}
        publication={publication}
        user={{
          profilePicture:
            publication.owner?.profilePicture || "/images/default-avatar.png",
          displayName:
            publication.owner?.name && publication.owner?.lastName
              ? `${publication.owner.name} ${publication.owner.lastName}`
              : publication.owner?.name || "Usuario",
        }}
      />
      {/* Modal de reporte de publicación */}
      {showReportModal && (
        <ReportPublicationModal
          onCancel={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          loading={reportLoading}
        />
      )}
      {/* Modal de reporte de comentario */}
      {showReportCommentModal && (
        <ReportCommentModal
          onCancel={() => {
            setShowReportCommentModal(false);
            setCommentToReport(null);
          }}
          onSubmit={handleReportCommentSubmit}
          loading={reportCommentLoading}
        />
      )}
      {/* Línea divisoria entre header y contenido */}
      <div className="border-t border-[#e0f0f0] mx-6" />
      {/* Contenido publicación con truncado y ver más */}
      <div className="px-0 pt-4 pb-1 w-full">
        <DescriptionWithReadMore description={publication.description} />

        {/* Mostrar medios usando el carousel */}
        {publication.media && publication.media.length > 0 ? (
          <MediaCarousel media={publication.media} />
        ) : (
          <>
            {/* Compatibilidad con formato anterior */}
            {publication.mediaUrl && publication.mediaType === "image" && (
              <img
                src={getMediaUrl(publication.mediaUrl)}
                alt="media"
                className="w-full h-auto my-2 object-contain"
                style={{ display: "block" }}
              />
            )}
            {publication.mediaUrl && publication.mediaType === "video" && (
              <video
                controls
                className="w-full h-auto my-2 object-contain"
                style={{ display: "block" }}
              >
                <source src={getMediaUrl(publication.mediaUrl)} />
                Tu navegador no soporta video.
              </video>
            )}
            {publication.mediaUrl && publication.mediaType === "gif" && (
              <img
                src={getMediaUrl(publication.mediaUrl)}
                alt="media gif"
                className="w-full h-auto my-2 object-contain"
                style={{ display: "block" }}
              />
            )}
          </>
        )}
      </div>
      {/* Espacio para recuento de reacciones y comentarios */}
      <div className="flex flex-col items-center w-full px-6 pt-2 pb-1">
        <div className="flex items-center justify-between w-full text-sm text-gray-500 mb-1">
          <div className="flex items-center gap-0">
            {/* Reacciones superpuestas, estilo Facebook/LinkedIn */}
            {reactionsSummary && reactionsSummary.length > 0 ? (
              <>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    setShowReactionsModal(true);
                    loadReactions();
                  }}
                >
                  {/* Emojis de reacciones (no subrayables) */}
                  <div className="flex items-center">
                    {reactionsSummary
                      // Si es la reacción del usuario actual, usar userReaction actual en lugar de lo que esté en el array
                      .filter((reaction, idx, self) => {
                        // Solo mantener una reacción por tipo (evita duplicados)
                        const firstIndex = self.findIndex(
                          (r) => r.type === reaction.type,
                        );
                        return idx === firstIndex;
                      })
                      .slice(0, 6)
                      .map((reaction, index) => {
                        let emoji = "👍";
                        switch (reaction.type) {
                          case "like":
                            emoji = "👍";
                            break;
                          case "love":
                            emoji = "❤️";
                            break;
                          case "support":
                            emoji = "🤝";
                            break;
                          case "insightful":
                            emoji = "💡";
                            break;
                          case "celebrate":
                            emoji = "🎉";
                            break;
                          case "fun":
                            emoji = "😂";
                            break;
                          default:
                            emoji = "👍";
                        }
                        return (
                          <span
                            key={reaction.type}
                            className={`text-lg ${index < reactionsSummary.length - 1 ? "mr-3" : ""} z-${10 - index} bg-white rounded-full shadow-sm border border-gray-100`}
                            style={{ marginLeft: index > 0 ? "-8px" : "0" }}
                          >
                            {emoji}
                          </span>
                        );
                      })}
                  </div>
                  {/* Contador (subrayable al hover) */}
                  <span className="ml-1 hover:underline">{reactionsCount}</span>
                </div>
              </>
            ) : (
              <span className="text-conexia-green/70 text-xs">
                Sé el primero en reaccionar
              </span>
            )}
          </div>
          <div>
            <button
              onClick={() => {
                // Usar nuestra utilidad para cerrar todas las demás publicaciones
                closeAllPublicationCommentsExcept(publicationId);

                // Forzar la carga de comentarios pero mostrar inicialmente solo 2
                loadAllComments();
                setShowCommentSection(true);
                setShowAllComments(false);

                // Si estamos en un grid, marcar este elemento como abierto para CSS
                if (isGridItem) {
                  const currentCard = document.getElementById(
                    `pub-${publicationId}`,
                  );
                  if (currentCard) {
                    currentCard.setAttribute("data-comment-open", "true");
                  }
                }
              }}
              className="hover:underline text-gray-600 hover:text-conexia-green cursor-pointer"
            >
              {publication.commentsCount || comments.length}{" "}
              {publication.commentsCount === 1 || comments.length === 1
                ? "comentario"
                : "comentarios"}
            </button>
          </div>
        </div>
      </div>
      {/* Línea divisoria */}
      <div className="border-t border-[#e0f0f0] mx-6" />
      {/* Acciones: Reaccionar y Comentar (cada uno ocupa la mitad y centrados en su mitad) */}
      <div className="flex w-full px-6 py-2">
        {/* Mitad izquierda: Reaccionar */}
        <div className="w-1/2 flex justify-center">
          <div
            className="relative group"
            onMouseEnter={(e) => {
              const menu = e.currentTarget.querySelector("#reaction-options");
              if (menu) {
                menu.classList.remove("hidden");
                menu.setAttribute("data-active", "true");
              }
            }}
            onMouseLeave={(e) => {
              try {
                const relatedTarget = e.relatedTarget;
                const menu = e.currentTarget.querySelector("#reaction-options");

                // Usar safeContains para evitar TypeError
                const leftGroup = e.currentTarget;
                const isInside = safeContains(leftGroup, relatedTarget);

                if (menu && !isInside) {
                  setTimeout(() => {
                    handleSafeElementInteraction(menu, (element) => {
                      const isHovering =
                        element.getAttribute("data-hover") === "true";
                      const isActive =
                        element.getAttribute("data-active") === "true";
                      if (!isHovering && !isActive) {
                        element.classList.add("hidden");
                      }
                    });
                  }, 100);
                }
              } catch (error) {
                console.error(
                  "Error en onMouseLeave del grupo de reacciones:",
                  error,
                );
              }
            }}
          >
            <button
              className={`flex items-center gap-2 font-semibold py-1 px-4 rounded hover:bg-[#e0f0f0] transition-colors focus:outline-none ${
                userReaction
                  ? "text-conexia-green font-bold"
                  : "text-conexia-green"
              }`}
              type="button"
              onMouseEnter={(e) => {
                // Cuando el cursor entra al botón principal, marcar el menú como activo
                const menu = e.currentTarget
                  .closest(".group")
                  .querySelector("#reaction-options");
                if (menu && !menu.classList.contains("hidden")) {
                  handleSafeElementInteraction(menu, (el) => {
                    el.setAttribute("data-active", "true");
                    el.setAttribute("data-hover", "true");
                  });
                }
              }}
              onMouseLeave={(e) => {
                // Cuando el cursor sale del botón, verificar si sale fuera del grupo
                const relatedTarget = e.relatedTarget;
                const group = e.currentTarget.closest(".group");

                if (!safeContains(group, relatedTarget)) {
                  const menu = group.querySelector("#reaction-options");
                  handleSafeElementInteraction(menu, (el) => {
                    el.setAttribute("data-active", "false");
                    el.setAttribute("data-hover", "false");

                    // Si el cursor salió completamente del grupo, ocultar el menú
                    setTimeout(() => {
                      if (el && !el.classList.contains("hidden")) {
                        el.classList.add("hidden");
                      }
                    }, 100);
                  });
                }
              }}
            >
              <span className="text-xl flex items-center justify-center">
                {userReaction
                  ? userReaction.type === "like"
                    ? "👍"
                    : userReaction.type === "love"
                      ? "❤️"
                      : userReaction.type === "support"
                        ? "🤝"
                        : userReaction.type === "insightful"
                          ? "💡"
                          : userReaction.type === "celebrate"
                            ? "🎉"
                            : userReaction.type === "fun"
                              ? "😂"
                              : "👥"
                  : "👥"}
              </span>
              <span className="ml-1">
                {userReaction
                  ? userReaction.type === "like"
                    ? "Me gusta"
                    : userReaction.type === "love"
                      ? "Me encanta"
                      : userReaction.type === "support"
                        ? "Apoyo"
                        : userReaction.type === "insightful"
                          ? "Interesante"
                          : userReaction.type === "celebrate"
                            ? "Celebro"
                            : userReaction.type === "fun"
                              ? "Divierte"
                              : "Reaccionar"
                  : "Reaccionar"}
              </span>
            </button>
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 hidden bg-white rounded-full shadow-lg px-3 py-2 z-30 border border-[#e0f0f0] gap-2 animate-fade-in flex flex-row after:content-[''] after:absolute after:w-full after:h-3 after:bottom-[-12px] after:left-0"
              id="reaction-options"
              data-hover="false"
              data-active="false"
              onMouseEnter={(e) => {
                e.currentTarget.setAttribute("data-hover", "true");
                // Aseguramos que esté visible mientras el ratón esté sobre él
                e.currentTarget.classList.remove("hidden");
              }}
              onMouseLeave={(e) => {
                try {
                  const menuId = e.currentTarget.id;
                  const menuElement = e.currentTarget;
                  const parentContainer = e.currentTarget.closest(".group");
                  const relatedTarget = e.relatedTarget;

                  handleSafeElementInteraction(menuElement, (menu) => {
                    menu.setAttribute("data-hover", "false");
                    menu.setAttribute("data-active", "false");
                  });

                  // Usar safeContains para evitar TypeError
                  const movedOutsideGroup =
                    !safeContains(parentContainer, relatedTarget) ||
                    relatedTarget === parentContainer;

                  if (movedOutsideGroup) {
                    handleSafeElementInteraction(menuElement, (menu) => {
                      menu.classList.add("hidden");
                    });
                  } else {
                    setTimeout(() => {
                      handleSafeElementInteraction(menuId, (menu) => {
                        if (
                          menu &&
                          menu.getAttribute("data-hover") === "false" &&
                          menu.getAttribute("data-active") === "false"
                        ) {
                          menu.classList.add("hidden");
                        }
                      });
                    }, 100);
                  }
                } catch (error) {
                  console.error(
                    "Error en el manejo del menú de reacciones:",
                    error,
                  );
                }
              }}
            >
              {/* Me gusta */}
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={(e) => {
                  // Mantener el menú visible mientras el mouse está en el botón
                  const menu = e.currentTarget.closest("#reaction-options");
                  if (menu) {
                    menu.setAttribute("data-hover", "true");
                  }
                }}
              >
                <button
                  className={`hover:scale-110 transition-transform ${isReactionActive("like") ? "scale-110 border-2 border-conexia-green rounded-full" : ""}`}
                  type="button"
                  onClick={() => handleReaction("like")}
                  onMouseEnter={(e) => {
                    // Mostrar tooltip
                    handleSafeElementInteraction(
                      e.currentTarget.parentElement.querySelector(".tooltip"),
                      (elem) => elem.classList.remove("hidden"),
                    );

                    // Mantener el menú visible
                    handleSafeElementInteraction(
                      e.currentTarget
                        .closest(".group")
                        ?.querySelector("#reaction-options"),
                      (menu) => {
                        menu.classList.remove("hidden");
                        menu.setAttribute("data-hover", "true");
                      },
                    );
                  }}
                  onMouseLeave={(e) => {
                    // Ocultar tooltip
                    handleSafeElementInteraction(
                      e.currentTarget.parentElement.querySelector(".tooltip"),
                      (elem) => elem.classList.add("hidden"),
                    );

                    // Actualizar estado del menú después de un breve retraso
                    const menuId = "reaction-options";
                    setTimeout(() => {
                      handleSafeElementInteraction(menuId, (menu) => {
                        menu.setAttribute("data-hover", "false");
                      });
                    }, 100);
                  }}
                >
                  <span className="text-[26px]">👍</span>
                </button>
                <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">
                  Me gusta
                </span>
              </div>
              {/* Me encanta */}
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={(e) => {
                  // Mantener el menú visible mientras el mouse está en el botón
                  const menu = e.currentTarget.closest("#reaction-options");
                  if (menu) {
                    menu.setAttribute("data-hover", "true");
                  }
                }}
              >
                <button
                  className={`hover:scale-110 transition-transform ${isReactionActive("love") ? "scale-110 border-2 border-conexia-green rounded-full" : ""}`}
                  type="button"
                  onClick={() => handleReaction("love")}
                  onMouseEnter={(e) => {
                    // Mostrar tooltip
                    e.currentTarget.parentElement
                      .querySelector(".tooltip")
                      .classList.remove("hidden");
                    // Mantener el menú visible
                    const menu = e.currentTarget
                      .closest(".group")
                      .querySelector("#reaction-options");
                    if (menu) {
                      menu.classList.remove("hidden");
                      menu.setAttribute("data-hover", "true");
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Ocultar tooltip
                    e.currentTarget.parentElement
                      .querySelector(".tooltip")
                      .classList.add("hidden");
                    // Mantener menú visible si hay interacción
                    const menu = e.currentTarget
                      .closest(".group")
                      .querySelector("#reaction-options");
                    if (menu) {
                      setTimeout(() => {
                        menu.setAttribute("data-hover", "false");
                      }, 100);
                    }
                  }}
                >
                  <span className="text-[26px]">❤️</span>
                </button>
                <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">
                  Me encanta
                </span>
              </div>
              {/* Apoyo */}
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={(e) => {
                  // Mantener el menú visible mientras el mouse está en el botón
                  const menu = e.currentTarget.closest("#reaction-options");
                  if (menu) {
                    menu.setAttribute("data-hover", "true");
                  }
                }}
              >
                <button
                  className={`hover:scale-110 transition-transform ${isReactionActive("support") ? "scale-110 border-2 border-conexia-green rounded-full" : ""}`}
                  type="button"
                  onClick={() => handleReaction("support")}
                  onMouseEnter={(e) => {
                    // Mostrar tooltip
                    e.currentTarget.parentElement
                      .querySelector(".tooltip")
                      .classList.remove("hidden");
                    // Mantener el menú visible
                    const menu = e.currentTarget
                      .closest(".group")
                      .querySelector("#reaction-options");
                    if (menu) {
                      menu.classList.remove("hidden");
                      menu.setAttribute("data-hover", "true");
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Ocultar tooltip
                    e.currentTarget.parentElement
                      .querySelector(".tooltip")
                      .classList.add("hidden");
                    // Mantener menú visible si hay interacción
                    const menu = e.currentTarget
                      .closest(".group")
                      .querySelector("#reaction-options");
                    if (menu) {
                      setTimeout(() => {
                        menu.setAttribute("data-hover", "false");
                      }, 100);
                    }
                  }}
                >
                  <span className="text-[26px]">🤝</span>
                </button>
                <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">
                  Apoyo
                </span>
              </div>
              {/* Interesante */}
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={(e) => {
                  // Mantener el menú visible mientras el mouse está en el botón
                  const menu = e.currentTarget.closest("#reaction-options");
                  if (menu) {
                    menu.setAttribute("data-hover", "true");
                  }
                }}
              >
                <button
                  className={`hover:scale-110 transition-transform ${isReactionActive("insightful") ? "scale-110 border-2 border-conexia-green rounded-full" : ""}`}
                  type="button"
                  onClick={() => handleReaction("insightful")}
                  onMouseEnter={(e) => {
                    // Mostrar tooltip
                    e.currentTarget.parentElement
                      .querySelector(".tooltip")
                      .classList.remove("hidden");
                    // Mantener el menú visible
                    const menu = e.currentTarget
                      .closest(".group")
                      .querySelector("#reaction-options");
                    if (menu) {
                      menu.classList.remove("hidden");
                      menu.setAttribute("data-hover", "true");
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Ocultar tooltip
                    e.currentTarget.parentElement
                      .querySelector(".tooltip")
                      .classList.add("hidden");
                    // Mantener menú visible si hay interacción
                    const menu = e.currentTarget
                      .closest(".group")
                      .querySelector("#reaction-options");
                    if (menu) {
                      setTimeout(() => {
                        menu.setAttribute("data-hover", "false");
                      }, 100);
                    }
                  }}
                >
                  <span className="text-[26px]">💡</span>
                </button>
                <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">
                  Interesante
                </span>
              </div>
              {/* Celebro */}
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={(e) => {
                  // Mantener el menú visible mientras el mouse está en el botón
                  const menu = e.currentTarget.closest("#reaction-options");
                  if (menu) {
                    menu.setAttribute("data-hover", "true");
                  }
                }}
              >
                <button
                  className={`hover:scale-110 transition-transform ${isReactionActive("celebrate") ? "scale-110 border-2 border-conexia-green rounded-full" : ""}`}
                  type="button"
                  onClick={() => handleReaction("celebrate")}
                  onMouseEnter={(e) => {
                    // Mostrar tooltip
                    e.currentTarget.parentElement
                      .querySelector(".tooltip")
                      .classList.remove("hidden");
                    // Mantener el menú visible
                    const menu = e.currentTarget
                      .closest(".group")
                      .querySelector("#reaction-options");
                    if (menu) {
                      menu.classList.remove("hidden");
                      menu.setAttribute("data-hover", "true");
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Ocultar tooltip
                    e.currentTarget.parentElement
                      .querySelector(".tooltip")
                      .classList.add("hidden");
                    // Mantener menú visible si hay interacción
                    const menu = e.currentTarget
                      .closest(".group")
                      .querySelector("#reaction-options");
                    if (menu) {
                      setTimeout(() => {
                        menu.setAttribute("data-hover", "false");
                      }, 100);
                    }
                  }}
                >
                  <span className="text-[26px]">🎉</span>
                </button>
                <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">
                  Celebro
                </span>
              </div>
              {/* Me divierte */}
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={(e) => {
                  // Mantener el menú visible mientras el mouse está en el botón
                  const menu = e.currentTarget.closest("#reaction-options");
                  if (menu) {
                    menu.setAttribute("data-hover", "true");
                  }
                }}
              >
                <button
                  className={`hover:scale-110 transition-transform ${isReactionActive("fun") ? "scale-110 border-2 border-conexia-green rounded-full" : ""}`}
                  type="button"
                  onClick={() => handleReaction("fun")}
                  onMouseEnter={(e) => {
                    try {
                      // Mostrar tooltip
                      handleSafeElementInteraction(
                        e.currentTarget.parentElement.querySelector(".tooltip"),
                        (elem) => elem.classList.remove("hidden"),
                      );

                      // Mantener el menú visible
                      handleSafeElementInteraction(
                        e.currentTarget
                          .closest(".group")
                          ?.querySelector("#reaction-options"),
                        (menu) => {
                          menu.classList.remove("hidden");
                          menu.setAttribute("data-hover", "true");
                        },
                      );
                    } catch (error) {
                      console.error("Error en tooltip divierte:", error);
                    }
                  }}
                  onMouseLeave={(e) => {
                    try {
                      // Ocultar tooltip
                      handleSafeElementInteraction(
                        e.currentTarget.parentElement.querySelector(".tooltip"),
                        (elem) => elem.classList.add("hidden"),
                      );

                      // Actualizar estado del menú después de un breve retraso
                      const menuId = "reaction-options";
                      setTimeout(() => {
                        handleSafeElementInteraction(menuId, (menu) => {
                          menu.setAttribute("data-hover", "false");
                        });
                      }, 100);
                    } catch (error) {
                      console.error("Error en evento mouseLeave:", error);
                    }
                  }}
                >
                  <span className="text-[26px]">😂</span>
                </button>
                <span className="tooltip hidden absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-conexia-green text-white text-xs font-semibold shadow-lg whitespace-nowrap z-50">
                  Divierte
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Mitad derecha: Comentar */}
        <div className="w-1/2 flex flex-col items-center justify-center">
          <button
            className="flex items-center gap-2 text-conexia-green font-semibold py-1 px-4 rounded hover:bg-[#e0f0f0] transition-colors focus:outline-none"
            type="button"
            onClick={() => {
              // Usar nuestra utilidad para cerrar todas las demás publicaciones
              closeAllPublicationCommentsExcept(publicationId);

              // Forzar siempre la carga de comentarios con toda la información
              // pero no mostrar todos inicialmente
              loadAllComments();
              setShowCommentSection(true);
              setShowAllComments(false);

              // Si estamos en un grid, marcar este elemento como abierto para CSS
              if (isGridItem) {
                const currentCard = document.getElementById(
                  `pub-${publicationId}`,
                );
                if (currentCard) {
                  currentCard.setAttribute("data-comment-open", "true");
                }
              }
            }}
          >
            <span className="text-xl">💬</span>
            Comentar
          </button>
        </div>
      </div>
      {showCommentSection && (
        <div className="w-full flex flex-col items-center mt-2 px-6 pb-4">
          <CommentSection onComment={handleAddComment} user={user} />

          {/* Lista de comentarios */}
          <div className="comments-section w-full mt-4">
            {commentsLoading ? (
              <div className="flex justify-center py-3">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-conexia-green"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mostrar solo los primeros 2 comentarios inicialmente */}
                {(allComments.length > 0 ? allComments : comments)
                  .slice(
                    0,
                    showAllComments
                      ? allComments.length > 0
                        ? allComments.length
                        : comments.length
                      : 2,
                  )
                  .filter((comment) => comment && comment.id) // Asegurarnos de que el comentario existe y tiene ID
                  .map((comment) => (
                    <div
                      key={comment.id}
                      id={`comment-${comment.id}`}
                      className="bg-[#f3f9f8] rounded-lg p-3 border border-[#e0f0f0] relative"
                    >
                      <div
                        className={`flex items-start ${editingComment === comment.id ? "justify-start" : "justify-between"}`}
                      >
                        <div className="flex items-start flex-1">
                          <div className="h-8 w-8 flex-shrink-0 mr-2">
                            {/* Imagen de perfil del comentario - con fallbacks mejorados */}
                            {comment.user?.profilePicture ? (
                              <img
                                src={comment.user.profilePicture}
                                alt={comment.user?.name || "Usuario"}
                                className="h-full w-full rounded-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/default-avatar.png";
                                }}
                              />
                            ) : user &&
                              String(comment.userId) === String(user.id) &&
                              user.profilePicture ? (
                              // Si es el usuario actual y tiene foto de perfil
                              <img
                                src={getProfilePictureUrl(user.profilePicture)}
                                alt={user.name || "Usuario"}
                                className="h-full w-full rounded-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/default-avatar.png";
                                }}
                              />
                            ) : (
                              <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <FaUser size={16} />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center flex-wrap">
                              <span
                                className="font-semibold text-conexia-green hover:underline cursor-pointer"
                                onClick={() => {
                                  // Usar el ID del usuario del comentario o el ID del usuario actual si es un comentario propio
                                  const profileId =
                                    comment.user?.id ||
                                    (user &&
                                    String(comment.userId) === String(user.id)
                                      ? user.id
                                      : null);
                                  if (profileId)
                                    router.push(
                                      `/profile/userProfile/${profileId}`,
                                    );
                                }}
                              >
                                {/* Mostrar nombre del comentario, con fallback al nombre del usuario actual */}
                                {comment.user?.name ||
                                  (user &&
                                  String(comment.userId) === String(user.id)
                                    ? user.name
                                    : `Usuario ${comment.userId}`)}
                              </span>
                              {/* Posición del usuario - con mejores fallbacks */}
                              {(comment.user?.position ||
                                (user &&
                                  String(comment.userId) === String(user.id) &&
                                  user.position)) && (
                                <span className="text-xs ml-1 text-gray-500">
                                  {comment.user?.position ||
                                    (user &&
                                    String(comment.userId) === String(user.id)
                                      ? user.position
                                      : "")}
                                </span>
                              )}
                              {/* Profesión con mejores fallbacks */}
                              {(comment.user?.profession ||
                                (user &&
                                  String(comment.userId) === String(user.id) &&
                                  (user.profession ||
                                    user.title ||
                                    user.role))) && (
                                <span className="font-normal text-xs ml-1 text-gray-500">
                                  ·{" "}
                                  {comment.user?.profession ||
                                    (user &&
                                    String(comment.userId) === String(user.id)
                                      ? user.profession ||
                                        user.title ||
                                        user.role
                                      : "")}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              {formatTimeDifference(
                                new Date(comment.createdAt),
                              )}
                            </div>
                            {/* Modo edición de comentario - Con emoji picker */}
                            {editingComment === comment.id ? (
                              <div
                                className="flex flex-col mt-1 relative w-full"
                                style={{ marginRight: "-24px" }}
                              >
                                <div className="w-full flex items-center bg-[#f3f9f8] border border-[#e0f0f0] rounded-xl px-4 py-3 relative">
                                  <button
                                    type="button"
                                    className="p-2 rounded-full hover:bg-gray-100 mr-2 flex-shrink-0"
                                    onClick={() =>
                                      setShowEmojiPickerForComment(
                                        (prev) => !prev,
                                      )
                                    }
                                    aria-label="Agregar emoji"
                                  >
                                    <BsEmojiSmile
                                      size={22}
                                      className="text-conexia-green"
                                    />
                                  </button>
                                  <input
                                    type="text"
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-conexia-green w-full"
                                    value={editCommentText}
                                    onChange={(e) => {
                                      setEditCommentText(e.target.value || "");
                                    }}
                                    autoFocus
                                    placeholder="Editar tu comentario..."
                                    ref={editCommentTextareaRef}
                                    maxLength={300}
                                  />
                                </div>
                                {showEmojiPickerForComment && (
                                  <div
                                    ref={emojiPickerRef}
                                    className="absolute z-50 bg-white border rounded shadow p-2 mt-1 left-0"
                                  >
                                    <Picker
                                      onEmojiClick={(emojiData) => {
                                        const emoji = emojiData.emoji;
                                        const textarea =
                                          editCommentTextareaRef.current;
                                        if (textarea) {
                                          const start = textarea.selectionStart;
                                          const end = textarea.selectionEnd;
                                          const newText =
                                            editCommentText.slice(0, start) +
                                            emoji +
                                            editCommentText.slice(end);
                                          setEditCommentText(newText);
                                          setTimeout(() => {
                                            textarea.focus();
                                            textarea.selectionStart =
                                              textarea.selectionEnd =
                                                start + emoji.length;
                                          }, 0);
                                        } else {
                                          setEditCommentText(
                                            (prev) => prev + emoji,
                                          );
                                        }
                                        setShowEmojiPickerForComment(false);
                                      }}
                                      theme="light"
                                      height={260}
                                      width={260}
                                      searchDisabled={false}
                                      emojiStyle="native"
                                      lazyLoadEmojis={true}
                                      skinTonesDisabled={false}
                                      previewConfig={{ showPreview: false }}
                                    />
                                  </div>
                                )}
                                <div className="flex justify-center sm:justify-end gap-3 mt-3 w-full">
                                  <button
                                    className="w-1/3 sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                                    onClick={() => {
                                      // Simplemente resetear el estado de edición
                                      setEditingComment(null);
                                      setEditCommentText("");
                                      setShowEmojiPickerForComment(false);
                                    }}
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    className="w-1/3 sm:w-auto px-4 py-2 bg-conexia-green text-white rounded-lg text-sm hover:bg-[#1e6e5c] disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => {
                                      // Guardar edición directamente aquí
                                      if (!editCommentText.trim()) return;

                                      // Llamada directa a la API
                                      updateComment(comment.id, editCommentText)
                                        .then((response) => {
                                          // Actualizar el comentario localmente
                                          const updatedComment =
                                            response.data || response;

                                          // Actualizar en el estado local preservando TODA la información del usuario
                                          if (allComments.length > 0) {
                                            setAllComments((prev) =>
                                              prev.map((c) =>
                                                c.id === comment.id
                                                  ? {
                                                      ...c,
                                                      content: editCommentText,
                                                      updatedAt:
                                                        new Date().toISOString(),
                                                      // Preservar información completa del usuario
                                                      user: c.user,
                                                    }
                                                  : c,
                                              ),
                                            );
                                          } else {
                                            setComments((prev) =>
                                              prev.map((c) =>
                                                c.id === comment.id
                                                  ? {
                                                      ...c,
                                                      content: editCommentText,
                                                      updatedAt:
                                                        new Date().toISOString(),
                                                      // Preservar información completa del usuario
                                                      user: c.user,
                                                    }
                                                  : c,
                                              ),
                                            );
                                          }

                                          // Limpiar estado de edición
                                          setEditingComment(null);
                                          setEditCommentText("");
                                        })
                                        .catch((error) => {
                                          console.error(
                                            "Error al editar comentario:",
                                            error,
                                          );
                                          // Error silencioso - no mostramos alertas
                                        });
                                    }}
                                    disabled={!editCommentText.trim()}
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-conexia-green mt-1">
                                {comment.content}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Menú de 3 puntos (para todos los usuarios) */}
                        {editingComment !== comment.id && (
                          <div className="relative ml-2 flex-shrink-0">
                            <button
                              className="p-1 rounded-full hover:bg-[#e0f0f0] focus:outline-none text-gray-500"
                              onClick={() => {
                                // Cerrar todos los menús abiertos y abrir solo este
                                setCommentMenuOpen({ [comment.id]: true });
                              }}
                              ref={(el) =>
                                (commentMenuRef.current[comment.id] = el)
                              }
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Menú desplegable */}
                            {commentMenuOpen[comment.id] && (
                              <div
                                className="absolute right-0 mt-1 w-36 bg-white shadow-lg rounded-md z-10 overflow-hidden comment-menu-dropdown"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Opciones para el dueño del comentario */}
                                {user &&
                                String(comment.userId) === String(user.id) ? (
                                  <>
                                    <button
                                      className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                      onClick={() => {
                                        // Cerramos el menú inmediatamente
                                        setCommentMenuOpen({});

                                        // Configuramos el estado de edición directamente sin timeouts
                                        const content = comment.content || "";

                                        // Actualizar estado directamente
                                        setEditCommentText(content);
                                        setEditingComment(comment.id);

                                        // Guardar en la referencia
                                        editingRef.current = {
                                          commentId: comment.id,
                                          content: content,
                                          isEditing: true,
                                        };
                                      }}
                                    >
                                      <Pencil size={16} className="mr-2" />
                                      Editar
                                    </button>
                                    <button
                                      className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-500"
                                      onClick={() => {
                                        // Cerramos el menú inmediatamente
                                        setCommentMenuOpen({});

                                        // Configurar el estado para mostrar el modal directamente
                                        setCommentToDelete(comment.id);

                                        // Mostrar el modal
                                        setShowDeleteCommentModal(true);
                                      }}
                                    >
                                      <Trash2 size={16} className="mr-2" />
                                      Eliminar
                                    </button>
                                  </>
                                ) : (
                                  // Opción para usuarios que no son dueños
                                  <>
                                    {/* Si es admin/moderador Y el comentario tiene reportes, mostrar "Ver reportes" */}
                                    {(roleName === "admin" ||
                                      roleName === "moderator" ||
                                      roleName === "administrador" ||
                                      roleName === "moderador") &&
                                    (comment.reportsCount > 0 ||
                                      comment.reportCount > 0) ? (
                                      <button
                                        className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-blue-600"
                                        onClick={() => {
                                          setCommentMenuOpen({});
                                          router.push(
                                            `/reports/comment/${comment.id}`,
                                          );
                                        }}
                                      >
                                        <Flag size={16} className="mr-2" />
                                        Ver reportes
                                      </button>
                                    ) : (
                                      // Usuario regular: mostrar "Reportar"
                                      <button
                                        className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-orange-500"
                                        onClick={() => {
                                          // Cerramos el menú
                                          setCommentMenuOpen({});

                                          // Verificar si ya fue reportado
                                          if (comment.hasReported) {
                                            const showToast = (payload) => {
                                              if (onShowToast) {
                                                onShowToast({
                                                  ...payload,
                                                  isVisible: true,
                                                });
                                              } else {
                                                setInternalToast({
                                                  ...payload,
                                                  isVisible: true,
                                                });
                                              }
                                            };
                                            showToast({
                                              type: "warning",
                                              message:
                                                "Ya has reportado este comentario",
                                            });
                                            return;
                                          }

                                          // Guardamos el ID del comentario a reportar
                                          setCommentToReport(comment.id);
                                          // Abrimos el modal de reporte
                                          setShowReportCommentModal(true);
                                        }}
                                      >
                                        <Flag size={16} className="mr-2" />
                                        Reportar
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Mensaje cuando no hay comentarios */}
                {allComments.length === 0 && comments.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Sé el primero en comentar esta publicación
                  </div>
                )}

                {/* Botón para expandir comentarios (cuando hay más de 2) */}
                {!showAllComments &&
                  (allComments.length > 2 ||
                    (allComments.length === 0 && comments.length > 2) ||
                    publication.commentsCount > 2) && (
                    <button
                      onClick={() => {
                        if (allComments.length === 0) {
                          loadAllComments();
                        }
                        setShowAllComments(true);
                      }}
                      className="flex items-center justify-center gap-1.5 text-gray-600 font-medium hover:underline mt-2 mb-1 mx-auto cursor-pointer"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-500"
                      >
                        <path
                          d="M8 3V13M8 13L13 8M8 13L3 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Mostrar{" "}
                      {allComments.length > 0
                        ? allComments.length - 2
                        : publication.commentsCount - 2}{" "}
                      comentarios más
                    </button>
                  )}

                {/* Botón para cargar más comentarios cuando hay paginación */}
                {showAllComments &&
                  allComments.length > 0 &&
                  commentsPagination?.hasNextPage && (
                    <div className="flex justify-center mt-4">
                      <button
                        className="px-4 py-2 bg-[#e0f0f0] text-conexia-green rounded-lg hover:bg-[#c6e3e4] transition-colors focus:outline-none font-medium"
                        onClick={loadMoreComments}
                        disabled={commentsLoading}
                      >
                        {commentsLoading
                          ? "Cargando..."
                          : "Cargar más comentarios"}
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
      <DeletePublicationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        loading={deleteLoading}
      />

      {/* Modal de confirmación para eliminar comentario (simplificado) */}
      {showDeleteCommentModal && commentToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#c6e3e4] w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="mr-4 p-2 bg-red-50 rounded-full">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-500"
                >
                  <path d="M10.29 4.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 4.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-conexia-green">
                Eliminar comentario
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este comentario? Esta acción
              no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteCommentModal(false);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 border border-[#c6e3e4] rounded-lg text-conexia-green hover:bg-[#f3f9f8]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Usar la función handleDeleteComment que ya tiene la lógica correcta
                  handleDeleteComment(commentToDelete);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar las reacciones */}
      {showReactionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-conexia-green">
                Reacciones
              </h3>
              <button
                onClick={() => setShowReactionsModal(false)}
                className="p-2 rounded-full text-conexia-green hover:bg-[#e0f0f0] focus:outline-none"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M6 6l8 8M14 6l-8 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] rounded-b-2xl">
              {/* Pestañas de tipos de reacciones */}
              <div className="flex border-b overflow-x-auto rounded-t-lg">
                <button
                  className={`px-4 py-3 font-medium flex items-center whitespace-nowrap ${selectedReactionType === "all" ? "text-conexia-green relative" : "text-gray-500 hover:bg-[#eef6f6]"}`}
                  onClick={() => loadReactions("all")}
                >
                  <span className="relative">
                    Todas{" "}
                    {publication.reactionsCount > 0 && (
                      <span className="ml-1">{publication.reactionsCount}</span>
                    )}
                    {selectedReactionType === "all" && (
                      <span className="absolute bottom-[-8px] left-0 right-0 h-[3px] bg-conexia-green rounded-full"></span>
                    )}
                  </span>
                </button>
                {reactionsSummary.map((reaction) => {
                  let emoji = "ðŸ‘";

                  switch (reaction.type) {
                    case "like":
                      emoji = "👍";
                      break;
                    case "love":
                      emoji = "❤️";
                      break;
                    case "support":
                      emoji = "🤝";
                      break;
                    case "insightful":
                      emoji = "💡";
                      break;
                    case "celebrate":
                      emoji = "🎉";
                      break;
                    case "fun":
                      emoji = "😂";
                      break;
                    default:
                      emoji = "👍";
                  }

                  return (
                    <button
                      key={reaction.type}
                      className={`px-4 py-3 font-medium flex items-center whitespace-nowrap ${selectedReactionType === reaction.type ? "text-conexia-green" : "text-gray-500 hover:bg-[#eef6f6]"}`}
                      onClick={() => loadReactions(reaction.type)}
                    >
                      <span className="relative flex items-center">
                        <span className="mr-1">{emoji}</span>
                        <span>{reaction.count}</span>
                        {selectedReactionType === reaction.type && (
                          <span className="absolute bottom-[-8px] left-0 right-0 h-[3px] bg-conexia-green rounded-full"></span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Lista de usuarios que reaccionaron - Usando datos del backend */}
              <div className="divide-y">
                {reactionsLoading ? (
                  <div className="flex justify-center items-center p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
                  </div>
                ) : reactions && reactions.length > 0 ? (
                  reactions.map((reaction, index) => {
                    let emoji = "👍";
                    switch (reaction.type) {
                      case "like":
                        emoji = "👍";
                        break;
                      case "love":
                        emoji = "❤️";
                        break;
                      case "support":
                        emoji = "🤝";
                        break;
                      case "insightful":
                        emoji = "💡";
                        break;
                      case "celebrate":
                        emoji = "🎉";
                        break;
                      case "fun":
                        emoji = "😂";
                        break;
                      default:
                        emoji = "👍";
                    }
                    return (
                      <div
                        key={reaction.id}
                        className="flex items-center px-4 py-3 hover:bg-[#f8fcfc] first:rounded-t-lg last:rounded-b-2xl"
                      >
                        <div className="relative">
                          <img
                            src={
                              reaction.user?.profilePicture
                                ? reaction.user.profilePicture.startsWith(
                                    "http",
                                  )
                                  ? reaction.user.profilePicture
                                  : `${config.IMAGE_URL}${reaction.user.profilePicture.startsWith("/") ? "" : "/"}${reaction.user.profilePicture}`
                                : "/images/default-avatar.png"
                            }
                            alt={reaction.user?.name || "Usuario"}
                            className="w-12 h-12 rounded-full object-cover border border-[#e0f0f0]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/default-avatar.png";
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-[#e0f0f0]">
                            <span className="text-sm">{emoji}</span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <span
                              className="font-semibold text-conexia-green hover:underline"
                              onClick={() =>
                                router.push(
                                  `/profile/userProfile/${reaction.user?.id}`,
                                )
                              }
                              style={{ cursor: "pointer" }}
                            >
                              {reaction.user?.name || "Usuario"}
                            </span>
                            {reaction.user?.position && (
                              <span className="ml-1 text-xs text-gray-500">
                                {reaction.user.position}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {reaction.user?.profession ||
                              reaction.user?.title ||
                              reaction.user?.role ||
                              "Miembro de CONEXIA"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex justify-center items-center p-8 rounded-b-2xl">
                    <p className="text-gray-500 text-center">
                      {selectedReactionType === "all"
                        ? "No hay reacciones en esta publicación."
                        : `No hay reacciones de tipo ${getReactionName(selectedReactionType)}.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {internalToast && (
        <Toast
          type={internalToast.type}
          message={internalToast.message}
          isVisible={internalToast.isVisible}
          onClose={() => setInternalToast(null)}
          position="top-center"
          duration={4000}
        />
      )}
    </div>
  );
}

PublicationCard.propTypes = {
  publication: PropTypes.object.isRequired,
  isGridItem: PropTypes.bool,
  onShowToast: PropTypes.func,
  sentConnectionRequests: PropTypes.instanceOf(Set),
  onConnectionRequestSent: PropTypes.func,
  onPublicationDeleted: PropTypes.func,
};

// Componente auxiliar para truncar descripción y mostrar 'ver más'

// Truncado visual por líneas usando CSS line-clamp
function DescriptionWithReadMore({ description }) {
  const [expanded, setExpanded] = React.useState(false);
  const [showButton, setShowButton] = React.useState(false);
  const textRef = React.useRef(null);

  React.useEffect(() => {
    if (!expanded && textRef.current) {
      // Detecta si el texto está truncado visualmente
      setShowButton(
        textRef.current.scrollHeight > textRef.current.clientHeight + 2,
      );
    } else {
      setShowButton(false);
    }
  }, [expanded, description]);

  return (
    <div className="relative">
      <div
        ref={textRef}
        className={
          expanded
            ? "text-conexia-green font-normal mb-2 whitespace-pre-line break-words leading-relaxed text-[1.08rem] px-5"
            : "text-conexia-green font-normal mb-2 whitespace-pre-line break-words leading-relaxed text-[1.08rem] px-5 line-clamp-2"
        }
        style={
          !expanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : {}
        }
      >
        {description}
      </div>
      {!expanded && showButton && (
        <button
          className="text-conexia-green font-semibold hover:underline focus:outline-none ml-1 absolute bottom-0 right-5 bg-white pr-2"
          style={{ fontSize: "1rem" }}
          onClick={() => setExpanded(true)}
          type="button"
        >
          ...más
        </button>
      )}
    </div>
  );
}

DescriptionWithReadMore.propTypes = {
  description: PropTypes.string.isRequired,
};

export default PublicationCard;
