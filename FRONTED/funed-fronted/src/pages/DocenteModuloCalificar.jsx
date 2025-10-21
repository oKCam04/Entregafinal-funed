import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import personasService from "../api/services/personaService";
import moduloService from "../api/services/moduloService";
import Button from "../components/Button";
import calificacionesService from "../api/services/calificacionesService";

export default function DocenteModuloCalificar() {
  const navigate = useNavigate();
  const { id: ofertaId, moduloId } = useParams();

  const [modulo, setModulo] = useState(null);
  const [loadingModulo, setLoadingModulo] = useState(false);
  const [errorModulo, setErrorModulo] = useState("");

  const [personas, setPersonas] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [errorPersonas, setErrorPersonas] = useState("");

  const [estadoPorPersona, setEstadoPorPersona] = useState({}); // { [id_persona]: 'aprobado' | 'desaprobado' }
  const [notaIdPorPersona, setNotaIdPorPersona] = useState({}); // { [id_persona]: id_nota }
  const [savingPersonaId, setSavingPersonaId] = useState(null);
  const [savingTargetEstado, setSavingTargetEstado] = useState(null); // 'aprobado' | 'desaprobado'
  const [errorGuardar, setErrorGuardar] = useState("");

  const normalizeEstado = (v) => {
    if (!v) return v;
    const s = String(v).toLowerCase();
    // Aceptar variantes: "desaprobó", "desaprobo", "desprobó", "reprobó"
    // Importante: revisar 'desapr'/'desprob'/'reprob' ANTES que 'aprob' para evitar falsos positivos
    if (s.includes('desapr') || s.includes('desprob') || s.includes('reprob')) return 'desaprobado';
    if (s.includes('aprob')) return 'aprobado';
    if (s.includes('pend')) return 'pendiente';
    return s;
  };

  const toBackendEstado = (v) => {
    const s = String(v).toLowerCase();
    // Importante: revisar 'desapr'/'desprob'/'reprob' ANTES que 'aprob' para evitar falsos positivos
    if (s === 'desaprobado' || s.includes('desapr') || s.includes('desprob') || s.includes('reprob')) return 'Desaprobó';
    if (s === 'aprobado' || s.includes('aprob')) return 'Aprobó';
    if (s === 'pendiente' || s.includes('pend')) return 'Pendiente';
    return v;
  };

  // Cargar información del módulo (opcional, para encabezado)
  useEffect(() => {
    if (!moduloId) return;
    let active = true;
    (async () => {
      try {
        setLoadingModulo(true);
        setErrorModulo("");
        const data = await moduloService.getById(Number(moduloId));
        if (!active) return;
        setModulo(data || null);
      } catch (err) {
        if (active) setErrorModulo(err?.response?.data?.mensaje || err.message || "Error cargando el módulo");
      } finally {
        active && setLoadingModulo(false);
      }
    })();
    return () => { active = false };
  }, [moduloId]);

  // Cargar personas activas matriculadas en la oferta
  useEffect(() => {
    if (!ofertaId) return;
    let active = true;
    (async () => {
      try {
        setLoadingPersonas(true);
        setErrorPersonas("");
        const list = await personasService.listActivosByOferta(Number(ofertaId));
        if (!active) return;
        setPersonas(Array.isArray(list) ? list : []);
      } catch (err) {
        if (active) setErrorPersonas(err?.response?.data?.mensaje || err.message || "Error cargando personas");
      } finally {
        active && setLoadingPersonas(false);
      }
    })();
    return () => { active = false };
  }, [ofertaId]);

  // Cargar notas existentes por módulo y oferta para mapear estado e id de nota por persona
  useEffect(() => {
    if (!ofertaId || !moduloId) return;
    let active = true;
    (async () => {
      try {
        const notas = await calificacionesService.listByModuloOferta(Number(moduloId), Number(ofertaId));
        if (!active) return;
        const ids = {};
        const estados = {};
        for (const n of (notas || [])) {
          if (n?.id_persona != null) {
            if (n?.id_nota != null) ids[n.id_persona] = n.id_nota;
            if (n?.estado) estados[n.id_persona] = normalizeEstado(n.estado);
          }
        }
        setNotaIdPorPersona(ids);
        // Usar exclusivamente el estado proveniente del backend
        setEstadoPorPersona(estados);
      } catch (err) {
        // Silenciar error inicial en carga de notas para no bloquear la vista
        console.warn("Error cargando notas del módulo:", err?.message || err);
      }
    })();
    return () => { active = false };
  }, [ofertaId, moduloId]);

  const handleSetEstado = async (id_persona, estado) => {
    setErrorGuardar("");
    setSavingPersonaId(id_persona);
    setSavingTargetEstado(estado);
    console.log("[Calificar] Set estado", { id_persona, estado_ui: estado, estado_backend: toBackendEstado(estado) });
    const estadoPrevio = estadoPorPersona[id_persona];
    // Cambio visual inmediato del botón
    setEstadoPorPersona((prev) => ({ ...prev, [id_persona]: estado }));
    try {
      const idNota = notaIdPorPersona?.[id_persona];
      let notaActualizada;
      if (idNota) {
        // Actualizar estado vía PATCH por ID de nota existente
        console.log("[Calificar] PATCH /api/notas-modulo/:id", { idNota, estado: toBackendEstado(estado) });
        notaActualizada = await calificacionesService.updateNota(idNota, toBackendEstado(estado));
      } else {
        // Crear/actualizar (upsert) nota para esta persona en este módulo y oferta
        const payload = {
          id_persona,
          id_oferta_curso: Number(ofertaId),
          id_modulo: Number(moduloId),
          estado: toBackendEstado(estado),
        };
        console.log("[Calificar] POST /api/notas-modulo", payload);
        notaActualizada = await calificacionesService.upsertNotaModulo(payload);
      }

      console.log("[Calificar] Respuesta guardar", notaActualizada);
      // Tras guardar, refrescar desde backend para asegurar persistencia real
      const nuevoId = notaActualizada?.id ?? idNota;
      if (nuevoId) setNotaIdPorPersona((prev) => ({ ...prev, [id_persona]: nuevoId }));
      const notasRefrescadas = await calificacionesService.listByModuloOferta(Number(moduloId), Number(ofertaId));
      console.log("[Calificar] Refrescar notas", { cantidad: (notasRefrescadas || []).length });
      const ids = {};
      const estados = {};
      for (const n of (notasRefrescadas || [])) {
        if (n?.id_persona != null) {
          if (n?.id_nota != null) ids[n.id_persona] = n.id_nota;
          if (n?.estado) estados[n.id_persona] = normalizeEstado(n.estado);
        }
      }
      setNotaIdPorPersona(ids);
      setEstadoPorPersona(estados);
    } catch (err) {
      console.error("[Calificar] Error guardando estado", err);
      setErrorGuardar(err?.response?.data?.mensaje || err.message || "Error al guardar el estado");
      // Revertir visual si falla
      setEstadoPorPersona((prev) => ({ ...prev, [id_persona]: estadoPrevio }));
    } finally {
      setSavingPersonaId(null);
      setSavingTargetEstado(null);
    }
  };

  const tituloModulo = useMemo(() => {
    return modulo?.nombre || modulo?.titulo || `Módulo ${moduloId}`;
  }, [modulo, moduloId]);

  const renderNombre = (p) => {
    const nombre = p?.nombre || p?.nombres || "";
    const apellido = p?.apellido || p?.apellidos || "";
    const full = `${nombre} ${apellido}`.trim();
    return full || nombre || apellido || "(Sin nombre)";
  };

  const renderTipoId = (p) => p?.tipoIdentificacion || p?.tipo_identificacion || "";
  const renderTelefono = (p) => p?.telefono || p?.celular || "";
  const renderCorreo = (p) => p?.correo || p?.email || "";

  const renderEstadoBadge = (id_persona) => {
    const e = (estadoPorPersona[id_persona] || '').toLowerCase();
    if (e === 'aprobado') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
          Aprobó
        </span>
      );
    }
    if (e === 'desaprobado') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
          Desaprobó
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
        Sin estado
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/docente/curso/${ofertaId}?oferta=${ofertaId}`)} className="inline-flex items-center gap-2">
            <span className="text-xl">←</span>
            <span>Volver al curso</span>
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold">Calificar módulo</h1>
            <p className="text-gray-600">{tituloModulo}</p>
            {errorModulo && <p className="text-red-600">{errorModulo}</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <span>👥</span>
            <h3 className="font-semibold">Estudiantes activos en la oferta</h3>
          </div>

          {loadingPersonas && <p className="text-gray-500">Cargando estudiantes...</p>}
          {errorPersonas && <p className="text-red-600">{errorPersonas}</p>}
          {!loadingPersonas && !errorPersonas && personas.length === 0 && (
            <p className="text-gray-500">No hay estudiantes activos para esta oferta.</p>
          )}

          {!loadingPersonas && !errorPersonas && personas.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personas.map((p, idx) => (
                    <tr key={`persona-${Number(p.id ?? idx)}`}>
                      {(() => { const pid = Number(p.id); return (
                        <>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{renderNombre(p)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{renderCorreo(p) || <span className="text-gray-400">—</span>}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{renderTipoId(p) || <span className="text-gray-400">—</span>}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{renderTelefono(p) || <span className="text-gray-400">—</span>}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{renderEstadoBadge(pid)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <Button
                                variant={(estadoPorPersona[pid] || '').toLowerCase() === 'aprobado' ? 'primary' : 'outline'}
                                onClick={() => handleSetEstado(pid, 'aprobado')}
                                className="py-1 px-3 inline-flex items-center gap-2"
                                disabled={savingPersonaId === pid}
                              >
                                Aprobó
                                {savingPersonaId === pid && savingTargetEstado === 'aprobado' && (
                                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                              </Button>
                              <Button
                                variant={(estadoPorPersona[pid] || '').toLowerCase() === 'desaprobado' ? 'primary' : 'outline'}
                                onClick={() => handleSetEstado(pid, 'desaprobado')}
                                className="py-1 px-3 inline-flex items-center gap-2"
                                disabled={savingPersonaId === pid}
                              >
                                Desaprobó
                                {savingPersonaId === pid && savingTargetEstado === 'desaprobado' && (
                                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                              </Button>
                            </div>
                            {errorGuardar && (
                              <div className="mt-1 text-xs text-red-600">{errorGuardar}</div>
                            )}
                          </td>
                        </>
                      ); })()}
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {/* Bloque de acciones movido arriba para usar pid numérico */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}