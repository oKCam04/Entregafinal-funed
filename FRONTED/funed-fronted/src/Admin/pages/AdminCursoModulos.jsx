import { Link, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import ofertaCursoService from '../../api/services/ofertaCursoService'
import moduloDocenteService from '../../api/services/moduloDocenteService'
import docenteService from '../../api/services/docenteService'
import moduloService from '../../api/services/moduloService'

// Combobox simple y estilizado con Tailwind (sin dependencias externas)
function SearchSelect({
  label,
  placeholder,
  options,
  valueId,
  onChange,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const ref = useRef(null)

  const selected = options.find(o => String(o.id) === String(valueId))
  const inputValueRaw = open ? (query || (selected && typeof selected.label !== 'undefined' ? selected.label : '')) : (selected && typeof selected.label !== 'undefined' ? selected.label : '')
  const inputValue = (inputValueRaw ?? '').toString()
  const filtered = query
    ? options.filter(o => (o.label || '').toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
        setHighlight(0)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function commitSelection(opt) {
    onChange(String(opt.id))
    setOpen(false)
    setQuery('')
    setHighlight(0)
  }

  function onKeyDown(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true)
      return
    }
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight(h => Math.min(h + 1, Math.max(filtered.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlight]) commitSelection(filtered[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      setHighlight(0)
    }
  }

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">Sin resultados</div>
          ) : (
            filtered.map((opt, idx) => (
              <button
                type="button"
                key={opt.id}
                className={`w-full text-left px-3 py-2 text-sm ${idx === highlight ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => commitSelection(opt)}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminCursoModulos() {
  const { id } = useParams()
  const ofertaId = Number(id)

  const [oferta, setOferta] = useState(null)
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [form, setForm] = useState({ moduloId: '', docenteId: '' })
  const [docentes, setDocentes] = useState([])
  const [modulosOferta, setModulosOferta] = useState([])
  const [addError, setAddError] = useState('')
  const [openEdit, setOpenEdit] = useState(false)
  const [editDocenteId, setEditDocenteId] = useState('')
  const [editAssignId, setEditAssignId] = useState(null)
  const [editError, setEditError] = useState('')
  const [editModulo, setEditModulo] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        setLoading(true)
        setError('')
        const [ofertaData, asignaciones] = await Promise.all([
          ofertaCursoService.getById(ofertaId),
          moduloDocenteService.getByOferta(ofertaId)
        ])
        if (!active) return
        setOferta(ofertaData)
        const asigns = Array.isArray(asignaciones) ? asignaciones : []
        // Consolidar por módulo, y tomar el primer docente para mantener la UI actual
        const byModule = new Map()
        for (const a of asigns) {
          const modId = a.modulo?.id ?? a.id_modulo
          const modName = a.modulo?.nombre
          const docName = a.docenteNombre || (a.docente?.persona ? `${a.docente.persona.nombre} ${a.docente.persona.apellido}` : null)
          if (!byModule.has(modId)) {
            byModule.set(modId, { id: modId, nombre: modName, docentes: [] })
          }
          if (docName) byModule.get(modId).docentes.push(docName)
        }
        const list = Array.from(byModule.values())
        setModulos(list.map((m, idx) => ({
          id: m.id ?? idx + 1,
          titulo: m.nombre ?? `Módulo ${idx + 1}`,
          docente: m.docentes[0] || 'Docente no asignado',
        })))
      } catch (err) {
        if (active) setError(err?.response?.data?.mensaje || err.message || 'Error cargando datos')
      } finally {
        active && setLoading(false)
      }
    }
    if (ofertaId) load()
    return () => { active = false }
  }, [ofertaId])

  // Cargar opciones para selects del modal
  useEffect(() => {
    let active = true
    async function loadOptions() {
      try {
        const docentesData = await docenteService.list().catch(() => [])
        console.log('DOCENTES API raw =>', docentesData)
        if (!active) return
        const docentesList = Array.isArray(docentesData)
          ? docentesData
          : (docentesData?.data || docentesData?.rows || docentesData?.items || docentesData?.docentes || [])
        const mapped = docentesList.map((d) => {
          const p = d.persona || {}
          const first = p.nombre || p.Nombre || p.nombres || p.Nombres || p.primer_nombre || p.primerNombre || ''
          const last = p.apellido || p.Apellido || p.apellidos || p.Apellidos || p.apellido_paterno || p.apellidoPaterno || ''
          const fullName = [first, last].filter(Boolean).join(' ').trim()
          const label = fullName || d.nombre || d.docenteNombre || p.numero_identificacion || `Docente #${d.id ?? ''}`
          return {
            id: String(d.id ?? d.id_docente ?? p.id ?? ''),
            nombre: fullName,
            label,
            numero_identificacion: p.numero_identificacion || '',
            persona: p,
          }
        })
        // Deduplicar por id para evitar opciones duplicadas
        const seen = new Set()
        const unique = mapped.filter(d => {
          const key = String(d.id)
          if (!key || seen.has(key)) return false
          seen.add(key)
          return true
        })
        console.log('DOCENTES mapped =>', mapped, 'unique =>', unique)
        setDocentes(unique)

        // Cargar TODOS los módulos disponibles desde /api/modulos
        let modsList = []
        const rawMods = await moduloService.list().catch(() => [])
        const arr = Array.isArray(rawMods) ? rawMods : (rawMods?.data || rawMods?.rows || rawMods?.items || rawMods?.modulos || [])
        modsList = Array.isArray(arr) ? arr : []
        if (!active) return
        console.log('MODULOS API raw list =>', modsList)
        const normalized = (Array.isArray(modsList) ? modsList : []).map((m, idx) => {
          const id = m.id ?? m.id_modulo ?? m.modulo?.id ?? idx + 1
          const name = m.nombre ?? m.nombre_modulo ?? m.titulo ?? m.titulo_modulo ?? m.modulo?.nombre ?? m.modulo?.titulo ?? `Módulo ${idx + 1}`
          return { id: String(id), titulo: String(name), label: String(name) }
        })
        // dedupe por id
        const seenMods = new Set()
        const uniqueMods = normalized.filter(mm => {
          if (seenMods.has(mm.id)) return false
          seenMods.add(mm.id)
          return true
        })
        console.log('MODULOS normalized =>', normalized, 'unique =>', uniqueMods)
        // Excluir módulos ya agregados en la oferta (según estado actual "modulos")
        const alreadyIds = new Set((modulos || []).map(mm => String(mm.id)))
        const available = uniqueMods.filter(mm => !alreadyIds.has(String(mm.id)))
        setModulosOferta(available)
      } catch (_) {
        if (active) {
          setDocentes([])
          setModulosOferta([])
        }
      }
    }
    if (ofertaId && (openAdd || openEdit || docentes.length === 0)) loadOptions()
    return () => { active = false }
  }, [ofertaId, oferta, openAdd, openEdit])

  const tituloCurso = oferta?.curso?.nombre_curso || 'Curso'
  const totalModulos = modulos.length

  async function onDeleteModulo(m) {
    try {
      setError('')
      // Buscar la asignación específica por módulo y nombre de docente mostrado
      const asignaciones = await moduloDocenteService.getByOferta(ofertaId)
      const arr = Array.isArray(asignaciones) ? asignaciones : []
      const target = arr.find(a => {
        const modId = a.modulo?.id ?? a.id_modulo
        const docName = a.docenteNombre || (a.docente?.persona ? `${a.docente.persona.nombre} ${a.docente.persona.apellido}` : '')
        return String(modId) === String(m.id) && docName === m.docente
      })
      if (!target || !target.id) {
        setError('No se encontró la asignación a eliminar')
        return
      }
      await moduloDocenteService.remove(target.id)

      // Refrescar lista después de eliminar
      const asignaciones2 = await moduloDocenteService.getByOferta(ofertaId)
      const byModule = new Map()
      for (const a of (Array.isArray(asignaciones2) ? asignaciones2 : [])) {
        const modId = a.modulo?.id ?? a.id_modulo
        const modName = a.modulo?.nombre
        const docName = a.docenteNombre || (a.docente?.persona ? `${a.docente.persona.nombre} ${a.docente.persona.apellido}` : null)
        if (!byModule.has(modId)) {
          byModule.set(modId, { id: modId, nombre: modName, docentes: [] })
        }
        if (docName) byModule.get(modId).docentes.push(docName)
      }
      const list = Array.from(byModule.values())
      setModulos(list.map((mm, idx) => ({
        id: mm.id ?? idx + 1,
        titulo: mm.nombre ?? `Módulo ${idx + 1}`,
        docente: mm.docentes[0] || 'Docente no asignado',
      })))
    } catch (err) {
      setError(err?.response?.data?.mensaje || 'Error al eliminar la asignación')
    }
  }

  async function openEditModal(m) {
    try {
      setEditError('')
      setEditModulo({ id: m.id, titulo: m.titulo, docenteActual: m.docente })
      // Buscar asignación actual por módulo y docente mostrado
      const asignaciones = await moduloDocenteService.getByOferta(ofertaId)
      const arr = Array.isArray(asignaciones) ? asignaciones : []
      const target = arr.find(a => {
        const modId = a.modulo?.id ?? a.id_modulo
        const docName = a.docenteNombre || (a.docente?.persona ? `${a.docente.persona.nombre} ${a.docente.persona.apellido}` : '')
        return String(modId) === String(m.id) && docName === m.docente
      })
      if (!target || !target.id) {
        setEditError('No se encontró la asignación a editar')
        setOpenEdit(true)
        return
      }
      setEditAssignId(target.id)
      const currentDocId = target.id_docente || (target.docente?.id)
      setEditDocenteId(currentDocId ? String(currentDocId) : '')
      setOpenEdit(true)
    } catch (err) {
      setEditError(err?.response?.data?.mensaje || 'Error preparando la edición')
      setOpenEdit(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Link to="/admin/gestionar-cursos"><Button variant="outline">← Volver</Button></Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{tituloCurso}</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mt-3">
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500"><path d="M4 19h16M4 8h16M4 13h16"/></svg>
                {totalModulos} módulos
              </span>
            </div>
          </div>
        <Button variant="primary" onClick={() => setOpenAdd(true)}>+ Gestionar Módulos</Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mt-6 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Módulos del Curso</h2>
          {loading && (
            <div className="text-gray-500">Cargando módulos…</div>
          )}
          {error && (
            <div className="rounded border border-red-300 bg-red-50 text-red-700 px-4 py-3">{error}</div>
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {modulos.length === 0 ? (
                <div className="text-gray-500">No hay módulos asignados a esta oferta.</div>
              ) : (
                modulos.map((m, idx) => (
                  <div key={m.id ?? idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold border border-blue-200">{idx + 1}</span>
                          <h3 className="text-base md:text-lg font-semibold text-gray-900">{m.titulo}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
                          <span className="inline-flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
                            {m.docente}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(m)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 text-gray-600 bg-white hover:bg-gray-50" title="Editar" aria-label="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>
                        </button>
                        <button onClick={() => onDeleteModulo(m)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50" title="Eliminar" aria-label="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal: Asignar módulo a docente */}
        <Modal open={openAdd} title="Asignar módulo a docente" onClose={() => setOpenAdd(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!form.docenteId || !form.moduloId) {
                setAddError('Selecciona un docente y un módulo')
                return
              }
              // Evitar asignar un módulo ya agregado a la oferta
              const yaExiste = (modulos || []).some(m => String(m.id) === String(form.moduloId))
              if (yaExiste) {
                setAddError('Este módulo ya está agregado a la oferta')
                return
              }
              try {
                setAddError('')
                // Llamar API POST /api/modulo-docente
                const payload = {
                  id_modulo: Number(form.moduloId),
                  id_docente: Number(form.docenteId),
                  id_oferta_curso: Number(ofertaId),
                }
                await moduloDocenteService.create(payload)

                // Refrescar lista de módulos mostrados
                const asignaciones = await moduloDocenteService.getByOferta(ofertaId)
                const byModule = new Map()
                for (const a of (Array.isArray(asignaciones) ? asignaciones : [])) {
                  const modId = a.modulo?.id ?? a.id_modulo
                  const modName = a.modulo?.nombre
                  const docName = a.docenteNombre || (a.docente?.persona ? `${a.docente.persona.nombre} ${a.docente.persona.apellido}` : null)
                  if (!byModule.has(modId)) {
                    byModule.set(modId, { id: modId, nombre: modName, docentes: [] })
                  }
                  if (docName) byModule.get(modId).docentes.push(docName)
                }
                const list = Array.from(byModule.values())
                setModulos(list.map((m, idx) => ({
                  id: m.id ?? idx + 1,
                  titulo: m.nombre ?? `Módulo ${idx + 1}`,
                  docente: m.docentes[0] || 'Docente no asignado',
                })))

                setOpenAdd(false)
                setForm({ moduloId: '', docenteId: '' })
              } catch (err) {
                setAddError(err?.response?.data?.mensaje || 'Error al guardar la asignación')
              }
            }}
            className="space-y-4"
          >
            {addError && (
              <div className="rounded border border-red-300 bg-red-50 text-red-700 px-4 py-2">{addError}</div>
            )}
            <SearchSelect
              label="Docente"
              placeholder="Escribe para buscar docente"
              options={docentes.map(d => ({ id: d.id, label: d.label }))}
              valueId={form.docenteId}
              onChange={(id) => setForm(f => ({ ...f, docenteId: id }))}
            />
            <SearchSelect
              label="Módulo"
              placeholder="Escribe para buscar módulo"
              options={modulosOferta.map(m => ({ id: m.id, label: m.label }))}
              valueId={form.moduloId}
              onChange={(id) => setForm(f => ({ ...f, moduloId: id }))}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setOpenAdd(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Editar docente del módulo */}
        <Modal open={openEdit} title="Editar docente del módulo" onClose={() => setOpenEdit(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!editAssignId) {
                setEditError('No se encontró la asignación a actualizar')
                return
              }
              if (!editDocenteId) {
                setEditError('Selecciona un docente')
                return
              }
              try {
                setEditError('')
                await moduloDocenteService.update(Number(editAssignId), { id_docente: Number(editDocenteId) })

                // Refrescar lista de módulos mostrados
                const asignaciones = await moduloDocenteService.getByOferta(ofertaId)
                const byModule = new Map()
                for (const a of (Array.isArray(asignaciones) ? asignaciones : [])) {
                  const modId = a.modulo?.id ?? a.id_modulo
                  const modName = a.modulo?.nombre
                  const docName = a.docenteNombre || (a.docente?.persona ? `${a.docente.persona.nombre} ${a.docente.persona.apellido}` : null)
                  if (!byModule.has(modId)) {
                    byModule.set(modId, { id: modId, nombre: modName, docentes: [] })
                  }
                  if (docName) byModule.get(modId).docentes.push(docName)
                }
                const list = Array.from(byModule.values())
                setModulos(list.map((m, idx) => ({
                  id: m.id ?? idx + 1,
                  titulo: m.nombre ?? `Módulo ${idx + 1}`,
                  docente: m.docentes[0] || 'Docente no asignado',
                })))

                setOpenEdit(false)
                setEditAssignId(null)
                setEditDocenteId('')
                setEditModulo(null)
              } catch (err) {
                setEditError(err?.response?.data?.mensaje || 'Error al actualizar la asignación')
              }
            }}
            className="space-y-4"
          >
            {editModulo && (
              <div className="text-sm text-gray-700">Módulo: <span className="font-semibold">{editModulo.titulo}</span></div>
            )}
            {editError && (
              <div className="rounded border border-red-300 bg-red-50 text-red-700 px-4 py-2">{editError}</div>
            )}
            <SearchSelect
              label="Docente"
              placeholder="Escribe para buscar docente"
              options={docentes.map(d => ({ id: d.id, label: d.label }))}
              valueId={editDocenteId}
              onChange={(id) => setEditDocenteId(id)}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setOpenEdit(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}
