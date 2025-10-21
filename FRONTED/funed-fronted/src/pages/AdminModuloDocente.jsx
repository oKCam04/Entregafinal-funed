import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'

function AdminModuloDocente() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>← Volver</Button>
        </div>

        <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">Módulo Docente</h1>

        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Gestión de Módulo-Docente</h2>
          <p className="text-gray-600">Aquí podrás vincular docentes a módulos, editar y eliminar asignaciones. Próximamente…</p>
        </Card>
      </div>
    </div>
  )
}

export default AdminModuloDocente