import { useState } from 'react'
import Card from '../components/Card'

function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envío de formulario
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitSuccess(true)
    setFormData({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: ''
    })
    
    // Resetear mensaje de éxito después de 3 segundos
    setTimeout(() => setSubmitSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Contáctanos
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Información de contacto */}
          <div className="space-y-6">
            <Card title="Información de Contacto">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="text-blue-800 text-xl mr-3">📍</div>
                  <div>
                    <h4 className="font-semibold">Dirección</h4>
                    <p className="text-gray-600">Calle Principal #123, Ciudad</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="text-blue-800 text-xl mr-3">📧</div>
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-gray-600">info@academiafuned.com</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="text-blue-800 text-xl mr-3">📞</div>
                  <div>
                    <h4 className="font-semibold">Teléfono</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="text-blue-800 text-xl mr-3">⏰</div>
                  <div>
                    <h4 className="font-semibold">Horarios</h4>
                    <p className="text-gray-600">Lun - Sáb: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Redes Sociales">
              <div className="flex space-x-4">
                <button className="bg-blue-800 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Facebook
                </button>
                <button className="bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition-colors">
                  Instagram
                </button>
                <button className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                  TikTok
                </button>
              </div>
            </Card>
          </div>

          {/* Formulario de contacto */}
          <Card title="Envíanos un mensaje">
            {submitSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                ¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-800 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ContactoPage 