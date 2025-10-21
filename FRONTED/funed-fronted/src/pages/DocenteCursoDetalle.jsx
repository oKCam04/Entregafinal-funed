import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import moduloService from "../api/services/moduloService";
import ofertaCursoService from "../api/services/ofertaCursoService";
import contenidoApoyoService from "../api/services/contenidoApoyoService";
import personasService from "../api/services/personaService";
import asistenciaService from "../api/services/asistenciaService";
import cursoMatriculadoService from "../api/services/cursoMatriculadoService";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { supabase } from "../supabaseClient";

export default function DocenteCursoDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario, persona } = useAuth();
  const idPersona = usuario?.idPersona || persona?.id;
  const [searchParams] = useSearchParams();
  const ofertaId = searchParams.get("oferta") || id; // fallback al :id si viene como oferta id

  const [modulos, setModulos] = useState([]);
  const [loadingModulos, setLoadingModulos] = useState(false);
  const [errorModulos, setErrorModulos] = useState("");

  const [oferta, setOferta] = useState(null);
  const [loadingOferta, setLoadingOferta] = useState(false);
  const [errorOferta, setErrorOferta] = useState("");

  const [recursos, setRecursos] = useState([]);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [errorRecursos, setErrorRecursos] = useState("");
  // Formulario nuevo recurso
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoDescripcion, setNuevoDescripcion] = useState("");
  const [nuevoUrl, setNuevoUrl] = useState("");
  const [nuevoFile, setNuevoFile] = useState(null);
  const [savingNuevo, setSavingNuevo] = useState(false);
  const [errorNuevo, setErrorNuevo] = useState("");
  // Edición de recurso existente
  const [editingId, setEditingId] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [savingEditId, setSavingEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorEdit, setErrorEdit] = useState("");
  const [errorDelete, setErrorDelete] = useState("");
  const [openNuevo, setOpenNuevo] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // Asistencia: fecha seleccionada y listado de personas
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);
  const [selectedDate, setSelectedDate] = useState("");
  const [personas, setPersonas] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [errorPersonas, setErrorPersonas] = useState("");
  // Mapa de asistencia por fecha: { 'YYYY-MM-DD': { [id_persona]: 'Asistió' | 'No asistió' | null } }
  const [attendanceByDate, setAttendanceByDate] = useState({});
  // Mapa de matrícula por persona para esta oferta: { [id_persona]: id_curso_matriculado }
  const [matriculaByPersona, setMatriculaByPersona] = useState({});
  const [loadingMatriculas, setLoadingMatriculas] = useState(false);
  const [errorMatriculas, setErrorMatriculas] = useState("");
  // Guardado de asistencia por persona
  const [savingAsistenciaByPersona, setSavingAsistenciaByPersona] = useState({});
  // IDs de registros de asistencia por fecha/persona para actualizar
  const [attendanceRecordIds, setAttendanceRecordIds] = useState({});

  // Cargar oferta
  useEffect(() => {
    if (!ofertaId) return;
    let active = true;
    (async () => {
      try {
        setLoadingOferta(true);
        setErrorOferta("");
        const data = await ofertaCursoService.getById(Number(ofertaId));
        if (!active) return;
        setOferta(data || null);
      } catch (err) {
        if (active) setErrorOferta(err?.response?.data?.mensaje || err.message || "Error cargando la oferta");
      } finally {
        active && setLoadingOferta(false);
      }
    })();
    return () => { active = false };
  }, [ofertaId]);

  // Construir mapa de matrícula por persona para esta oferta (una sola carga)
  useEffect(() => {
    if (!ofertaId) return;
    let active = true;
    (async () => {
      try {
        setLoadingMatriculas(true);
        setErrorMatriculas("");
        const all = await cursoMatriculadoService.list();
        const list = Array.isArray(all) ? all : [];
        const ofertaNum = Number(ofertaId);
        const map = {};
        for (const m of list) {
          const idPersonaM = m?.id_persona ?? m?.idPersona;
          const idOfertaM = m?.id_curso_oferta ?? m?.id_oferta_curso ?? m?.idCursoOferta;
          const idMatricula = m?.id ?? m?.id_curso_matriculado ?? m?.idCursoMatriculado;
          if (!idPersonaM || !idOfertaM || !idMatricula) continue;
          const idPersonaNum = Number(idPersonaM);
          const idOfertaNum = Number(idOfertaM);
          const idMatriculaNum = Number(idMatricula);
          if (!Number.isFinite(idPersonaNum) || !Number.isFinite(idOfertaNum) || !Number.isFinite(idMatriculaNum)) continue;
          if (idOfertaNum === ofertaNum) {
            map[idPersonaNum] = idMatriculaNum;
          }
        }
        if (!active) return;
        setMatriculaByPersona(map);
      } catch (err) {
        if (active) setErrorMatriculas(err?.response?.data?.mensaje || err.message || "Error cargando matrículas");
      } finally {
        active && setLoadingMatriculas(false);
      }
    })();
    return () => { active = false };
  }, [ofertaId]);

  // Helpers de render para personas (similar a Calificar)
  const renderNombre = (p) => {
    const nombre = p?.nombre || p?.nombres || "";
    const apellido = p?.apellido || p?.apellidos || "";
    const full = `${nombre} ${apellido}`.trim();
    return full || nombre || apellido || "(Sin nombre)";
  };
  const renderTipoId = (p) => p?.tipoIdentificacion || p?.tipo_identificacion || "";
  const renderTelefono = (p) => p?.telefono || p?.celular || "";
  const renderCorreo = (p) => p?.correo || p?.email || "";

  // Normaliza el id de persona a número válido o null
  const getPersonaId = (p) => {
    const candidates = [
      p?.id,
      p?.id_persona,
      p?.idPersona,
      p?.persona?.id,
      p?.persona?.id_persona,
      p?.persona?.idPersona,
    ];
    for (const c of candidates) {
      const n = Number(c);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
  };

  // Compara si a.fecha coincide con selectedDate (YYYY-MM-DD) considerando UTC y local
  const matchesSelectedDate = (dateVal, selectedYmd) => {
    if (!dateVal || !selectedYmd) return false;
    try {
      // Si viene como string 'YYYY-MM-DD...'
      const raw = typeof dateVal === 'string' ? String(dateVal).slice(0, 10) : null;
      if (raw && raw === selectedYmd) return true;
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return false;
      const ymdUTC = d.toISOString().slice(0, 10);
      if (ymdUTC === selectedYmd) return true;
      const dLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      const ymdLocal = dLocal.toISOString().slice(0, 10);
      return ymdLocal === selectedYmd;
    } catch {
      return false;
    }
  };

  const reloadRecursos = async () => {
    if (!ofertaId) return;
    try {
      setLoadingRecursos(true);
      setErrorRecursos("");
      const data = await contenidoApoyoService.getByOferta(Number(ofertaId));
      const mapped = (Array.isArray(data) ? data : []).map((r, idx) => ({
        id: r.id ?? idx + 1,
        id_oferta_curso: r.id_oferta_curso ?? Number(ofertaId),
        titulo: r.titulo ?? `Recurso ${idx + 1}`,
        descripcion: r.descripcion ?? "",
        url_contenido: r.url_contenido ?? "",
      }));
      setRecursos(mapped);
    } catch (err) {
      setErrorRecursos(err?.response?.data?.mensaje || err.message || "Error cargando recursos");
    } finally {
      setLoadingRecursos(false);
    }
  };

  const handleCreateRecurso = async (e) => {
    e?.preventDefault?.();
    if (!ofertaId) return;
    const titulo = nuevoTitulo.trim();
    const descripcion = nuevoDescripcion.trim();
    if (!titulo) {
      setErrorNuevo("El título es obligatorio");
      return;
    }
    try {
      setSavingNuevo(true);
      setErrorNuevo("");
      // Subir archivo si se seleccionó y obtener URL pública
      let finalUrl = "";
      if (nuevoFile) {
        const bucket = "pagos-funed";
        const ext = nuevoFile.name.split(".").pop();
        const fileName = `${ofertaId}_${Date.now()}.${ext}`;
        const filePath = `contenido/${ofertaId}/${fileName}`;
        const { error: uploadError } = await supabase
          .storage
          .from(bucket)
          .upload(filePath, nuevoFile, { contentType: nuevoFile.type || "application/octet-stream", upsert: true });
        if (uploadError) throw new Error(uploadError.message || "Error subiendo archivo");
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        finalUrl = publicData?.publicUrl || "";
      } else {
        // Si no hay archivo, intenta usar el texto del campo (por compatibilidad)
        finalUrl = nuevoUrl.trim();
      }

      const payload = {
        id_oferta_curso: Number(ofertaId),
        titulo,
        descripcion,
        url_contenido: finalUrl,
      };
      const creado = await contenidoApoyoService.create(payload);
      setRecursos((prev) => [
        ...prev,
        {
          id: creado?.id ?? Math.max(0, ...prev.map((p) => p.id || 0)) + 1,
          id_oferta_curso: creado?.id_oferta_curso ?? Number(ofertaId),
          titulo: creado?.titulo ?? titulo,
          descripcion: creado?.descripcion ?? descripcion,
          url_contenido: creado?.url_contenido ?? finalUrl,
        },
      ]);
      setNuevoTitulo("");
      setNuevoDescripcion("");
      setNuevoUrl("");
      setNuevoFile(null);
      setOpenNuevo(false);
    } catch (err) {
      setErrorNuevo(err?.response?.data?.mensaje || err.message || "Error al crear el recurso");
    } finally {
      setSavingNuevo(false);
    }
  };

  const startEdit = (r) => {
    setEditingId(r?.id ?? null);
    setEditTitulo(r?.titulo ?? "");
    setEditDescripcion(r?.descripcion ?? "");
    setEditUrl(r?.url_contenido ?? "");
    setErrorEdit("");
    setOpenEdit(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitulo("");
    setEditDescripcion("");
    setEditUrl("");
    setErrorEdit("");
    setOpenEdit(false);
  };

  const handleSaveEdit = async (id) => {
    const titulo = editTitulo.trim();
    const descripcion = editDescripcion.trim();
    if (!titulo) {
      setErrorEdit("El título es obligatorio");
      return;
    }
    try {
      setSavingEditId(id);
      setErrorEdit("");
      // Subir archivo nuevo si se seleccionó
      let finalUrl = editUrl.trim();
      if (editFile) {
        const bucket = "pagos-funed";
        const ext = editFile.name.split(".").pop();
        const fileName = `${ofertaId}_${id}_${Date.now()}.${ext}`;
        const filePath = `contenido/${ofertaId}/${fileName}`;
        const { error: uploadError } = await supabase
          .storage
          .from(bucket)
          .upload(filePath, editFile, { contentType: editFile.type || "application/octet-stream", upsert: true });
        if (uploadError) throw new Error(uploadError.message || "Error subiendo archivo");
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        finalUrl = publicData?.publicUrl || finalUrl;
      }
      const payload = { titulo, descripcion, url_contenido: finalUrl };
      const actualizado = await contenidoApoyoService.update(id, payload);
      setRecursos((prev) => prev.map((r) =>
        (r.id === id)
          ? {
              ...r,
              titulo: actualizado?.titulo ?? titulo,
              descripcion: actualizado?.descripcion ?? descripcion,
              url_contenido: actualizado?.url_contenido ?? finalUrl,
            }
          : r
      ));
      setEditFile(null);
      cancelEdit();
    } catch (err) {
      setErrorEdit(err?.response?.data?.mensaje || err.message || "Error al actualizar el recurso");
    } finally {
      setSavingEditId(null);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("¿Deseas eliminar este recurso?");
    if (!ok) return;
    try {
      setDeletingId(id);
      setErrorDelete("");
      await contenidoApoyoService.remove(id);
      setRecursos((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setErrorDelete(err?.response?.data?.mensaje || err.message || "Error al eliminar el recurso");
    } finally {
      setDeletingId(null);
    }
  };

  // Cargar módulos asignados al docente para esta oferta
  useEffect(() => {
    if (!idPersona || !ofertaId) return;
    let active = true;
    (async () => {
      try {
        setLoadingModulos(true);
        setErrorModulos("");
        const mods = await moduloService.listByDocenteOferta(Number(idPersona), Number(ofertaId));
        const mapped = (Array.isArray(mods) ? mods : []).map((m, idx) => ({
          id: m.id ?? idx + 1,
          titulo: m.nombre ?? `Módulo ${idx + 1}`,
        }));
        if (!active) return;
        setModulos(mapped);
      } catch (err) {
        if (active) setErrorModulos(err?.response?.data?.mensaje || err.message || "Error cargando módulos");
      } finally {
        active && setLoadingModulos(false);
      }
    })();
    return () => { active = false };
  }, [idPersona, ofertaId]);

  // Cargar recursos asociados a la oferta
  useEffect(() => {
    if (!ofertaId) return;
    let active = true;
    (async () => {
      try {
        setLoadingRecursos(true);
        setErrorRecursos("");
        const data = await contenidoApoyoService.getByOferta(Number(ofertaId));
        const mapped = (Array.isArray(data) ? data : []).map((r, idx) => ({
          id: r.id ?? idx + 1,
          id_oferta_curso: r.id_oferta_curso ?? Number(ofertaId),
          titulo: r.titulo ?? `Recurso ${idx + 1}`,
          descripcion: r.descripcion ?? "",
          url_contenido: r.url_contenido ?? "",
        }));
        if (!active) return;
        setRecursos(mapped);
      } catch (err) {
        if (active) setErrorRecursos(err?.response?.data?.mensaje || err.message || "Error cargando recursos");
      } finally {
        active && setLoadingRecursos(false);
      }
    })();
    return () => { active = false };
  }, [ofertaId]);

  // Inicializar fecha seleccionada a hoy
  useEffect(() => {
    if (!selectedDate) setSelectedDate(todayStr);
  }, [todayStr, selectedDate]);

  // Cargar personas activas matriculadas por oferta (para asistencia)
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

  // Al cambiar la fecha, cargar y pintar estado de asistencia desde backend
  useEffect(() => {
    // Requiere: fecha válida, personas y mapa de matrículas listo
    if (!selectedDate || !personas?.length) return;
    // Evita consultas si aún cargan matrículas/personas
    if (loadingPersonas || loadingMatriculas) return;
    let active = true;
    (async () => {
      try {
        // Limpia estado previo para la fecha seleccionada
        setAttendanceByDate((prev) => ({ ...prev, [selectedDate]: {} }));
        setAttendanceRecordIds((prev) => ({ ...prev, [selectedDate]: {} }));
        // Consultar asistencia por persona+matrícula y mapear al estado para la fecha
        const tasks = personas.map(async (p) => {
          const pid = getPersonaId(p);
          const mid = matriculaByPersona[pid];
          if (!Number.isFinite(pid) || !Number.isFinite(Number(mid))) return;
          const list = await asistenciaService.getByPersonaCurso(pid, Number(mid));
          // Buscar coincidencia exacta por día (ajustando TZ)
          const match = list.find((a) => {
            const d = a?.fecha ? new Date(a.fecha) : null;
            if (!d) return false;
            const ymdUTC = d.toISOString().slice(0, 10);
            const dLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
            const ymdLocal = dLocal.toISOString().slice(0, 10);
            return ymdUTC === selectedDate || ymdLocal === selectedDate;
          });
          const estadoLabel = match ? (match.asistio === 'Si' ? 'Asistió' : 'No asistió') : null;
          if (!active) return;
          // Pintar estado y guardar id de registro si existe
          setAttendanceByDate((prev) => ({
            ...prev,
            [selectedDate]: {
              ...(prev[selectedDate] || {}),
              [pid]: estadoLabel,
            },
          }));
          if (match?.id) {
            setAttendanceRecordIds((prev) => ({
              ...prev,
              [selectedDate]: {
                ...(prev[selectedDate] || {}),
                [pid]: match.id,
              },
            }));
          }
        });
        await Promise.all(tasks);
      } catch (err) {
        console.error('Error cargando asistencia por fecha', err);
      }
    })();
    return () => { active = false };
  }, [selectedDate, personas, matriculaByPersona, loadingPersonas, loadingMatriculas]);

  const setAsistencia = (idPersona, estado) => {
    if (!selectedDate) return;
    setAttendanceByDate((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [idPersona]: estado,
      },
    }));
  };

  const persistAsistencia = async (idPersona, estadoLabel) => {
    if (!selectedDate) return;
    const asistio = estadoLabel === "Asistió" ? "Si" : "No";
    const idMatricula = matriculaByPersona[idPersona];
    // Normalizar tipos y fecha para el backend
    const idPersonaNum = Number(idPersona);
    const idMatriculaNum = Number(idMatricula);
    const fechaSend = selectedDate ? new Date(`${selectedDate}T00:00:00.000Z`) : null;
    if (!Number.isFinite(idPersonaNum)) {
      console.warn("Persistencia de asistencia: id_persona inválido", { idPersona });
      return;
    }
    if (!idMatricula) {
      // No hay matrícula; solo actualiza local y marca error global
      setAsistencia(idPersona, estadoLabel);
      setErrorMatriculas("No se encontró matrícula para el estudiante en esta oferta.");
      return;
    }

    setSavingAsistenciaByPersona((prev) => ({ ...prev, [idPersona]: true }));
    try {
      // Si ya tenemos el id cargado para esta fecha/persona, usar PATCH directamente
      const existingIdLocal = attendanceRecordIds[selectedDate]?.[idPersona];
      let match = null;
      if (existingIdLocal) {
        match = { id: existingIdLocal };
      } else {
        // Obtener lista y buscar coincidencia por fecha
        const existingList = await asistenciaService.getByPersonaCurso(idPersonaNum, idMatriculaNum);
        match = existingList.find((a) => matchesSelectedDate(a?.fecha, selectedDate));
      }

      if (match?.id) {
        const updatePayload = { asistio, id_persona: idPersonaNum, fecha: fechaSend };
        console.log("PATCH /api/asistencia/", match.id, updatePayload);
        const updated = await asistenciaService.update(match.id, updatePayload);
        // Guardar id del registro para futuros cambios
        setAttendanceRecordIds((prev) => ({
          ...prev,
          [selectedDate]: {
            ...(prev[selectedDate] || {}),
            [idPersona]: updated?.id ?? match.id,
          },
        }));
      } else {
        const createPayload = {
          id_curso_matriculado: idMatriculaNum,
          id_persona: idPersonaNum,
          asistio,
          fecha: fechaSend,
        };
        console.log("POST /api/asistencia", createPayload);
        const created = await asistenciaService.create(createPayload);
        setAttendanceRecordIds((prev) => ({
          ...prev,
          [selectedDate]: {
            ...(prev[selectedDate] || {}),
            [idPersona]: created?.id ?? (created?.asistencia?.id),
          },
        }));
      }

      // Actualiza estado local
      setAsistencia(idPersona, estadoLabel);
    } catch (err) {
      // En caso de error, igualmente refleja local para no bloquear la UI
      setAsistencia(idPersona, estadoLabel);
      console.error("Error guardando asistencia", err);
    } finally {
      setSavingAsistenciaByPersona((prev) => ({ ...prev, [idPersona]: false }));
    }
  };

  const [activeTab, setActiveTab] = useState("modulos");

  const totalModulos = useMemo(() => modulos.length, [modulos]);
  // Progreso no aplica en vista docente; se omite barra de progreso

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate("/docente/cursos-asignados")} className="inline-flex items-center gap-2">
            <span className="text-xl">←</span>
            <span>Volver</span>
          </Button>
        </div>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Módulos" value={String(totalModulos)} color="orange" />
          <StatCard title="Recursos" value={String(recursos.length)} color="purple" />
        </div>

        {/* Barra de progreso removida para vista docente */}

        <div className="flex gap-6 border-b border-gray-200 mb-4">
          <button
            className={`pb-2 ${activeTab === "modulos" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("modulos")}
          >
            Módulos
          </button>
          <button
            className={`pb-2 ${activeTab === "contenido" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("contenido")}
          >
            Contenido
          </button>
          <button
            className={`pb-2 ${activeTab === "asistencia" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("asistencia")}
          >
            Asistencia
          </button>
        </div>

        {activeTab === "modulos" && (
          <div className="space-y-4">
            {loadingModulos && <p className="text-gray-500">Cargando módulos...</p>}
            {errorModulos && (
              <p className="text-red-600">{errorModulos}</p>
            )}
            {!loadingModulos && !errorModulos && modulos.length === 0 && (
              <p className="text-gray-500">No hay módulos asignados para esta oferta.</p>
            )}
            {modulos.map((modulo) => (
              <div key={`mod-${modulo.id}`} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl">📘</div>
                  <div>
                    <p className="font-semibold">{modulo.titulo}</p>
                  </div>
                </div>
                <div>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/docente/curso/${ofertaId}/modulo/${modulo.id}/calificar`)}
                    className="inline-flex items-center gap-2"
                  >
                    Calificar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "contenido" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <span>📚</span>
                  <h3 className="font-semibold">Contenido de apoyo</h3>
                </div>
                <Button variant="primary" onClick={() => setOpenNuevo(true)}>Nuevo contenido</Button>
              </div>
              {loadingRecursos && (
                <p className="text-gray-500">Cargando recursos...</p>
              )}
              {errorRecursos && (
                <p className="text-red-600">{errorRecursos}</p>
              )}
              {/* Botón abre Modal; el guardado real se integrará luego */}

              {!loadingRecursos && !errorRecursos && recursos.length === 0 && (
                <p className="text-gray-500">No hay recursos disponibles.</p>
              )}
              {!loadingRecursos && !errorRecursos && recursos.length > 0 && (
                <div className="space-y-3">
                  {recursos.map((r, idx) => (
                    <div key={`rec-${r.id ?? idx}`} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">📘</div>
                          <div>
                            <p className="font-semibold">{r.titulo}</p>
                            <p className="text-sm text-gray-500">{r.descripcion}</p>
                          </div>
                        </div>
                        {r.url_contenido ? (
                          <a
                            href={r.url_contenido}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Abrir
                          </a>
                        ) : (
                          <span className="text-gray-400">Sin enlace</span>
                        )}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <Button variant="secondary" onClick={() => startEdit(r)}>Editar</Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                        >
                          {deletingId === r.id ? "Eliminando…" : "Eliminar"}
                        </Button>
                      </div>

                      {errorDelete && deletingId === r.id && (
                        <p className="text-red-600 text-sm mt-2">{errorDelete}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "asistencia" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6 text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  <h3 className="font-semibold text-lg">Registro de Asistencia</h3>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona fecha</label>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-64 rounded-lg border border-gray-300 px-4 py-3 text-lg"
                  />
                  <div className="text-sm text-gray-500">Hoy: <span className="font-medium text-gray-700">{todayStr}</span></div>
                </div>
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
                      {personas.map((p, idx) => {
                        const idPersonaApi = getPersonaId(p);
                        const idP = idPersonaApi ?? (idx + 1); // para key/UI, pero usar idPersonaApi para API
                        const estado = attendanceByDate[selectedDate]?.[idP] || null;
                        const badgeClass = estado === "Asistió"
                          ? "bg-green-100 text-green-600"
                          : estado === "No asistió"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600";
                        const badgeText = estado || "Pendiente";
                        return (
                          <tr key={`asis-${idP}`}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{renderNombre(p)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{renderCorreo(p) || <span className="text-gray-400">—</span>}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{renderTipoId(p) || <span className="text-gray-400">—</span>}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{renderTelefono(p) || <span className="text-gray-400">—</span>}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <span className={`px-3 py-1 rounded-full text-sm ${badgeClass}`}>{badgeText}</span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant={estado === "Asistió" ? "primary" : "outline"}
                                  onClick={() => Number.isFinite(idPersonaApi) && persistAsistencia(idPersonaApi, "Asistió")}
                                  className="py-1 px-3 inline-flex items-center gap-2"
                                  disabled={!Number.isFinite(idPersonaApi) || !!savingAsistenciaByPersona[idPersonaApi]}
                                >
                                  {Number.isFinite(idPersonaApi) && savingAsistenciaByPersona[idPersonaApi] && estado !== "Asistió" ? "Guardando…" : "Asistió"}
                                </Button>
                                <Button
                                  variant={estado === "No asistió" ? "primary" : "outline"}
                                  onClick={() => Number.isFinite(idPersonaApi) && persistAsistencia(idPersonaApi, "No asistió")}
                                  className="py-1 px-3 inline-flex items-center gap-2"
                                  disabled={!Number.isFinite(idPersonaApi) || !!savingAsistenciaByPersona[idPersonaApi]}
                                >
                                  {Number.isFinite(idPersonaApi) && savingAsistenciaByPersona[idPersonaApi] && estado !== "No asistió" ? "Guardando…" : "No asistió"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Nuevo contenido (solo diseño, sin API) */}
        <Modal open={openNuevo} title="Nuevo contenido de apoyo" onClose={() => setOpenNuevo(false)}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Ej: Guía rápida"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo del contenido</label>
                <input
                  type="file"
                  onChange={(e) => setNuevoFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  accept="*/*"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={nuevoDescripcion}
                  onChange={(e) => setNuevoDescripcion(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  rows={3}
                  placeholder="Breve descripción del recurso"
                />
              </div>
            </div>
            {errorNuevo && (
              <div className="rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{errorNuevo}</div>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpenNuevo(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={savingNuevo} onClick={handleCreateRecurso}>
                {savingNuevo ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Editar contenido */}
        <Modal open={openEdit} title="Editar contenido de apoyo" onClose={cancelEdit}>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(editingId); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo del contenido (opcional)</label>
                <input
                  type="file"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  accept="*/*"
                />
                <p className="text-xs text-gray-500 mt-1">Actual: <a href={editUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{editUrl ? "Abrir enlace" : "Sin enlace"}</a></p>
              </div>
            </div>
            {errorEdit && (
              <div className="rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{errorEdit}</div>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={cancelEdit}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={savingEditId === editingId}>
                {savingEditId === editingId ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    green: "bg-green-100 text-green-600 border-green-200",
    orange: "bg-orange-100 text-orange-600 border-orange-200",
    purple: "bg-purple-100 text-purple-600 border-purple-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.gray}`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}