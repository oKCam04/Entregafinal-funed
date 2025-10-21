import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import pagoService from '../../api/services/pagoService';
import ofertaCursoService from '../../api/services/ofertaCursoService';
import personasService from '../../api/services/personaService';
import emailService from '../../api/services/emailService';
import cursoMatriculadoService from '../../api/services/cursoMatriculadoService';
import Button from '../../components/Button';

const formatCOP = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return String(v ?? '');
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
};
const formatDateLong = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return String(d);
  }
};

export default function AdminPagoDetalle() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await pagoService.getById(id);
        const parsed = res?.data || res?.pago || res?.result || res?.resultado || res;
        if (active) setDetail(parsed || null);
      } catch (e) {
        console.error('[AdminPagoDetalle] Error cargando detalle:', e);
        if (active) setError('No se pudo cargar el detalle del pago.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const handleUpdateEstado = async (nuevo) => {
    if (!id) return;
    try {
      setSaving(true);
      // 1) Actualizar estado del pago
      await pagoService.update(id, { estado: nuevo });
      setDetail((prev) => prev ? { ...prev, estado: nuevo } : prev);
      let msg = `Estado actualizado a ${nuevo}`;

      // 1.1) Actualizar estado de la matrícula según resultado del pago
      try {
        const idMatricula = detail?.cursoMatriculado?.id;
        if (idMatricula) {
          const aprobado = (String(nuevo).toLowerCase() === 'pagado' || String(nuevo).toLowerCase() === 'aprobado' || String(nuevo).toLowerCase() === 'aceptado');
          const estadoMatricula = aprobado ? 'Activo' : 'Cancelado'; // el modelo admite: Preinscrito, Activo, Finalizado, Cancelado
          const resultadoMatricula = aprobado ? (detail?.cursoMatriculado?.resultado ?? 'Pendiente') : 'Reprobado';

          await cursoMatriculadoService.update(idMatricula, { estado: estadoMatricula, resultado: resultadoMatricula });
          setDetail((prev) => prev ? { ...prev, cursoMatriculado: { ...prev.cursoMatriculado, estado: estadoMatricula, resultado: resultadoMatricula } } : prev);
          msg += ` · Matrícula ${estadoMatricula}`;
          if (!aprobado) msg += ' · Resultado Reprobado';
        }
      } catch (matErr) {
        console.error('[AdminPagoDetalle] Error actualizando estado de matrícula:', matErr);
        msg += ' · (matrícula no actualizada)';
      }

      // 2) Si fue aprobado/pagado: disminuir cupo en la oferta y cambiar rol a Estudiante
      if (String(nuevo).toLowerCase() === 'pagado' || String(nuevo).toLowerCase() === 'aprobado' || String(nuevo).toLowerCase() === 'aceptado') {
        try {
          // Disminuir cupos de la oferta del curso
          const ofertaId = detail?.cursoMatriculado?.curso?.id ?? detail?.cursoMatriculado?.id_curso_oferta;
          if (ofertaId) {
            const oferta = await ofertaCursoService.getById(ofertaId);
            const ofertaData = oferta?.data || oferta; // tolerancia de estructura
            const currentCupos = Number(
              ofertaData?.cupos ?? detail?.cursoMatriculado?.curso?.cupos ?? detail?.cursoMatriculado?.curso?.curso?.cupos ?? 0
            );
            const nextCupos = Math.max(0, currentCupos - 1);

            const payloadOferta = {
              codigo_curso: ofertaData?.codigo_curso ?? detail?.cursoMatriculado?.curso?.codigo_curso,
              id_curso: ofertaData?.id_curso ?? detail?.cursoMatriculado?.curso?.id_curso ?? detail?.cursoMatriculado?.curso?.curso?.id,
              fecha_inicio_curso: ofertaData?.fecha_inicio_curso ?? detail?.cursoMatriculado?.curso?.fecha_inicio_curso,
              fecha_fin_curso: ofertaData?.fecha_fin_curso ?? detail?.cursoMatriculado?.curso?.fecha_fin_curso,
              horario: ofertaData?.horario ?? detail?.cursoMatriculado?.curso?.horario,
              cupos: nextCupos,
              precio: ofertaData?.precio ?? detail?.cursoMatriculado?.curso?.precio ?? detail?.cursoMatriculado?.curso?.curso?.precio,
              foto: ofertaData?.foto ?? detail?.cursoMatriculado?.curso?.foto,
            };
            await ofertaCursoService.update(ofertaId, payloadOferta);
            // Refrescar cupos en UI local
            setDetail((prev) => {
              if (!prev) return prev;
              const clone = { ...prev };
              if (clone?.cursoMatriculado?.curso) {
                clone.cursoMatriculado = {
                  ...clone.cursoMatriculado,
                  curso: { ...clone.cursoMatriculado.curso, cupos: nextCupos }
                };
              }
              return clone;
            });
            msg += ' · Cupos decrecidos';
          }

          // Cambiar rol de la persona a Estudiante
          const personaId = detail?.persona?.id ?? detail?.cursoMatriculado?.id_persona;
          if (personaId) {
            const personaRes = await personasService.getById(personaId);
            const p = personaRes?.data || personaRes;
            const personaPayload = {
              nombre: p?.nombre,
              apellido: p?.apellido,
              numero_identificacion: p?.numero_identificacion,
              // Mapeo a claves esperadas por el controlador (evita undefined)
              tipo: p?.tipo_identificacion,
              fecha: p?.fecha_nacimiento,
              telefono: p?.telefono,
              correo: p?.correo,
              rol: 'Estudiante',
            };
            await personasService.update(personaId, personaPayload);
            setDetail((prev) => prev ? { ...prev, persona: { ...prev.persona, rol: 'Estudiante' } } : prev);
            msg += ' · Rol actualizado a Estudiante';
          }

          // Enviar correo de aprobación de pago al estudiante
          try {
            const correoAlumno = detail?.persona?.correo;
            const nombreAlumno = `${detail?.persona?.nombre ?? ''} ${detail?.persona?.apellido ?? ''}`.trim();
            const cursoNombre = (detail?.cursoMatriculado?.curso?.curso?.nombre_curso) || (detail?.cursoMatriculado?.curso?.nombre_curso) || 'Curso';
            if (correoAlumno) {
              await emailService.sendPaymentApproved({ email: correoAlumno, nombre: nombreAlumno || undefined, curso: cursoNombre });
              msg += ' · Correo de aprobación enviado';
            }
          } catch (mailErr) {
            console.error('[AdminPagoDetalle] Error enviando correo de aprobación:', mailErr);
            msg += ' · (correo no enviado)';
          }
        } catch (sideErr) {
          console.error('[AdminPagoDetalle] Error en efectos pos-aprobación:', sideErr);
          msg += ' · (con advertencias en cupos/rol)';
        }
      }

      setToast(msg);
      setTimeout(() => setToast(''), 2500);
    } catch (e) {
      console.error('[AdminPagoDetalle] Error actualizando estado:', e);
      setToast('No se pudo actualizar el estado');
      setTimeout(() => setToast(''), 2500);
    } finally {
      setSaving(false);
    }
  };

  const estadoNorm = (v) => {
    const s = (v || '').toString().toLowerCase();
    if (["aceptado","pagado","aprobado"].includes(s)) return 'Pagado';
    if (s === 'rechazado') return 'Rechazado';
    return 'Pendiente';
  };

  // Helpers de extracción segura
  const fullName = `${detail?.persona?.nombre ?? ''} ${detail?.persona?.apellido ?? ''}`.trim() || '—';
  const cursoData = detail?.cursoMatriculado?.curso || {};
  const cursoBase = cursoData?.curso || {};
  const codigoCurso = cursoData?.codigo_curso ?? cursoBase?.codigo_curso ?? '—';
  const nombreCurso = cursoBase?.nombre_curso ?? '—';
  const precioCurso = cursoData?.precio ?? cursoBase?.precio ?? null;
  const cupos = cursoData?.cupos ?? cursoBase?.cupos ?? null;
  const fechaPagoMostrada = formatDateLong(detail?.fecha_pago || detail?.created_at);
  const comprobanteUrl = detail?.comprobante_url || detail?.comprobante || detail?.comprobante_path || '';
  const isPdf = typeof comprobanteUrl === 'string' && (comprobanteUrl.toLowerCase().endsWith('.pdf') || comprobanteUrl.startsWith('data:application/pdf'));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Detalle de Pago</h1>
            <p className="text-gray-600">ID: {id}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/pagos"><Button variant="secondary">‹ Volver a Pagos</Button></Link>
          </div>
        </div>

        {loading && <div className="text-gray-500">Cargando detalle…</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow p-6">
            {toast && <div className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">{toast}</div>}

            {/* Encabezado */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Resumen del Pago</h2>
              <p className="text-gray-600 text-sm">ID: {detail?.id ?? id}</p>
            </div>

            {/* Sección: Estudiante */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 border rounded-md p-4">
                <h3 className="font-medium text-gray-800 mb-2">Datos del Estudiante</h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-600">Nombre:</span> <span className="font-medium">{fullName}</span></div>
                  <div><span className="text-gray-600">Identificación:</span> <span className="font-medium">{detail?.persona?.numero_identificacion || '—'}</span></div>
                  <div><span className="text-gray-600">Correo:</span> <span className="font-medium">{detail?.persona?.correo || '—'}</span></div>
                </div>
              </div>

              {/* Sección: Curso */}
              <div className="bg-gray-50 border rounded-md p-4">
                <h3 className="font-medium text-gray-800 mb-2">Datos del Curso</h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-600">Nombre curso:</span> <span className="font-medium">{nombreCurso}</span></div>
                  <div><span className="text-gray-600">Código:</span> <span className="font-medium">{codigoCurso}</span></div>
                  <div><span className="text-gray-600">Precio:</span> <span className="font-medium">{precioCurso ? formatCOP(precioCurso) : '—'}</span></div>
                  <div><span className="text-gray-600">Cupos:</span> <span className="font-medium">{cupos ?? '—'}</span></div>
                </div>
              </div>
            </div>

            {/* Sección: Transacción */}
            <div className="bg-gray-50 border rounded-md p-4 mb-4">
              <h3 className="font-medium text-gray-800 mb-2">Transacción</h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-600">Forma de pago:</span> <span className="font-medium">{detail?.forma_pago || '—'}</span></div>
                <div><span className="text-gray-600">Monto:</span> <span className="font-medium">{formatCOP(detail?.monto)}</span></div>
                <div><span className="text-gray-600">Estado:</span> <span className="font-medium">{estadoNorm(detail?.estado)}</span></div>
                <div><span className="text-gray-600">Fecha de pago:</span> <span className="font-medium capitalize">{fechaPagoMostrada}</span></div>
                <div className="md:col-span-2"><span className="text-gray-600">Referencia:</span> <span className="font-medium">{detail?.referencia || '—'}</span></div>
              </div>
            </div>

            {/* Comprobante (solo imagen; si es PDF o vacío, mostrar mensaje) */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-800 mb-2">Comprobante</h3>
              {comprobanteUrl && !isPdf ? (
                <a href={comprobanteUrl} target="_blank" rel="noreferrer" className="block">
                  <img src={comprobanteUrl} alt="Comprobante de pago" className="max-w-md w-full rounded-md border shadow" />
                </a>
              ) : (
                <p className="text-sm text-gray-600">No adjuntó comprobante.</p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-3 mb-4">
              {detail && String(detail?.estado).toLowerCase() === 'pendiente' && (
                <>
                  <button
                    disabled={saving}
                    onClick={() => handleUpdateEstado('Pagado')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                  >
                    {saving ? 'Guardando…' : 'Marcar como Pagado'}
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => handleUpdateEstado('Rechazado')}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                  >
                    {saving ? 'Guardando…' : 'Rechazar Pago'}
                  </button>
                </>
              )}
            </div>

            {/* Se removió sección de "Ver más detalles" para UI más limpia */}
          </div>
        )}
      </div>
    </div>
  );
}
