import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'
import personasService from '../api/services/personaService'
import authService from '../api/services/authService'
import emailService from '../api/services/emailService'

function RegistroPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_identificacion: '',
    numero_identificacion: '',
    fechaNacimiento: '',
    email: '',
    telefono: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido'
    if (!formData.tipo_identificacion) newErrors.tipo_identificacion = 'El tipo de identificación es requerido'
    if (!formData.numero_identificacion.trim()) newErrors.numero_identificacion = 'El número de identificación es requerido'

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida'
    } else {
      const today = new Date()
      const birthDate = new Date(formData.fechaNacimiento)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
      if (age < 16) newErrors.fechaNacimiento = 'Debes tener al menos 16 años para registrarte'
    }

    if (!formData.email) newErrors.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El email no es válido'

    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // helper para encontrar el id de persona sin importar el shape
  const getIdPersonaFrom = (res) =>
    res?.idPersona ?? res?.id ?? res?.data?.idPersona ?? res?.data?.id ?? null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // 1) Crear PERSONA
    console.log("Datos capturados en formData:", formData)
      const personaPayload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipo_identificacion: formData.tipo_identificacion,
        numero_identificacion: formData.numero_identificacion,
        fecha_nacimiento: formData.fechaNacimiento,
        correo: formData.email,
        telefono: formData.telefono,
      }

      const personaRes = await personasService.create(personaPayload)
      const id_persona = getIdPersonaFrom(personaRes)
      if (!id_persona) throw new Error('No se recibió idPersona del backend')

      // 2) Registrar USUARIO (regla: contraseña = cédula)
      const registerPayload = {
        id_persona,
        email: formData.email,
        password: formData.numero_identificacion,
      }

      await authService.register(registerPayload)

      // 3) Enviar correo de bienvenida (endpoint standalone)
      try {
        await emailService.sendWelcome({
          email: formData.email,
          numero_identificacion: formData.numero_identificacion,
          nombre: formData.nombre,
        })
      } catch (emailErr) {
        // No bloquea el flujo si falla el envío de correo
        console.warn('Fallo al enviar correo de bienvenida:', emailErr?.response?.data || emailErr?.message || emailErr)
      }

      // 4) Redirigir a login
      navigate('/login')
    } catch (err) {
      console.error(err)
      setErrors({
        general:
          err?.response?.data?.message ||
          err?.message ||
          'Error al crear la cuenta. Intenta nuevamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Campos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
              </div>

              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.apellido ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.apellido && <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipo_identificacion" className="block text-sm font-medium text-gray-700">Tipo de Identificación</label>
                <select
                  id="tipo_identificacion"
                  name="tipo_identificacion"
                  value={formData.tipo_identificacion}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tipo_identificacion ? 'border-red-300' : 'border-gray-300'}`}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="CC">Cédula Nacional</option>
                  <option value="TI">Tarjeta identificación</option>
                  <option value="CE">Cédula Extranjería</option>
                </select>
                {errors.tipo_identificacion && <p className="mt-1 text-sm text-red-600">{errors.tipo_identificacion}</p>}
              </div>

              <div>
                <label htmlFor="numero_identificacion" className="block text-sm font-medium text-gray-700">Número de Identificación</label>
                <input
                  id="numero_identificacion"
                  name="numero_identificacion"
                  type="text"
                  value={formData.numero_identificacion}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.numero_identificacion ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.numero_identificacion && <p className="mt-1 text-sm text-red-600">{errors.numero_identificacion}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fechaNacimiento ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.fechaNacimiento && <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.telefono ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
            </div>

            <div>
              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegistroPage
