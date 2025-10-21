import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'
import authService from '../api/services/authService'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const eMail = (email || '').trim()
    if (!eMail) {
      setError('Ingresa tu correo')
      return
    }
    setLoading(true)
    try {
      const res = await authService.forgotPassword(eMail)
      setSuccess(res?.message || 'Hemos enviado una contraseña temporal a tu correo. Revisa tu bandeja e inicia sesión, luego cámbiala en tu perfil.')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'No se pudo procesar la recuperación de contraseña'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 flex justify-start">
          <Button variant="secondary" onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar contraseña</h1>
        <p className="text-gray-600 mb-4">Ingresa tu correo. Te enviaremos una contraseña temporal para que puedas iniciar sesión.</p>

        {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}
        {success && <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar contraseña temporal'}
          </Button>
        </form>

      </div>
    </div>
  )
}