import axios from "axios";

const BASE_URL =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000/api";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Adjuntar token JWT en cada petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("swag_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Si el backend responde 401, limpiar sesión y redirigir
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("swag_token");
            localStorage.removeItem("swag_user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
