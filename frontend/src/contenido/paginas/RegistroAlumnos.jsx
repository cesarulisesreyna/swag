import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearAlumno, obtenerAlumnos, actualizarAlumno, eliminarAlumno } from "../../services/alumnosService";

const ContenedorAnimado = motion.section;
const TarjetaAnimada = motion.div;
const EncabezadoAnimado = motion.header;

const RegistroAlumnos = () => {
  const clienteQuery = useQueryClient();
  const [alumno, setAlumno] = useState({
    nombre: "",
    apellido: "",
    email: "",
  });

  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState(null);

  // Consultar alumnos desde el backend
  const {
    data: datosAlumnos = { datos: [] },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["alumnos"],
    queryFn: obtenerAlumnos,
    staleTime: 1000 * 60,
  });

  // Mutaciones
  const accionCrear = useMutation({
    mutationFn: crearAlumno,
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: ["alumnos"] });
      setMensaje({
        tipo: "exito",
        texto: "Alumno registrado correctamente.",
      });
      setTimeout(() => setMensaje(null), 3000);
    },
    onError: () => {
      setMensaje({
        tipo: "error",
        texto: "Error al registrar el alumno.",
      });
      setTimeout(() => setMensaje(null), 3000);
    },
  });

  const accionActualizar = useMutation({
    mutationFn: ({ id, data }) => actualizarAlumno(id, data),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: ["alumnos"] });
      setMensaje({
        tipo: "exito",
        texto: "Alumno actualizado correctamente.",
      });
      setTimeout(() => setMensaje(null), 3000);
    },
    onError: () => {
      setMensaje({
        tipo: "error",
        texto: "Error al actualizar el alumno.",
      });
      setTimeout(() => setMensaje(null), 3000);
    },
  });

  const accionEliminar = useMutation({
    mutationFn: eliminarAlumno,
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: ["alumnos"] });
      setMensaje({
        tipo: "exito",
        texto: "Alumno eliminado correctamente.",
      });
      setTimeout(() => setMensaje(null), 3000);
    },
    onError: () => {
      setMensaje({
        tipo: "error",
        texto: "Error al eliminar el alumno.",
      });
      setTimeout(() => setMensaje(null), 3000);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlumno((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editando !== null) {
      // Actualizar alumno existente
      await accionActualizar.mutateAsync({ id: editando, data: alumno });
      setEditando(null);
    } else {
      // Crear nuevo alumno
      await accionCrear.mutateAsync(alumno);
    }

    resetForm();
  };

  const resetForm = () => {
    setAlumno({
      nombre: "",
      apellido: "",
      email: "",
    });
  };

  const handleEditar = (alumnoData) => {
    setAlumno({
      nombre: alumnoData.nombre,
      apellido: alumnoData.apellido,
      email: alumnoData.email,
    });
    setEditando(alumnoData._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este alumno?")) {
      await accionEliminar.mutateAsync(id);
    }
  };

  const handleCancelar = () => {
    resetForm();
    setEditando(null);
  };

  const listaAlumnos = datosAlumnos?.datos || [];

  const alumnosFiltrados = listaAlumnos.filter((a) => {
    const termino = busqueda.toLowerCase();
    return (
      a.nombre?.toLowerCase().includes(termino) ||
      a.apellido?.toLowerCase().includes(termino) ||
      a.email?.toLowerCase().includes(termino)
    );
  });

  return (
    <ContenedorAnimado
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-10"
    >
      <EncabezadoAnimado
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-4"
      >
        <div>
          <h2 className="titulo-seccion">Registro de Alumnos</h2>
          <p className="descripcion-suave mt-2 max-w-2xl">
            Registra alumnos con información completa y consulta la lista con opciones de edición y eliminación.
          </p>
        </div>

        <AnimatePresence>
          {mensaje && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                mensaje.tipo === "error"
                  ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-400"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-400"
              }`}
            >
              {mensaje.tipo === "error" ? "⚠️" : "✅"}
              <span>{mensaje.texto}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </EncabezadoAnimado>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,400px)_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="tarjeta-suave p-6 shadow-slate-200/80 xl:sticky xl:top-24 xl:h-fit"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-neutro-50">
            {editando !== null ? "Editar alumno" : "Registrar nuevo alumno"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-neutro-300">
            {editando !== null
              ? "Modifica la información y guarda los cambios."
              : "Completa todos los campos del formulario."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="campo-formulario">
              <label className="etiqueta-formulario" htmlFor="nombre">
                Nombre *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="input-formulario"
                placeholder="Ej. Juan"
                value={alumno.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo-formulario">
              <label className="etiqueta-formulario" htmlFor="apellido">
                Apellido *
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                className="input-formulario"
                placeholder="Ej. Pérez García"
                value={alumno.apellido}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo-formulario">
              <label className="etiqueta-formulario" htmlFor="email">
                Correo electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input-formulario"
                placeholder="Ej. alumno@utc.edu.mx"
                value={alumno.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="boton-principal flex-1">
                {editando !== null ? "Actualizar" : "Registrar"}
              </button>
              {editando !== null && (
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-oscuro-300 dark:bg-oscuro-200/70 dark:text-neutro-200 dark:hover:bg-oscuro-300"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
          className="tarjeta-suave overflow-hidden"
        >
          <div className="border-b border-slate-100 bg-white/90 px-6 py-5 dark:border-oscuro-200/60 dark:bg-oscuro-200/70">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-neutro-50">
                  Lista de alumnos
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutro-300">
                  {listaAlumnos.length} alumno{listaAlumnos.length !== 1 ? "s" : ""}{" "}
                  registrado{listaAlumnos.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar alumnos..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-600 shadow-sm transition focus:border-primario-500 focus:outline-none focus:ring-2 focus:ring-primario-500/30 dark:border-oscuro-300 dark:bg-oscuro-200/60 dark:text-neutro-200 dark:focus:border-esmeralda-500 dark:focus:ring-esmeralda-500/30"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 dark:text-neutro-500">
                  🔍
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-6">
            {isLoading && <p className="text-sm text-slate-500 dark:text-neutro-300">Cargando alumnos...</p>}

            {isError && (
              <p className="text-sm font-medium text-rose-500">Error al cargar alumnos.</p>
            )}

            {!isLoading && !isError && listaAlumnos.length === 0 ? (
              <p className="text-sm font-medium text-slate-400 dark:text-neutro-500">
                No hay alumnos registrados aún.
              </p>
            ) : alumnosFiltrados.length === 0 ? (
              <p className="text-sm font-medium text-slate-400 dark:text-neutro-500">
                No se encontraron resultados para "{busqueda}".
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatePresence>
                  {alumnosFiltrados.map((a, index) => (
                    <TarjetaAnimada
                      key={a._id || a.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-md shadow-slate-200/60 transition hover:shadow-lg dark:border-oscuro-300/70 dark:bg-oscuro-200/70 dark:shadow-black/20"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-neutro-50">
                              {a.nombre} {a.apellido}
                            </h4>
                          </div>
                          <div className="space-y-1 text-sm text-slate-600 dark:text-neutro-300">
                            <p>
                              <strong>Email:</strong> {a.email}
                            </p>
                            <p className="text-xs text-slate-400">
                              {a.activo ? "✓ Activo" : "✗ Inactivo"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleEditar(a)}
                          className="flex-1 rounded-xl bg-primario-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-600 dark:bg-esmeralda-500 dark:hover:bg-esmeralda-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(a._id || a.id)}
                          className="flex-1 rounded-xl border border-rose-500 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                        >
                          Eliminar
                        </button>
                      </div>
                    </TarjetaAnimada>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </ContenedorAnimado>
  );
};

export default RegistroAlumnos;




