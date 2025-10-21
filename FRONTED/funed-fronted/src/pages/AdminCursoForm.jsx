// src/pages/AdminCursoForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import cursosService from '../api/services/cursoService'

function AdminCursoForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    nombreCurso: '',
    duracion: '',
    temario: '',
    tipoCurso: '' // 'Técnico' | 'Corto'
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCurso, setLoadingCurso] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return
    (async () => {
      setLoadingCurso(true)
      try {
        const curso = await cursosService.getById(id)
        setFormData({
          nombreCurso: curso?.nombreCurso ?? '',
          duracion: (curso?.duracion ?? '').toString(),
          temario: curso?.temario ?? '',
          tipoCurso: curso?.tipoCurso ?? ''
        })
      } catch (e) {
        console.error('Error cargando curso:', e)
        setErrors({ general: e?.response?.data?.message || 'No se pudo cargar el curso.' })
      } finally {
        setLoadingCurso(false)
      }
    })()
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.nombreCurso.trim()) newErrors.nombreCurso = 'El nombre del curso es requerido'
    const dur = Number(formData.duracion)
    if (!formData.duracion || Number.isNaN(dur) || !Number.isInteger(dur) || dur <= 0) {
      newErrors.duracion = 'La duración debe ser un entero mayor que 0'
    }
    if (!formData.tipoCurso) newErrors.tipoCurso = 'El tipo de curso es requerido'
    if (!formData.temario.trim()) newErrors.temario = 'El temario es requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload = {
        nombreCurso: formData.nombreCurso.trim(),
        duracion: parseInt(formData.duracion, 10),
        temario: formData.temario.trim(),
        tipoCurso: formData.tipoCurso // 'Técnico' | 'Corto'
      }

      if (isEditing) {
        await cursosService.update(id, payload)
      } else {
        await cursosService.create(payload)
      }

      navigate('/cursos', {
        state: { message: isEditing ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente' }
      })
    } catch (error) {
      console.error(error)
      setErrors({ general: error?.response?.data?.message || 'Error al guardar el curso. Intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingCurso) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifica los datos del curso' : 'Completa la información del nuevo curso'}
            </p>
          </div>
          <Button onClick={() => navigate('/admin')} variant="secondary">
            ← Volver a Cursos
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            {/* nombreCurso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Curso *</label>
              <input
                type="text"
                name="nombreCurso"
                value={formData.nombreCurso}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${ 
                  errors.nombreCurso ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Maquillaje Profesional"
              />
              {errors.nombreCurso && <p className="mt-1 text-sm text-red-600">{errors.nombreCurso}</p>}
            </div>

            {/* duracion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duración (horas) *</label>
              <input
                type="number"
                name="duracion"
                value={formData.duracion}
                onChange={handleChange}
                min="1"
                step="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${ 
                  errors.duracion ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: 40"
              />
              {errors.duracion && <p className="mt-1 text-sm text-red-600">{errors.duracion}</p>}
            </div>

            {/* tipoCurso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Curso *</label>
              <select
                name="tipoCurso"
                value={formData.tipoCurso}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${ 
                  errors.tipoCurso ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una opción</option>
                <option value="Técnico">Técnico</option>
                <option value="Corto">Corto</option>
              </select>
              {errors.tipoCurso && <p className="mt-1 text-sm text-red-600">{errors.tipoCurso}</p>}
            </div>

            {/* temario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temario *</label>
              <textarea
                name="temario"
                value={formData.temario}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${ 
                  errors.temario ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={'Ej:\n- Introducción\n- Técnicas básicas\n- Prácticas guiadas'}
              />
              {errors.temario && <p className="mt-1 text-sm text-red-600">{errors.temario}</p>}
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
                {isLoading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Curso' : 'Crear Curso')}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/admin')}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminCursoForm
