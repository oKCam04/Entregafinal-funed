import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import personasService from '../api/services/personaService'

export default function AdminGestionDatosDocentes() {
  const navigate = useNavigate()

  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const data = await personasService.list()
        const list = Array.isArray(data) ? data : []
        if (!active) return
        setPersonas(list)
      } catch (err) {
        console.error(err)
        setError('Error al cargar personas.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const docentes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return personas
      .filter(p => (p?.rol || '').toLowerCase() === 'docente')
      .filter(p => {
        const nombre = `${p?.nombre || ''} ${p?.apellido || ''}`.trim().toLowerCase()
        const doc = String(p?.numero_identificacion || '').toLowerCase()
        const correo = String(p?.correo || '').toLowerCase()
        return !q || nombre.includes(q) || doc.includes(q) || correo.includes(q)
      })
  }, [personas, searchTerm])

  const openEdit = (p) => {
    setCurrent({
      id: p.id,
      nombre: p.nombre || '',
      apellido: p.apellido || '',
      numero_identificacion: p.numero_identificacion || '',
      tipo_identificacion: p.tipo_identificacion || 'CC',
      fecha_nacimiento: p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toISOString().split('T')[0] : '',
      telefono: p.telefono || '',
      correo: p.correo || '',
      rol: p.rol || 'Docente',
    })
    setEditOpen(true)
    setError('')
    setSuccess('')
  }

  const closeEdit = () => { setEditOpen(false); setCurrent(null) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setCurrent((s) => ({ ...s, [name]: value }))
  }

  const savePersona = async () => {
    if (!current?.id) return
    try {
      setError('')
      setSuccess('')
      const payload = {
        nombre: current.nombre,
        apellido: current.apellido,
        numero_identificacion: current.numero_identificacion,
        tipo_identificacion: current.tipo_identificacion,
        fecha_nacimiento: current.fecha_nacimiento,
        telefono: current.telefono,
        correo: current.correo,
        rol: current.rol,
      }
      const updated = await personasService.update(current.id, payload)
      // Actualizar en memoria
      setPersonas((list) => list.map(p => p.id === current.id ? { ...p, ...updated } : p))
      setSuccess('Datos del docente actualizados correctamente.')
      setEditOpen(false)
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'No se pudo actualizar la persona.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/admin/docentes')}>← Volver</Button>
        </div>
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Gestionar Datos Docentes</h1>

        {error && <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 px-4 py-2">{error}</div>}
        {success && <div className="mb-4 rounded border border-green-300 bg-green-50 text-green-700 px-4 py-2">{success}</div>}

        <Card className="mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre, identificación o correo…" className="w-full rounded-lg border px-4 py-2" />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="text-gray-500">Cargando docentes…</div>
        ) : docentes.length === 0 ? (
          <div className="text-gray-500">No hay personas con rol Docente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Identificación</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {docentes.map((p) => (
                  <tr key={`p-${p.id}`}>
                    <td className="px-4 py-2 whitespace-nowrap">{`${p?.nombre || ''} ${p?.apellido || ''}`.trim() || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{p?.numero_identificacion || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{p?.tipo_identificacion || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{p?.telefono || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{p?.correo || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Button size="sm" onClick={() => openEdit(p)}>Editar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal open={editOpen} title="Editar datos de docente" onClose={closeEdit}>
          {current && (
            <form onSubmit={(e) => { e.preventDefault(); savePersona() }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" name="nombre" value={current.nombre} onChange={handleChange} className="w-full rounded-lg border px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input type="text" name="apellido" value={current.apellido} onChange={handleChange} className="w-full rounded-lg border px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Identificación</label>
                  <select name="tipo_identificacion" value={current.tipo_identificacion} onChange={handleChange} className="w-full rounded-lg border px-4 py-2">
                    <option value="CC">CC</option>
                    <option value="TI">TI</option>
                    <option value="CE">CE</option>
                    <option value="PAS">PAS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"># Identificación</label>
                  <input type="text" name="numero_identificacion" value={current.numero_identificacion} onChange={handleChange} className="w-full rounded-lg border px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input type="date" name="fecha_nacimiento" value={current.fecha_nacimiento} onChange={handleChange} className="w-full rounded-lg border px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" name="telefono" value={current.telefono} onChange={handleChange} className="w-full rounded-lg border px-4 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                  <input type="email" name="correo" value={current.correo} onChange={handleChange} className="w-full rounded-lg border px-4 py-2" />
                  <p className="text-xs text-gray-500 mt-1">Al cambiar el correo, también se actualizará en el usuario vinculado.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEdit}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar cambios</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  )
}