import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as gruposService from "../../services/gruposService";
import * as alumnosService from "../../services/alumnosService";
import * as materiasService from "../../services/materiasService";
import * as profesoresService from "../../services/profesoresService";
import { useAuth } from "../../hooks/useAuth";

const Modal = ({ title, onClose, children }) => (
    <AnimatePresence>
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-oscuro-100 shadow-2xl border border-slate-200 dark:border-oscuro-200" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-oscuro-200/60 px-6 py-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-neutro-50">{title}</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-oscuro-200 transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

// Formulario para crear/editar grupo
const EMPTY_FORM = { groupCode: "", subjectId: "", teacherId: "", period: "", capacity: 30, classroom: "" };

const Grupos = () => {
    const { user } = useAuth();
    const isCoord = user?.role === "coordinator";

    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [modalGrupo, setModalGrupo] = useState(null);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
    const [alumnos, setAlumnos] = useState([]);
    const [alumnosBuscados, setAlumnosBuscados] = useState([]);
    const [busqAlumno, setBusqAlumno] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [tab, setTab] = useState("info");

    // Para los dropdowns del formulario
    const [materias, setMaterias] = useState([]);
    const [maestros, setMaestros] = useState([]);

    // ── Carga de grupos ────────────────────────────────────────────────────────
    const cargarGrupos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await gruposService.obtenerGrupos();
            // La API devuelve { data, total, page, limit }
            let lista = Array.isArray(res) ? res : (res.data ?? res.groups ?? []);
            // Maestro: filtrar por sus propios grupos (teacherId populado)
            if (user?.role === "teacher" && user?.profileId) {
                lista = lista.filter((g) => {
                    const tid = g.teacherId;
                    const tidStr = typeof tid === "object" ? String(tid?._id) : String(tid);
                    return tidStr === user.profileId;
                });
            }
            setGrupos(lista);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { cargarGrupos(); }, [cargarGrupos]);

    // ── Carga de materias y maestros para el formulario ───────────────────────
    const cargarCatalogos = useCallback(async () => {
        try {
            const [resMat, resMae] = await Promise.all([
                materiasService.obtenerMaterias(),
                profesoresService.obtenerProfesores(),
            ]);
            setMaterias(Array.isArray(resMat) ? resMat : (resMat.data ?? []));
            setMaestros(Array.isArray(resMae) ? resMae : (resMae.data ?? []));
        } catch { /* ignorar */ }
    }, []);

    // ── Detalle de grupo ───────────────────────────────────────────────────────
    const abrirDetalle = async (g) => {
        setGrupoSeleccionado(g);
        setTab("info");
        setModalGrupo("detalle");
        try {
            const res = await gruposService.obtenerAlumnosDelGrupo(g._id);
            // Enrollment docs con studentId populado
            const raw = Array.isArray(res) ? res : (res.students ?? res.data ?? []);
            const mapped = raw.map((e) => {
                const stu = e.studentId ?? e;
                return { _id: stu._id ?? stu.id, nombre: stu.nombre, apellido: stu.apellido, matricula: stu.matricula };
            });
            setAlumnos(mapped);
        } catch { setAlumnos([]); }
    };

    const abrirCrear = async () => {
        setForm(EMPTY_FORM);
        setFormError("");
        setGrupoSeleccionado(null);
        setModalGrupo("form");
        await cargarCatalogos();
    };

    const abrirEditar = async (g) => {
        setGrupoSeleccionado(g);
        setForm({
            groupCode: g.groupCode ?? "",
            subjectId: (typeof g.subjectId === "object" ? g.subjectId?._id : g.subjectId) ?? "",
            teacherId: (typeof g.teacherId === "object" ? g.teacherId?._id : g.teacherId) ?? "",
            period: g.period ?? "",
            capacity: g.capacity ?? 30,
            classroom: g.classroom ?? "",
        });
        setFormError("");
        setModalGrupo("form");
        await cargarCatalogos();
    };

    const handleGuardar = async (e) => {
        e.preventDefault(); setSaving(true); setFormError("");
        try {
            const payload = {
                groupCode: form.groupCode,
                subjectId: form.subjectId,
                teacherId: form.teacherId,
                period: form.period,
                capacity: Number(form.capacity),
                classroom: form.classroom,
            };
            if (grupoSeleccionado) await gruposService.actualizarGrupo(grupoSeleccionado._id, payload);
            else await gruposService.crearGrupo(payload);
            setModalGrupo(null);
            cargarGrupos();
        } catch (err) { setFormError(err?.response?.data?.message ?? "Error al guardar."); }
        finally { setSaving(false); }
    };

    const handleEliminar = async (g) => {
        if (!window.confirm(`¿Eliminar el grupo "${g.groupCode ?? g.nombre}"?`)) return;
        try { await gruposService.eliminarGrupo(g._id); cargarGrupos(); }
        catch { alert("No se pudo eliminar el grupo."); }
    };

    // ── Búsqueda de alumnos para inscribir ────────────────────────────────────
    const buscarAlumnos = useCallback(async (q) => {
        if (!q) { setAlumnosBuscados([]); return; }
        try {
            const res = await alumnosService.obtenerAlumnos({ search: q });
            setAlumnosBuscados(Array.isArray(res) ? res : (res.data ?? res.students ?? []));
        } catch { setAlumnosBuscados([]); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => buscarAlumnos(busqAlumno), 400);
        return () => clearTimeout(t);
    }, [busqAlumno, buscarAlumnos]);

    const inscribir = async (studentId) => {
        try {
            await gruposService.agregarAlumnoAlGrupo(grupoSeleccionado._id, studentId);
            const res = await gruposService.obtenerAlumnosDelGrupo(grupoSeleccionado._id);
            const raw = Array.isArray(res) ? res : (res.students ?? res.data ?? []);
            setAlumnos(raw.map((e) => {
                const stu = e.studentId ?? e;
                return { _id: stu._id ?? stu.id, nombre: stu.nombre, apellido: stu.apellido, matricula: stu.matricula };
            }));
            setBusqAlumno("");
            setAlumnosBuscados([]);
        } catch (err) { alert(err?.response?.data?.message ?? "No se pudo inscribir."); }
    };

    const desinscribir = async (studentId) => {
        if (!window.confirm("¿Quitar este alumno del grupo?")) return;
        try {
            await gruposService.removerAlumnoDelGrupo(grupoSeleccionado._id, studentId);
            setAlumnos((prev) => prev.filter((a) => a._id !== studentId));
        } catch { alert("No se pudo quitar al alumno."); }
    };

    const filtrados = grupos.filter((g) =>
        !busqueda ||
        g.groupCode?.toLowerCase().includes(busqueda.toLowerCase()) ||
        (typeof g.subjectId === "object" && g.subjectId?.nombre?.toLowerCase().includes(busqueda.toLowerCase())) ||
        g.period?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-neutro-50">{isCoord ? "Grupos" : "Mis Grupos"}</h2>
                    <p className="text-sm text-slate-500 dark:text-neutro-400 mt-0.5">{grupos.length} grupo{grupos.length !== 1 ? "s" : ""} encontrado{grupos.length !== 1 ? "s" : ""}</p>
                </div>
                {isCoord && (
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={abrirCrear} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primario-500 to-esmeralda-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primario-500/25 hover:opacity-90 transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Nuevo grupo
                    </motion.button>
                )}
            </div>

            <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
                <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por código, materia o cuatrimestre…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20 dark:border-oscuro-200/60 dark:bg-oscuro-100/80 dark:text-neutro-50 shadow-sm" />
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
            ) : filtrados.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center"><div className="mb-3 text-5xl">📂</div><p className="font-semibold text-slate-700 dark:text-neutro-200">Sin grupos</p></div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtrados.map((g, i) => {
                        const materia = typeof g.subjectId === "object" ? g.subjectId : null;
                        const maestro = typeof g.teacherId === "object" ? g.teacherId : null;
                        return (
                            <motion.article key={g._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="tarjeta-suave flex flex-col gap-3 p-5 cursor-pointer hover:shadow-lg transition" onClick={() => abrirDetalle(g)}>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-neutro-50">{g.groupCode}</p>
                                        <p className="text-xs text-slate-500 dark:text-neutro-400 mt-0.5">{g.period}</p>
                                    </div>
                                    <span className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 dark:bg-oscuro-200 dark:text-neutro-300">
                                        Cap. {g.capacity}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {g.classroom && <span className="rounded-lg bg-slate-100 dark:bg-oscuro-200 px-2.5 py-1 text-slate-600 dark:text-neutro-300">Aula {g.classroom}</span>}
                                    {materia?.nombre && <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-emerald-700 dark:text-emerald-400">{materia.nombre}</span>}
                                    {maestro?.nombre && <span className="rounded-lg bg-violet-50 dark:bg-violet-950/30 px-2.5 py-1 text-violet-700 dark:text-violet-400">{maestro.nombre} {maestro.apellido}</span>}
                                </div>
                                {isCoord && (
                                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-oscuro-200/50" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => abrirEditar(g)} className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-primario-600 dark:text-esmeralda-400 hover:bg-primario-50 dark:hover:bg-esmeralda-950/30 transition">Editar</button>
                                        <button onClick={() => handleEliminar(g)} className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">Eliminar</button>
                                    </div>
                                )}
                            </motion.article>
                        );
                    })}
                </div>
            )}

            {/* Modal Detalle */}
            {modalGrupo === "detalle" && grupoSeleccionado && (
                <Modal title={grupoSeleccionado.groupCode ?? "Detalle"} onClose={() => setModalGrupo(null)}>
                    <div className="flex gap-2 mb-4">
                        {["info", "alumnos"].map((t) => (
                            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition ${tab === t ? "bg-primario-500 text-white dark:bg-esmeralda-500" : "bg-slate-100 text-slate-600 dark:bg-oscuro-200 dark:text-neutro-300 hover:bg-slate-200 dark:hover:bg-oscuro-300"}`}>
                                {t === "info" ? "Información" : `Alumnos (${alumnos.length})`}
                            </button>
                        ))}
                    </div>
                    {tab === "info" ? (
                        <dl className="space-y-3 text-sm">
                            {[
                                ["Código", grupoSeleccionado.groupCode],
                                ["Período", grupoSeleccionado.period],
                                ["Aula", grupoSeleccionado.classroom],
                                ["Capacidad", grupoSeleccionado.capacity],
                                ["Materia", (typeof grupoSeleccionado.subjectId === "object" ? grupoSeleccionado.subjectId?.nombre : undefined)],
                                ["Maestro", (typeof grupoSeleccionado.teacherId === "object" && grupoSeleccionado.teacherId) ? `${grupoSeleccionado.teacherId?.nombre} ${grupoSeleccionado.teacherId?.apellido}` : undefined],
                            ].filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => (
                                <div key={k} className="flex gap-2"><dt className="w-28 flex-shrink-0 font-semibold text-slate-500 dark:text-neutro-400">{k}</dt><dd className="text-slate-800 dark:text-neutro-100">{v}</dd></div>
                            ))}
                        </dl>
                    ) : (
                        <div className="space-y-3">
                            {isCoord && (
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
                                    <input type="search" value={busqAlumno} onChange={(e) => setBusqAlumno(e.target.value)} placeholder="Buscar alumno para inscribir…" className="w-full rounded-xl border border-slate-200 dark:border-oscuro-200/60 bg-slate-50 dark:bg-oscuro-200/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20 dark:text-neutro-50" />
                                    {alumnosBuscados.length > 0 && (
                                        <ul className="absolute left-0 right-0 top-full mt-1 z-10 rounded-xl border border-slate-200 dark:border-oscuro-200 bg-white dark:bg-oscuro-100 shadow-lg max-h-48 overflow-y-auto">
                                            {alumnosBuscados.map((a) => (
                                                <li key={a._id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-oscuro-200 transition">
                                                    <span className="text-sm font-medium text-slate-800 dark:text-neutro-100">{a.nombre} {a.apellido} <span className="text-xs text-slate-400 dark:text-neutro-500 font-mono ml-1">{a.matricula}</span></span>
                                                    <button onClick={() => inscribir(a._id)} className="rounded-lg bg-primario-500 dark:bg-esmeralda-500 px-2.5 py-1 text-xs font-bold text-white hover:opacity-80 transition">Inscribir</button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                            {alumnos.length === 0 ? (
                                <p className="text-center text-sm text-slate-500 dark:text-neutro-400 py-6">Sin alumnos inscritos</p>
                            ) : (
                                <ul className="space-y-2">
                                    {alumnos.map((a) => (
                                        <li key={a._id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-oscuro-200/60 px-3 py-2.5">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-neutro-100">{a.nombre} {a.apellido}</p>
                                                <p className="text-xs font-mono text-slate-400 dark:text-neutro-500">{a.matricula}</p>
                                            </div>
                                            {isCoord && (
                                                <button onClick={() => desinscribir(a._id)} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">Quitar</button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </Modal>
            )}

            {/* Modal Crear/Editar (solo coordinator) */}
            {modalGrupo === "form" && isCoord && (
                <Modal title={grupoSeleccionado ? "Editar grupo" : "Nuevo grupo"} onClose={() => setModalGrupo(null)}>
                    <form onSubmit={handleGuardar} className="space-y-4">
                        {/* Código del grupo */}
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">Código del grupo</label>
                            <input value={form.groupCode} onChange={(e) => setForm((f) => ({ ...f, groupCode: e.target.value }))} placeholder="MAT101-A" required className="w-full rounded-xl border border-slate-200 dark:border-oscuro-200/60 bg-slate-50 dark:bg-oscuro-200/60 px-3 py-2.5 text-sm text-slate-900 dark:text-neutro-50 outline-none focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20" />
                        </div>
                        {/* Materia */}
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">Materia</label>
                            <select value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))} required className="w-full rounded-xl border border-slate-200 dark:border-oscuro-200/60 bg-slate-50 dark:bg-oscuro-200/60 px-3 py-2.5 text-sm text-slate-900 dark:text-neutro-50 outline-none focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20">
                                <option value="">Selecciona una materia…</option>
                                {materias.map((m) => <option key={m._id} value={m._id}>{m.nombre} {m.codigo ? `(${m.codigo})` : ""}</option>)}
                            </select>
                        </div>
                        {/* Maestro */}
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">Maestro</label>
                            <select value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))} required className="w-full rounded-xl border border-slate-200 dark:border-oscuro-200/60 bg-slate-50 dark:bg-oscuro-200/60 px-3 py-2.5 text-sm text-slate-900 dark:text-neutro-50 outline-none focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20">
                                <option value="">Selecciona un maestro…</option>
                                {maestros.map((m) => <option key={m._id} value={m._id}>{m.nombre} {m.apellido}</option>)}
                            </select>
                        </div>
                        {/* Período y Aula */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">Período</label>
                                <input value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="2026-1" required className="w-full rounded-xl border border-slate-200 dark:border-oscuro-200/60 bg-slate-50 dark:bg-oscuro-200/60 px-3 py-2.5 text-sm text-slate-900 dark:text-neutro-50 outline-none focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">Aula</label>
                                <input value={form.classroom} onChange={(e) => setForm((f) => ({ ...f, classroom: e.target.value }))} placeholder="A-101" required className="w-full rounded-xl border border-slate-200 dark:border-oscuro-200/60 bg-slate-50 dark:bg-oscuro-200/60 px-3 py-2.5 text-sm text-slate-900 dark:text-neutro-50 outline-none focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20" />
                            </div>
                        </div>
                        {/* Capacidad */}
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">Capacidad</label>
                            <input type="number" min="1" max="100" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className="w-full rounded-xl border border-slate-200 dark:border-oscuro-200/60 bg-slate-50 dark:bg-oscuro-200/60 px-3 py-2.5 text-sm text-slate-900 dark:text-neutro-50 outline-none focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20" />
                        </div>
                        {formError && <p className="rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{formError}</p>}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setModalGrupo(null)} className="flex-1 rounded-xl border border-slate-200 dark:border-oscuro-200 py-2.5 text-sm font-semibold text-slate-600 dark:text-neutro-300 hover:bg-slate-50 dark:hover:bg-oscuro-200 transition">Cancelar</button>
                            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-primario-500 to-esmeralda-600 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition">{saving ? "Guardando…" : "Guardar"}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </motion.section>
    );
};

export default Grupos;
