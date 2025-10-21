import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import pagoService from '../../api/services/pagoService';

// Utilidad para normalizar el estado a los 3 oficiales: Pendiente, Pagado, Rechazado
const normalizeEstadoTitle = (v) => {
  const s = (v || '').toString().toLowerCase();
  if (['aceptado', 'pagado', 'aprobado'].includes(s)) return 'Pagado';
  if (s === 'rechazado') return 'Rechazado';
  return 'Pendiente';
};

// Formateadores locales
const formatCOP = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return String(v ?? '');
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
};
const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('es-CO'); } catch { return String(d); }
};

// Mapeo defensivo desde backend -> UI
const mapPagoToUI = (p) => ({
  // id usado para UI (puede ser aleatorio si el backend no trae id)
  id: p?.id ?? p?.id_pago ?? p?.pago_id ?? Math.random(),
  // id real para consultar detalle
  sourceId: p?.id ?? p?.id_pago ?? p?.pago_id ?? null,
  nombre: p?.nombre || p?.persona?.nombre || p?.persona?.nombre_completo || 'Estudiante',
  // nombre del curso: cursoMatriculado -> ofertacurso(as 'curso') -> curso
  curso: p?.cursoMatriculado?.curso?.curso?.nombre_curso
    || p?.cursoMatriculado?.curso?.nombre_curso
    || p?.cursoMatriculado?.curso?.nombre
    || p?.curso?.nombre_curso
    || p?.curso?.nombre
    || p?.curso_nombre
    || p?.curso
    || p?.ofertacurso?.curso?.nombre_curso
    || p?.oferta?.curso?.nombre_curso
    || '—',
  cupos: p?.cursoMatriculado?.curso?.cupos ?? p?.ofertacurso?.cupos ?? p?.cupos ?? p?.curso_cupos ?? null,
  fecha: (p?.fecha || p?.fecha_pago || p?.created_at || '').toString().slice(0, 10),
  imagenUrl: p?.comprobante_url || p?.comprobante || p?.comprobante_path || p?.imagenUrl || '',
  estado: normalizeEstadoTitle(p?.estado || p?.status),
  monto: p?.monto,
  referencia: p?.referencia,
  forma_pago: p?.forma_pago,
  fecha_pago: p?.fecha_pago || p?.fecha,
  raw: p,
});

function AdminPagos() {
  const [pagos, setPagos] = useState([]);
  const [selectedPago, setSelectedPago] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Todos'); // Todos | Pendiente | Pagado | Rechazado

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await pagoService.list();
        console.log('[AdminPagos] <- lista pagos (raw):', res);
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setPagos(arr.map(mapPagoToUI));
      } catch (err) {
        console.error('[AdminPagos] Error listando pagos:', err);
        setError('No se pudieron cargar los pagos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      await pagoService.update(id, { estado: newStatus });
      setPagos((prev) => prev.map(p => p.id === id ? { ...p, estado: normalizeEstadoTitle(newStatus) } : p));
      console.log(`[AdminPagos] Pago ${id} marcado como ${newStatus}`);
    } catch (err) {
      console.error('[AdminPagos] Error actualizando estado de pago:', err);
      alert('No se pudo actualizar el estado del pago.');
    }
  };

  const openModal = async (pago) => {
    setSelectedPago(pago);
    setIsModalOpen(true);
    setSelectedDetail(null);
    setErrorDetail('');
    try {
      setLoadingDetail(true);
      const idLookup = pago?.sourceId ?? pago?.id;
      if (!idLookup) {
        console.warn('[AdminPagos] No hay ID válido para consultar detalle. Mostrando solo resumen. Pago=', pago);
        return; // dejamos el resumen con selectedPago
      }
      console.log('[AdminPagos] -> getById', idLookup);
      const res = await pagoService.getById(idLookup);
      // soporte a distintas formas de respuesta
      const parsed = res?.data || res?.pago || res?.result || res?.resultado || res;
      setSelectedDetail(parsed);
    } catch (e) {
      console.error('[AdminPagos] Error obteniendo detalle de pago:', e);
      setErrorDetail('No se pudo cargar el detalle del pago');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPago(null);
  };
  
  const getStatusBadge = (estado) => {
    const s = (estado || '').toString().toLowerCase();
    if (s === 'pagado') return 'bg-green-100 text-green-800';
    if (s === 'rechazado') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const pagosFiltrados = pagos.filter(p => filter === 'Todos' ? true : p.estado === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Pagos
            </h1>
            <p className="text-gray-600">
              Revisa, aprueba o rechaza los comprobantes de pago de los estudiantes.
            </p>
          </div>
          <div>
            <Link to="/admin">
                <Button variant="secondary">‹ Volver al Dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Pagos Pendientes y Recientes
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-700">Filtrar por estado:</label>
            <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="border rounded-md px-2 py-1 text-sm">
              <option>Todos</option>
              <option>Pendiente</option>
              <option>Pagado</option>
              <option>Rechazado</option>
            </select>
          </div>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          {loading ? (
            <div className="text-gray-500">Cargando pagos…</div>
          ) : (
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pagosFiltrados.map((pago) => (
              <div key={pago.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
                {/* Encabezado con curso y estado */}
                <div className="px-4 pt-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-semibold text-gray-900 truncate" title={pago.curso}>{pago.curso}</h3>
                    <span className={`ml-3 text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(pago.estado)}`}>
                      {pago.estado}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{pago.nombre}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    {typeof pago.monto !== 'undefined' && (
                      <span>Monto: <span className="font-medium">{formatCOP(pago.monto)}</span></span>
                    )}
                    {typeof pago.cupos !== 'undefined' && (
                      <span className="inline-flex items-center gap-1">Cupos: <span className="font-medium">{pago.cupos ?? '—'}</span></span>
                    )}
                  </div>
                </div>

                {/* Imagen / placeholder */}
                <div className="relative mt-3 bg-gray-100 h-40">
                  {pago.imagenUrl ? (
                    <Link to={`/admin/pagos/${pago.sourceId || pago.id}`} className="absolute inset-0">
                      <img
                        src={pago.imagenUrl}
                        alt={`Comprobante de ${pago.nombre}`}
                        className="object-cover w-full h-full hover:opacity-90 transition-opacity"
                      />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                      Sin comprobante
                    </div>
                  )}
                </div>

                {/* Pie con acción */}
                <div className="p-4 bg-gray-50">
                  <div className="flex justify-center">
                    <Link to={`/admin/pagos/${pago.sourceId || pago.id}`}>
                      <Button variant="secondary" size="sm">Ver detalles</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default AdminPagos;
