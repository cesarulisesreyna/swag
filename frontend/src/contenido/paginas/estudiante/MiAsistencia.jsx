import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import * as alumnosService from "../../../services/alumnosService";

// El modelo Attendance usa: 'presente' | 'ausente' | 'retardo'
const ESTADO_STYLE = {
    presente: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    ausente: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    retardo: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

const MiAsistencia = () => {
    const { user } = useAuth();
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fn = user.matricula
            ? alumnosService.obtenerAsistenciaDelAlumnoPorMatricula
            : alumnosService.obtenerAsistenciaDelAlumno;
        const param = user.matricula ?? user.profileId ?? user.id;
        fn(param).then((res) => {
            // La API devuelve docs de Attendance con studentId/groupId populados
            const raw = Array.isArray(res) ? res : (res.records ?? res.data ?? []);
            setRegistros(raw);
        }).catch(() => setRegistros([])).finally(() => setLoading(false));
    }, [user]);

    // Estadísticas rápidas
    const total = registros.length;
    const presentes = registros.filter((r) => r.status === "presente").length;
    const retardos = registros.filter((r) => r.status === "retardo").length;
    const ausentes = registros.filter((r) => r.status === "ausente").length;
    const porcentaje = total > 0 ? Math.round(((presentes + retardos) / total) * 100) : 0;

    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutro-50">Mi Asistencia</h2>
                <p className="text-sm text-slate-500 dark:text-neutro-400 mt-0.5">Historial de asistencia a tus clases</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
            ) : (
                <>
                    {/* Estadísticas */}
                    {total > 0 && (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {[
                                { label: "Total clases", value: total, color: "from-slate-500 to-slate-600" },
                                { label: "Presentes", value: presentes, color: "from-emerald-500 to-teal-600" },
                                { label: "Retardos", value: retardos, color: "from-amber-500 to-orange-600" },
                                { label: "Ausentes", value: ausentes, color: "from-red-500 to-rose-600" },
                            ].map((s) => (
                                <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="tarjeta-suave p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">{s.label}</p>
                                    <p className={`mt-1 text-3xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Barra de asistencia */}
                    {total > 0 && (
                        <div className="tarjeta-suave p-5 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-slate-700 dark:text-neutro-200">Asistencia efectiva</span>
                                <span className={`font-black text-lg ${porcentaje >= 80 ? "text-emerald-600 dark:text-emerald-400" : porcentaje >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>{porcentaje}%</span>
                            </div>
                            <div className="h-3 rounded-full bg-slate-100 dark:bg-oscuro-200 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${porcentaje}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`h-full rounded-full ${porcentaje >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : porcentaje >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-red-500 to-rose-500"}`}
                                />
                            </div>
                            <p className="text-xs text-slate-400 dark:text-neutro-500">{porcentaje >= 80 ? "Excelente asistencia 🎉" : porcentaje >= 60 ? "Asistencia regular, ¡sigue mejorando!" : "Riesgo de reprobación por faltas ⚠️"}</p>
                        </div>
                    )}

                    {/* Tabla */}
                    {registros.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center"><div className="mb-3 text-5xl">📋</div><p className="font-semibold text-slate-700 dark:text-neutro-200">Sin registros de asistencia</p></div>
                    ) : (
                        <div className="tarjeta-suave overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-oscuro-200/60 bg-slate-50/80 dark:bg-oscuro-200/40">
                                            {["Materia / Grupo", "Fecha", "Estado"].map((h) => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-neutro-400 first:pl-5">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-oscuro-200/40">
                                        {registros.map((r, i) => (
                                            <motion.tr key={r._id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }} className="hover:bg-slate-50/60 dark:hover:bg-oscuro-200/20 transition">
                                                <td className="px-4 py-3 pl-5">
                                                    {/* groupId puede ser objeto populado o string */}
                                                    <p className="font-medium text-slate-800 dark:text-neutro-100">
                                                        {typeof r.groupId === "object" ? (r.groupId?.groupCode ?? r.groupId?._id) : (r.groupId ?? "–")}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-neutro-400">{r.date ? new Date(r.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "–"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${ESTADO_STYLE[r.status] ?? "bg-slate-100 text-slate-600 dark:bg-oscuro-200 dark:text-neutro-300"}`}>{r.status ?? "–"}</span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.section>
    );
};

export default MiAsistencia;
