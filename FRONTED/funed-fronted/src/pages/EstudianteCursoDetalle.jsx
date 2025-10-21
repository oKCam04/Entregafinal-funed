import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import moduloService from "../api/services/moduloService";
import calificacionesService from "../api/services/calificacionesService";
import asistenciaService from "../api/services/asistenciaService";
import certificadoService from "../api/services/certificadoService";
import contenidoApoyoService from "../api/services/contenidoApoyoService";
import cursoMatriculadoService from "../api/services/cursoMatriculadoService";
import ofertaCursoService from "../api/services/ofertaCursoService";
import moduloDocenteService from "../api/services/moduloDocenteService";
import { useAuth } from "../auth/AuthContext";

export default function EstudianteCursoDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario } = useAuth();
  const [searchParams] = useSearchParams();
  const ofertaId = searchParams.get("oferta");
  const [modulos, setModulos] = useState([]);
  const [loadingModulos, setLoadingModulos] = useState(false);
  const [errorModulos, setErrorModulos] = useState("");
  const [calificaciones, setCalificaciones] = useState([]);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false);
  const [errorCalificaciones, setErrorCalificaciones] = useState("");
  const [ultimoResultado, setUltimoResultado] = useState(null);

  // Cargar módulos desde API según oferta
  useEffect(() => {
    if (!ofertaId) return;
    (async () => {
      try {
        setLoadingModulos(true);
        setErrorModulos("");
        const mods = await moduloService.listByOfertaCurso(ofertaId);
        // Obtener asignaciones módulo-docente para esta oferta
        const asignaciones = await moduloDocenteService.getByOferta(ofertaId);
        const docentePorModulo = new Map();
        for (const a of (Array.isArray(asignaciones) ? asignaciones : [])) {
          const modId = a?.modulo?.id ?? a?.id_modulo;
          const docName = a?.docenteNombre || (a?.docente?.persona ? `${a.docente.persona.nombre} ${a.docente.persona.apellido}` : "");
          if (modId && docName) docentePorModulo.set(Number(modId), docName);
        }
        // Mapear a estructura usada en UI
        const mapped = (Array.isArray(mods) ? mods : []).map((m, idx) => ({
          id: m.id ?? idx + 1,
          titulo: m.nombre ?? `Módulo ${idx + 1}`,
          duracion: "",
          estado: "Pendiente",
          nota: null,
          // Preferir nombre del docente provisto por listarModulosPorOfertaCurso; si no, usar el mapa de asignaciones
          docente: m.docenteNombre || docentePorModulo.get(Number(m.id)) || "Docente por asignar",
        }));
        setModulos(mapped);
      } catch (err) {
        setErrorModulos(err?.response?.data?.mensaje || err.message || "Error cargando módulos");
      } finally {
        setLoadingModulos(false);
      }
    })();
  }, [ofertaId]);

  // Cargar calificaciones desde API según oferta
  useEffect(() => {
    const idPersona = usuario?.idPersona;
    if (!ofertaId || !idPersona) return;
    (async () => {
      try {
        setLoadingCalificaciones(true);
        setErrorCalificaciones("");
        const items = await calificacionesService.getNotasModuloByPersonaOferta(idPersona, ofertaId);
        // Normalizar por si faltan campos con la nueva estructura (estado)
        const mapped = (Array.isArray(items) ? items : []).map((n) => ({
          id: n.id,
          estado: n.estado || "Pendiente",
          moduloNombre: n.modulo?.nombre || "Módulo",
          fechaRegistro: n.fecha_registro || null,
        }));
        setCalificaciones(mapped);
      } catch (err) {
        setErrorCalificaciones(
          err?.response?.data?.mensaje || err.message || "Error cargando calificaciones"
        );
      } finally {
        setLoadingCalificaciones(false);
      }
    })();
  }, [ofertaId, usuario?.idPersona]);

  // Actualizar resultado de la matrícula según calificaciones
  useEffect(() => {
    if (!id) return;
    const estados = (Array.isArray(calificaciones) ? calificaciones : []).map(c => c?.estado || 'Pendiente');

    let nuevoResultado;
    if (estados.length === 0 || estados.some(e => e === 'Pendiente')) {
      nuevoResultado = 'Pendiente';
    } else if (estados.some(e => e === 'Desaprobó')) {
      nuevoResultado = 'Desaprobado';
    } else if (estados.every(e => e === 'Aprobó')) {
      nuevoResultado = 'Aprobado';
    } else {
      nuevoResultado = 'Reprobado';
    }

    // Evitar parches repetidos si el resultado no cambia
    if (nuevoResultado && nuevoResultado !== ultimoResultado) {
      (async () => {
        try {
          await cursoMatriculadoService.update(id, { resultado: nuevoResultado });
          setUltimoResultado(nuevoResultado);
          setCertificadoDisponible(nuevoResultado === 'Aprobado');
        } catch (e) {
          // Silencioso: no interrumpir la vista por error al guardar
        }
      })();
    }
  }, [id, calificaciones, ultimoResultado]);

  // 🔹 Recursos desde API ContenidoApoyo (por oferta)
  const [recursos, setRecursos] = useState([]);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [errorRecursos, setErrorRecursos] = useState("");

  useEffect(() => {
    if (!ofertaId) return;
    (async () => {
      try {
        setLoadingRecursos(true);
        setErrorRecursos("");
        const data = await contenidoApoyoService.getByOferta(ofertaId);
        const mapped = (Array.isArray(data) ? data : []).map((r, idx) => ({
          id: r.id ?? idx + 1,
          titulo: r.titulo ?? `Recurso ${idx + 1}`,
          descripcion: r.descripcion ?? "",
          url: r.url_contenido ?? "",
        }));
        setRecursos(mapped);
      } catch (err) {
        setErrorRecursos(
          err?.response?.data?.mensaje || err.message || "Error cargando recursos"
        );
      } finally {
        setLoadingRecursos(false);
      }
    })();
  }, [ofertaId]);

  // 🔹 Estado para Tabs
  const [activeTab, setActiveTab] = useState("modulos");
  const [certificadoDisponible, setCertificadoDisponible] = useState(false);
  // 🔹 Oferta para datos reales
  const [oferta, setOferta] = useState(null);
  const [loadingOferta, setLoadingOferta] = useState(false);
  const [errorOferta, setErrorOferta] = useState("");

  useEffect(() => {
    if (!ofertaId) return;
    (async () => {
      try {
        setLoadingOferta(true);
        setErrorOferta("");
        const data = await ofertaCursoService.getById(Number(ofertaId));
        setOferta(data || null);
      } catch (err) {
        setErrorOferta(err?.response?.data?.mensaje || err.message || "Error cargando la oferta");
      } finally {
        setLoadingOferta(false);
      }
    })();
  }, [ofertaId]);

  // Verificar si la matrícula está Aprobada para mostrar Certificado
  useEffect(() => {
    (async () => {
      try {
        // Si no hay id de matrícula, no se puede verificar
        if (!id) {
          setCertificadoDisponible(false);
          return;
        }
        const list = await cursoMatriculadoService.list();
        const match = Array.isArray(list) ? list.find((m) => String(m.id) === String(id)) : null;
        const aprobado = match?.resultado === "Aprobado";
        setCertificadoDisponible(Boolean(aprobado));
        // Si la pestaña activa es certificado y deja de estar disponible, regresar a "modulos"
        if (!aprobado && activeTab === "certificado") {
          setActiveTab("modulos");
        }
      } catch (err) {
        // En caso de error, por seguridad ocultamos el certificado
        setCertificadoDisponible(false);
        if (activeTab === "certificado") setActiveTab("modulos");
      }
    })();
  }, [id]);

  // 🔹 Estado de asistencias desde API
  const [asistencias, setAsistencias] = useState([]);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);
  const [errorAsistencias, setErrorAsistencias] = useState("");

  // Cargar asistencias por persona y curso matriculado
  useEffect(() => {
    const idPersona = usuario?.idPersona;
    if (!idPersona || !id) return;
    (async () => {
      try {
        setLoadingAsistencias(true);
        setErrorAsistencias("");
        const data = await asistenciaService.getByPersonaCurso(idPersona, id);
        const mapped = (Array.isArray(data) ? data : []).map((a, idx) => ({
          id: a.id ?? idx + 1,
          fecha: a.fecha ?? null,
          estado: a.asistio === "Si" ? "Presente" : "Ausente",
        }));
        setAsistencias(mapped);
      } catch (err) {
        setErrorAsistencias(
          err?.response?.data?.message || err.message || "Error cargando asistencias"
        );
      } finally {
        setLoadingAsistencias(false);
      }
    })();
  }, [usuario?.idPersona, id]);

  // 🔹 Helpers de calificación cualitativa
  const getEtiqueta = (nota) => {
    if (nota === null || nota === undefined) return "Pendiente";
    if (nota >= 90) return "Excelente";
    if (nota >= 80) return "Bueno";
    if (nota >= 70) return "Aceptable";
    return "Insuficiente";
  };

  const getEtiquetaColor = (nota) => {
    if (nota === null || nota === undefined) return "text-gray-500";
    if (nota >= 90) return "text-green-600";
    if (nota >= 80) return "text-orange-500";
    if (nota >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // 🔹 Helpers de asistencia
  const formatFecha = (isoDate) => {
    const d = new Date(isoDate);
    const dia = d.getDate().toString().padStart(2, "0");
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const mes = meses[d.getMonth()];
    return `${dia} ${mes}`;
  };

  const asistCardClasses = (estado) =>
    estado === "Presente"
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200";

  const asistIcon = (estado) => (estado === "Presente" ? "✅" : "⏰");

  const asistLabelColor = (estado) => (estado === "Presente" ? "text-green-700" : "text-red-600");

  // 🔹 Métricas dinámicas
  const asistenciaPercent = useMemo(() => {
    const total = asistencias.length;
    const presentes = asistencias.filter((a) => a.estado === "Presente").length;
    return total ? Math.round((presentes / total) * 100) : 0;
  }, [asistencias]);

  const totalModulos = modulos.length;
  const evaluadas = useMemo(
    () => calificaciones.filter((c) => c.estado && c.estado !== "Pendiente"),
    [calificaciones]
  );
  const aprobadasCount = useMemo(
    () => evaluadas.filter((c) => c.estado === "Aprobó").length,
    [evaluadas]
  );
  const promedioAprobacion = useMemo(
    () => (evaluadas.length ? Math.round((aprobadasCount / evaluadas.length) * 100) : 0),
    [evaluadas, aprobadasCount]
  );
  const modulosCompletados = evaluadas.length;
  const progresoGeneral = useMemo(
    () => (totalModulos ? Math.round((modulosCompletados / totalModulos) * 100) : 0),
    [modulosCompletados, totalModulos]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-md"
        onClick={() => navigate("/Estudiante")}
      >
        Volver
      </button>
      {/* Encabezado del curso (dinámico) */}
      <h1 className="text-3xl font-bold">{oferta?.curso?.nombre_curso || oferta?.curso?.nombreCurso || "Curso"}</h1>
      <p className="text-gray-600 mb-4">
        {oferta?.curso?.temario
          ? (Array.isArray(oferta.curso.temario)
              ? oferta.curso.temario.join(", ")
              : String(oferta.curso.temario))
          : "Contenido del curso"}
      </p>
      <div className="flex items-center gap-6 text-gray-500 mb-6">
        <span>👨‍🏫 {oferta?.docente?.nombre || oferta?.docente_nombre || "Docente asignado"}</span>
        <span>📅 Inicio: {oferta?.fecha_inicio_curso ? new Date(oferta.fecha_inicio_curso).toLocaleDateString() : "—"}</span>
        <span>⏳ Duración: {oferta?.curso?.duracion ? `${oferta.curso.duracion} horas` : "—"}</span>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Promedio" value={String(promedioAprobacion)} color="blue" />
        <StatCard title="Asistencia" value={`${asistenciaPercent}%`} color="green" />
        <StatCard title="Módulos" value={`${modulosCompletados}/${totalModulos || 0}`} color="orange" />
        <StatCard title="Recursos" value={String(recursos.length)} color="purple" />
      </div>

      {/* Progreso General */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <p className="text-gray-600 mb-2">Progreso General</p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progresoGeneral}%` }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{modulosCompletados} de {totalModulos || 0} módulos completados</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-4">
        <button
          className={`pb-2 -mb-px ${
            activeTab === "modulos" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("modulos")}
        >
          Módulos
        </button>
        <button
          className={`pb-2 -mb-px ${
            activeTab === "calificaciones" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("calificaciones")}
        >
          Calificaciones
        </button>
        <button
          className={`pb-2 -mb-px ${
            activeTab === "asistencia" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("asistencia")}
        >
          Asistencia
        </button>
        <button
          className={`pb-2 -mb-px ${
            activeTab === "recursos" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("recursos")}
        >
          Recursos
        </button>
        {certificadoDisponible && (
          <button
            className={`pb-2 -mb-px ${
              activeTab === "certificado" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("certificado")}
          >
            Certificado
          </button>
        )}
      </div>

      {/* Contenido: Módulos */}
      {activeTab === "modulos" && (
        <div className="space-y-4">
          {loadingModulos && <p className="text-gray-500">Cargando módulos...</p>}
          {errorModulos && (
            <p className="text-red-600">{errorModulos}</p>
          )}
          {!loadingModulos && !errorModulos && modulos.length === 0 && (
            <p className="text-gray-500">No hay módulos disponibles para esta oferta.</p>
          )}
          {modulos.map((modulo) => (
            <div
              key={modulo.id}
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow border"
            >
              <div>
                <h3 className="font-medium">{modulo.titulo}</h3>
                {modulo.duracion && (
                  <p className="text-sm text-gray-500">Duración: {modulo.duracion}</p>
                )}
                <p className="text-sm text-gray-500">Docente: {modulo.docente || "Por asignar"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contenido: Certificado (dinámico) */}
      {activeTab === "certificado" && certificadoDisponible && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">🎓</span>
                <div>
                  <h3 className="font-semibold text-lg">Certificado disponible</h3>
                  <p className="text-sm text-gray-500">
                    Curso: {oferta?.curso?.nombre_curso || oferta?.curso?.nombreCurso || "Curso"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Alumno: {usuario?.nombre || "Estudiante"}
                  </p>
                </div>
              </div>
              <button
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={async () => {
                  try {
                    // id es el id de la matrícula de la ruta /Estudiante/curso/:id
                    await certificadoService.generateAndDownload(id);
                  } catch (e) {
                    alert(e?.response?.data?.message || e?.message || 'No se pudo generar el certificado');
                  }
                }}
                onClick={async () => {
                  try {
                    // id es el id de la matrícula de la ruta /Estudiante/curso/:id
                    await certificadoService.generateAndDownload(id);
                  } catch (e) {
                    alert(e?.response?.data?.message || e?.message || 'No se pudo generar el certificado');
                  }
                }}
              >
                Descargar certificado
                Descargar certificado
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Tu certificado está habilitado porque aprobaste la matrícula. Si ya lo solicitaste, podrás descargarlo cuando esté listo.
            </div>
          </div>
        </div>
      )}

      {/* Contenido: Recursos */}
      {activeTab === "recursos" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <span>📄</span>
              <h3 className="font-semibold">Recursos Adicionales</h3>
            </div>
            {loadingRecursos && <p className="text-gray-500">Cargando recursos...</p>}
            {errorRecursos && <p className="text-red-600">{errorRecursos}</p>}
            {!loadingRecursos && !errorRecursos && recursos.length === 0 && (
              <p className="text-gray-500">No hay recursos disponibles para esta oferta.</p>
            )}
            {!loadingRecursos && !errorRecursos && recursos.length > 0 && (
              <div className="space-y-3">
                {recursos.map((r) => (
                  <div key={`rec-${r.id}`} className="flex items-center justify-between bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">📘</div>
                      <div>
                        <p className="font-semibold">{r.titulo}</p>
                        <p className="text-sm text-gray-500">{r.descripcion}</p>
                      </div>
                    </div>
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-50 transition"
                      >
                        <span>🔗</span>
                        Abrir
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin enlace</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido: Calificaciones */}
      {activeTab === "calificaciones" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <span>📊</span>
              <h3 className="font-semibold">Historial de Calificaciones</h3>
            </div>
            {loadingCalificaciones && <p className="text-gray-500">Cargando calificaciones...</p>}
            {errorCalificaciones && (
              <p className="text-red-600">{errorCalificaciones}</p>
            )}
            {!loadingCalificaciones && !errorCalificaciones && calificaciones.length === 0 && (
              <p className="text-gray-500">No hay calificaciones registradas para esta oferta.</p>
            )}
            <div className="space-y-3">
              {calificaciones.map((c, idx) => (
                <div
                  key={`cal-${c.id ?? idx}`}
                  className="flex items-center justify-between bg-white rounded-xl border p-4"
                >
                  <div>
                    <p className="font-semibold">{c.moduloNombre}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        c.estado === "Aprobó"
                          ? "bg-green-100 text-green-600"
                          : c.estado === "Desaprobó"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contenido: Asistencia */}
      {activeTab === "asistencia" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <span>📅</span>
              <h3 className="font-semibold">Registro de Asistencia</h3>
            </div>
            {loadingAsistencias && (
              <p className="text-gray-500">Cargando asistencias...</p>
            )}
            {errorAsistencias && (
              <p className="text-red-600">{errorAsistencias}</p>
            )}
            {!loadingAsistencias && !errorAsistencias && asistencias.length === 0 && (
              <p className="text-gray-500">No hay registros de asistencia.</p>
            )}
            {!loadingAsistencias && !errorAsistencias && asistencias.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {asistencias.map((a) => (
                  <div
                    key={`asis-${a.id}`}
                    className={`rounded-xl border p-5 ${asistCardClasses(a.estado)}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="text-2xl opacity-80">{asistIcon(a.estado)}</div>
                      <p className="font-semibold">{a.fecha ? formatFecha(a.fecha) : "—"}</p>
                      <p className={`text-sm ${asistLabelColor(a.estado)}`}>{a.estado}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
  };

  return (
    <div className="p-4 rounded-lg shadow bg-white text-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-2xl font-bold ${colorMap[color] || ""}`}>{value}</p>
    </div>
  );
}
