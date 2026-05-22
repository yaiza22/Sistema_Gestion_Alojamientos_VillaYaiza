import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, // ícono del menú Dashboard
  Calendar,        // ícono Calendario
  BookOpen,        // ícono Reservas
  Users,           // ícono Clientes
  Package,         // ícono Inventario
  FileText,        // ícono Reportes
  LogOut,          // ícono Cerrar sesión
  DollarSign,      // ícono Ingresos
  AlertTriangle,   // ícono Items dañados
  TrendingUp,      // ícono tendencia en la gráfica
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Datos de la gráfica ──────────────────────────────────────────
// En producción estos vendrían del backend con useEffect + api.get()
const datosOcupacion = [
  { dia: "Lun", ocupacion: 65 },
  { dia: "Mar", ocupacion: 78 },
  { dia: "Mié", ocupacion: 80 },
  { dia: "Jue", ocupacion: 74 },
  { dia: "Vie", ocupacion: 82 },
  { dia: "Sáb", ocupacion: 91 },
  { dia: "Dom", ocupacion: 88 },
];

// ── Datos de actividad reciente ──────────────────────────────────
const actividadReciente = [
  { id: 1, titulo: "Nueva reserva confirmada", nombre: "Juan Pérez",     tiempo: "Hace 5 min" },
  { id: 2, titulo: "Pago recibido",            nombre: "María González", tiempo: "Hace 15 min" },
  { id: 3, titulo: "Reserva cancelada",        nombre: "Carlos Ruiz",    tiempo: "Hace 1 hora" },
  { id: 4, titulo: "Nuevo cliente registrado", nombre: "Ana López",      tiempo: "Hace 2 horas" },
];

// ── Ítems del menú lateral ───────────────────────────────────────
// Cada objeto tiene: nombre (texto) e icono (componente de lucide-react)
const elementosMenu = [
  { nombre: "Dashboard",  icono: LayoutDashboard },
  { nombre: "Calendario", icono: Calendar },
  { nombre: "Reservas",   icono: BookOpen },
  { nombre: "Clientes",   icono: Users },
  { nombre: "Inventario", icono: Package },
  { nombre: "Reportes",   icono: FileText },
];

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================
function Panel() {
  const [paginaActiva, setPaginaActiva] = useState("Dashboard");
  const navegar = useNavigate();

  // Borra los tokens y lleva al usuario al inicio de sesión
  const cerrarSesion = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navegar("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── SIDEBAR ────────────────────────────────────────────── */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7B5EA7, #C850C0)" }}
          >
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-800">Dashboard</span>
        </div>

        {/* Menú de navegación — flex-1 empuja el botón de cerrar sesión al fondo */}
        <nav className="flex-1 px-3 space-y-1">
          {elementosMenu.map((item) => {
            // Guardamos el componente del ícono en una variable con mayúscula
            // (React requiere que los componentes empiecen con mayúscula)
            const Icono = item.icono;
            const estaActivo = paginaActiva === item.nombre;

            return (
              <button
                key={item.nombre}
                onClick={() => setPaginaActiva(item.nombre)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-sm font-medium transition-colors duration-150
                            ${estaActivo
                              ? "bg-purple-50 text-purple-700"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`}
              >
                <Icono
                  className={`w-4 h-4 ${estaActivo ? "text-purple-600" : "text-gray-400"}`}
                />
                {item.nombre}
              </button>
            );
          })}
        </nav>

        {/* Botón cerrar sesión */}
        <div className="px-3 pb-6">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────────── */}
      {/* overflow-y-auto permite hacer scroll si el contenido es más largo que la pantalla */}
      <main className="flex-1 overflow-y-auto px-8 py-8">

        {/* Animación de entrada del contenido */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >

          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Bienvenido de vuelta, aquí está tu resumen de hoy
            </p>
          </div>

          {/* ── TARJETAS DE ESTADÍSTICAS ─────────────────────── */}
          <div className="grid grid-cols-3 gap-5 mb-6">

            <TarjetaEstadistica
              icono={Calendar}
              colorFondo="bg-blue-50"
              colorIcono="text-blue-500"
              etiqueta="Reservas hoy"
              valor="12"
              cambio="+4.75%"
              positivo={true}
            />

            <TarjetaEstadistica
              icono={DollarSign}
              colorFondo="bg-green-50"
              colorIcono="text-green-500"
              etiqueta="Ingresos del mes"
              valor="$24,500"
              cambio="+12.5%"
              positivo={true}
            />

            <TarjetaEstadistica
              icono={AlertTriangle}
              colorFondo="bg-red-50"
              colorIcono="text-red-500"
              etiqueta="Items dañados"
              valor="3"
              cambio="-2"
              positivo={false}
            />
          </div>

          {/* ── GRÁFICA + ACTIVIDAD RECIENTE ─────────────────── */}
          <div className="grid grid-cols-8 gap-5 mb-6">

            {/* Gráfica — ocupa 5 de 8 columnas */}
            <div className="col-span-5 bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Ocupación Semanal</h2>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>

              {/* ResponsiveContainer ajusta la gráfica al ancho del contenedor */}
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={datosOcupacion}>
                  <defs>
                    {/* Degradado para el área rellena */}
                    <linearGradient id="degradadoOcupacion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7B5EA7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7B5EA7" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="dia"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(valor) => [`${valor}%`, "Ocupación"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ocupacion"
                    stroke="#7B5EA7"
                    strokeWidth={2}
                    fill="url(#degradadoOcupacion)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Actividad reciente — ocupa 3 de 8 columnas */}
            <div className="col-span-3 bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
              <div className="space-y-4">
                {/* .map() genera un elemento por cada actividad en el array */}
                {actividadReciente.map((actividad) => (
                  <div key={actividad.id} className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center
                                    justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {actividad.titulo}
                      </p>
                      <p className="text-xs text-gray-500">{actividad.nombre}</p>
                    </div>
                    {/* Tiempo */}
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {actividad.tiempo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ACCIONES RÁPIDAS ─────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-4 gap-4">
              <AccionRapida icono={Calendar}     etiqueta="Nueva Reserva" />
              <AccionRapida icono={Users}        etiqueta="Nuevo Cliente" />
              <AccionRapida icono={Package}      etiqueta="Inventario" />
              <AccionRapida icono={DollarSign}   etiqueta="Registrar Pago" />
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}

// ================================================================
// COMPONENTES REUTILIZABLES
// ================================================================

// ── Tarjeta de estadística ────────────────────────────────────────
// Props: icono, colorFondo, colorIcono, etiqueta, valor, cambio, positivo
function TarjetaEstadistica({ icono: Icono, colorFondo, colorIcono, etiqueta, valor, cambio, positivo }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        {/* Ícono con fondo */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorFondo}`}>
          <Icono className={`w-5 h-5 ${colorIcono}`} />
        </div>
        {/* Indicador de cambio */}
        <span className={`text-sm font-medium ${positivo ? "text-green-500" : "text-red-500"}`}>
          {cambio}
        </span>
      </div>
      <p className="text-sm text-gray-500">{etiqueta}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{valor}</p>
    </div>
  );
}

// ── Botón de acción rápida ────────────────────────────────────────
// Props: icono, etiqueta
function AccionRapida({ icono: Icono, etiqueta }) {
  return (
    <button
      className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl
                 border border-gray-100 hover:bg-purple-50 hover:border-purple-100
                 transition-colors duration-150 text-gray-600 hover:text-purple-600"
    >
      <Icono className="w-5 h-5 text-purple-500" />
      <span className="text-sm font-medium">{etiqueta}</span>
    </button>
  );
}

export default Panel;