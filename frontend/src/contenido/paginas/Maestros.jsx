import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as profesoresService from "../../services/profesoresService";

const EMPTY_FORM = {
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    numeroEmpleado: "",
    especialidad: "",
};

const Modal = ({ title, onClose, children }) => (
    <AnimatePresence>
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                className="relative w-full max-w-md rounded-2xl bg-white dark:bg-oscuro-100 shadow-2xl border border-slate-200 dark:border-oscuro-200"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-oscuro-200/60 px-6 py-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-neutro-50">{title}</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-oscuro-200 transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

const Field = ({ label, id, ...props }) => (
    <div className="space-y-1">
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">
            {label}
        </label>
        <input
            id={id}
            {...props}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20 dark:border-oscuro-200/60 dark:bg-oscuro-200/60 dark:text-neutro-50 dark:focus:border-esmeralda-500 dark:focus:ring-esmeralda-500/20"
        />
    </div>
);

const Maestros = () => {
    const [maestros, setMaestros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [modal, setModal] = useState(null); // null | 'create' | 'edit'
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const cargarMaestros = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await profesoresService.obtenerProfesores({ search: busqueda || undefined });
            // La API devuelve { data, total, page, limit }
            setMaestros(Array.isArray(data) ? data : (data.data ?? data.teachers ?? []));
        } catch {
            setError("No se pudieron cargar los maestros.");
        } finally {
            setLoading(false);
        }
    }, [busqueda]);

    useEffect(() => {
        const t = setTimeout(cargarMaestros, 350);
        return () => clearTimeout(t);
    }, [cargarMaestros]);

    const abrirCrear = () => {
        setForm(EMPTY_FORM);
        setFormError("");
        setModal("create");
    };

    const abrirEditar = (m) => {
        setSelected(m);
        setForm({ nombre: m.nombre, apellido: m.apellido, email: m.userId?.email ?? m.email ?? "", password: "", numeroEmpleado: m.numeroEmpleado, especialidad: m.especialidad });
        setFormError("");
        setModal("edit");
    };

    const cerrarModal = () => { setModal(null); setSelected(null); };

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleGuardar = async (e) => {
        e.preventDefault();
        setFormError("");
        setSaving(true);
        try {
            if (modal === "create") {
                await profesoresService.crearProfesor(form);
            } else {
                const payload = { nombre: form.nombre, apellido: form.apellido, especialidad: form.especialidad };
                await profesoresService.actualizarProfesor(selected._id, payload);
            }
            cerrarModal();
            cargarMaestros();
        } catch (err) {
            setFormError(err?.response?.data?.message ?? "Error al guardar.");
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (m) => {
        if (!window.confirm(`¿Desactivar a ${m.nombre} ${m.apellido}?`)) return;
        try {
            await profesoresService.eliminarProfesor(m._id);
            cargarMaestros();
        } catch {
            alert("No se pudo desactivar el maestro.");
        }
    };

    const maestrosFiltrados = maestros.filter(
        (m) =>
            !busqueda ||
            `${m.nombre} ${m.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.especialidad?.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.numeroEmpleado?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* Encabezado */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-neutro-50">Maestros</h2>
                    <p className="text-sm text-slate-500 dark:text-neutro-400 mt-0.5">Gestiona el personal docente</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={abrirCrear}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primario-500 to-esmeralda-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primario-500/25 hover:opacity-90 transition"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo maestro
                </motion.button>
            </div>

            {/* Búsqueda */}
            <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-neutro-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, especialidad o #empleado…"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20 dark:border-oscuro-200/60 dark:bg-oscuro-100/80 dark:text-neutro-50 dark:focus:border-esmeralda-500 dark:focus:ring-esmeralda-500/20 shadow-sm"
                />
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="loading-spinner" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">{error}</div>
            ) : maestrosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 text-5xl">👨‍🏫</div>
                    <p className="font-semibold text-slate-700 dark:text-neutro-200">Sin maestros</p>
                    <p className="text-sm text-slate-500 dark:text-neutro-400 mt-1">
                        {busqueda ? "Ningún resultado para tu búsqueda" : "Agrega el primer maestro con el botón de arriba"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {maestrosFiltrados.map((m, i) => (
                        <motion.article
                            key={m._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="tarjeta-suave group flex flex-col gap-4 p-5 hover:shadow-lg transition"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm shadow-md">
                                    {m.nombre?.[0]}{m.apellido?.[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-neutro-50 truncate">{m.nombre} {m.apellido}</p>
                                    <p className="text-xs text-slate-500 dark:text-neutro-400 truncate">{m.especialidad || "Sin especialidad"}</p>
                                </div>
                                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${m.isActive !== false ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"}`}>
                                    {m.isActive !== false ? "Activo" : "Inactivo"}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="rounded-lg bg-slate-100 dark:bg-oscuro-200 px-2.5 py-1 font-mono text-slate-600 dark:text-neutro-300">
                                    #{m.numeroEmpleado}
                                </span>
                                {m.userId?.email && (
                                    <span className="rounded-lg bg-slate-100 dark:bg-oscuro-200 px-2.5 py-1 text-slate-500 dark:text-neutro-400 truncate">
                                        {m.userId.email}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-oscuro-200/50">
                                <button
                                    onClick={() => abrirEditar(m)}
                                    className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-primario-600 dark:text-esmeralda-400 hover:bg-primario-50 dark:hover:bg-esmeralda-950/30 transition"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleEliminar(m)}
                                    className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                >
                                    Desactivar
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </div>
            )}

            {/* Modal crear/editar */}
            {modal && (
                <Modal title={modal === "create" ? "Nuevo maestro" : "Editar maestro"} onClose={cerrarModal}>
                    <form onSubmit={handleGuardar} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Nombre" id="f-nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
                            <Field label="Apellido" id="f-apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
                        </div>
                        {modal === "create" && (
                            <>
                                <Field label="Correo electrónico" id="f-email" name="email" type="email" value={form.email} onChange={handleChange} required />
                                <Field label="Contraseña" id="f-pass" name="password" type="password" value={form.password} onChange={handleChange} required />
                                <Field label="Número de empleado" id="f-emp" name="numeroEmpleado" value={form.numeroEmpleado} onChange={handleChange} required />
                            </>
                        )}
                        <Field label="Especialidad" id="f-esp" name="especialidad" value={form.especialidad} onChange={handleChange} />
                        {formError && (
                            <p className="rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{formError}</p>
                        )}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={cerrarModal} className="flex-1 rounded-xl border border-slate-200 dark:border-oscuro-200 py-2.5 text-sm font-semibold text-slate-600 dark:text-neutro-300 hover:bg-slate-50 dark:hover:bg-oscuro-200 transition">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-primario-500 to-esmeralda-600 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition">
                                {saving ? "Guardando…" : "Guardar"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </motion.section>
    );
};

export default Maestros;
