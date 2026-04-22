
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function InicioSesion() {

  // ── Estado del formulario ──────────────────────────────────────
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [usuario, setUsuario]     = useState("");
  const [password, setPassword]   = useState("");
  const [cargando, setCargando]   = useState(false);
  const [error, setError]         = useState("");

  // useNavigate permite redirigir al usuario a otra página
  const navegar = useNavigate();

  // ── Función al enviar el formulario ───────────────────────────
  const manejarEnvio = async (e) => {
    e.preventDefault();   // evita que la página se recargue
    setCargando(true);
    setError("");

    try {
      // POST /api/token/ → el backend devuelve access y refresh tokens
      const res = await api.post("/token/", {
        username: usuario,
        password: password,
      });

      // Guarda los tokens en localStorage para sesiones futuras
      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);

      // Redirige al panel principal
      navegar("/panel");

    } catch (err) {
      setError("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  // ── Inicio de sesión con Google ────────────────────────────────
  const manejarGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/`;
  };

  // ── JSX ────────────────────────────────────────────────────────
  return (
    <div className="w-full h-screen flex">

      {/* ── PANEL IZQUIERDO — degradado morado ─────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start px-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6B4FBB 0%, #9B59B6 50%, #C850C0 100%)" }}
      >
        {/* Círculos decorativos de fondo */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-20"
             style={{ background: "rgba(255,255,255,0.3)" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full opacity-10"
             style={{ background: "rgba(255,255,255,0.3)" }} />

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Bienvenido<br />de nuevo
          </h1>
          <p className="text-purple-100 text-lg">
            Accede a tu cuenta y continúa<br />donde lo dejaste
          </p>
        </div>
      </div>

      {/* ── PANEL DERECHO — formulario ──────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">

        {/* motion.div añade animación de entrada: aparece desde la derecha */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >

          {/* Título */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Iniciar sesión</h2>
            <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl
                            px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={manejarEnvio} className="space-y-5">

            {/* Campo Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <div className="relative">
                {/* Ícono de sobre (lucide-react) */}
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="tu usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500
                             focus:border-transparent text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                {/* Ícono de candado (lucide-react) */}
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500
                             focus:border-transparent text-gray-800 placeholder-gray-400"
                />
                {/* Botón mostrar/ocultar contraseña */}
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {/* Cambia el ícono según el estado */}
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recordarme + ¿Olvidaste tu contraseña? */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-purple-600" />
                <span className="text-sm text-gray-700">Recordarme</span>
              </label>
              <a href="/recuperar" className="text-sm text-purple-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón principal */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl text-white font-semibold text-base
                         transition-opacity duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #7B5EA7 0%, #C850C0 100%)" }}
            >
              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </motion.button>

          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">O continúa con</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Botones sociales */}
          <div className="flex gap-3">
            <button
              onClick={manejarGoogle}
              className="flex-1 flex items-center justify-center gap-2 py-3
                         border border-gray-300 rounded-xl hover:bg-gray-50
                         transition-colors text-gray-700 font-medium text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Google
            </button>

            <button
              className="flex-1 flex items-center justify-center gap-2 py-3
                         border border-gray-300 rounded-xl hover:bg-gray-50
                         transition-colors text-gray-700 font-medium text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Link de registro */}
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes una cuenta?{" "}
            <a href="/registro" className="text-purple-600 font-medium hover:underline">
              Regístrate gratis
            </a>
          </p>

        </motion.div>
      </div>
    </div>
  );
}

export default InicioSesion;