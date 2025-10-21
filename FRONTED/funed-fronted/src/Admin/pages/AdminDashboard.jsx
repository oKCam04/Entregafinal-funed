import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import cursosService from '../../api/services/cursoService'
import personaService from '../../api/services/personaService'
import ofertaCursoService from '../../api/services/ofertaCursoService'
import pagoService from '../../api/services/pagoService'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCursos: 0,
    totalEstudiantes: 0,
    cursosActivos: 0,
    inscripcionesRecientes: 0
  })
  const [recentPayments, setRecentPayments] = useState([])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [cursosRes, personasRes, ofertasRes, pagosRes] = await Promise.all([
          cursosService.list(),
          personaService.list(),
          ofertaCursoService.list(),
          pagoService.list(),
        ])

        const cursos = Array.isArray(cursosRes?.data) ? cursosRes.data : (Array.isArray(cursosRes) ? cursosRes : [])
        const personas = Array.isArray(personasRes?.data) ? personasRes.data : (Array.isArray(personasRes) ? personasRes : [])
        const ofertas = Array.isArray(ofertasRes?.data) ? ofertasRes.data : (Array.isArray(ofertasRes) ? ofertasRes : [])
        const pagos = Array.isArray(pagosRes?.data) ? pagosRes.data : (Array.isArray(pagosRes) ? pagosRes : [])

        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const totalCursos = cursos.length
        const totalEstudiantes = personas.filter(p => (p?.rol || '').toLowerCase() === 'estudiante').length

        const cursosActivos = ofertas.filter(o => {
          const inicio = o?.fecha_inicio_curso ? new Date(o.fecha_inicio_curso) : null
          const fin = o?.fecha_fin_curso ? new Date(o.fecha_fin_curso) : null
          if (!inicio) return false
          const started = inicio <= now
          const notFinished = !fin || fin >= now
          return started && notFinished
        }).length

        const inscripcionesRecientes = pagos.filter(p => {
          const fp = p?.fecha_pago ? new Date(p.fecha_pago) : null
          return fp && fp >= sevenDaysAgo
        }).length

        setStats({ totalCursos, totalEstudiantes, cursosActivos, inscripcionesRecientes })

        // Actividad reciente: últimos 5 pagos por fecha
        const sorted = [...pagos]
          .map(p => ({
            id: p?.id ?? p?.id_pago ?? Math.random(),
            sourceId: p?.id ?? p?.id_pago ?? p?.pago_id ?? null,
            fecha: p?.fecha_pago || p?.fecha || p?.created_at,
            curso:
              p?.cursoMatriculado?.curso?.curso?.nombre_curso ||
              p?.cursoMatriculado?.curso?.nombre_curso ||
              p?.curso?.nombre_curso ||
              p?.curso || '—',
          }))
          .filter(p => !!p.fecha)
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5)

        setRecentPayments(sorted)
      } catch (error) {
        console.error('Error cargando estadísticas admin:', error)
      }
    }
    loadStats()
  }, [])

  const quickActions = [
    {
      title: 'Gestionar Cursos',
      description: 'Crear, editar y eliminar cursos',
      link: '/admin/gestionar-cursos',
      icon: '📚',
      color: 'bg-blue-500'
    },
    {
      title: 'Inscripciones',
      description: 'Gestionar inscripciones a cursos',
      link: '/admin/inscripciones',
      icon: '📋',
      color: 'bg-purple-500'
    },
    {
      title: 'Ver Estudiantes',
      description: 'Administrar usuarios registrados',
      link: '/admin/estudiantes',
      icon: '👥',
      color: 'bg-green-500'
    },
    // Reportes eliminado según solicitud
  ]

  const relativeTime = (dateString) => {
    const d = new Date(dateString)
    const diffMs = Date.now() - d.getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'Hace un momento'
    if (mins < 60) return `Hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `Hace ${hrs} hora${hrs === 1 ? '' : 's'}`
    const days = Math.floor(hrs / 24)
    return `Hace ${days} día${days === 1 ? '' : 's'}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Bienvenido al sistema de gestión de Academia FUNED
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                📚
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cursos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCursos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                👥
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEstudiantes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                ✅
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cursosActivos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                📈
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inscripciones Recientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inscripcionesRecientes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white text-xl mr-3`}>
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Actividad Reciente
              </h2>
              <div className="space-y-3">
                {recentPayments.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between border border-blue-100 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-gray-900">Pago curso {pago.curso}</p>
                      <p className="text-xs text-gray-400 mt-1">{relativeTime(pago.fecha)}</p>
                    </div>
                    <Link to={pago.sourceId ? `/admin/pagos/${pago.sourceId}` : '/admin/pagos'}>
                      <Button>Revisar</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Course Management */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Gestión Rápida de Cursos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to="/admin/cursos">
              <Button className="w-full" variant="primary">+ Gestionar Cursos</Button>
            </Link>
            <Link to="/admin/inscripciones">
              <Button className="w-full" variant="primary">+ Inscripciones</Button>
            </Link>
            <Link to="/admin/modulos">
              <Button className="w-full">+ Gestionar Módulos</Button>
            </Link>
            <Link to="/admin/docentes">
              <Button className="w-full">+ Gestionar Docentes</Button>
            </Link>
            <Link to="/admin/oferta-cursos">
              <Button className="w-full">+ Gestionar Ofertas</Button>
            </Link>
            <Link to="/admin/estudiantes">
              <Button className="w-full">+ Gestionar Estudiantes</Button>
            </Link>
            <Link to="/admin/pagos">
              <Button className="w-full" variant="success">+ Gestionar Pagos</Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard
