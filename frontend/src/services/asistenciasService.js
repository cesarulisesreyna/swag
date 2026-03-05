import api from "./api";

export const registrarAsistencia = (data) =>
  api.post("/attendance", data).then((r) => r.data);

export const obtenerAsistencias = (params = {}) =>
  api.get("/attendance", { params }).then((r) => r.data);

export const actualizarAsistencia = (id, data) =>
  api.put(`/attendance/${id}`, data).then((r) => r.data);
