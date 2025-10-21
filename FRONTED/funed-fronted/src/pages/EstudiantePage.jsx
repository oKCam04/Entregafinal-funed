import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import cursoPersonaService from "../api/services/cursoPersonaService";
import { useNavigate } from "react-router-dom";
import moduloService from "../api/services/moduloService";
import calificacionesService from "../api/services/calificacionesService";

export default function EstudiantePage() {
  const { usuario } = useAuth(); // usamos usuario del contexto (idPersona está aquí)
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState({}); // { [idOferta]: { total, evaluadas } }
  const [loadingAvg, setLoadingAvg] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  const fetchCursos = async () => {
    try {
      console.log("👤 Usuario en contexto:", usuario); 

      if (usuario?.idPersona) {
        console.log("🔑 idPersona usado:", usuario.idPersona);

        const data = await cursoPersonaService.getByPersona(usuario.idPersona);
        console.log("📌 Respuesta API cursosPersonas:", data);

        setCursos(data?.cursos || []);
      } else {
        console.warn("⚠️ No hay idPersona en usuario");
      }
    } catch (error) {
      console.error("❌ Error cargando cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchCursos();
}, [usuario]);

  // Métricas
  const totalCursos = cursos.length;
  const completados = cursos.filter((c) => c.resultado === "Aprobado").length;
  const enProgreso = cursos.filter((c) => c.estado === "Activo" && c.resultado !== "Aprobado").length;

  // Cargar progreso por oferta para calcular Progreso Promedio dinámico
  useEffect(() => {
    let active = true;
    async function loadAll() {
      try {
        if (!cursos.length) {
          active && setProgressMap({});
          return;
        }
        setLoadingAvg(true);
        const entries = await Promise.all(
          cursos.map(async (c) => {
            if (!c?.idOferta) return [c.idOferta, { total: 0, evaluadas: 0 }];
            try {
              const mods = await moduloService.getByOferta(c.idOferta);
              const cals = await calificacionesService.getByOferta(c.idOferta);
              const total = Array.isArray(mods) ? mods.length : 0;
              const evaluadas = Array.isArray(cals)
                ? cals.filter((x) => x.resultado && x.resultado !== "Pendiente").length
                : 0;
              return [c.idOferta, { total, evaluadas }];
            } catch (err) {
              return [c.idOferta, { total: 0, evaluadas: 0 }];
            }
          })
        );
        active && setProgressMap(Object.fromEntries(entries));
      } finally {
        active && setLoadingAvg(false);
      }
    }
    loadAll();
    return () => {
      active = false;
    };
  }, [cursos]);

  const promedio = useMemo(() => {
    if (!cursos.length) return 0;
    const enProgresoCursos = cursos.filter((c) => c.resultado !== "Aprobado");
    if (enProgresoCursos.length > 0) {
      const porcentajes = enProgresoCursos.map((c) => {
        const pm = progressMap[c.idOferta];
        if (!pm || !pm.total) return 0;
        return Math.min(100, Math.round((pm.evaluadas / pm.total) * 100));
      });
      const suma = porcentajes.reduce((acc, v) => acc + v, 0);
      return Math.round(suma / porcentajes.length);
    }
    // Si todos están aprobados, el promedio es 100
    const todosAprobados = cursos.every((c) => c.resultado === "Aprobado");
    return todosAprobados ? 100 : 0;
  }, [cursos, progressMap]);
  if (loading) return <p className="text-center mt-10">Cargando cursos...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Panel de Cursos</h1>
      <p className="text-gray-600 mb-6">
        Gestiona tu progreso y accede a todos tus cursos
      </p>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Cursos" value={totalCursos} color="blue" />
        <StatCard title="Completados" value={completados} color="green" />
        <StatCard title="En Progreso" value={enProgreso} color="orange" />
        <StatCard title="Progreso Promedio" value={loadingAvg ? "Calculando…" : `${promedio}%`} color="indigo" />
      </div>

      {/* Cursos */}
      <div className="grid md:grid-cols-2 gap-6">
        {cursos.map((curso) => (
          <CursoCard key={curso.idMatricula} curso={curso} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    orange: "text-orange-600 bg-orange-100",
    indigo: "text-indigo-600 bg-indigo-100",
  };

  return (
    <div className="p-4 rounded-lg shadow bg-white">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-2xl font-bold ${colorMap[color] || ""}`}>{value}</p>
    </div>
  );
}

function CursoCard({ curso, navigate }) {
  const [totalModulos, setTotalModulos] = useState(0);
  const [evaluadasCount, setEvaluadasCount] = useState(0);
  const [loadingProg, setLoadingProg] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoadingProg(true);
        // Obtener total de módulos por oferta
        const mods = await moduloService.listByOfertaCurso(curso.idOferta);
        const total = Array.isArray(mods) ? mods.length : 0;
        // Obtener calificaciones y contar las evaluadas (no Pendiente)
        const cals = await calificacionesService.getByOferta(curso.idOferta);
        const evaluadas = Array.isArray(cals)
          ? cals.filter((c) => c.resultado && c.resultado !== "Pendiente").length
          : 0;
        if (active) {
          setTotalModulos(total);
          setEvaluadasCount(evaluadas);
        }
      } catch (err) {
        // si falla, dejamos progreso en 0 excepto si está Aprobado
        if (active) {
          setTotalModulos(0);
          setEvaluadasCount(0);
        }
      } finally {
        active && setLoadingProg(false);
      }
    }
    if (curso?.idOferta) load();
    return () => {
      active = false;
    };
  }, [curso?.idOferta]);

  const progreso = useMemo(() => {
    if (curso.resultado === "Aprobado") return 100;
    if (!totalModulos) return 0;
    return Math.min(100, Math.round((evaluadasCount / totalModulos) * 100));
  }, [curso.resultado, totalModulos, evaluadasCount]);

  return (
    <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            curso.resultado === "Aprobado"
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {curso.resultado === "Aprobado" ? "Completado" : curso.estado}
        </span>
        <span className="text-sm text-gray-500">{curso.tipo}</span>
      </div>

      <h2 className="text-xl font-semibold mb-2">{curso.nombre}</h2>
      <p className="text-gray-600 mb-4">{curso.temario}</p>

      {/* Barra de progreso (dinámica) */}
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {loadingProg && curso.resultado !== "Aprobado" ? "Calculando…" : `${progreso}%`}
        </p>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {curso.duracion} horas · {curso.horario}
      </p>

      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition" onClick={() => navigate(`/Estudiante/curso/${curso.idMatricula}?oferta=${curso.idOferta}`)}>
        {curso.resultado === "Aprobado" ? "Revisar" : "Continuar"}
      </button>
    </div>
  );
}
