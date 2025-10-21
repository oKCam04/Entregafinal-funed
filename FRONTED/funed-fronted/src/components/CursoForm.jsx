import React, { useState } from 'react';

const CursoForm = ({ onSubmit, curso }) => {
  const [titulo, setTitulo] = useState(curso ? curso.titulo : '');
  const [descripcion, setDescripcion] = useState(curso ? curso.descripcion : '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!titulo || !descripcion) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setError('');
    onSubmit({ titulo, descripcion });
    setTitulo('');
    setDescripcion('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Título:</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>
      <div>
        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">{curso ? 'Actualizar Curso' : 'Crear Curso'}</button>
    </form>
  );
};

export default CursoForm;