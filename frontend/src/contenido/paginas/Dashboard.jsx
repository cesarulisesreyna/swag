import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

const MotionSection = motion.section;
const MotionDiv = motion.div;
const TarjetaEstadistica = motion.article;

const Dashboard = () => {
  const { user } = useAuth();

  const estadisticas = [
    {
      titulo: "Alumnos Registrados",
      valor: "324",
      cambio: "+12.5%",
      tendencia: "positiva",
      icono: "👨‍🎓",
      color: "from-blue-500 to-blue-600",
      sombra: "shadow-blue-500/20",
    },
    {
      titulo: "Materias Activas",
      valor: "42",
      cambio: "+3",
      tendencia: "positiva",
      icono: "📚",
      color: "from-emerald-500 to-emerald-600",
      sombra: "shadow-emerald-500/20",
    },
    {
      titulo: "Asistencia Promedio",
      valor: "89.3%",
      cambio: "+2.1%",
      tendencia: "positiva",
      icono: "📊",
      color: "from-purple-500 to-purple-600",
      sombra: "shadow-purple-500/20",
    },
    {
      titulo: "Horarios Configurados",
      valor: "18",
      cambio: "Activos",
      tendencia: "neutro",
      icono: "🕐",
      color: "from-amber-500 to-amber-600",
      sombra: "shadow-amber-500/20",
    },
  ];

  const actividadesRecientes = [
    {
      titulo: "Nuevo alumno registrado",
      descripcion: "María González - Ing. en Sistemas",
      tiempo: "Hace 5 minutos",
      icono: "✨",
    },
    {
      titulo: "Materia actualizada",
      descripcion: "Base de Datos II - 40 sesiones",
      tiempo: "Hace 1 hora",
      icono: "📝",
    },
    {
      titulo: "Horario modificado",
      descripcion: "Grupo A - Turno vespertino",
      tiempo: "Hace 3 horas",
      icono: "🔄",
    },
    {
      titulo: "Asistencia registrada",
      descripcion: "Programación Avanzada - 32/35 alumnos",
      tiempo: "Hace 5 horas",
      icono: "✅",
    },
  ];

  const accesoRapido = [
    {
      titulo: "Materias",
      descripcion: "Gestiona el catálogo de materias",
      enlace: "/materias",
      icono: "📚",
      color: "bg-blue-500",
    },
    {
      titulo: "Horarios",
      descripcion: "Organiza los horarios",
      enlace: "/horarios",
      icono: "📅",
      color: "bg-purple-500",
    },
    {
      titulo: "Registro",
      descripcion: "Registra nuevos alumnos",
      enlace: "/registro-alumnos",
      icono: "👤",
      color: "bg-emerald-500",
    },
  ];

  return (
    <MotionSection
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Header de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-3xl bg-gradient-to-r from-primario-500 to-blue-600 p-8 text-white shadow-xl shadow-primario-500/20 dark:from-esmeralda-500 dark:to-emerald-600 dark:shadow-esmeralda-500/20"
      >
        <h2 className="text-3xl font-bold">
          Bienvenido{user?.nombre ? `, ${user.nombre}` : ""} 
        </h2>
        <p className="mt-2 text-lg text-white/90">
          Sistema Web de Asistencia y Gestionamiento
        </p>
        <p className="mt-1 text-sm text-white/70">
          Gestiona estudiantes, materias y horarios desde un solo lugar
        </p>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {estadisticas.map((stat, index) => (
          <TarjetaEstadistica
            key={stat.titulo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`tarjeta-suave overflow-hidden p-6 shadow-lg ${stat.sombra}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-neutro-400">
                  {stat.titulo}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-neutro-50">
                  {stat.valor}
                </p>
                <p
                  className={`mt-2 text-xs font-semibold ${
                    stat.tendencia === "positiva"
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-slate-500 dark:text-neutro-400"
                  }`}
                >
                  {stat.cambio}
                </p>
              </div>
              <div
                className={`rounded-2xl bg-gradient-to-br ${stat.color} p-3 text-2xl shadow-lg`}
              >
                {stat.icono}
              </div>
            </div>
          </TarjetaEstadistica>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Actividades recientes */}
        <MotionDiv
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="tarjeta-suave overflow-hidden lg:col-span-2"
        >
          <div className="border-b border-slate-100 bg-white/90 px-6 py-5 dark:border-oscuro-200/60 dark:bg-oscuro-200/70">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-neutro-50">
              Actividad Reciente
            </h3>
            <p className="text-sm text-slate-500 dark:text-neutro-300">
              Últimas actualizaciones del sistema
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-oscuro-300/50">
            {actividadesRecientes.map((actividad, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-4 px-6 py-4 transition hover:bg-slate-50/50 dark:hover:bg-oscuro-300/30"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-xl dark:from-oscuro-300 dark:to-oscuro-400">
                  {actividad.icono}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-neutro-50">
                    {actividad.titulo}
                  </h4>
                  <p className="mt-1 text-sm text-slate-600 dark:text-neutro-300">
                    {actividad.descripcion}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-neutro-500">
                    {actividad.tiempo}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </MotionDiv>

        {/* Acceso rápido */}
        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="tarjeta-suave overflow-hidden"
        >
          <div className="border-b border-slate-100 bg-white/90 px-6 py-5 dark:border-oscuro-200/60 dark:bg-oscuro-200/70">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-neutro-50">
              Acceso Rápido
            </h3>
            <p className="text-sm text-slate-500 dark:text-neutro-300">
              Atajos del sistema
            </p>
          </div>
          <div className="space-y-3 p-6">
            {accesoRapido.map((item, index) => (
              <motion.a
                key={item.titulo}
                href={item.enlace}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm transition hover:shadow-md dark:border-oscuro-300/50 dark:bg-oscuro-200/50"
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${item.color} text-2xl text-white shadow-lg`}
                >
                  {item.icono}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-neutro-50">
                    {item.titulo}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-neutro-400">
                    {item.descripcion}
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-slate-400 dark:text-neutro-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.a>
            ))}
          </div>
        </MotionDiv>
      </div>

      {/* Panel de información */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="tarjeta-suave p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primario-500 to-blue-600 text-2xl text-white shadow-lg dark:from-esmeralda-500 dark:to-emerald-600">
            💡
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-neutro-50">
              Panel Principal
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-neutro-300">
              Usa el menú lateral para acceder a las funciones del Sistema Web de Asistencia y
              Gestionamiento. Puedes gestionar materias, configurar horarios y registrar alumnos
              desde las opciones del menú.
            </p>
          </div>
        </div>
      </MotionDiv>
    </MotionSection>
  );
};

export default Dashboard;
