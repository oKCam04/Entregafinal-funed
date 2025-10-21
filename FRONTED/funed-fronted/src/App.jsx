import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/home'
import CursosPage from './pages/CursosPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import AdminDashboard from './Admin/pages/AdminDashboard'
import AdminCursos from './pages/AdminCursos'
import AdminCursoForm from './pages/AdminCursoForm'
import SobreNosotrosPage from './pages/SobreNosotrosPage'
import AdminEstudiantes from './Admin/pages/AdminEstudiantes'
import ContactoPage from './pages/ContactoPage'
import AdminDocente from './pages/AdminDocentes'
import AdminOfertaCursos from './pages/AdminOfertaCurso'
import AdminPagos from './Admin/pages/AdminPagos';
import AdminPagoDetalle from './Admin/pages/AdminPagoDetalle';
import EstudiantePage from './pages/EstudiantePage'
import EstudianteCursoDetallePage from './pages/EstudianteCursoDetalle'
import ProcesoPago from './pages/ProcesoPago';
import PerfilPage from './pages/PerfilPage'
import AdminModulos from './pages/AdminModulos'
import AdminModuloDocente from './pages/AdminModuloDocente'
import { RequireAuth, RequireRole } from './auth/RouteGuards'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'
import AdminGestionarCursos from './Admin/pages/AdminGestionarCursos'
import AdminInscripciones from './Admin/pages/AdminInscripciones'
import AdminCursoModulos from './Admin/pages/AdminCursoModulos'
import AdminOfertaEstudiantes from './Admin/pages/AdminOfertaEstudiantes'
import DocenteCursosAsignados from './pages/DocenteCursosAsignados'
import DocenteCursoDetalle from './pages/DocenteCursoDetalle'
import DocenteModuloCalificar from './pages/DocenteModuloCalificar'
import AdminGestionDatosDocentes from './pages/AdminGestionDatosDocentes'


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cursos" element={<CursosPage />} />
            <Route path="/curso/:id" element={<CourseDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/verificar-email" element={<EmailVerificationPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/admin" element={<RequireRole roles={["admin"]}><AdminDashboard /></RequireRole>} />
            <Route path="/admin/gestionar-cursos" element={<RequireRole roles={["admin"]}><AdminGestionarCursos /></RequireRole>} />
            <Route path="/admin/cursos" element={<RequireRole roles={["admin"]}><AdminCursos /></RequireRole>} /> {/*crud completo de cursos*/}
            <Route path='/admin/docentes' element={<RequireRole roles={["admin"]}><AdminDocente/></RequireRole>}  /> {/* crud completo docentes*/}
            <Route path='/admin/oferta-cursos' element={<RequireRole roles={["admin"]}><AdminOfertaCursos/></RequireRole>} /> {/* crud completo oferta*/}
            <Route path="/admin/pagos" element={<RequireRole roles={["admin"]}><AdminPagos /></RequireRole>} />
            <Route path="/admin/pagos/:id" element={<RequireRole roles={["admin"]}><AdminPagoDetalle /></RequireRole>} />
            <Route path="/admin/cursos/nuevo" element={<RequireRole roles={["admin"]}><AdminCursoForm /></RequireRole>} />
            <Route path="/admin/cursos/editar/:id" element={<RequireRole roles={["admin"]}><AdminCursoForm /></RequireRole>} />
            <Route path="/admin/modulos" element={<RequireRole roles={["admin"]}><AdminModulos /></RequireRole>} />
            <Route path="/admin/cursos/:id/modulos" element={<RequireRole roles={["admin"]}><AdminCursoModulos /></RequireRole>} />
            <Route path="/admin/cursos/:id/estudiantes" element={<RequireRole roles={["admin"]}><AdminOfertaEstudiantes /></RequireRole>} />
            <Route path="/admin/modulo-docente" element={<RequireRole roles={["admin"]}><AdminModuloDocente /></RequireRole>} />
            <Route path="/admin/estudiantes" element={<RequireRole roles={["admin"]}><AdminEstudiantes /></RequireRole>} />
            <Route path="/admin/inscripciones" element={<RequireRole roles={["admin"]}><AdminInscripciones /></RequireRole>} />
            <Route path="/admin/docentes/gestionar-datos" element={<RequireRole roles={["admin"]}><AdminGestionDatosDocentes /></RequireRole>} />
            <Route path="/sobre-nosotros" element={<SobreNosotrosPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/pago/curso/:id" element={<RequireAuth><ProcesoPago/></RequireAuth>} />
            <Route path="/perfil" element={<RequireAuth><PerfilPage /></RequireAuth>} />

            {/*Estudiante*/}
            <Route path='/Estudiante' element={<RequireRole roles={["Estudiante"]}><EstudiantePage/></RequireRole>}  />
            <Route path='/Estudiante/curso/:id' element={<RequireRole roles={["Estudiante"]}><EstudianteCursoDetallePage/></RequireRole>}  />
            {/* routee*/}

            {/* Docente */}
            <Route path='/docente/cursos-asignados' element={<RequireRole roles={["Docente"]}><DocenteCursosAsignados/></RequireRole>} />
            <Route path='/docente/curso/:id' element={<RequireRole roles={["Docente"]}><DocenteCursoDetalle/></RequireRole>} />
            <Route path='/docente/curso/:id/modulo/:moduloId/calificar' element={<RequireRole roles={["Docente"]}><DocenteModuloCalificar/></RequireRole>} />

            {/* 404 fallback */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
