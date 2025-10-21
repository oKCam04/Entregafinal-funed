import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import Button from '../components/Button'
import ofertaCursoService from '../api/services/ofertaCursoService'
import { useAuth } from '../auth/AuthContext'
import cursoMatriculadoService from '../api/services/cursoMatriculadoService'

function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const [oferta, setOferta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkingEnrollment, setCheckingEnrollment] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  const ofertaId = Number(id)

  const formatCOP = (v) =>
    typeof v === 'number'
      ? v.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0,
        })
      : 'Consultar'

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const ofertaData = await ofertaCursoService.getById(ofertaId)
        if (!mounted) return
        setOferta(ofertaData)
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || err.message)
      } finally {
        mounted && setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [ofertaId])

  // Verificar si el usuario ya está inscrito en esta oferta
  useEffect(() => {
    let active = true
    const token = localStorage.getItem('token')
    const idPersona = usuario?.idPersona
    if (!token || !idPersona || !ofertaId) return
    setCheckingEnrollment(true)
    ;(async () => {
      try {
        const res = await cursoMatriculadoService.getForPerson(idPersona)
        // Se espera estructura { mensaje, cursos: [...] }
        const cursos = Array.isArray(res?.cursos) ? res.cursos : Array.isArray(res) ? res : []
        const found = cursos.some((c) => Number(c?.idOferta) === Number(ofertaId))
        if (active) setIsEnrolled(found)
      } catch (err) {
        console.warn('No se pudo verificar inscripción previa:', err)
      } finally {
        active && setCheckingEnrollment(false)
      }
    })()
    return () => { active = false }
  }, [usuario?.idPersona, ofertaId])

  // Datos principales
  const titulo = oferta?.curso?.nombre_curso || 'Curso'

  const precio = useMemo(() => {
    if (!oferta?.precio) return 'Consultar'
    const numericPrice = parseFloat(oferta.precio)
    if (isNaN(numericPrice)) return 'Consultar'
    return formatCOP(numericPrice)
  }, [oferta])

  const nivel = oferta?.curso?.tipo_curso || '—'
  const duracion = oferta?.curso?.duracion
    ? `${oferta.curso.duracion} horas`
    : '—'
  const modalidad = oferta?.modalidad || 'Presencial'
  const horarios = oferta?.horario ? [oferta.horario] : []
  const certificacion =
    oferta?.curso?.certificacion || `Certificado ${titulo} FUNED`

  const temarioLista = useMemo(() => {
    if (Array.isArray(oferta?.curso?.temario)) return oferta.curso.temario
    if (typeof oferta?.curso?.temario === 'string') {
      return oferta.curso.temario
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    }
    return []
  }, [oferta])

  const instructor =
    oferta?.docentes?.persona?.nombre ||
    (oferta?.id_docente ? `Docente #${oferta.id_docente}` : 'Por confirmar')

  const descripcionCompleta =
    oferta?.curso?.descripcion_completa ||
    'Información del curso próximamente disponible.'

  const handleInscribirse = () => {
    const token = localStorage.getItem('token')
    if (!token) return setShowLoginModal(true)
    if (isEnrolled) {
      alert('Ya estás inscrito en este curso. Te llevamos a la lista de cursos.')
      return navigate('/cursos')
    }
    navigate(`/pago/curso/${oferta?.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">Cargando…</div>
      </div>
    )
  }

  if (error || !oferta) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {error ? 'Error' : 'Curso no encontrado'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'No existe la oferta solicitada.'}
          </p>
          <Button onClick={() => navigate('/cursos')} variant="primary">
            Volver a cursos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <button onClick={() => navigate('/')} className="hover:text-blue-600">
                Inicio
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => navigate('/cursos')} className="hover:text-blue-600">
                Cursos
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{titulo}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={
                  oferta?.foto ||
                  `https://via.placeholder.com/1200x600/1e40af/FFFFFF?text=${encodeURIComponent(
                    titulo
                  )}`
                }
                alt={titulo}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {oferta?.curso?.categoria || 'formación'}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {modalidad}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {nivel}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{titulo}</h1>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {descripcionCompleta}
                </p>

                {/* Instructor */}
                {/* <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Instructor</h3>
                  <p className="text-gray-700">{instructor}</p>
                </div> */}

                {/* Temario */}
                {temarioLista.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Temario del Curso
                    </h3>
                    <ul className="space-y-2">
                      {temarioLista.map((tema, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-6 h-6 mr-3 mt-0.5 flex items-center justify-center rounded-full text-sm font-medium bg-blue-500 text-white">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{tema}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">{duracion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modalidad:</span>
                  <span className="font-medium">{modalidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-medium">{nivel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inicio:</span>
                  <span className="font-medium">
                    {oferta?.fecha_inicio_curso
                      ? new Date(oferta.fecha_inicio_curso).toLocaleDateString()
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fin:</span>
                  <span className="font-medium">
                    {oferta?.fecha_fin_curso
                      ? new Date(oferta.fecha_fin_curso).toLocaleDateString()
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cupos:</span>
                  <span className="font-medium">{oferta?.cupos ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-medium">{oferta?.codigo_curso ?? '—'}</span>
                </div>
              </div>

              {horarios.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Horarios:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {horarios.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{precio}</div>
                <p className="text-gray-600">Precio del curso</p>
              </div>

              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Certificación:</strong> {certificacion}
                </p>
              </div>

              <Button onClick={handleInscribirse} variant="primary" className="w-full mb-3" disabled={checkingEnrollment || isEnrolled}>
                {isEnrolled ? 'Ya inscrito' : (checkingEnrollment ? 'Verificando…' : 'Inscribirse Ahora')}
              </Button>
              {isEnrolled && (
                <p className="text-sm text-green-700 text-center mb-3">Ya estás inscrito en esta oferta.</p>
              )}
              <Button onClick={() => navigate('/cursos')} variant="secondary" className="w-full">
                Volver a Cursos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Iniciar Sesión</h3>
            <p className="text-gray-600 mb-4">
              Para inscribirte en este curso, necesitas iniciar sesión o crear una cuenta.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowLoginModal(false)
                  navigate('/login')
                }}
                variant="primary"
                className="flex-1"
              >
                Iniciar Sesión
              </Button>
              <Button
                onClick={() => {
                  setShowLoginModal(false)
                  navigate('/registro')
                }}
                variant="secondary"
                className="flex-1"
              >
                Registrarse
              </Button>
            </div>
            <Button
              onClick={() => setShowLoginModal(false)}
              variant="secondary"
              className="w-full mt-3"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseDetailPage
