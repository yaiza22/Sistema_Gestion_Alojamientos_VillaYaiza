import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import api from "../services/api";
import PropTypes from "prop-types";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const cargarPerfil = useCallback(async () => {
    try {
      const res = await api.get("/cuentas/perfil/");
      setUsuario(res.data);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

    if (!token) {
      setCargando(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const ahora = Date.now() / 1000;
      if (decoded.exp < ahora) {
        setCargando(false);
        return;
      }
      cargarPerfil();
    } catch {
      setCargando(false);
    }
  }, [cargarPerfil]);

  const login = useCallback(async (accessToken, refreshToken, recordar) => {
    const storage = recordar ? localStorage : sessionStorage;
    storage.setItem("accessToken", accessToken);
    storage.setItem("refreshToken", refreshToken);
    setCargando(true);
    await cargarPerfil();
  }, [cargarPerfil]);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, cargarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};