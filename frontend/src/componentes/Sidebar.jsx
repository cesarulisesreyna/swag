import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

// Ícono SVG inline helpers
const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  materias: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  horarios: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  alumnos: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  maestros: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  grupos: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  asistencia: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  inscripciones: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  perfil: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

const NAV_POR_ROL = {
  coordinator: [
    { to: "/dashboard", label: "Panel", icon: "dashboard" },
    { to: "/alumnos", label: "Alumnos", icon: "alumnos" },
    { to: "/maestros", label: "Maestros", icon: "maestros" },
    { to: "/grupos", label: "Grupos", icon: "grupos" },
    { to: "/asistencia", label: "Asistencia", icon: "asistencia" },
    { to: "/materias", label: "Materias", icon: "materias" },
    { to: "/horarios", label: "Horarios", icon: "horarios" },
    { to: "/inscripciones", label: "Inscripciones", icon: "inscripciones" },
  ],
  teacher: [
    { to: "/dashboard", label: "Panel", icon: "dashboard" },
    { to: "/grupos", label: "Mis Grupos", icon: "grupos" },
    { to: "/asistencia", label: "Asistencia", icon: "asistencia" },
  ],
  student: [
    { to: "/dashboard", label: "Panel", icon: "dashboard" },
    { to: "/mi-perfil", label: "Mi Perfil", icon: "perfil" },
    { to: "/mis-grupos", label: "Mis Grupos", icon: "grupos" },
    { to: "/mi-horario", label: "Mi Horario", icon: "horarios" },
    { to: "/mi-asistencia", label: "Mi Asistencia", icon: "asistencia" },
  ],
};

const ROL_LABEL = {
  coordinator: "Coordinador",
  teacher: "Maestro",
  student: "Alumno",
};

const ROL_COLOR = {
  coordinator: "from-violet-500 to-purple-600",
  teacher: "from-emerald-500 to-teal-600",
  student: "from-sky-500 to-blue-600",
};

const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.055, duration: 0.32, ease: "easeOut" },
  }),
};

const Sidebar = ({ cerrarBarra }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? "student";
  const navItems = NAV_POR_ROL[role] ?? NAV_POR_ROL.student;
  const initials = user
    ? `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-white/95 dark:bg-oscuro-100/90 backdrop-blur-xl border-r border-slate-200/60 dark:border-oscuro-200">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-slate-100 dark:border-oscuro-200/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primario-500 to-esmeralda-600 text-white font-bold text-lg shadow-lg shadow-primario-500/30 dark:shadow-esmeralda-500/30">
            S
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-neutro-500">SWAG</p>
            <p className="text-sm font-bold text-slate-800 dark:text-neutro-50 leading-tight">Sistema Académico</p>
          </div>
        </div>
        <button
          type="button"
          onClick={cerrarBarra}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-oscuro-200/60 dark:hover:text-neutro-200 transition lg:hidden"
          aria-label="Cerrar menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Usuario */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-oscuro-200/60">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${ROL_COLOR[role]} text-white text-sm font-bold shadow-md`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-neutro-50 truncate">
              {user?.nombre} {user?.apellido}
            </p>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-gradient-to-r ${ROL_COLOR[role]} text-white`}>
              {ROL_LABEL[role]}
            </span>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegación principal">
        <motion.ul
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {navItems.map((item, i) => (
            <motion.li key={item.to} custom={i} variants={itemVariants}>
              <NavLink
                to={item.to}
                end={item.to === "/dashboard"}
                onClick={cerrarBarra}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                    ? "bg-primario-500 text-white shadow-lg shadow-primario-500/25 dark:bg-esmeralda-500 dark:shadow-esmeralda-500/25"
                    : "text-slate-600 dark:text-neutro-300 hover:bg-slate-100 dark:hover:bg-oscuro-200/60 hover:text-slate-900 dark:hover:text-neutro-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      path={ICONS[item.icon]}
                      className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 dark:text-neutro-500 group-hover:text-primario-500 dark:group-hover:text-esmeralda-400"}`}
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                    )}
                  </>
                )}
              </NavLink>
            </motion.li>
          ))}
        </motion.ul>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-slate-100 dark:border-oscuro-200/60">
        <motion.button
          type="button"
          onClick={handleLogout}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
        >
          <Icon path={ICONS.logout} className="w-5 h-5 flex-shrink-0" />
          Cerrar sesión
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
