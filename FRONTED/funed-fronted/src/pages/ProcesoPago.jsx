import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ofertaCursoService from '../api/services/ofertaCursoService';
import pagoService from '../api/services/pagoService';
import cursoMatriculadoService from '../api/services/cursoMatriculadoService';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../supabaseClient';

const formatCOP = (v) =>
  typeof v === 'number'
    ? v.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      })
    : 'Consultar';

function ProcesoPago() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth(); // Hook llamado en el nivel superior
  const [oferta, setOferta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [comprobante, setComprobante] = useState(null);
  const [referencia, setReferencia] = useState('');
  const [isUploaded, setIsUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadOferta() {
      try {
        const data = await ofertaCursoService.getById(id);
        setOferta(data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOferta();
  }, [id]);

  const precioFormateado = useMemo(() => {
    if (!oferta?.precio) return 'Consultar';
    const numericPrice = parseFloat(oferta.precio);
    if (isNaN(numericPrice)) return 'Consultar';
    return formatCOP(numericPrice);
  }, [oferta]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      // Validación rápida de tamaño (<= 10MB) y tipo permitido
      const maxBytes = 10 * 1024 * 1024;
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'image/webp'];
      if (file.size > maxBytes) {
        alert('El archivo supera el límite de 10MB.');
        return;
      }
      if (!allowed.includes(file.type)) {
        alert('Tipo de archivo no permitido. Usa PNG, JPG, WEBP o PDF.');
        return;
      }
      setComprobante(file);
    }
  };

  // Maneja el envío del formulario de pago.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario.

    // --- Verificación de datos iniciales ---
    console.log('Iniciando el proceso de envío...');
    console.log('Comprobante (archivo):', comprobante);
    console.log('Referencia (texto):', referencia);
    console.log('Supabase URL (mask):', (import.meta?.env?.VITE_SUPABASE_URL || '').replace(/\/([a-zA-Z0-9]{6})[a-zA-Z0-9-]+$/, '/$1***'));

    if (!comprobante) {
      alert('Por favor, sube el comprobante de pago.');
      return;
    }

    // Obtener el id de la persona desde el contexto de autenticación.
    const id_persona = usuario?.idPersona;

    console.log('ID de persona (desde AuthContext):', id_persona);

    if (!id_persona) {
      alert('Error: No se pudo obtener la información del usuario. Por favor, inicia sesión de nuevo.');
      return;
    }

    try {
      setSubmitting(true);

      // 1) Crear matrícula en backend
      const matriculaData = {
        id_curso_oferta: id,
        id_persona,
        estado: 'Preinscrito',
        resultado: 'Pendiente',
      };
      console.log('[Matricula] -> POST /api/matriculas payload:', matriculaData);
      const nuevaMatricula = await cursoMatriculadoService.create(matriculaData);
      console.log('[Matricula] <- response:', nuevaMatricula);
      const id_curso_matriculado = nuevaMatricula?.id ?? nuevaMatricula?.data?.id ?? nuevaMatricula?.resultado?.id ?? null;
      if (!id_curso_matriculado) {
        console.warn('[Matricula] No se pudo determinar el id de la matrícula desde la respuesta.');
        throw new Error('No se pudo crear la matrícula.');
      }

      // 2) Subir comprobante a Supabase Storage
      const bucket = 'pagos-funed';
      const ext = comprobante.name.split('.').pop();
      const fileName = `${id_persona}_${Date.now()}.${ext}`;
      const filePath = `${id_persona}/${id}/${fileName}`;

      console.log(`Subiendo comprobante a Supabase Storage -> bucket: ${bucket}, path: ${filePath}`);
      const { error: uploadError } = await supabase
        .storage
        .from(bucket)
        .upload(filePath, comprobante, { contentType: comprobante.type || 'application/octet-stream', upsert: true });

      if (uploadError) {
        console.error('Error al subir el comprobante a Supabase:', uploadError);
        throw new Error(`No se pudo subir el comprobante. Detalle: ${uploadError.message || uploadError.error || 'error desconocido'}`);
      }

      const { data: publicData } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(filePath);

      const comprobante_url = publicData?.publicUrl || null;
      console.log('Comprobante subido. Public URL:', comprobante_url);

      // 3) Enviar registro de pago al backend con la URL del comprobante
      const payload = {
        id_persona,
        id_curso_matriculado,
        forma_pago: 'Nequi',
        monto: parseFloat(oferta.precio),
        estado: 'Pendiente',
        comprobante: comprobante_url, // mantener nombre de campo compatible
        comprobante_url, // también enviar explícito
        comprobante_path: filePath,
        referencia,
      };
      console.log('[Pago] -> POST /api/pagos payload:', payload);
      const pagoResponse = await pagoService.create(payload);
      console.log('[Pago] <- response:', pagoResponse);

      // Redirigir a perfil -> documentos con aviso
      navigate('/perfil?tab=documentos', {
        state: {
          notice: 'Hemos recibido tu comprobante. Para aprobar tu inscripción, por favor sube los documentos requeridos.',
        },
        replace: true,
      });
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      alert(error?.message || 'Hubo un error al procesar tu inscripción. Por favor, intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Cargando información de pago...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-16 text-center text-red-600">Error: {error}</div>;
  }

  // Nota: ya no mostramos pantalla de "Gracias"; se redirige a Perfil->Documentos tras éxito

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-4">
            <Link to={`/curso/${id}`}>
                <Button variant="secondary">‹ Volver al curso</Button>
            </Link>
        </div>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden md:flex">
          {/* Columna Izquierda: Instrucciones y QR */}
          <div className="md:w-1/2 p-8 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Completa tu Inscripción</h2>
            
            <div className="mb-6">
                <h3 className="font-semibold text-lg text-gray-700">Resumen del Curso</h3>
                <p className="text-gray-600">{oferta?.curso?.nombre_curso}</p>
                
                <p className="text-2xl font-bold text-blue-600 mt-2">{precioFormateado}</p>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-lg text-gray-700">Instrucciones de Pago</h3>
                <ol className="list-decimal list-inside text-gray-600 space-y-2 mt-2">
                    <li>Escanea el código QR con tu aplicación bancaria.</li>
                    <li>Realiza una transferencia por el valor exacto de <strong>{precioFormateado}</strong>.</li>
                    <li>Asegúrate de que la transferencia sea a nombre de "Academia Funed".</li>
                    <li>Guarda el comprobante de pago.</li>
                    <li>Sube el comprobante en el formulario de la derecha.</li>
                </ol>
            </div>

            <div className="text-center">
                <a href="https://onxbempdrygdsayzvkyk.supabase.co/storage/v1/object/public/cursos-images/Qr/qrpago.jpeg" target="_blank" rel="noreferrer">
                  <img 
                    src="https://onxbempdrygdsayzvkyk.supabase.co/storage/v1/object/public/cursos-images/Qr/qrpago.jpeg" 
                    alt="Código QR para pago"
                    className="mx-auto rounded-md shadow-md max-w-full h-auto"
                  />
                </a>
                <p className="text-xs text-gray-500 mt-2">Haz clic en la imagen para verla a tamaño completo.</p>
            </div>
             <div className="mt-6 text-sm text-gray-500">
                <h4 className="font-semibold">¿Problemas con el pago?</h4>
                <p>Contáctanos por WhatsApp al +57 300 123 4567 o al correo <a href="mailto:pagos@funed.com" className="text-blue-600 hover:underline">pagos@funed.com</a>.</p>
            </div>
          </div>

          {/* Columna Derecha: Formulario de subida */}
          <div className="md:w-1/2 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Sube tu Comprobante</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Referencia (Opcional)
                </label>
                <input 
                  type="text" 
                  id="referencia"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 0123456789"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="comprobante" className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante de Pago
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Sube un archivo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf"/>
                      </label>
                      <p className="pl-1">o arrástralo aquí</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF hasta 10MB
                    </p>
                  </div>
                </div>
                {comprobante && <p className="text-sm text-green-600 mt-2">Archivo seleccionado: {comprobante.name}</p>}
              </div>

              <div>
                <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Confirmar y Enviar Pago'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcesoPago;