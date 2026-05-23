//import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

function InicioSesion() {
  const { login } = useAuth();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [errores, setErrores] = useState({});

  const navegar = useNavigate();

  const validar = () => {
    const nuevosErrores = {};
    if (!usuario.trim()) {
      nuevosErrores.usuario = "El usuario es obligatorio.";
    }
    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    //} else if (password.length < 6) {
      //nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    return nuevosErrores;
  };
  
  const manejarEnvio = async (e) => {
    e.preventDefault();

    const erroresValidacion = validar();

    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setCargando(true);
    setErrores({});

    try {
      // POST /api/token/ → el backend devuelve access y refresh tokens
      const res = await api.post("/token/", {
        username: usuario,
        password: password,
      });

      // Recordarme — si está activo guarda en localStorage (persiste)
      // Si no está activo guarda en sessionStorage (se borra al cerrar)
      /*
      const storage = recordarme ? localStorage : sessionStorage;
      storage.setItem("accessToken", res.data.access);
      storage.setItem("refreshToken", res.data.refresh);
      */
      login(res.data.access, res.data.refresh, recordarme);

      navegar("/dashboard");
    } catch (err) {
      if (!err.response) {
        setErrores({ general: "Error de red. Verifica tu conexión."});
      } else if (err.response.status === 401) {
        setErrores({ general: "Usuario o contraseña incorrectos. Inténtalo de nuevo."});
      } else {
        setErrores({ general: "Ocurrió un error inesperado. Intenta más tarde."});
      }
    } finally {
      setCargando(false);
    }
  };

  // Inicio de sesión con Google - Falta Backend
  const manejarGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/`;
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">
      {/* PANEL IZQUIERDO */}
      <div
        className="w-full lg:w-5/12 flex flex-col justify-center items-center py-12 px-8 lg:px-12 relative min-h-[300px] lg:min-h-screen"
        style={{background: "#F5A623"}}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 flex items-center justify-center mb-5 lg:mb-6">
            <img
              src="/logo.png"
              alt="Finca Villa Yaiza"
              className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 object-contain"
            />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold mb-2" style={{color: "#251706"}}>
              Finca Villa Yaiza
            </h1>
            <p className="text-base lg:text-lg" style={{ color: "#251706" }}>
              Sistema de gestión de alojamientos y eventos
            </p>
        </div>
      </div>
      
      {/* PANEL DERECHO */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-8 lg:p-14 bg-white min-h-screen lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        > 
          {/* Título */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              Iniciar sesión
            </h2>
            <p className="text-gray-500 text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Error */}
          {errores.general && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              {errores.general}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={manejarEnvio} className="space-y-5" noValidate>

            {/* Campo Usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input
                  type="text"
                  placeholder="Tu usuario"
                  value={usuario}
                  onChange={
                    (e) => {setUsuario(e.target.value);
                            if(errores.usuario) setErrores(prev => ({ ...prev, usuario: "" }));
                  }}
                  disabled = {cargando}
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 
                            focus:ring-yellow-400 focus:border-transparent text-gray-800 placeholder-gray-400 disabled:bg-gray-50 
                            disabled:cursor-not-allowed transition-colors ${errores.usuario ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                />
                  {/* Error campo usuario */}
                  {errores.usuario && (
                    <p className="text-red-500 text-xs mt-1">{errores.usuario}</p>
                  )}
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={
                    (e) => {setPassword(e.target.value);
                    if (errores.password) setErrores(prev => ({ ...prev, password: "" }));
                  }}
                  disabled = {cargando}
                  required
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl text-base focus:outline-none focus:ring-2
                              focus:ring-yellow-400 focus:border-transparent text-gray-800 
                              placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed
                              transition-colors ${errores.password ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowec"
                >
                  {mostrarPassword
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />}
                  {/* Error campo contraseña */}
                  {errores.password && (
                    <p className="text-red-500 text-xs mt-1">{errores.password}</p>
                  )}
                </button>
              </div>
            </div>

            {/* Recordarme */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  disabled={cargando}
                  className="w-4 h-4 accent-yellow-500 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-600">Recordarme</span>
                <span className="text-xs text-gray-400">(mantiene la sesión activa al cerrar el navegador)</span>
              </label>
            </div>
            

            {/* Botón */}
            <motion.button
              whileTap={{ scale: cargando ? 1 : 0.97 }}
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl font-semibold text-base transition-all duration-200 
                        disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg
                        bg-[#F5A623] text-[#251706] hover:bg-[#e09612] hover:text-white"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"
                       fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : "Iniciar sesión"}
            </motion.button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">O continúa con</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Inicio sesión google */}
          <button
            onClick={manejarGoogle}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 
                      rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}

InicioSesion.propTypes = {
  children: PropTypes.node,
};

export default InicioSesion;