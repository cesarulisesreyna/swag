import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import * as authService from "../../../services/authService";

const InfoRow = ({ label, value }) =>
    value ? (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-oscuro-200/50 last:border-0">
            <span className="w-36 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutro-500 pt-0.5">{label}</span>
            <span className="text-sm font-medium text-slate-800 dark:text-neutro-100">{value}</span>
        </div>
    ) : null;

const MiPerfil = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authService.getMe().then(({ profile: p }) => setProfile(p)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const initials = user ? `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`.toUpperCase() : "?";

    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-xl">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutro-50">Mi Perfil</h2>
                <p className="text-sm text-slate-500 dark:text-neutro-400 mt-0.5">Tu información personal</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
            ) : (
                <div className="tarjeta-suave overflow-hidden">
                    {/* Avatar banner */}
                    <div className="bg-gradient-to-r from-primario-500 to-esmeralda-600 px-6 py-8 flex items-center gap-5">
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white text-2xl font-black shadow-lg">
                            {initials}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{user?.nombre} {user?.apellido}</h3>
                            <p className="text-white/80 text-sm mt-0.5">{user?.email}</p>
                            <span className="mt-2 inline-flex rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">Alumno</span>
                        </div>
                    </div>
                    {/* Datos */}
                    <div className="px-6 py-4">
                        <InfoRow label="Matrícula" value={profile?.matricula ?? user?.matricula} />
                        <InfoRow label="Carrera" value={profile?.carrera} />
                        <InfoRow label="Cuatrimestre" value={profile?.cuatrimestre ? `${profile.cuatrimestre}°` : undefined} />
                        <InfoRow label="Correo" value={user?.email} />
                        <InfoRow label="Estado" value={profile?.isActive !== false ? "Activo" : "Inactivo"} />
                    </div>
                </div>
            )}
        </motion.section>
    );
};

export default MiPerfil;
