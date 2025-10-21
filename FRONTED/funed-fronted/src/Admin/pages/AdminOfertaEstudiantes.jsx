import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ofertaCursoService from '../../api/services/ofertaCursoService'
import personasService from '../../api/services/personaService'

export default function AdminOfertaEstudiantes() {
  const { id } = useParams()

  const [oferta, setOferta] = useState(null)
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const [ofertaData, personasData] = await Promise.all([
          ofertaCursoService.getById(id),
          personasService.listActivosByOferta(id),
        ])
        const ofertaObj = ofertaData?.data || ofertaData
        const list = Array.isArray(personasData) ? personasData : []
        if (!active) return
        setOferta(ofertaObj)
        setEstudiantes(list)
      } catch (err) {
        console.error(err)
        setError(err?.response?.data?.message || 'Error al cargar estudiantes activos de la oferta.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id])

  const titulo = oferta?.curso?.nombre_curso || 'Curso'
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return estudiantes.filter((e) => {
      const nombre = `${e?.nombre || ''} ${e?.apellido || ''}`.trim().toLowerCase()
      const doc = String(e?.numero_identificacion || '').toLowerCase()
      const correo = String(e?.correo || '').toLowerCase()
      return !q || nombre.includes(q) || doc.includes(q) || correo.includes(q)
    })
  }, [searchTerm, estudiantes])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center gap-2">
          <Link to="/admin/inscripciones"><Button variant="outline">← Volver</Button></Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{titulo}</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mt-3">
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500"><path d="M4 19h16M4 8h16M4 13h16"/></svg>
                {Array.isArray(estudiantes) ? estudiantes.length : 0} estudiantes activos
              </span>
            </div>
          </div>
        </div>

        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Listado de Estudiantes</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por nombre, identificación o correo…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading && <div className="text-gray-500">Cargando estudiantes…</div>}
          {error && <div className="rounded border border-red-300 bg-red-50 text-red-700 px-4 py-3">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-gray-500">No hay estudiantes activos para esta oferta.</div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Identificación</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((e) => (
                    <tr key={`est-${e.id}`}>
                      <td className="px-4 py-2 whitespace-nowrap">{`${e?.nombre || ''} ${e?.apellido || ''}`.trim() || '—'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{e?.numero_identificacion ?? e?.numeroIdentificacion ?? '—'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{e?.tipo_identificacion ?? e?.tipoIdentificacion ?? '—'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{e?.correo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}