import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import moduloService from '../api/services/moduloService'

function AdminModulos() {
  const navigate = useNavigate()

  // estado principal
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // búsqueda
  const [searchTerm, setSearchTerm] = useState('')

  // formulario
  const [formData, setFormData] = useState({ id: null, nombre: '' })
  const [editOpen, setEditOpen] = useState(false)

  // cargar módulos
  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await moduloService.list()
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.modulos) ? data.modulos : [])
        setModulos(arr)
      } catch (err) {
        console.error(err)
        setError(err?.response?.data?.message || 'Error al cargar módulos.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // filtro local
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return modulos.filter(m => !q || (m?.nombre || '').toLowerCase().includes(q))
  }, [modulos, searchTerm])

  // handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(s => ({ ...s, [name]: value }))
  }

  const resetForm = () => {
    setFormData({ id: null, nombre: '' })
    setEditOpen(false)
  }

  const validate = () => {
    const nombre = (formData.nombre || '').trim()
    if (!nombre) return 'El nombre es obligatorio.'
    if (nombre.length < 2) return 'El nombre debe tener al menos 2 caracteres.'
    return ''
  }

  const saveModulo = async () => {
    const vErr = validate()
    if (vErr) { setError(vErr); return }

    try {
      setError(''); setSuccess('')
      const payload = { nombre: formData.nombre.trim() }

      if (!formData.id) {
        // crear
        const created = await moduloService.create(payload)
        const obj = created?.modulo || created // backend puede devolver {modulo}
        setModulos(prev => [obj, ...prev])
        setSuccess('Módulo creado correctamente.')
      } else {
        // actualizar
        const updated = await moduloService.update(formData.id, payload)
        const obj = updated?.modulo || updated
        setModulos(prev => prev.map(m => m.id === formData.id ? { ...m, ...obj } : m))
        setSuccess('Módulo actualizado correctamente.')
      }

      resetForm()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'No se pudo guardar el módulo.')
    }
  }

  const handleEdit = (id) => {
    const m = modulos.find(x => x.id === id)
    if (!m) return
    setFormData({ id: m.id, nombre: m.nombre || '' })
    setEditOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este módulo?')) return
    try {
      setError(''); setSuccess('')
      await moduloService.remove(id)
      setModulos(prev => prev.filter(m => m.id !== id))
      setSuccess('Módulo eliminado correctamente.')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'No se pudo eliminar el módulo.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>← Volver</Button>
        </div>

        <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">Administración de Módulos</h1>

        {error && (
          <div className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-6 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">{success}</div>
        )}

        {/* Crear nuevo módulo */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Crear nuevo módulo</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveModulo() }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del módulo *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Módulo 1 - Fundamentos"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary">Crear módulo</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Limpiar</Button>
            </div>
          </form>
        </Card>

        {/* Filtros y listado */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestionar módulos existentes</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Nombre del módulo"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-500">Cargando módulos…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500">No hay módulos para mostrar.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((m) => (
                <Card key={m.id} className="transition-shadow hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{m.nombre}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => handleEdit(m.id)}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(m.id)}>Eliminar</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Modal edición */}
        <Modal open={editOpen} title="Editar módulo" onClose={resetForm}>
          <form onSubmit={(e) => { e.preventDefault(); saveModulo() }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del módulo *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar cambios</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default AdminModulos