import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";

const Header = ({ alHacerClickMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const esModoOscuro = theme === "dark";

  const ROL_LABEL = {
    coordinator: "Coordinador",
    teacher: "Maestro",
    student: "Alumno",
  };

  return (
    <motion.header
      className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-oscuro-200/60 dark:bg-oscuro-100/80"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        {/* Izquierda: botón menú + título */}
        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-primario-200 hover:text-primario-600 dark:border-oscuro-200 dark:bg-oscuro-100 dark:text-neutro-200 dark:hover:border-esmeralda-500/40 dark:hover:text-esmeralda-500 lg:hidden"
            onClick={alHacerClickMenu}
            whileTap={{ scale: 0.95 }}
            aria-label="Abrir menú"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="hidden sm:inline">Menú</span>
          </motion.button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-neutro-500 hidden sm:block">
              {user ? ROL_LABEL[user.role] : "Sistema"}
            </p>
            <h1 className="text-base font-bold text-slate-900 dark:text-neutro-50 sm:text-lg leading-tight">
              SWAG · Sistema Académico
            </h1>
          </div>
        </div>

        {/* Derecha: usuario + toggle tema */}
        <div className="flex items-center gap-3">
          {/* Info usuario (pantallas medianas+) */}
          {user && (
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3 py-1.5 dark:border-oscuro-200/60 dark:bg-oscuro-200/60">
              <span className="text-sm font-semibold text-slate-700 dark:text-neutro-100">
                {user.nombre} {user.apellido}
              </span>
              {user.matricula && (
                <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-xs font-mono font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                  {user.matricula}
                </span>
              )}
              {user.numeroEmpleado && (
                <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-xs font-mono font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                  #{user.numeroEmpleado}
                </span>
              )}
            </div>
          )}

          {/* Toggle tema */}
          <motion.button
            type="button"
            onClick={toggleTheme}
            aria-pressed={esModoOscuro}
            aria-label={esModoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            whileTap={{ scale: 0.93 }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-primario-200 hover:text-primario-600 dark:border-oscuro-200 dark:bg-oscuro-100 dark:text-neutro-300 dark:hover:border-esmeralda-500/40 dark:hover:text-esmeralda-500"
          >
            {esModoOscuro ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-12h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71m12.73 0-.71-.71M6.34 6.34l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
