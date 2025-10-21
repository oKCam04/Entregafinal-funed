import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'

function EmailVerificationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [verificationStatus, setVerificationStatus] = useState('pending') // pending, success, error
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  
  const email = searchParams.get('email') || 'tu@email.com'
  const token = searchParams.get('token')

  useEffect(() => {
    // Si hay un token en la URL, verificar automáticamente
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  useEffect(() => {
    // Countdown para reenvío
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const verifyEmail = async (verificationToken) => {
    try {
      // Simular verificación de email
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // En una app real, aquí harías la llamada a tu API
      console.log('Verifying email with token:', verificationToken)
      
      // Simular éxito
      setVerificationStatus('success')
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.' }
        })
      }, 3000)
      
    } catch (error) {
      setVerificationStatus('error')
    }
  }

  const resendVerificationEmail = async () => {
    setIsResending(true)
    
    try {
      // Simular reenvío de email
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // En una app real, aquí harías la llamada a tu API
      console.log('Resending verification email to:', email)
      
      // Resetear countdown
      setCountdown(60)
      setCanResend(false)
      
    } catch (error) {
      console.error('Error resending email:', error)
    } finally {
      setIsResending(false)
    }
  }

  const maskEmail = (email) => {
    const [localPart, domain] = email.split('@')
    const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1)
    return `${maskedLocal}@${domain}`
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              ¡Email Verificado!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tu cuenta ha sido verificada exitosamente.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Serás redirigido al login en unos segundos...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Error de Verificación
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              El enlace de verificación no es válido o ha expirado.
            </p>
            <div className="mt-6 space-y-3">
              <Button 
                onClick={resendVerificationEmail}
                variant="primary"
                className="w-full"
                disabled={isResending}
              >
                {isResending ? 'Reenviando...' : 'Reenviar Email de Verificación'}
              </Button>
              <Button 
                onClick={() => navigate('/registro')}
                variant="secondary"
                className="w-full"
              >
                Volver al Registro
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Verifica tu Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hemos enviado un enlace de verificación a:
          </p>
          <p className="mt-1 text-sm font-medium text-blue-600">
            {maskEmail(email)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Instrucciones
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Revisa tu bandeja de entrada</li>
                      <li>Si no lo encuentras, revisa la carpeta de spam</li>
                      <li>Haz clic en el enlace de verificación</li>
                      <li>El enlace expira en 24 horas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                ¿No recibiste el email?
              </p>
              
              {canResend ? (
                <Button 
                  onClick={resendVerificationEmail}
                  variant="secondary"
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? 'Reenviando...' : 'Reenviar Email de Verificación'}
                </Button>
              ) : (
                <div className="text-sm text-gray-500">
                  Puedes reenviar el email en {countdown} segundos
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <Button 
                  onClick={() => navigate('/registro')}
                  variant="secondary"
                  className="flex-1 mr-2"
                >
                  Cambiar Email
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  variant="secondary"
                  className="flex-1 ml-2"
                >
                  Ya tengo cuenta
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Si tienes problemas, contacta nuestro soporte técnico
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationPage
