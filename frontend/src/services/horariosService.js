import api from "./api";

export const crearHorario = (horario) =>
  api.post("/schedules", horario).then((r) => r.data);

export const obtenerHorarios = (params = {}) =>
  api.get("/schedules", { params }).then((r) => r.data);

export const obtenerHorarioPorId = (id) =>
  api.get(`/schedules/${id}`).then((r) => r.data);

export const actualizarHorario = (id, data) =>
  api.put(`/schedules/${id}`, data).then((r) => r.data);

export const eliminarHorario = (id) =>
  api.delete(`/schedules/${id}`).then((r) => r.data);
