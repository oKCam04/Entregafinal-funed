import React from 'react';

const CursoItem = ({ curso, onEdit, onDelete }) => {
  return (
    <div className="curso-item">
      <h3>{curso.titulo}</h3>
      <p>{curso.descripcion}</p>
      <button onClick={() => onEdit(curso.id)}>Editar</button>
      <button onClick={() => onDelete(curso.id)}>Eliminar</button>
    </div>
  );
};

export default CursoItem;