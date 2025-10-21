import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import ofertaCursoService from '../../api/services/ofertaCursoService'
import cursosService from '../../api/services/cursoService'
// métricas eliminadas: no se requieren servicios de estudiantes/módulos aquí

function AdminInscripciones() {
  const navigate = useNavigate()
  const [ofertas, setOfertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos') // Todos | Activo | Terminado | Inactivo
  const [tipoFilter, setTipoFilter] = useState('Todos') // Todos | Técnico | Corto
  const [courseTypeById, setCourseTypeById] = useState({})
  

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await ofertaCursoService.list()
        active && setOfertas(Array.isArray(data) ? data : [])
      } catch (err) {
        active && setError('Error al cargar ofertas')
      } finally {
        active && setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  // Cargar cursos para obtener tipo_curso (Técnico/Corto)
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const cursos = await cursosService.list().catch(() => [])
        const map = {}
        for (const c of Array.isArray(cursos) ? cursos : []) {
          const id = c?.id
          const tipo = c?.tipo_curso ?? c?.tipoCurso
          if (id) map[id] = tipo || ''
        }
        active && setCourseTypeById(map)
      } catch {
        active && setCourseTypeById({})
      }
    })()
    return () => { active = false }
  }, [])

  // métricas eliminadas: no se calcula conteo de estudiantes/módulos

  // Estado igual a Gestionar Cursos (Activo, Terminado, Inactivo)
  const getOfferStatus = (oferta) => {
    const now = new Date()
    const inicio = oferta?.fecha_inicio_curso ? new Date(oferta.fecha_inicio_curso) : null
    const fin = oferta?.fecha_fin_curso ? new Date(oferta.fecha_fin_curso) : null
    if (!inicio) return 'Inactivo'
    const started = inicio <= now
    const finished = !!fin && fin < now
    if (started && !finished) return 'Activo'
    if (finished) return 'Terminado'
    return 'Inactivo'
  }

  // Normalizador para comparar tipos (elimina acentos)
  const normalize = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Filtro por estado y tipo de curso
  const filtered = useMemo(() => {
    const list = Array.isArray(ofertas) ? ofertas : []
    return list.filter((o) => {
      const statusOk = statusFilter === 'Todos' || getOfferStatus(o) === statusFilter
      const tipoReal = o?.curso?.tipo_curso ?? courseTypeById[o?.id_curso] ?? ''
      const tipoNorm = normalize(tipoReal)
      const tipoTarget = tipoFilter === 'Todos' ? 'todos' : normalize(tipoFilter)
      const tipoOk = tipoFilter === 'Todos' || tipoNorm === tipoTarget
      return statusOk && tipoOk
    })
  }, [ofertas, statusFilter, tipoFilter, courseTypeById])

  // métricas eliminadas

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Volver */}
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>← Volver</Button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Inscripciones</h1>
            <p className="text-gray-600 mt-2">Acceso rápido a estudiantes inscritos por oferta</p>
          </div>
        </div>

        {/* métricas superiores eliminadas */}

        {/* Lista de Cursos - mismo diseño que Gestionar Cursos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Lista de Cursos</h2>
          </div>
          <div className="p-4">
            {/* Filtros de estado */}
            <div className="flex flex-wrap gap-2 mb-4">
              {["Todos", "Activo", "Terminado", "Inactivo"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${
                    statusFilter === s
                      ? s === 'Activo'
                        ? 'bg-green-600 text-white border-green-600'
                        : s === 'Terminado'
                          ? 'bg-red-600 text-white border-red-600'
                          : s === 'Inactivo'
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Filtros por tipo de curso */}
            <div className="flex flex-wrap gap-2 mb-4">
              {["Todos", "Técnico", "Corto"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipoFilter(t)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${
                    tipoFilter === t
                      ? t === 'Técnico'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {loading && (
              <div className="text-gray-500">Cargando ofertas…</div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="text-gray-500">No hay ofertas disponibles.</div>
            )}

            {!loading && filtered.map((o) => (
              <div key={o.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm mb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{o?.curso?.nombre_curso || 'Curso'}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          getOfferStatus(o) === 'Activo'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : getOfferStatus(o) === 'Terminado'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {getOfferStatus(o)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
                      <span className="inline-flex items-center gap-2">Código: {o?.codigo_curso ?? '—'}</span>
                      <span className="inline-flex items-center gap-2">Tipo: {o?.curso?.tipo_curso ?? courseTypeById[o?.id_curso] ?? '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/cursos/${o.id}/estudiantes`}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                      >
                        <span>☰</span>
                        Ver Estudiantes
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminInscripciones