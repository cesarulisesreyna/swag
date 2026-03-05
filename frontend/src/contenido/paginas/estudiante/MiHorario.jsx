import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import * as alumnosService from "../../../services/alumnosService";

// El modelo Schedule usa dayOfWeek: 0=Dom … 6=Sáb
const DIA_POR_NUMERO = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    0: "Domingo",
};

const DIAS_ORDENADOS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const DIA_COLOR = {
    Lunes: "from-blue-500 to-blue-600",
    Martes: "from-violet-500 to-purple-600",
    Miércoles: "from-amber-500 to-orange-600",
    Jueves: "from-rose-500 to-pink-600",
    Viernes: "from-emerald-500 to-teal-600",
    Sábado: "from-sky-500 to-cyan-600",
    Domingo: "from-slate-500 to-slate-600",
};

const MiHorario = () => {
    const { user } = useAuth();
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fn = user.matricula
            ? alumnosService.obtenerHorarioDelAlumnoPorMatricula
            : alumnosService.obtenerHorarioDelAlumno;
        const param = user.matricula ?? user.profileId ?? user.id;
        fn(param)
            .then((res) => {
                // La API devuelve Schedule docs con groupId populado
                // Schedule: { _id, dayOfWeek (0-6), startTime, endTime, classroom, groupId: { subjectId: {nombre}, teacherId: {nombre,apellido} } }
                const raw = Array.isArray(res) ? res : (res.schedules ?? res.data ?? []);
                setHorarios(raw);
            })
            .catch(() => setHorarios([]))
            .finally(() => setLoading(false));
    }, [user]);

    // Agrupar por día de la semana (dayOfWeek numérico → nombre español)
    const porDia = DIAS_ORDENADOS.reduce((acc, dia) => {
        acc[dia] = horarios.filter((h) => {
            const nombreDia = DIA_POR_NUMERO[h.dayOfWeek] ?? h.dia ?? h.diaSemana ?? "";
            return nombreDia === dia;
        });
        return acc;
    }, {});

    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutro-50">Mi Horario</h2>
                <p className="text-sm text-slate-500 dark:text-neutro-400 mt-0.5">Horario semanal de clases</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
            ) : horarios.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center"><div className="mb-3 text-5xl">📅</div><p className="font-semibold text-slate-700 dark:text-neutro-200">Sin horario asignado</p></div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {DIAS_ORDENADOS.map((dia) => {
                        const items = porDia[dia];
                        if (!items.length) return null;
                        return (
                            <motion.div key={dia} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tarjeta-suave overflow-hidden">
                                <div className={`bg-gradient-to-r ${DIA_COLOR[dia]} px-4 py-3`}>
                                    <h3 className="font-bold text-white">{dia}</h3>
                                </div>
                                <ul className="divide-y divide-slate-100 dark:divide-oscuro-200/50">
                                    {items.map((h, i) => {
                                        // groupId está populado con subjectId y teacherId
                                        const grupo = h.groupId ?? {};
                                        const materia = grupo.subjectId ?? {};
                                        const maestro = grupo.teacherId ?? {};
                                        return (
                                            <li key={h._id ?? i} className="flex flex-col gap-0.5 px-4 py-3">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-neutro-50">
                                                    {materia.nombre ?? "Materia"}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-neutro-400">
                                                    {h.startTime} – {h.endTime}
                                                </p>
                                                {h.classroom && <p className="text-xs text-slate-400 dark:text-neutro-500">Aula: {h.classroom}</p>}
                                                {maestro.nombre && <p className="text-xs text-slate-400 dark:text-neutro-500">{maestro.nombre} {maestro.apellido}</p>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.section>
    );
};

export default MiHorario;
