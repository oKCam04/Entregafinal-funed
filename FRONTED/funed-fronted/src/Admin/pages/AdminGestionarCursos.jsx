import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import ofertaCursoService from '../../api/services/ofertaCursoService'
import moduloService from '../../api/services/moduloService'
import cursoMatriculadoService from '../../api/services/cursoMatriculadoService'

export default function AdminGestionarCursos() {
  const navigate = useNavigate()

  // Ofertas desde API
  const [ofertas, setOfertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('Todos') // Todos | Activo | Terminado | Inactivo
  const [metrics, setMetrics] = useState({})

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const ofertasRes = await ofertaCursoService.list()
        if (!active) return
        const ofertas = Array.isArray(ofertasRes?.data) ? ofertasRes.data : (Array.isArray(ofertasRes) ? ofertasRes : [])
        setOfertas(ofertas)
      } catch (e) {
        active && setError(e?.response?.data?.message || e.message)
      } finally {
        active && setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Cargar métricas (estudiantes y módulos) por oferta
  useEffect(() => {
    let active = true
    async function loadMetrics() {
      try {
        if (!ofertas || ofertas.length === 0) {
          active && setMetrics({})
          return
        }
        // 1) Todas las matrículas para contar estudiantes por oferta (Activo/Preinscrito)
        const matriculas = await cursoMatriculadoService.list().catch(() => [])
        const allowed = new Set(['Activo', 'Preinscrito'])
        const studentsByOferta = {}
        if (Array.isArray(matriculas)) {
          for (const m of matriculas) {
            const ofertaId = m?.id_curso_oferta ?? m?.idCursoOferta ?? m?.id_oferta_curso
            const estado = m?.estado
            if (!ofertaId) continue
            if (!estado || !allowed.has(estado)) continue
            studentsByOferta[ofertaId] = (studentsByOferta[ofertaId] || 0) + 1
          }
        }

        // 2) Módulos por oferta (petición por cada oferta)
        const modulesPairs = await Promise.all(
          ofertas.map((o) =>
            moduloService
              .listByOfertaCurso(o.id)
              .then((mods) => ({ id: o.id, count: Array.isArray(mods) ? mods.length : 0 }))
              .catch(() => ({ id: o.id, count: 0 }))
          )
        )
        const modulesByOferta = {}
        for (const r of modulesPairs) modulesByOferta[r.id] = r.count

        const merged = {}
        for (const o of ofertas) {
          merged[o.id] = {
            studentsCount: studentsByOferta[o.id] || 0,
            modulesCount: modulesByOferta[o.id] || 0,
          }
        }
        active && setMetrics(merged)
      } catch (err) {
        // silencioso para no romper la UI
        active && setMetrics({})
      }
    }
    loadMetrics()
    return () => {
      active = false
    }
  }, [ofertas])


  const getOfferStatus = (o) => {
    const now = new Date()
    const inicio = o?.fecha_inicio_curso ? new Date(o.fecha_inicio_curso) : null
    const fin = o?.fecha_fin_curso ? new Date(o.fecha_fin_curso) : null
    if (!inicio) return 'Inactivo'
    const started = inicio <= now
    const finished = !!fin && fin < now
    if (started && !finished) return 'Activo'
    if (finished) return 'Terminado'
    return 'Inactivo'
  }

  const filteredOfertas = (Array.isArray(ofertas) ? ofertas : []).filter((o) => {
    if (statusFilter === 'Todos') return true
    return getOfferStatus(o) === statusFilter
  })

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">

        {/* Volver arriba */}
        <div className="mb-3">
          <Button variant="outline" onClick={() => navigate('/admin')}>← Volver</Button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Gestionar Cursos</h1>
            <p className="text-gray-600 mt-2">Administra los cursos, módulos y profesores asignados</p>
          </div>
        </div>

        {/* Métricas resumidas - diseño y orden solicitado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Cursos */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Total Cursos</div>
              <div className="text-blue-600">
                <span className="text-2xl">📘</span>
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{Array.isArray(ofertas) ? ofertas.length : 0}</div>
          </div>

          {/* Cursos Activos */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Cursos Activos</div>
              <span className="h-5 w-5 inline-flex items-center justify-center rounded-full bg-green-500/80 ring-4 ring-green-100" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{Array.isArray(ofertas) ? ofertas.filter((o) => getOfferStatus(o) === 'Activo').length : 0}</div>
          </div>

          {/* Total Estudiantes */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Total Estudiantes</div>
              <div className="text-orange-600">
                <span className="text-2xl">👤</span>
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{Object.values(metrics || {}).reduce((sum, m) => sum + (m?.studentsCount || 0), 0)}</div>
          </div>

          {/* Total Módulos */}
          <div className="bg-white rounded-xl shadow-sm border border-fuchsia-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Total Módulos</div>
              <div className="text-fuchsia-600">
                <span className="text-2xl">📑</span>
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{Object.values(metrics || {}).reduce((sum, m) => sum + (m?.modulesCount || 0), 0)}</div>
          </div>
        </div>

        {/* Lista de Cursos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Lista de Cursos</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Filtro por estado */}
            <div className="flex flex-wrap items-center gap-2">
              {['Todos','Activo','Terminado','Inactivo'].map((s) => (
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
            {loading && (
              <div className="text-gray-500">Cargando ofertas…</div>
            )}
            {error && (
              <div className="rounded border border-red-300 bg-red-50 text-red-700 px-4 py-3">
                {error}
              </div>
            )}
            {!loading && !error && filteredOfertas.length === 0 && (
              <div className="text-gray-500">No hay ofertas disponibles.</div>
            )}
            {!loading && !error && filteredOfertas.map((o) => (
              <div key={o.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
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
                    {/* Descripción con métricas */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
                      <span className="inline-flex items-center gap-2">Código: {o?.codigo_curso ?? '—'}</span>
                      <span className="inline-flex items-center gap-2">{metrics[o.id]?.modulesCount ?? 0} módulos</span>
                      <span className="inline-flex items-center gap-2">{metrics[o.id]?.studentsCount ?? 0} estudiantes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/cursos/${o.id}/modulos`}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 19h16M4 8h16M4 13h16"/></svg>
                        <span>Ver Módulos</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}