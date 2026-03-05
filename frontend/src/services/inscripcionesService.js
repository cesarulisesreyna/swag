import api from "./api";

export const obtenerInscripciones = (params = {}) =>
    api.get("/enrollments", { params }).then((r) => r.data);

export const obtenerInscripcionPorId = (id) =>
    api.get(`/enrollments/${id}`).then((r) => r.data);

export const crearInscripcion = (data) =>
    api.post("/enrollments", data).then((r) => r.data);

export const actualizarEstatusInscripcion = (id, status) =>
    api.patch(`/enrollments/${id}/status`, { status }).then((r) => r.data);
