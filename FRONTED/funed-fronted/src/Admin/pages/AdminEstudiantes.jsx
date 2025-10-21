import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import personasService from '../../api/services/personaService'
import Modal from '../../components/Modal'

export default function AdminEstudiantes() {
  const navigate = useNavigate()
  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Edición
  const [editOpen, setEditOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [editForm, setEditForm] = useState({
    id: null,
    nombre: '',
    apellido: '',
    tipo_identificacion: 'CC',
    numero_identificacion: '',
    fecha_nacimiento: '',
    correo: '',
    telefono: '',
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const data = await personasService.list()
        const list = Array.isArray(data) ? data : data?.personas || []
        const estudiantes = list.filter(p => (p?.rol || '').toLowerCase() === 'estudiante')
        active && setPersonas(estudiantes)
      } catch (e) {
        active && setError(e?.response?.data?.message || e.message || 'Error cargando estudiantes')
      } finally {
        active && setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return personas
    return personas.filter(p =>
      (p?.nombre || '').toLowerCase().includes(q) ||
      (p?.apellido || '').toLowerCase().includes(q) ||
      String(p?.numero_identificacion || '').toLowerCase().includes(q) ||
      (p?.correo || '').toLowerCase().includes(q)
    )
  }, [personas, search])

  const openEdit = (p) => {
    setEditError('')
    setEditSuccess('')
    setEditForm({
      id: p?.id ?? p?.id_persona ?? p?.persona_id ?? null,
      nombre: p?.nombre ?? '',
      apellido: p?.apellido ?? '',
      tipo_identificacion: p?.tipo_identificacion ?? 'CC',
      numero_identificacion: p?.numero_identificacion ?? '',
      fecha_nacimiento: p?.fecha_nacimiento ? new Date(p.fecha_nacimiento).toISOString().slice(0, 10) : '',
      correo: p?.correo ?? '',
      telefono: p?.telefono ?? '',
    })
    setEditOpen(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((s) => ({ ...s, [name]: value }))
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setEditSaving(true)
    setEditError('')
    setEditSuccess('')
    try {
      const id = editForm.id
      if (!id) throw new Error('No se encontró el ID de la persona')
      const payload = {
        nombre: editForm.nombre,
        apellido: editForm.apellido,
        // Usar nombres canónicos del modelo
        tipo_identificacion: editForm.tipo_identificacion,
        numero_identificacion: editForm.numero_identificacion,
        fecha_nacimiento: editForm.fecha_nacimiento || null,
        correo: editForm.correo,
        telefono: editForm.telefono,
      }
      console.log('[AdminEstudiantes] Enviando PATCH persona', { id, payload })
      const res = await personasService.update(id, payload)
      console.log('[AdminEstudiantes] Respuesta PATCH persona', res)
      const updated = res?.persona || res || payload
      setPersonas((list) => list.map(px => {
        const pid = px?.id ?? px?.id_persona ?? px?.persona_id
        return String(pid) === String(id) ? { ...px, ...updated } : px
      }))
      setEditSuccess('Estudiante actualizado correctamente')
      setEditOpen(false)
    } catch (err) {
      setEditError(err?.response?.data?.message || err.message || 'No se pudo actualizar el estudiante')
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(-1)}>&larr; Volver</Button>
          <h1 className="text-2xl font-semibold">Estudiantes</h1>
        </div>
        <Button onClick={() => setSearch('')} className="shadow-sm">+ Limpiar Filtro</Button>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, apellido, cédula o correo"
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <p>Cargando estudiantes...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># identificación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No hay estudiantes para mostrar</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{p.nombre}</td>
                    <td className="px-4 py-2">{p.apellido}</td>
                    <td className="px-4 py-2">{p.tipo_identificacion}</td>
                    <td className="px-4 py-2">{p.numero_identificacion}</td>
                    <td className="px-4 py-2">{p.correo}</td>
                    <td className="px-4 py-2">{p.telefono}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal editar persona */}
      <Modal open={editOpen} title="Editar estudiante" onClose={() => setEditOpen(false)}>
        <form onSubmit={saveEdit} className="space-y-4">
          {editError && <div className="rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2">{editError}</div>}
          {editSuccess && <div className="rounded border border-green-300 bg-green-50 text-green-700 px-3 py-2">{editSuccess}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600">Nombre</label>
              <input name="nombre" value={editForm.nombre} onChange={handleEditChange} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Apellido</label>
              <input name="apellido" value={editForm.apellido} onChange={handleEditChange} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Tipo de identificación</label>
              <select name="tipo_identificacion" value={editForm.tipo_identificacion} onChange={handleEditChange} className="w-full border rounded-md px-3 py-2">
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Número de identificación</label>
              <input name="numero_identificacion" value={editForm.numero_identificacion} onChange={handleEditChange} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Fecha de nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={editForm.fecha_nacimiento || ''} onChange={handleEditChange} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Correo</label>
              <input type="email" name="correo" value={editForm.correo} onChange={handleEditChange} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Teléfono</label>
              <input name="telefono" value={editForm.telefono} onChange={handleEditChange} className="w-full border rounded-md px-3 py-2" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={editSaving}>{editSaving ? 'Guardando…' : '+ Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}