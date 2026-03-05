import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as asistenciasService from "../../services/asistenciasService";
import * as gruposService from "../../services/gruposService";
import { useAuth } from "../../hooks/useAuth";

// El modelo Attendance usa: 'presente' | 'ausente' | 'retardo'
const ESTADOS = ["presente", "retardo", "ausente"];

const ESTADO_LABEL = {
    presente: "Presente",
    retardo: "Retardo",
    ausente: "Ausente",
};

const ESTADO_STYLE = {
    presente: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    ausente: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    retardo: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

const Asistencia = () => {
    const { user } = useAuth();
    const isCoord = user?.role === "coordinator";
    const isTeacher = user?.role === "teacher";

    // ── Estado para el flujo de registro (maestro) ─────────────────────────────
    const [grupos, setGrupos] = useState([]);
    const [grupoId, setGrupoId] = useState("");
    // enrollments: [{ enrollmentId, studentId, nombre, apellido, matricula }]
    const [enrollments, setEnrollments] = useState([]);
    const [estados, setEstados] = useState({});   // { enrollmentId: status }
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [guardando, setGuardando] = useState(false);
    const [exitoMsg, setExitoMsg] = useState("");

    // ── Estado historial ───────────────────────────────────────────────────────
    const [historial, setHistorial] = useState([]);
    const [loadingHist, setLoadingHist] = useState(true);
    const [tabActiva, setTabActiva] = useState(isTeacher ? "registro" : "historial");

    // ── Carga de grupos ────────────────────────────────────────────────────────
    const cargarGrupos = useCallback(async () => {
        try {
            const res = await gruposService.obtenerGrupos();
            // La API devuelve { data, total } para la lista de grupos
            const lista = Array.isArray(res) ? res : (res.data ?? res.groups ?? []);
            setGrupos(lista);
        } catch { setGrupos([]); }
    }, []);

    // ── Carga del historial ────────────────────────────────────────────────────
    const cargarHistorial = useCallback(async () => {
        setLoadingHist(true);
        try {
            const res = await asistenciasService.obtenerAsistencias();
            setHistorial(Array.isArray(res) ? res : (res.records ?? []));
        } catch { setHistorial([]); }
        finally { setLoadingHist(false); }
    }, []);

    useEffect(() => {
        if (isTeacher || isCoord) cargarGrupos();
        cargarHistorial();
    }, [isTeacher, isCoord, cargarGrupos, cargarHistorial]);

    // ── Al seleccionar grupo, cargar alumnos/inscripciones ─────────────────────
    useEffect(() => {
        if (!grupoId) { setEnrollments([]); setEstados({}); return; }
        gruposService.obtenerAlumnosDelGrupo(grupoId)
            .then((res) => {
                // La API devuelve Enrollment docs con studentId populado
                // res puede ser un array de enrollments o { data/students/records }
                const raw = Array.isArray(res) ? res : (res.students ?? res.data ?? []);
                const mapped = raw.map((e) => {
                    // Si ya tiene studentId como objeto populado:
                    const stu = e.studentId ?? e;
                    return {
                        enrollmentId: e._id,
                        studentId: stu._id ?? stu.id,
                        nombre: stu.nombre,
                        apellido: stu.apellido,
                        matricula: stu.matricula,
                    };
                });
                setEnrollments(mapped);
                // Inicializar todos como 'presente'
                setEstados(Object.fromEntries(mapped.map((e) => [e.enrollmentId, "presente"])));
            })
            .catch(() => { setEnrollments([]); setEstados({}); });
    }, [grupoId]);

    const toggleEstado = (enrollmentId, estado) =>
        setEstados((prev) => ({ ...prev, [enrollmentId]: estado }));

    // ── Registrar asistencia en bulk ───────────────────────────────────────────
    const handleRegistrar = async () => {
        if (!grupoId || enrollments.length === 0) return;
        setGuardando(true);
        setExitoMsg("");
        try {
            const records = enrollments.map((e) => ({
                studentId: e.studentId,
                enrollmentId: e.enrollmentId,
                status: estados[e.enrollmentId] ?? "ausente",
            }));
            await asistenciasService.registrarAsistencia({ groupId: grupoId, date: fecha, records });
            setExitoMsg(`✅ Asistencia registrada para ${enrollments.length} alumnos.`);
            cargarHistorial();
        } catch (err) {
            setExitoMsg("❌ " + (err?.response?.data?.message ?? "Error al registrar."));
        } finally { setGuardando(false); }
    };

    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutro-50">Asistencia</h2>
                <p className="text-sm text-slate-500 dark:text-neutro-400 mt-0.5">
                    {isTeacher ? "Registra y consulta la asistencia de tus grupos" : "Historial de asistencia del sistema"}
                </p>
            </div>

            {/* Tabs (solo maestro ve ambas pestañas) */}
            {isTeacher && (
                <div className="flex gap-2">
                    {[["registro", "Registrar"], ["historial", "Historial"]].map(([t, l]) => (
                        <button key={t} onClick={() => setTabActiva(t)} className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${tabActiva === t ? "bg-primario-500 text-white dark:bg-esmeralda-500 shadow-lg shadow-primario-500/25" : "bg-white dark:bg-oscuro-100 border border-slate-200 dark:border-oscuro-200 text-slate-600 dark:text-neutro-300 hover:bg-slate-50 dark:hover:bg-oscuro-200"}`}>
                            {l}
                        </button>
                    ))}
                </div>
            )}

            {/* Tab: Registro (solo teacher) */}
            {tabActiva === "registro" && isTeacher && (
                <div className="tarjeta-suave p-6 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Selector de grupo */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">Grupo</label>
                            <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-oscuro-200/60 bg-slate-50 dark:bg-oscuro-200/60 px-3 py-2.5 text-sm text-slate-900 dark:text-neutro-50 outline-none focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20">
                                <option value="">Selecciona un grupo…</option>
                                {grupos.map((g) => (
                                    <option key={g._id} value={g._id}>
                                        {g.groupCode ?? g.nombre ?? g._id}
                                        {g.subjectId?.nombre ? ` – ${g.subjectId.nombre}` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Fecha */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">Fecha</label>
                            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} max={new Date().toISOString().slice(0, 10)} className="w-full rounded-xl border border-slate-200 dark:border-oscuro-200/60 bg-slate-50 dark:bg-oscuro-200/60 px-3 py-2.5 text-sm text-slate-900 dark:text-neutro-50 outline-none focus:border-primario-400 focus:ring-2 focus:ring-primario-400/20" />
                        </div>
                    </div>

                    {enrollments.length > 0 ? (
                        <>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutro-500">{enrollments.length} alumnos</p>
                                {enrollments.map((e, i) => (
                                    <motion.div key={e.enrollmentId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-oscuro-200/60 px-4 py-3 gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-neutro-50">{e.nombre} {e.apellido}</p>
                                            <p className="text-xs font-mono text-slate-400 dark:text-neutro-500">{e.matricula}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {ESTADOS.map((est) => (
                                                <button key={est} onClick={() => toggleEstado(e.enrollmentId, est)} className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${estados[e.enrollmentId] === est ? ESTADO_STYLE[est] + " ring-2 ring-offset-1 ring-current" : "bg-slate-200 text-slate-500 dark:bg-oscuro-300 dark:text-neutro-400 hover:bg-slate-300 dark:hover:bg-oscuro-400"}`}>
                                                    {ESTADO_LABEL[est]}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {exitoMsg && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl px-4 py-3 text-sm font-medium ${exitoMsg.startsWith("✅") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"}`}>
                                    {exitoMsg}
                                </motion.div>
                            )}

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleRegistrar} disabled={guardando} className="w-full rounded-xl bg-gradient-to-r from-primario-500 to-esmeralda-600 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-60 transition">
                                {guardando ? "Registrando…" : "Guardar asistencia"}
                            </motion.button>
                        </>
                    ) : grupoId ? (
                        <p className="text-center text-sm text-slate-500 dark:text-neutro-400 py-8">Sin alumnos inscritos en este grupo</p>
                    ) : (
                        <p className="text-center text-sm text-slate-500 dark:text-neutro-400 py-8">Selecciona un grupo para comenzar</p>
                    )}
                </div>
            )}

            {/* Tab: Historial */}
            {tabActiva === "historial" && (
                <div className="tarjeta-suave overflow-hidden">
                    {loadingHist ? (
                        <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
                    ) : historial.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center"><div className="mb-3 text-5xl">📋</div><p className="font-semibold text-slate-700 dark:text-neutro-200">Sin registros</p></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-oscuro-200/60 bg-slate-50/80 dark:bg-oscuro-200/40">
                                        {["Alumno", "Grupo", "Fecha", "Estado"].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-neutro-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-oscuro-200/40">
                                    {historial.slice(0, 80).map((r, i) => {
                                        const stu = r.studentId ?? {};
                                        const grp = r.groupId ?? {};
                                        return (
                                            <motion.tr key={r._id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50/60 dark:hover:bg-oscuro-200/20 transition">
                                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-neutro-100">
                                                    {stu.nombre ?? "–"} {stu.apellido ?? ""}
                                                    {stu.matricula && <span className="ml-2 font-mono text-xs text-slate-400 dark:text-neutro-500">{stu.matricula}</span>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-neutro-300">{grp.groupCode ?? grp.nombre ?? r.groupId ?? "–"}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-neutro-300 font-mono text-xs">{r.date ? new Date(r.date).toLocaleDateString("es-MX") : "–"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${ESTADO_STYLE[r.status] ?? "bg-slate-100 text-slate-600 dark:bg-oscuro-200 dark:text-neutro-300"}`}>{r.status ?? "–"}</span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </motion.section>
    );
};

export default Asistencia;
