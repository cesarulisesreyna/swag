import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import * as alumnosService from "../../../services/alumnosService";

const MisGrupos = () => {
    const { user } = useAuth();
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fn = user.matricula
            ? alumnosService.obtenerGruposDelAlumnoPorMatricula
            : alumnosService.obtenerGruposDelAlumno;
        const param = user.matricula ?? user.profileId ?? user.id;
        fn(param)
            .then((res) => {
                // La API devuelve Enrollment docs con groupId populado
                // Cada item: { _id (enrollmentId), groupId: { _id, groupCode, subjectId: {...}, teacherId: {...} }, ... }
                const raw = Array.isArray(res) ? res : (res.groups ?? res.data ?? []);
                const mapped = raw.map((item) => {
                    // Si el item tiene groupId como objeto (está populado), extraemos el grupo
                    const g = item.groupId ?? item;
                    return {
                        _id: g._id ?? item._id,
                        nombre: g.groupCode ?? g.nombre ?? "Grupo",
                        cuatrimestre: g.cuatrimestre,
                        turno: g.turno,
                        // subjectId populado con { nombre, codigo }
                        materia: g.subjectId ?? g.materia ?? null,
                        // teacherId populado con { nombre, apellido }
                        teacher: g.teacherId ?? g.teacher ?? null,
                    };
                });
                setGrupos(mapped);
            })
            .catch(() => setGrupos([]))
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutro-50">Mis Grupos</h2>
                <p className="text-sm text-slate-500 dark:text-neutro-400 mt-0.5">{grupos.length} grupo{grupos.length !== 1 ? "s" : ""} inscrito{grupos.length !== 1 ? "s" : ""}</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
            ) : grupos.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center"><div className="mb-3 text-5xl">📂</div><p className="font-semibold text-slate-700 dark:text-neutro-200">Sin grupos inscritos</p></div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {grupos.map((g, i) => (
                        <motion.article key={g._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="tarjeta-suave flex flex-col gap-3 p-5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white text-lg shadow-md">
                                    📚
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-neutro-50 truncate">{g.nombre}</p>
                                    {g.materia?.nombre && <p className="text-xs text-slate-500 dark:text-neutro-400">{g.materia.nombre}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {g.cuatrimestre && <div className="rounded-lg bg-slate-100 dark:bg-oscuro-200 px-2.5 py-1.5"><span className="text-slate-500 dark:text-neutro-400">Cuatrimestre</span><p className="font-semibold text-slate-800 dark:text-neutro-100">{g.cuatrimestre}</p></div>}
                                {g.turno && <div className="rounded-lg bg-slate-100 dark:bg-oscuro-200 px-2.5 py-1.5"><span className="text-slate-500 dark:text-neutro-400">Turno</span><p className="font-semibold text-slate-800 dark:text-neutro-100 capitalize">{g.turno}</p></div>}
                                {g.teacher && <div className="col-span-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 px-2.5 py-1.5"><span className="text-violet-500 dark:text-violet-400">Maestro</span><p className="font-semibold text-violet-800 dark:text-violet-200">{g.teacher.nombre} {g.teacher.apellido}</p></div>}
                            </div>
                        </motion.article>
                    ))}
                </div>
            )}
        </motion.section>
    );
};

export default MisGrupos;
