import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-700 mb-4">Página no encontrada</p>
        <p className="text-gray-500 mb-6">La ruta ingresada no existe. Puedes regresar al inicio.</p>
        <div className="flex justify-center">
          <Button variant="primary" onClick={() => navigate('/')}>Ir al inicio</Button>
        </div>
      </div>
    </div>
  )
}