import { Link } from 'react-router-dom'
import FunedLogo from './FunedLogo'

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Información de la empresa */}
          <div className="col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-shrink-0">
                <FunedLogo 
                  size="xl" 
                  className="opacity-90"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Academia de Belleza Funed</h3>
                <p className="text-sm text-gray-300">Educación a tu Alcance</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Tu centro de formación profesional en belleza y estética. 
              Formamos profesionales exitosos en el mundo de la belleza.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                📷
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">TikTok</span>
                🎵
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">YouTube</span>
                📺
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/cursos" className="text-gray-300 hover:text-white transition-colors">
                  Cursos
                </Link>
              </li>
              <li>
                <Link to="/sobre-nosotros" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📍 Calle Principal #123, Ciudad</li>
              <li>📧 info@academiafuned.com</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>⏰ Lun - Sáb: 9:00 AM - 7:00 PM</li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 Academia de Belleza Funed. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 