import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { persona, logout, hasRole } = useAuth();

  const esAdmin = hasRole(["admin"]);
  const esEstudiante = hasRole(["Estudiante"]);
  const esDocente = hasRole(["Docente"]);

  const handleLogout = () => {
    logout();        // limpia estado + localStorage + header
    navigate("/login");
  };

  return (
    <nav className="bg-blue-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 hover:text-blue-200 transition-colors">
          <img
            src="/logo.png"
            alt="FUNED Logo"
            className="h-12 w-auto object-contain drop-shadow-sm"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div>
            <div className="text-xl font-bold">Academia Funed</div>
            <div className="text-xs text-blue-200">Educación a tu Alcance</div>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-200">Inicio</Link>
          <Link to="/cursos" className="hover:text-blue-200">Cursos</Link>
          <Link to="/sobre-nosotros" className="hover:text-blue-200">Sobre Nosotros</Link>
          <Link to="/contacto" className="hover:text-blue-200">Contacto</Link>

          {esAdmin && <Link to="/admin" className="hover:text-blue-200">Admin</Link>}
          {esEstudiante && <Link to="/estudiante" className="hover:text-blue-200">Mis Cursos</Link>}
          {esDocente && <Link to="/docente/cursos-asignados" className="hover:text-blue-200">Cursos Asignados</Link>}
          {persona && <Link to="/perfil" className="hover:text-blue-200">Perfil</Link>}
            
          <div className="border-l border-blue-600 pl-4 ml-4 flex items-center gap-3">
            {!persona ? (
              <>
                <Link to="/login" className="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded-md">Iniciar Sesión</Link>
                <Link to="/registro" className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded-md">Registrarse</Link>
              </>
            ) : (
              <>
                <span className="text-sm text-blue-200">
                  Hola, <span className="font-semibold text-white">{persona.nombre}</span>
                  {persona.rol ? <span className="ml-1 text-[11px] opacity-80">({persona.rol})</span> : null}
                </span>
                <button onClick={handleLogout} className="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded-md">
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;