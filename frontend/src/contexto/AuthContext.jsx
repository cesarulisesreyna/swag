import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context";
import * as authService from "../services/authService";

const TOKEN_KEY = "swag_token";
const USER_KEY = "swag_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validar token al montar
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then(({ user: u, profile }) => {
        const enriched = {
          ...u,
          nombre: profile?.nombre ?? u.nombre,
          apellido: profile?.apellido ?? u.apellido,
          matricula: profile?.matricula,
          numeroEmpleado: profile?.numeroEmpleado,
          profileId: profile?._id,
        };
        setUser(enriched);
        localStorage.setItem(USER_KEY, JSON.stringify(enriched));
      })
      .catch(() => {
        // Token expirado o inválido
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      loading,
      user,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
