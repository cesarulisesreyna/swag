import api from "./api";

export const crearMateria = (materia) =>
  api.post("/subjects", materia).then((r) => r.data);

export const obtenerMaterias = (params = {}) =>
  api.get("/subjects", { params }).then((r) => r.data);

export const obtenerMateriaPorId = (id) =>
  api.get(`/subjects/${id}`).then((r) => r.data);

export const actualizarMateria = (id, data) =>
  api.put(`/subjects/${id}`, data).then((r) => r.data);

export const eliminarMateria = (id) =>
  api.delete(`/subjects/${id}`).then((r) => r.data);
