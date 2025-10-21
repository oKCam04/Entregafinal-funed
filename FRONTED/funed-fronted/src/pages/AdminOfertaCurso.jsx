import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Select from "react-select"
import Card from "../components/Card"
import Button from "../components/Button"
import Modal from "../components/Modal"
import ofertaCursoService from "../api/services/ofertaCursoService"
import cursosService from "../api/services/cursoService"
import { supabase } from "../supabaseClient"

const formatCOP = (v) => {
  const num = parseFloat(v)
  if (isNaN(num)) return 'Consultar'
  return num.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
}

// Estilos para react-select
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

function AdminOfertaCursosPage() {
  const navigate = useNavigate()

  const [ofertas, setOfertas] = useState([])
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    id: null, codigo_curso: "", id_curso: "", fecha_inicio_curso: "",
    fecha_fin_curso: "", horario: "", cupos: "", precio: "", foto: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const [ofertasData, cursosData] = await Promise.all([
          ofertaCursoService.list(),
          cursosService.list(),
        ])
        setOfertas(Array.isArray(ofertasData) ? ofertasData : [])
        setCursos(Array.isArray(cursosData) ? cursosData : [])
      } catch (err) {
        console.error(err)
        setError("Error al cargar los datos iniciales.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const cursoOptions = useMemo(() => 
    cursos.map(curso => ({
      value: curso.id,
      label: curso.nombre_curso
    })),
  [cursos])

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return ofertas.filter((o) => {
        const curso = cursos.find(c => c.id === o.id_curso)
        return (
            !q ||
            o.codigo_curso?.toString().includes(q) ||
            curso?.nombre_curso?.toLowerCase().includes(q) ||
            o.horario?.toLowerCase().includes(q)
        )
    })
  }, [ofertas, cursos, searchTerm])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((s) => ({ ...s, [name]: value }))
  }

  const handleCursoChange = (selectedOption) => {
    setFormData(s => ({ ...s, id_curso: selectedOption ? selectedOption.value : "" }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => { setPreviewUrl(reader.result) }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({ id: null, codigo_curso: "", id_curso: "", fecha_inicio_curso: "", fecha_fin_curso: "", horario: "", cupos: "", precio: "", foto: "", })
    setEditMode(false)
    setEditOpen(false)
    setSelectedFile(null)
    setPreviewUrl("")
  }

  const uploadFile = async (file) => {
    if (!file) return null
    setIsUploading(true)
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `ofertas/${fileName}`
    try {
      const { error: uploadError } = await supabase.storage.from('cursos-images').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('cursos-images').getPublicUrl(filePath)
      return urlData.publicUrl
    } finally {
      setIsUploading(false)
    }
  }

  const saveOferta = async () => {
    setError("")
    setSuccess("")
    const { id, codigo_curso, id_curso, fecha_inicio_curso, fecha_fin_curso, horario, cupos, precio } = formData
    if (!codigo_curso || !id_curso || !fecha_inicio_curso || !fecha_fin_curso || !horario || !cupos || !precio) {
      setError("Completa todos los campos obligatorios.")
      return
    }

    try {
      let imageUrl = formData.foto
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile)
        if (uploadedUrl) imageUrl = uploadedUrl
      }
      const payload = { ...formData, foto: imageUrl, precio: formData.precio.toString(), id_curso: parseInt(formData.id_curso, 10) }

      if (editMode && id != null) {
        const updated = await ofertaCursoService.update(id, payload)
        setOfertas((list) => list.map((o) => (o.id === id ? updated : o)))
        setSuccess("Oferta actualizada correctamente.")
      } else {
        const newOferta = await ofertaCursoService.create(payload)
        setOfertas((list) => [newOferta, ...list])
        setSuccess("Oferta creada correctamente.")
      }
      resetForm()
    } catch (err) {
      console.error(err)
      setError("No se pudo guardar la oferta.")
    }
  }

  const handleEdit = (id) => {
    const o = ofertas.find((x) => x.id === id)
    if (!o) return
    const formattedOferta = { ...o, fecha_inicio_curso: o.fecha_inicio_curso ? new Date(o.fecha_inicio_curso).toISOString().split('T')[0] : '', fecha_fin_curso: o.fecha_fin_curso ? new Date(o.fecha_fin_curso).toISOString().split('T')[0] : '' }
    setFormData(formattedOferta)
    setPreviewUrl(o.foto || "")
    setEditMode(true)
    setEditOpen(true)
  }

  const handleDelete = async (id) => {
    const o = ofertas.find((x) => x.id === id)
    if (!o) return
    if (!window.confirm(`¿Eliminar la oferta del curso con código ${o.codigo_curso}?`)) return
    try {
      await ofertaCursoService.remove(id)
      setOfertas((list) => list.filter((x) => x.id !== id))
      setSuccess("Oferta eliminada correctamente.")
    } catch (err) {
      console.error(err)
      setError("No se pudo eliminar la oferta.")
    }
  }

  const renderFormFields = () => (
    <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="codigo_curso">Código del curso</label>
          <input id="codigo_curso" type="number" name="codigo_curso" value={formData.codigo_curso} onChange={handleChange} className="w-full rounded border px-4 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="id_curso">Curso</label>
          <Select
            inputId="id_curso"
            name="id_curso"
            options={cursoOptions}
            styles={selectStyles}
            className="w-full"
            classNamePrefix="select"
            isClearable
            isSearchable
            placeholder="Selecciona o busca un curso..."
            value={cursoOptions.find(option => option.value === formData.id_curso)}
            onChange={handleCursoChange}
          />
          {/* Mostrar tipo de curso seleccionado (Técnico/Corto) */}
          <p className="mt-1 text-sm text-gray-600">
            Tipo de curso: { (cursos.find(c => c.id === formData.id_curso)?.tipo_curso) || '—' }
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fecha_inicio_curso">Fecha de inicio</label>
          <input id="fecha_inicio_curso" type="date" name="fecha_inicio_curso" value={formData.fecha_inicio_curso} onChange={handleChange} className="w-full rounded border px-4 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fecha_fin_curso">Fecha de fin</label>
          <input id="fecha_fin_curso" type="date" name="fecha_fin_curso" value={formData.fecha_fin_curso} onChange={handleChange} className="w-full rounded border px-4 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="horario">Horario</label>
          <input id="horario" type="text" name="horario" value={formData.horario} onChange={handleChange} placeholder="Ej: Lun-Vie 8-12" className="w-full rounded border px-4 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cupos">Cupos</label>
          <input id="cupos" type="number" name="cupos" value={formData.cupos} onChange={handleChange} className="w-full rounded border px-4 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="precio">Precio</label>
          <input id="precio" type="text" name="precio" value={formData.precio} onChange={handleChange} placeholder="Ej: 450.00" className="w-full rounded border px-4 py-2" required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Foto de la oferta</label>
          <div className="mt-2 flex items-center gap-4">
            {previewUrl && <img src={previewUrl} alt="Previsualización" className="w-24 h-24 object-cover rounded-md shadow-sm" />}
            <div className="flex-1">
              <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <p className="text-xs text-gray-500 mt-1">Sube una imagen para la tarjeta de la oferta.</p>
            </div>
          </div>
        </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4"><Button variant="outline" onClick={() => navigate("/admin")}>← Volver</Button></div>
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">Administración de Ofertas de Cursos</h1>
        {error && <div className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">{error}</div>}
        {success && <div className="mb-6 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">{success}</div>}

        <Card className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Crear nueva oferta</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveOferta(); }} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">{renderFormFields()}</div>
            <div className="flex gap-3"><Button type="submit" variant="primary" disabled={isUploading}>{isUploading ? 'Subiendo imagen...' : 'Crear oferta'}</Button><Button type="button" variant="outline" onClick={resetForm}>Limpiar</Button></div>
          </form>
        </Card>

        <Card className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Gestionar ofertas existentes</h2>
          <input type="text" placeholder="Buscar por código, nombre de curso o horario…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded border px-4 py-2" />
        </Card>

        {loading ? (
          <div className="text-center text-gray-500">Cargando ofertas…</div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500">No hay ofertas.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => {
                const curso = cursos.find(c => c.id === o.id_curso)
                return (
                    <Card key={o.id} className="flex flex-col md:flex-row justify-between items-start p-4 gap-4">
                        {o.foto && <img src={o.foto} alt={curso?.nombre_curso || 'Curso'} className="w-full md:w-48 h-32 object-cover rounded-md mb-4 md:mb-0"/>}
                        <div className="flex-grow">
                        <h3 className="text-lg font-semibold">{curso?.nombre_curso || `Curso ID: ${o.id_curso}`}</h3>
                        <p className="text-sm text-gray-500">Código de Oferta: {o.codigo_curso}</p>
                        <p className="text-sm text-gray-600">Tipo: {curso?.tipo_curso ?? '—'}</p>
                        <p>Horario: {o.horario}</p>
                        <p>Cupos: {o.cupos}</p>
                        <p>Inicio: {new Date(o.fecha_inicio_curso).toLocaleDateString()} – Fin: {new Date(o.fecha_fin_curso).toLocaleDateString()}</p>
                        <p className="font-bold text-green-600 mt-2">{formatCOP(o.precio)}</p>
                        </div>
                        <div className="flex gap-2 self-start md:self-center"><Button size="sm" onClick={() => handleEdit(o.id)}>Editar</Button><Button size="sm" variant="danger" onClick={() => handleDelete(o.id)}>Eliminar</Button></div>
                    </Card>
                )
            })}
          </div>
        )}

        <Modal open={editOpen} title="Editar oferta" onClose={resetForm}>
          <form onSubmit={(e) => { e.preventDefault(); saveOferta();}} className="space-y-4"><div className="grid gap-4 md:grid-cols-2">{renderFormFields()}</div><div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button><Button type="submit" variant="primary" disabled={isUploading}>{isUploading ? 'Subiendo imagen...' : 'Guardar'}</Button></div></form>
        </Modal>
      </div>
    </div>
  )
}

export default AdminOfertaCursosPage
