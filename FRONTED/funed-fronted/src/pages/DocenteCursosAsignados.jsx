import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ofertaCursoService from "../api/services/ofertaCursoService";

export default function DocenteCursosAsignados() {
  const navigate = useNavigate();
  const { usuario, persona } = useAuth();
  const idPersona = usuario?.idPersona || persona?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await ofertaCursoService.listByDocentePersona(Number(idPersona));
        const list = Array.isArray(data) ? data : [];
        if (!active) return;
        setOfertas(list);
      } catch (err) {
        if (active) setError(err?.response?.data?.message || err.message || "Error cargando cursos asignados");
      } finally {
        active && setLoading(false);
      }
    }

    if (idPersona) load();
    return () => {
      active = false;
    };
  }, [idPersona]);

  const totalCursos = useMemo(() => ofertas.length, [ofertas]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Cursos Asignados</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mt-3">
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500"><path d="M4 19h16M4 8h16M4 13h16"/></svg>
                {totalCursos} cursos
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mt-6 p-4">
          {loading && <div className="text-gray-500">Cargando cursos…</div>}
          {error && (
            <div className="rounded border border-red-300 bg-red-50 text-red-700 px-4 py-3">{error}</div>
          )}
          {!loading && !error && (
            <div className="grid md:grid-cols-2 gap-6">
              {ofertas.length === 0 ? (
                <div className="text-gray-500">No tienes cursos asignados.</div>
              ) : (
                ofertas.map((o) => (
                  <div key={o.id} className="p-6 bg-white rounded-lg shadow border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-600">Asignado</span>
                      <span className="text-sm text-gray-500">{o.curso?.tipo_curso || "—"}</span>
                    </div>

                    <h2 className="text-xl font-semibold mb-2">{o.curso?.nombre_curso || "Curso"}</h2>
                    <p className="text-gray-600 mb-4">Código: {o.codigo_curso ?? '-'}</p>

                    <p className="text-sm text-gray-500 mb-4">
                      {o.curso?.duracion ? `${o.curso.duracion} horas` : '—'} · {o.horario || '—'}
                    </p>

                    <div className="flex justify-end">
                      <button
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                        onClick={() => navigate(`/docente/curso/${o.id}?oferta=${o.id}`)}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}