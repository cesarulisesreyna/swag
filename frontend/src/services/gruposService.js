import api from "./api";

export const crearGrupo = (grupo) =>
  api.post("/groups", grupo).then((r) => r.data);

export const obtenerGrupos = (params = {}) =>
  api.get("/groups", { params }).then((r) => r.data);

export const obtenerGrupoPorId = (id) =>
  api.get(`/groups/${id}`).then((r) => r.data);

export const obtenerAlumnosDelGrupo = (id) =>
  api.get(`/groups/${id}/students`).then((r) => r.data);

export const agregarAlumnoAlGrupo = (grupoId, studentId) =>
  api.post(`/groups/${grupoId}/enroll`, { studentId }).then((r) => r.data);

export const removerAlumnoDelGrupo = (grupoId, studentId) =>
  api.delete(`/groups/${grupoId}/enroll/${studentId}`).then((r) => r.data);

export const actualizarGrupo = (id, data) =>
  api.put(`/groups/${id}`, data).then((r) => r.data);

export const eliminarGrupo = (id) =>
  api.delete(`/groups/${id}`).then((r) => r.data);
