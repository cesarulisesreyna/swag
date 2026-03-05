import api from "./api";

export const crearProfesor = (profesor) =>
  api.post("/teachers", profesor).then((r) => r.data);

export const obtenerProfesores = (params = {}) =>
  api.get("/teachers", { params }).then((r) => r.data);

export const obtenerProfesorPorId = (id) =>
  api.get(`/teachers/${id}`).then((r) => r.data);

export const obtenerGruposDelProfesor = (id) =>
  api.get(`/teachers/${id}/groups`).then((r) => r.data);

export const actualizarProfesor = (id, data) =>
  api.put(`/teachers/${id}`, data).then((r) => r.data);

export const eliminarProfesor = (id) =>
  api.delete(`/teachers/${id}`).then((r) => r.data);
