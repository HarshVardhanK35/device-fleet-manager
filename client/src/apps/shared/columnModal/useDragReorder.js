import { useState } from "react";

// Hand-rolled HTML5 drag-and-drop reorder state, extracted out of Rotating
// Notices' board list so any other repeatable-item list (e.g. Event Cards'
// up-to-3 cards) can reuse the exact same drag mechanics instead of
// re-implementing dragIndex/dragOverIndex per settings screen. Same
// underlying pattern pages/Playlists.jsx uses for its own drag-reorder.
//
// `onReorder(fromIndex, toIndex)` does the actual array move — this hook
// only owns which index is being dragged/hovered and when a drop should
// fire that callback.
export function useDragReorder(onReorder) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  function handleDrop(toIndex) {
    if (dragIndex !== null && dragIndex !== toIndex) onReorder(dragIndex, toIndex);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function dragPropsFor(index) {
    return {
      draggable: true,
      onDragStart: () => setDragIndex(index),
      onDragOver: (e) => {
        e.preventDefault();
        setDragOverIndex(index);
      },
      onDrop: () => handleDrop(index),
      onDragEnd: () => {
        setDragIndex(null);
        setDragOverIndex(null);
      },
      isDragging: dragIndex === index,
      isDragOver: dragOverIndex === index,
    };
  }

  return { dragPropsFor };
}
