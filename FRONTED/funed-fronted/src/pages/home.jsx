import Card from '../components/Card'
import FunedLogo from '../components/FunedLogo'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-20">
        <div className="container mx-auto text-center px-4">
          <div className="flex justify-center mb-8">
            <FunedLogo 
              size="2xl" 
              showBackground={true}
              backgroundSize="large"
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4">Academia de Belleza Funed</h1>
          <p className="text-xl mb-8">Tu centro de formación profesional en belleza y estética</p>
          <p className="text-lg mb-8 text-blue-200">Educación a tu Alcance</p>
          <button onClick={() => navigate('/cursos')} className="bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
            Descubre Nuestros Cursos
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          ¿Por qué elegir nuestra academia?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card 
            title="Formación Profesional"
            description="Cursos certificados con las últimas técnicas y tendencias en belleza y estética."
            className="text-center"
          >
            <div className="text-4xl mb-4">💄</div>
          </Card>

          <Card 
            title="Práctica Intensiva"
            description="Aprende con práctica real en nuestro salón escuela equipado con tecnología de vanguardia."
            className="text-center"
          >
            <div className="text-4xl mb-4">✨</div>
          </Card>

          <Card 
            title="Certificaciones Reconocidas"
            description="Obtén certificados profesionales que te abrirán las puertas en el mundo de la belleza."
            className="text-center"
          >
            <div className="text-4xl mb-4">🏆</div>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-800 mb-2">500+</div>
              <div className="text-gray-600">Estudiantes Graduados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-800 mb-2">15+</div>
              <div className="text-gray-600">Cursos Especializados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-800 mb-2">95%</div>
              <div className="text-gray-600">Tasa de Empleo</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-800 mb-2">10+</div>
              <div className="text-gray-600">Años de Experiencia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cursos Destacados */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Cursos Destacados
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card 
            title="Maquillaje Profesional"
            description="Domina las técnicas de maquillaje para eventos especiales y sesiones fotográficas."
            className="text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">💋</div>
            <div className="text-blue-800 font-semibold">$299.99</div>
          </Card>

          <Card 
            title="Estética Facial"
            description="Aprende tratamientos faciales profesionales y técnicas de rejuvenecimiento."
            className="text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🌸</div>
            <div className="text-blue-800 font-semibold">$399.99</div>
          </Card>

          <Card 
            title="Peluquería Profesional"
            description="Técnicas modernas de corte, color y peinado para todos los tipos de cabello."
            className="text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">💇‍♀️</div>
            <div className="text-blue-800 font-semibold">$449.99</div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home