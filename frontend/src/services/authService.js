import api from "./api";

/**
 * POST /api/auth/login
 * Retorna { token, user: { id, email, role, nombre, apellido, matricula, numeroEmpleado } }
 */
export const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
};

/**
 * GET /api/auth/me
 * Retorna { user, profile }
 */
export const getMe = async () => {
    const res = await api.get("/auth/me");
    return res.data;
};
