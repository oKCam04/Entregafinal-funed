import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { cursoService } from "../services/cursoService";

function AdminCursosPage() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");

  // form (alineado a tu API)
  const [formData, setFormData] = useState({
    id: null,
    nombreCurso: "",
    duracion: "", // horas (number)
    temario: "",
    tipoCurso: "",
  });
  const [editMode, setEditMode] = useState(false);

  // Cargar
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await cursoService.getAll();
        setCursos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.status === 401
            ? "No autorizado (401). Inicia sesión nuevamente."
            : "Error al cargar cursos."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtro
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return cursos.filter((c) => {
      const byText =
        !q ||
        c.nombreCurso?.toLowerCase().includes(q) ||
        c.temario?.toLowerCase().includes(q) ||
        c.tipoCurso?.toLowerCase().includes(q);
      const byTipo = tipoFiltro === "todos" || c.tipoCurso === tipoFiltro;
      return byText && byTipo;
    });
  }, [cursos, searchTerm, tipoFiltro]);

  // Handlers form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nombreCurso: "",
      duracion: "",
      temario: "",
      tipoCurso: "",
    });
    setEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { nombreCurso, duracion, temario, tipoCurso, id } = formData;
    if (!nombreCurso || !duracion || !temario || !tipoCurso) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    const payload = {
      nombreCurso,
      duracion: Number(duracion),
      temario,
      tipoCurso,
    };

    try {
      if (editMode && id != null) {
        const updated = await cursoService.update(id, payload);
        setCursos((list) => list.map((c) => (c.id === updated.id ? updated : c)));
        setSuccess(`"${updated.nombreCurso}" actualizado correctamente.`);
      } else {
        const created = await cursoService.create(payload);
        setCursos((list) => [created, ...list]);
        setSuccess(`"${created.nombreCurso}" creado correctamente.`);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.status === 401
          ? "No autorizado (401). Verifica tu sesión/token."
          : err?.response?.data?.message || "No se pudo guardar el curso."
      );
    }
  };

  const handleEdit = (id) => {
    const c = cursos.find((x) => x.id === id);
    if (!c) return;
    setFormData({
      id: c.id,
      nombreCurso: c.nombreCurso ?? "",
      duracion: c.duracion ?? "",
      temario: c.temario ?? "",
      tipoCurso: c.tipoCurso ?? "",
    });
    setEditMode(true);
    document.getElementById("curso-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const c = cursos.find((x) => x.id === id);
    if (!c) return;
    const ok = window.confirm(`¿Eliminar el curso "${c.nombreCurso}"?`);
    if (!ok) return;

    try {
      await cursoService.remove(id);
      setCursos((list) => list.filter((x) => x.id !== id));
      setSuccess(`"${c.nombreCurso}" eliminado correctamente.`);
      if (formData.id === id) resetForm();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.status === 401
          ? "No autorizado (401). Verifica tu sesión/token."
          : "No se pudo eliminar el curso."
      );
    }
  };

  // Tipos (si no vienen de la API, puedes fijar algunos sugeridos)
  const tiposSugeridos = [
    "Técnico",
    "Curso corto",
    "Diplomado",
    "Seminario",
    "Workshop",
  ];

  const uniqueTipos = [
    "todos",
    ...Array.from(new Set(cursos.map((c) => c.tipoCurso).filter(Boolean))),
  ];

  // Utils
  const fmtDate = (s) =>
    s ? new Date(s).toLocaleString() : "";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Administración de Cursos
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* ---------- Form Crear/Editar ---------- */}
        <Card className="mb-8" id="curso-form">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {editMode ? "Editar curso" : "Crear nuevo curso"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del curso *
                </label>
                <input
                  type="text"
                  name="nombreCurso"
                  value={formData.nombreCurso}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Maquillaje Profesional"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de curso *
                </label>
                <input
                  list="tipos"
                  name="tipoCurso"
                  value={formData.tipoCurso}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Técnico / Curso corto / …"
                  required
                />
                <datalist id="tipos">
                  {tiposSugeridos.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (horas) *
                </label>
                <input
                  type="number"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="40"
                  min="1"
                  required
                />
              </div>

              <div className="md:col-span-1"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temario / Contenido *
              </label>
              <textarea
                name="temario"
                value={formData.temario}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Técnicas de maquillaje social, fotografía, cuidado de la piel…"
                rows="3"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary">
                {editMode ? "Actualizar curso" : "Crear curso"}
              </Button>
              {editMode && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar edición
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* ---------- Filtros ---------- */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Gestionar cursos existentes
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre, temario o tipo…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por tipo de curso
              </label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {uniqueTipos.map((t) => (
                  <option key={t} value={t}>
                    {t === "todos" ? "Todos" : t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* ---------- Lista ---------- */}
        {loading ? (
          <div className="text-center text-gray-500">Cargando cursos…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No se encontraron cursos que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <Card key={c.id} className="hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {c.nombreCurso}
                      </h3>
                      {c.tipoCurso && (
                        <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm">
                          {c.tipoCurso}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Duración:</span>{" "}
                      {c.duracion} hora{Number(c.duracion) === 1 ? "" : "s"}
                    </p>

                    {c.temario && (
                      <p className="text-gray-600 mb-3">
                        <span className="font-medium">Temario:</span> {c.temario}
                      </p>
                    )}

                    <div className="text-gray-400 text-sm">
                      <span className="mr-4">Creado: {fmtDate(c.createdAt)}</span>
                      <span>Actualizado: {fmtDate(c.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEdit(c.id)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(c.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCursosPage;
