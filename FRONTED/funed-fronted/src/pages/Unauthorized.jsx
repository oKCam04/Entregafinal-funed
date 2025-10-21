import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso no autorizado</h1>
        <p className="text-gray-600 mb-6">No tienes permisos para acceder a esta sección.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/')}>Ir al inicio</Button>
          <Button variant="primary" onClick={() => navigate('/login')}>Iniciar sesión</Button>
        </div>
      </div>
    </div>
  )
}