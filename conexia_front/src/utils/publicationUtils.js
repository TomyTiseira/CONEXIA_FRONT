// Añadir una función para cerrar la sección de comentarios de una publicación específica
export function closePublicationComments(publicationId) {
  const cardElement = document.getElementById(`pub-${publicationId}`);
  if (cardElement) {
    cardElement.classList.remove('publication-card-open');
    cardElement.setAttribute('data-comment-open', 'false');
  }
}

// Función para cerrar todas las secciones de comentarios excepto la especificada
export function closeAllPublicationCommentsExcept(exceptPublicationId) {
  document.querySelectorAll('.publication-card-open').forEach(card => {
    if (card.id !== `pub-${exceptPublicationId}`) {
      card.classList.remove('publication-card-open');
      card.setAttribute('data-comment-open', 'false');
    }
  });
}
