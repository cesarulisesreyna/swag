import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import * as alumnosService from "../../services/alumnosService";

const EMPTY_FORM = { nombre: "", apellido: "", email: "", password: "", matricula: "", carrera: "", cuatrimestre: "" };
const Field = ({ label, id, ...props }) => (
    <div className="space-y-1">
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">{label}</label>
        <input id={id} {...props} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20 dark:border-oscuro-200/60 dark:bg-oscuro-200/60 dark:text-neutro-50" />
    </div>
);

import { AnimatePresence } from "framer-motion";
const Modal = ({ title, onClose, children }) => (
    <AnimatePresence>
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-oscuro-100 shadow-2xl border border-slate-200 dark:border-oscuro-200" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-oscuro-200/60 px-6 py-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-neutro-50">{title}</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-oscuro-200 transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

const Alumnos = () => {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const data = await alumnosService.obtenerAlumnos({ search: busqueda || undefined });
            // La API devuelve { data, total, page, limit }
            setAlumnos(Array.isArray(data) ? data : (data.data ?? data.students ?? []));
        } finally { setLoading(false); }
    }, [busqueda]);

    useEffect(() => { const t = setTimeout(cargar, 350); return () => clearTimeout(t); }, [cargar]);

    const abrirCrear = () => { setForm(EMPTY_FORM); setFormError(""); setSelected(null); setModal("form"); };
    const abrirEditar = (a) => { setSelected(a); setForm({ nombre: a.nombre, apellido: a.apellido, email: a.userId?.email ?? "", password: "", matricula: a.matricula, carrera: a.carrera ?? "", cuatrimestre: a.cuatrimestre ?? "" }); setFormError(""); setModal("form"); };
    const cerrar = () => { setModal(null); setSelected(null); };

    const handleGuardar = async (e) => {
        e.preventDefault(); setSaving(true); setFormError("");
        try {
            if (selected) await alumnosService.actualizarAlumno(selected._id, { nombre: form.nombre, apellido: form.apellido, carrera: form.carrera, cuatrimestre: form.cuatrimestre });
            else await alumnosService.crearAlumno(form);
            cerrar(); cargar();
        } catch (err) { setFormError(err?.response?.data?.message ?? "Error al guardar."); }
        finally { setSaving(false); }
    };

    const handleEliminar = async (a) => {
        if (!window.confirm(`¿Desactivar a ${a.nombre} ${a.apellido}?`)) return;
        try { await alumnosService.eliminarAlumno(a._id); cargar(); }
        catch { alert("No se pudo desactivar."); }
    };

    const filtrados = alumnos.filter((a) => !busqueda || `${a.nombre} ${a.apellido} ${a.matricula} ${a.carrera}`.toLowerCase().includes(busqueda.toLowerCase()));

    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-neutro-50">Alumnos</h2>
                    <p className="text-sm text-slate-500 dark:text-neutro-400 mt-0.5">{alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""} registrado{alumnos.length !== 1 ? "s" : ""}</p>
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={abrirCrear} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primario-500 to-esmeralda-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primario-500/25 hover:opacity-90 transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Nuevo alumno
                </motion.button>
            </div>

            <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
                <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, matrícula o carrera…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20 dark:border-oscuro-200/60 dark:bg-oscuro-100/80 dark:text-neutro-50 shadow-sm" />
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
            ) : filtrados.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center"><div className="mb-3 text-5xl">👨‍🎓</div><p className="font-semibold text-slate-700 dark:text-neutro-200">Sin alumnos</p></div>
            ) : (
                <div className="tarjeta-suave overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-oscuro-200/60 bg-slate-50/80 dark:bg-oscuro-200/40">
                                    {["Alumno", "Matrícula", "Carrera", "Cuatrimestre", "Estado", "Acciones"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-neutro-400 first:pl-5">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-oscuro-200/40">
                                {filtrados.map((a, i) => (
                                    <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50/60 dark:hover:bg-oscuro-200/20 transition">
                                        <td className="px-4 py-3 pl-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xs font-bold">{a.nombre?.[0]}{a.apellido?.[0]}</div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-neutro-50">{a.nombre} {a.apellido}</p>
                                                    <p className="text-xs text-slate-400 dark:text-neutro-500">{a.userId?.email ?? ""}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-neutro-300">{a.matricula}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-neutro-300 max-w-[160px] truncate">{a.carrera ?? "–"}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-neutro-300 text-center">{a.cuatrimestre ?? "–"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${a.isActive !== false ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"}`}>{a.isActive !== false ? "Activo" : "Inactivo"}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => abrirEditar(a)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primario-600 dark:text-esmeralda-400 hover:bg-primario-50 dark:hover:bg-esmeralda-950/30 transition">Editar</button>
                                                <button onClick={() => handleEliminar(a)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">Desactivar</button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modal === "form" && (
                <Modal title={selected ? "Editar alumno" : "Nuevo alumno"} onClose={cerrar}>
                    <form onSubmit={handleGuardar} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Nombre" id="a-nombre" name="nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} required />
                            <Field label="Apellido" id="a-apellido" name="apellido" value={form.apellido} onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))} required />
                        </div>
                        {!selected && <>
                            <Field label="Correo" id="a-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                            <Field label="Contraseña" id="a-pass" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
                            <Field label="Matrícula" id="a-mat" value={form.matricula} onChange={(e) => setForm((f) => ({ ...f, matricula: e.target.value }))} required />
                        </>}
                        <Field label="Carrera" id="a-carrera" value={form.carrera} onChange={(e) => setForm((f) => ({ ...f, carrera: e.target.value }))} />
                        <Field label="Cuatrimestre" id="a-cuatri" value={form.cuatrimestre} onChange={(e) => setForm((f) => ({ ...f, cuatrimestre: e.target.value }))} />
                        {formError && <p className="rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{formError}</p>}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={cerrar} className="flex-1 rounded-xl border border-slate-200 dark:border-oscuro-200 py-2.5 text-sm font-semibold text-slate-600 dark:text-neutro-300 hover:bg-slate-50 dark:hover:bg-oscuro-200 transition">Cancelar</button>
                            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-primario-500 to-esmeralda-600 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition">{saving ? "Guardando…" : "Guardar"}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </motion.section>
    );
};

export default Alumnos;
