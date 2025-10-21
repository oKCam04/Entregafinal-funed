import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Select from "react-select"
import Card from "../components/Card"
import Button from "../components/Button"
import Modal from "../components/Modal"
import docenteService from "../api/services/docenteService"
import personaService from "../api/services/personaService"

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    borderRadius: '0.5rem',
    padding: '0.1rem', 
    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
    '&:hover': {
      borderColor: '#9ca3af',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#dbeafe' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
  }),
};

function AdminDocentesPage() {
  const navigate = useNavigate()

  const [docentes, setDocentes] = useState([])
  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    id: null, id_persona: "", especialidad: "", fecha_contratacion: "", fecha_terminacion: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const [docentesData, personasData] = await Promise.all([
          docenteService.list(),
          personaService.list(),
        ])
        setDocentes(Array.isArray(docentesData) ? docentesData.map(d => ({ ...d, id: d.id || d.id_docente })) : [])
        setPersonas(Array.isArray(personasData) ? personasData : [])
      } catch (err) {
        console.error(err)
        setError("Error al cargar los datos iniciales.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const personaOptions = useMemo(() => 
    personas.map(p => ({
      value: p.id,
      label: `${p.nombre} ${p.apellido}`
    })),
  [personas])

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return docentes.filter((d) => {
        const persona = personas.find(p => p.id === d.id_persona)
        return (
            !q ||
            d.especialidad?.toLowerCase().includes(q) ||
            persona?.nombre?.toLowerCase().includes(q) ||
            persona?.apellido?.toLowerCase().includes(q)
        )
    })
  }, [docentes, personas, searchTerm])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((s) => ({ ...s, [name]: value }))
  }

  const handlePersonaChange = (selectedOption) => {
    setFormData(s => ({ ...s, id_persona: selectedOption ? selectedOption.value : "" }))
  }

  const resetForm = () => {
    setFormData({ id: null, id_persona: "", especialidad: "", fecha_contratacion: "", fecha_terminacion: "", })
    setEditMode(false)
    setEditOpen(false)
  }

  const saveDocente = async () => {
    setError("")
    setSuccess("")
    const { id, id_persona, especialidad, fecha_contratacion, fecha_terminacion } = formData
    if (!id_persona || !especialidad || !fecha_contratacion) {
      setError("Completa todos los campos obligatorios.")
      return
    }

    try {
      const payload = { id_persona: parseInt(id_persona, 10), especialidad, fecha_contratacion, fecha_terminacion: fecha_terminacion || null }
      if (editMode && id != null) {
        const updated = await docenteService.update(id, payload)
        setDocentes((list) => list.map((d) => (d.id === id ? { ...updated, id } : d)))
        setSuccess("Docente actualizado correctamente.")
      } else {
        const newDocente = await docenteService.create(payload)
        const withId = { ...newDocente, id: newDocente.id || newDocente.id_docente }
        setDocentes((list) => [withId, ...list])
        // Actualizar rol de la persona a 'Docente' (fallback si backend no lo hace)
        try {
          const personaRes = await personaService.getById(payload.id_persona)
          const p = personaRes?.data || personaRes
          const personaPayload = {
            nombre: p?.nombre,
            apellido: p?.apellido,
            numero_identificacion: p?.numero_identificacion,
            tipo: p?.tipo_identificacion,
            fecha: p?.fecha_nacimiento,
            telefono: p?.telefono,
            correo: p?.correo,
            rol: 'Docente',
          }
          await personaService.update(payload.id_persona, personaPayload)
          // Refrescar lista de personas en memoria
          setPersonas((prev) => prev.map(px => px.id === payload.id_persona ? { ...px, rol: 'Docente' } : px))
          setSuccess("Docente creado correctamente y rol actualizado a Docente.")
        } catch (sideErr) {
          console.warn('[AdminDocentes] No se pudo actualizar el rol de la persona a Docente', sideErr)
          setSuccess("Docente creado correctamente (rol de persona no actualizado).")
        }
      }
      resetForm()
    } catch (err) {
      console.error(err)
      setError("No se pudo guardar el docente.")
    }
  }

  const handleEdit = (id) => {
    const d = docentes.find((x) => x.id === id)
    if (!d) return
    const formattedDocente = { ...d, fecha_contratacion: d.fecha_contratacion ? new Date(d.fecha_contratacion).toISOString().split('T')[0] : '', fecha_terminacion: d.fecha_terminacion ? new Date(d.fecha_terminacion).toISOString().split('T')[0] : '' }
    setFormData(formattedDocente)
    setEditMode(true)
    setEditOpen(true)
  }

  const handleDelete = async (id) => {
    const d = docentes.find((x) => x.id === id)
    if (!d) return
    const persona = personas.find(p => p.id === d.id_persona)
    if (!window.confirm(`¿Eliminar al docente ${persona?.nombre || `(ID Persona: ${d.id_persona})`}?`)) return

    try {
      await docenteService.remove(id)
      setDocentes((list) => list.filter((x) => x.id !== id))
      setSuccess("Docente eliminado correctamente.")
    } catch (err) {
      console.error(err)
      setError("No se pudo eliminar el docente.")
    }
  }
  
  const renderFormFields = (isModal = false) => (
    <>
      <div>
        {!isModal && <label className="block text-sm font-medium text-gray-700 mb-1">Persona *</label>}
        <Select
            name="id_persona"
            options={personaOptions}
            styles={selectStyles}
            className="w-full"
            classNamePrefix="select"
            isClearable
            isSearchable
            placeholder={isModal ? "Persona" : "Busca o selecciona una persona..."}
            value={personaOptions.find(option => option.value === formData.id_persona)}
            onChange={handlePersonaChange}
        />
      </div>
      <div>
        {!isModal && <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>}
        <input type="text" name="especialidad" value={formData.especialidad} onChange={handleChange} placeholder="Especialidad" className="w-full rounded-lg border px-4 py-2" required />
      </div>
      <div>
        {!isModal && <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Contratación *</label>}
        <input type="date" name="fecha_contratacion" value={formData.fecha_contratacion} onChange={handleChange} className="w-full rounded-lg border px-4 py-2" required />
      </div>
      <div>
        {!isModal && <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Terminación</label>}
        <input type="date" name="fecha_terminacion" value={formData.fecha_terminacion} onChange={handleChange} className="w-full rounded-lg border px-4 py-2" />
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/admin")}>← Volver</Button>
          <Button variant="primary" onClick={() => navigate("/admin/docentes/gestionar-datos")}>+ Gestionar Datos Docentes</Button>
        </div>
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">Administración de Docentes</h1>

        {error && <div className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">{error}</div>}
        {success && <div className="mb-6 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">{success}</div>}

        <Card className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Crear nuevo docente</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveDocente() }} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">{renderFormFields()}</div>
            <div className="flex gap-3"><Button type="submit" variant="primary">Crear docente</Button><Button type="button" variant="outline" onClick={resetForm}>Limpiar</Button></div>
          </form>
        </Card>

        <Card className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Gestionar docentes existentes</h2>
          <input type="text" placeholder="Buscar por nombre o especialidad…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border px-4 py-2" />
        </Card>

        {loading ? (
          <div className="text-center text-gray-500">Cargando docentes…</div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500">No hay docentes.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((d) => {
                const persona = personas.find(p => p.id === d.id_persona)
                return (
                    <Card key={d.id} className="flex justify-between p-4"><div className="flex-grow"><h3 className="text-lg font-semibold">{persona ? `${persona.nombre} ${persona.apellido}` : `ID Persona: ${d.id_persona}`}</h3><p>Especialidad: {d.especialidad}</p><p>Contratación: {new Date(d.fecha_contratacion).toLocaleDateString()} <br />Terminación: {d.fecha_terminacion ? new Date(d.fecha_terminacion).toLocaleDateString() : "—"}</p></div><div className="flex gap-2"><Button size="sm" onClick={() => handleEdit(d.id)}>Editar</Button><Button size="sm" variant="danger" onClick={() => handleDelete(d.id)}>Eliminar</Button></div></Card>
                )
            })}
          </div>
        )}

        <Modal open={editOpen} title="Editar docente" onClose={resetForm}>
          <form onSubmit={(e) => { e.preventDefault(); saveDocente() }} className="space-y-4"><div className="grid gap-4 md:grid-cols-2">{renderFormFields(true)}</div><div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button><Button type="submit" variant="primary">Guardar</Button></div></form>
        </Modal>
      </div>
    </div>
  )
}

export default AdminDocentesPage
