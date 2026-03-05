import api from "./api";

export const crearAlumno = (alumno) =>
  api.post("/students", alumno).then((r) => r.data);

export const obtenerAlumnos = (params = {}) =>
  api.get("/students", { params }).then((r) => r.data);

export const obtenerAlumnoPorId = (id) =>
  api.get(`/students/${id}`).then((r) => r.data);

export const obtenerAlumnoPorMatricula = (matricula) =>
  api.get(`/students/matricula/${matricula}`).then((r) => r.data);

export const obtenerGruposDelAlumno = (id) =>
  api.get(`/students/${id}/grupos`).then((r) => r.data);

export const obtenerGruposDelAlumnoPorMatricula = (matricula) =>
  api.get(`/students/matricula/${matricula}/grupos`).then((r) => r.data);

export const obtenerAsistenciaDelAlumno = (id) =>
  api.get(`/students/${id}/asistencia`).then((r) => r.data);

export const obtenerAsistenciaDelAlumnoPorMatricula = (matricula) =>
  api.get(`/students/matricula/${matricula}/asistencia`).then((r) => r.data);

export const obtenerHorarioDelAlumno = (id) =>
  api.get(`/students/${id}/horario`).then((r) => r.data);

export const obtenerHorarioDelAlumnoPorMatricula = (matricula) =>
  api.get(`/students/matricula/${matricula}/horario`).then((r) => r.data);

export const actualizarAlumno = (id, data) =>
  api.put(`/students/${id}`, data).then((r) => r.data);

export const eliminarAlumno = (id) =>
  api.delete(`/students/${id}`).then((r) => r.data);
