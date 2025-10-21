import Card from '../components/Card'
import Button from '../components/Button'
import FunedLogo from '../components/FunedLogo'

function SobreNosotrosPage() {
  const equipo = [
    {
      nombre: "María González",
      cargo: "CEO & Fundadora",
      descripcion: "Experta en educación digital con más de 10 años de experiencia.",
      imagen: "https://via.placeholder.com/150x150/1e40af/FFFFFF?text=MG"
    },
    {
      nombre: "Carlos Rodríguez",
      cargo: "Director de Tecnología",
      descripcion: "Desarrollador full-stack apasionado por la innovación educativa.",
      imagen: "https://via.placeholder.com/150x150/20b2aa/FFFFFF?text=CR"
    },
    {
      nombre: "Ana Martínez",
      cargo: "Directora de Contenido",
      descripcion: "Especialista en diseño instruccional y metodologías de aprendizaje.",
      imagen: "https://via.placeholder.com/150x150/1e40af/FFFFFF?text=AM"
    }
  ]

  const valores = [
    {
      titulo: "Excelencia",
      descripcion: "Nos esforzamos por ofrecer la mejor calidad en todos nuestros cursos.",
      icono: "⭐"
    },
    {
      titulo: "Innovación",
      descripcion: "Utilizamos las últimas tecnologías para crear experiencias de aprendizaje únicas.",
      icono: "🚀"
    },
    {
      titulo: "Accesibilidad",
      descripcion: "Creemos que la educación debe estar disponible para todos, sin importar su ubicación.",
      icono: "🌍"
    },
    {
      titulo: "Comunidad",
      descripcion: "Fomentamos una comunidad de aprendizaje colaborativo y de apoyo mutuo.",
      icono: "🤝"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <FunedLogo 
              size="3xl" 
              showBackground={true}
              backgroundSize="large"
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Somos una plataforma educativa comprometida con el desarrollo profesional 
            y personal de nuestros estudiantes a través de cursos de alta calidad.
          </p>
          <p className="text-lg text-blue-800 font-semibold mt-4">
            Educación a tu Alcance
          </p>
        </div>

        {/* Misión y Visión */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card title="Nuestra Misión">
            <p className="text-gray-600 mb-4">
              Democratizar el acceso a la educación de calidad, proporcionando herramientas 
              y recursos que permitan a las personas desarrollar sus habilidades y alcanzar 
              sus metas profesionales.
            </p>
            <div className="text-4xl mb-4">🎯</div>
          </Card>

          <Card title="Nuestra Visión">
            <p className="text-gray-600 mb-4">
              Ser la plataforma líder en educación digital, reconocida por la excelencia 
              de nuestros cursos y el impacto positivo en la vida de nuestros estudiantes.
            </p>
            <div className="text-4xl mb-4">🔮</div>
          </Card>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Nuestros Valores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor, index) => (
              <Card key={index} className="text-center">
                <div className="text-4xl mb-4">{valor.icono}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {valor.titulo}
                </h3>
                <p className="text-gray-600">
                  {valor.descripcion}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Equipo */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Nuestro Equipo
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {equipo.map((miembro, index) => (
              <Card key={index} className="text-center">
                <img 
                  src={miembro.imagen} 
                  alt={miembro.nombre}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {miembro.nombre}
                </h3>
                <p className="text-blue-800 font-medium mb-3">
                  {miembro.cargo}
                </p>
                <p className="text-gray-600">
                  {miembro.descripcion}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Nuestros Logros
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-800 mb-2">50K+</div>
              <div className="text-gray-600">Estudiantes Satisfechos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-800 mb-2">500+</div>
              <div className="text-gray-600">Cursos Disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-800 mb-2">95%</div>
              <div className="text-gray-600">Tasa de Completación</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-800 mb-2">150+</div>
              <div className="text-gray-600">Instructores Expertos</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para comenzar tu viaje de aprendizaje?
            </h3>
            <p className="text-blue-100 mb-6">
              Únete a miles de estudiantes que ya han transformado sus carreras con nosotros.
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-blue-800"
            >
              Explorar Cursos
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SobreNosotrosPage 