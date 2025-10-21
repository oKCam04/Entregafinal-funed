import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import personaService from "../api/services/personaService";
import documentoService from "../api/services/documentoService";
import authService from "../api/services/authService";
import usuarioService from "../api/services/usuarioService";
import { supabase } from "../supabaseClient";

export default function PerfilPage() {
  const { usuario, persona } = useAuth();
  const idPersona = usuario?.idPersona || persona?.id;
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("informacion"); // informacion | documentos
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    tipo_identificacion: "CC",
    numero_identificacion: "",
    fecha_nacimiento: "",
    telefono: "",
    correo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);

  // Estado para cambiar contraseña
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  // Documentos
  const [doc, setDoc] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [errorDocs, setErrorDocs] = useState("");
  const [docForm, setDocForm] = useState({
    documento_identidad: "",
    foto_3x4: "",
    recibo_publico: "",
    acta_grado: "",
    eps_salud: "",
  });
  const [docFiles, setDocFiles] = useState({
    documento_identidad: null,
    foto_3x4: null,
    recibo_publico: null,
    acta_grado: null,
    eps_salud: null,
  });
  const [removedFields, setRemovedFields] = useState({});
  const [inputKeys, setInputKeys] = useState({
    documento_identidad: 0,
    foto_3x4: 0,
    recibo_publico: 0,
    acta_grado: 0,
    eps_salud: 0,
  });

  // Utilidades para la tarjeta de perfil
  const formatDate = (d) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  // UI helper para un campo de documento
  const renderDocItem = ({ field, label, accept }) => {
    const selectedFile = docFiles[field];
    const existingUrl = doc?.[field];
    const removed = removedFields[field];
    return (
      <div>
        <label className="block text-sm text-slate-700 font-medium mb-1">{label}</label>
        <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              {/* Estado del archivo seleccionado */}
              {selectedFile ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h7a2 2 0 002-2V9.414A2 2 0 0012.586 8L9 4.414A2 2 0 007.586 4H4z" /><path d="M8 4v4a2 2 0 002 2h4"/></svg>
                    {selectedFile.name}
                  </span>
                  <button type="button" onClick={() => clearSelected(field)} className="text-xs text-red-600 hover:underline">Quitar seleccionado</button>
                </div>
              ) : existingUrl && !removed ? (
                <div className="flex items-center gap-2">
                  <a href={existingUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-700 underline">Ver archivo actual</a>
                  <button type="button" onClick={() => handleRemoveField(field)} className="text-xs text-red-600 hover:underline">Quitar archivo actual</button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin archivo seleccionado</p>
              )}
              {removed && (
                <p className="text-xs text-red-600 mt-1">Archivo marcado para eliminar</p>
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v1a1 1 0 001 1h14a1 1 0 001-1V5a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M3 9a1 1 0 011-1h12a1 1 0 011 1v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm4 2a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                <span>Seleccionar</span>
                <input key={inputKeys[field]} type="file" name={field} accept={accept} onChange={handleDocFileChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const initials = ([form.nombre, form.apellido].filter(Boolean).map((s) => s[0]).join("") || "US").toUpperCase();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        if (!idPersona) {
          // Si no hay id, inicializa con datos del contexto si existen
          setForm((f) => ({
            ...f,
            nombre: persona?.nombre || "",
            apellido: persona?.apellido || "",
            correo: persona?.correo || "",
            telefono: persona?.telefono || "",
          }));
          return;
        }
        const data = await personaService.getById(idPersona);
        const p = data?.persona || data; // soporte a distintas formas
        active &&
          setForm({
            nombre: p?.nombre || "",
            apellido: p?.apellido || "",
            tipo_identificacion: p?.tipo_identificacion || "CC",
            numero_identificacion: p?.numero_identificacion || "",
            fecha_nacimiento: p?.fecha_nacimiento ? new Date(p.fecha_nacimiento).toISOString().slice(0, 10) : "",
            telefono: p?.telefono || "",
            correo: p?.correo || "",
          });
      } catch (e) {
        active && setError(e?.response?.data?.message || e.message || "Error cargando perfil");
      } finally {
        active && setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [idPersona]);

  // Leer query ?tab= y state.notice para mostrar mensaje y seleccionar pestaña
  useEffect(() => {
    // tab desde query
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ["informacion","documentos"].includes(tab)) {
      setActiveTab(tab);
    }
    // aviso desde state
    const incomingNotice = location.state?.notice;
    if (incomingNotice) {
      setNotice(incomingNotice);
      // limpiar el state para evitar que reaparezca al navegar atrás
      navigate(location.pathname + location.search, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Cargar documentos cuando la pestaña activa sea "documentos"
  useEffect(() => {
    const fetchDocs = async () => {
      if (!idPersona || activeTab !== "documentos") return;
      setLoadingDocs(true);
      setErrorDocs("");
      try {
        const list = await documentoService.list();
        const found = Array.isArray(list) ? list.find((d) => d.id_persona === idPersona) : null;
        setDoc(found || null);
        setDocForm(
          found
            ? {
                documento_identidad: found.documento_identidad || "",
                foto_3x4: found.foto_3x4 || "",
                recibo_publico: found.recibo_publico || "",
                acta_grado: found.acta_grado || "",
                eps_salud: found.eps_salud || "",
              }
            : {
                documento_identidad: "",
                foto_3x4: "",
                recibo_publico: "",
                acta_grado: "",
                eps_salud: "",
              }
        );
      } catch (e) {
        setErrorDocs(e?.response?.data?.message || e.message || "Error al cargar documentos");
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocs();
  }, [idPersona, activeTab]);

  // --- CRUD Documentos ---
  const handleDocChange = (e) => {
    const { name, value } = e.target;
    setDocForm((s) => ({ ...s, [name]: value }));
  };

  const handleDocFileChange = (e) => {
    const { name, files } = e.target;
    const file = files && files[0] ? files[0] : null;
    setDocFiles((s) => ({ ...s, [name]: file }));
    setRemovedFields((s) => ({ ...s, [name]: false }));
  };

  const handleRemoveField = (field) => {
    setRemovedFields((s) => ({ ...s, [field]: true }));
    setDocFiles((s) => ({ ...s, [field]: null }));
    setDocForm((s) => ({ ...s, [field]: "" }));
    setInputKeys((s) => ({ ...s, [field]: Date.now() }));
  };

  const clearSelected = (field) => {
    setDocFiles((s) => ({ ...s, [field]: null }));
    setInputKeys((s) => ({ ...s, [field]: Date.now() }));
  };

  // Eliminado toggle de edición: el formulario estará siempre visible

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!idPersona) return;
    setLoadingDocs(true);
    setErrorDocs("");
    try {
      // Subir archivos seleccionados a Supabase y obtener URLs públicas
      const bucket = "cursos-images";
      const uploadIfNeeded = async (field) => {
        const file = docFiles[field];
        if (!file) return docForm[field] || "";
        const ext = file.name.split(".").pop();
        const fileName = `${idPersona}_${field}_${Date.now()}.${ext}`;
        const filePath = `${idPersona}/${field}/${fileName}`;
        const { error: uploadError } = await supabase
          .storage
          .from(bucket)
          .upload(filePath, file, { contentType: file.type || "application/octet-stream", upsert: true });
        if (uploadError) throw new Error(uploadError.message || "Error subiendo archivo");
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return publicData?.publicUrl || "";
      };

      const valOrEmpty = async (field) => {
        if (removedFields[field]) return "";
        return await uploadIfNeeded(field);
      };
      const payload = {
        id_persona: idPersona,
        documento_identidad: await valOrEmpty("documento_identidad"),
        foto_3x4: await valOrEmpty("foto_3x4"),
        recibo_publico: await valOrEmpty("recibo_publico"),
        acta_grado: await valOrEmpty("acta_grado"),
        eps_salud: await valOrEmpty("eps_salud"),
      };

      if (doc?.id) {
        const updated = await documentoService.update(doc.id, payload);
        setDoc(updated);
      } else {
        const created = await documentoService.create(payload);
        setDoc(created);
      }
      setDocFiles({ documento_identidad: null, foto_3x4: null, recibo_publico: null, acta_grado: null, eps_salud: null });
      setRemovedFields({});
    } catch (e) {
      setErrorDocs(e?.response?.data?.message || e.message || "Error al guardar documentos");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDocDelete = async () => {
    if (!doc?.id) return;
    const ok = window.confirm("¿Eliminar documentos? Esta acción no se puede deshacer.");
    if (!ok) return;
    setLoadingDocs(true);
    setErrorDocs("");
    try {
      await documentoService.remove(doc.id);
      setDoc(null);
    } catch (e) {
      setErrorDocs(e?.response?.data?.message || e.message || "Error al eliminar documentos");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (!idPersona) throw new Error("No se encontró el ID de la persona");
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        tipo_identificacion: form.tipo_identificacion,
        numero_identificacion: form.numero_identificacion,
        fecha_nacimiento: form.fecha_nacimiento,
        telefono: form.telefono,
        correo: form.correo,
      };
      await personaService.update(idPersona, payload);
      setSuccess("Perfil actualizado correctamente");
      setEditing(false);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // Handlers cambio de contraseña
  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwdForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdError("");
    setPwdSuccess("");
    try {
      if (!usuario?.id || !usuario?.email || !usuario?.idPersona) {
        throw new Error("No hay datos de usuario en sesión");
      }
      const current = (pwdForm.current || "").trim();
      const next = (pwdForm.next || "").trim();
      const confirm = (pwdForm.confirm || "").trim();
      if (!current || !next || !confirm) throw new Error("Completa todos los campos");
      if (next.length < 6) throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
      if (next !== confirm) throw new Error("La confirmación no coincide");

      // Validar contraseña actual con login
      try {
        await authService.login(usuario.email, current);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) throw new Error("La contraseña actual es incorrecta");
        throw new Error(err?.response?.data?.message || err.message || "Error validando contraseña actual");
      }

      const payload = {
        id_persona: usuario.idPersona,
        email: usuario.email,
        password: next,
      };
      await usuarioService.update(usuario.id, payload);
      setPwdSuccess("Contraseña actualizada correctamente");
      setPwdForm({ current: "", next: "", confirm: "" });
    } catch (e) {
      setPwdError(e?.response?.data?.message || e.message || "Error al cambiar contraseña");
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Cargando perfil…</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {notice && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
            {notice}
          </div>
        )}
        <h1 className="text-3xl font-bold mb-4">Mi Perfil</h1>
        <p className="text-gray-600 mb-6">Actualiza tus datos personales y los requeridos para tus cursos.</p>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-6">
          <button
            className={`pb-2 -mb-px ${
              activeTab === "informacion" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("informacion")}
          >
            Información
          </button>
          <button
            className={`pb-2 -mb-px ${
              activeTab === "documentos" ? "border-b-2 border-blue-600 font-semibold" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("documentos")}
          >
            Documentos
          </button>
        </div>

        {/* Contenido: Información */}
        {activeTab === "informacion" && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Contenedor izquierdo: tarjeta de perfil fija */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-semibold">
                    {initials}
                  </div>
                </div>
                <div className="w-full">
                  <h1 className="text-2xl font-bold">{form.nombre} {form.apellido}</h1>
                  <div className="mt-4 space-y-2 text-gray-700">
                    <p>📧 {form.correo || "—"}</p>
                    <p>📞 {form.telefono || "—"}</p>
                    {persona?.direccion && <p>📍 {persona.direccion}</p>}
                    {formatDate(usuario?.fechaRegistro || persona?.created_at) && (
                      <p>📅 Miembro desde {formatDate(usuario?.fechaRegistro || persona?.created_at)}</p>
                    )}
                  </div>
                  <button onClick={() => setEditing(true)} className="mt-4 w-full inline-flex items-center justify-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-50">
                    Editar Perfil
                  </button>
                </div>
              </div>
            </div>

            {/* Contenedor centro: información personal (lectura/edición) */}
            <div className="md:col-span-2">
              {!editing ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Información Personal</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1">Nombre</label>
                      <input value={form.nombre || ''} disabled className="w-full border-0 p-2 bg-gray-100 rounded-md text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Apellido</label>
                      <input value={form.apellido || ''} disabled className="w-full border-0 p-2 bg-gray-100 rounded-md text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tipo de Identificación</label>
                      <input value={form.tipo_identificacion || ''} disabled className="w-full border-0 p-2 bg-gray-100 rounded-md text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Número de Identificación</label>
                      <input value={form.numero_identificacion || ''} disabled className="w-full border-0 p-2 bg-gray-100 rounded-md text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Fecha de Nacimiento</label>
                      <input value={formatDate(form.fecha_nacimiento) || ''} disabled className="w-full border-0 p-2 bg-gray-100 rounded-md text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                      <input value={form.telefono || ''} disabled className="w-full border-0 p-2 bg-gray-100 rounded-md text-gray-800" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Correo Electrónico</label>
                      <input value={form.correo || ''} disabled className="w-full border-0 p-2 bg-gray-100 rounded-md text-gray-800" />
                    </div>
                    {/* Dirección, Rol y Biografía removidos según solicitud */}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Información Personal</h2>
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      {saving ? "Guardando…" : "Guardar Cambios"}
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1">Nombre</label>
                      <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1">Apellido</label>
                      <input name="apellido" value={form.apellido} onChange={handleChange} className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1">Tipo de Identificación</label>
                      <select name="tipo_identificacion" value={form.tipo_identificacion} onChange={handleChange} className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500">
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PAS">Pasaporte</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1">Número de Identificación</label>
                      <input name="numero_identificacion" value={form.numero_identificacion} onChange={handleChange} className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1">Fecha de Nacimiento</label>
                      <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1">Teléfono</label>
                      <input name="telefono" value={form.telefono} onChange={handleChange} className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-700 font-medium mb-1">Correo</label>
                      <input type="email" name="correo" value={form.correo} onChange={handleChange} className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2 text-sm text-gray-500">
                      Estos datos son necesarios para inscripciones, certificados y comunicaciones del curso.
                    </div>
                    <div className="md:col-span-2 flex gap-3 mt-2">
                      <button type="button" onClick={() => setEditing(false)} className="border px-4 py-2 rounded-md hover:bg-gray-50">Cancelar</button>
                      {error && <span className="text-red-600">{error}</span>}
                      {success && <span className="text-green-600">{success}</span>}
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Sección: Cambiar contraseña (debajo de Información Personal) */}
            <div className="md:col-span-2 md:col-start-2">
              <div className="bg-white p-6 rounded-lg shadow-md mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
                </div>
                {pwdError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">{pwdError}</div>
                )}
                {pwdSuccess && (
                  <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700">{pwdSuccess}</div>
                )}
                <form onSubmit={handlePwdSubmit} className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-700 font-medium mb-1">Contraseña actual</label>
                    <input
                      type="password"
                      name="current"
                      value={pwdForm.current}
                      onChange={handlePwdChange}
                      className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1">Nueva contraseña</label>
                    <input
                      type="password"
                      name="next"
                      value={pwdForm.next}
                      onChange={handlePwdChange}
                      className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1">Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      name="confirm"
                      value={pwdForm.confirm}
                      onChange={handlePwdChange}
                      className="w-full border border-blue-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={pwdSaving}
                      className={`px-4 py-2 rounded-md text-white ${pwdSaving ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      {pwdSaving ? "Guardando…" : "Guardar nueva contraseña"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        

        {/* Contenido: Documentos */}
        {activeTab === "documentos" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Documentos</h2>
              <div className="flex gap-3">
                {doc && (
                  <button onClick={handleDocDelete} className="border px-4 py-2 rounded-md text-red-700 hover:bg-red-50">Eliminar</button>
                )}
              </div>
            </div>

            {loadingDocs && <p className="text-gray-500">Cargando documentos…</p>}
            {errorDocs && <p className="text-red-600">{errorDocs}</p>}
            {!loadingDocs && !errorDocs && (
              <form onSubmit={handleDocSubmit} className="grid md:grid-cols-2 gap-4">
                {renderDocItem({ field: 'documento_identidad', label: 'Documento de Identidad', accept: 'application/pdf' })}
                {renderDocItem({ field: 'foto_3x4', label: 'Foto 3x4', accept: 'image/*,application/pdf' })}
                {renderDocItem({ field: 'recibo_publico', label: 'Recibo de Servicio Público', accept: 'application/pdf' })}
                {renderDocItem({ field: 'acta_grado', label: 'Acta de Grado', accept: 'application/pdf' })}
                <div className="md:col-span-2">
                  {renderDocItem({ field: 'eps_salud', label: 'EPS / Salud', accept: 'application/pdf' })}
                </div>
                <div className="md:col-span-2 flex gap-3 mt-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Guardar</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}