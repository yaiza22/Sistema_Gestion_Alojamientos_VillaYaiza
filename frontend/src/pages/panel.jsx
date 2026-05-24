import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, BookOpen, Users, Package, DollarSign, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { tienePermiso } from "../utils/permisos";
import reservaService from "../services/reservaService";
import PropTypes from "prop-types";

// ── Helpers ──────────────────────────────────────────────────────
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const COLORES_ESTADO = {
  pendiente: { bg: "bg-yellow-400", texto: "text-yellow-800" },
  en_curso: { bg: "bg-blue-400", texto: "text-blue-800" },
  completada: { bg: "bg-green-400", texto: "text-green-800" },
  cancelada: { bg: "bg-red-400", texto: "text-red-800" },
};

function diasEnMes(anio, mes) {
  return new Date(anio, mes + 1, 0).getDate();
}

function primerDiaMes(anio, mes) {
  return new Date(anio, mes, 1).getDay();
}

// ── Componentes reutilizables ────────────────────────────────────
function TarjetaStat({ icono: Icono, colorFondo, colorIcono, etiqueta, valor, subcampo }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center
                                 justify-center ${colorFondo}`}>
          <Icono className={`w-5 h-5 ${colorIcono}`} />
        </div>
      </div>
      <p className="text-sm text-gray-500">{etiqueta}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{valor}</p>
      {subcampo && (
        <p className="text-xs text-gray-400 mt-1">{subcampo}</p>
      )}
    </div>
  );
}

TarjetaStat.propTypes = {
  icono: PropTypes.elementType.isRequired,
  colorFondo: PropTypes.string.isRequired,
  colorIcono: PropTypes.string.isRequired,
  etiqueta: PropTypes.string.isRequired,
  valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subcampo: PropTypes.string,
};

function Calendario({ reservas, anio, mes, onCambiarMes }) {
  const totalDias = diasEnMes(anio, mes);
  const primerDia = primerDiaMes(anio, mes);
  const hoy = new Date();
  const esHoy = (dia) =>
    hoy.getFullYear() === anio &&
    hoy.getMonth() === mes &&
    hoy.getDate() === dia;

  // Mapea fecha → reservas de ese día
  const reservasPorDia = {};
  reservas.forEach(r => {
    const inicio = new Date(r.fecha_inicio + "T00:00:00");
    const fin = new Date(r.fecha_fin + "T00:00:00");
    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      const key = d.getDate();
      if (d.getFullYear() === anio && d.getMonth() === mes) {
        if (!reservasPorDia[key]) reservasPorDia[key] = [];
        reservasPorDia[key].push(r);
      }
    }
  });

  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= totalDias; d++) celdas.push(d);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">
          {MESES[mes]} {anio}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={() => onCambiarMes(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => onCambiarMes(1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="text-center text-xs font-medium
                                            text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7 gap-1">
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`v-${i}`} />;
          const rsv = reservasPorDia[dia] || [];
          const hoyFlag = esHoy(dia);

          return (
            <div key={dia}
              className={`min-h-[52px] rounded-xl p-1 transition-colors
                                ${hoyFlag
                  ? "bg-[#F5A623]/15 ring-1 ring-[#F5A623]"
                  : rsv.length > 0
                    ? "bg-gray-50"
                    : "hover:bg-gray-50"}`}>
              <p className={`text-xs font-medium mb-1 text-center
                                ${hoyFlag ? "text-[#D4890A]" : "text-gray-600"}`}>
                {dia}
              </p>
              <div className="space-y-0.5">
                {rsv.slice(0, 2).map(r => {
                  const color = COLORES_ESTADO[r.estado] ||
                    { bg: "bg-gray-400" };
                  return (
                    <div key={r.id}
                      className={`${color.bg} rounded px-1
                                                        truncate text-white
                                                        text-[10px] leading-4`}
                      title={r.cliente_detalle?.nombre}>
                      {r.cliente_detalle?.nombre?.split(" ")[0]}
                    </div>
                  );
                })}
                {rsv.length > 2 && (
                  <p className="text-[10px] text-gray-400 text-center">
                    +{rsv.length - 2}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
        {Object.entries(COLORES_ESTADO).map(([estado, { bg }]) => (
          <div key={estado} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${bg}`} />
            <span className="text-xs text-gray-500 capitalize">{estado.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Calendario.propTypes = {
  reservas: PropTypes.array.isRequired,
  anio: PropTypes.number.isRequired,
  mes: PropTypes.number.isRequired,
  onCambiarMes: PropTypes.func.isRequired,
};


// ── Panel principal ──────────────────────────────────────────────
export default function Panel() {
  const { usuario } = useAuth();
  const navegar = useNavigate();
  const hoy = new Date();

  const [stats, setStats] = useState(null);
  const [cargandoStats, setCargandoStats] = useState(true);
  const [reservasCal, setReservasCal] = useState([]);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());

  // Stats
  useEffect(() => {
    reservaService.stats()
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setCargandoStats(false));
  }, []);

  // Calendario
  const cargarCalendario = useCallback(() => {
    reservaService.calendario(anio, mes + 1)
      .then(res => setReservasCal(res.data))
      .catch(() => setReservasCal([]));
  }, [anio, mes]);

  useEffect(() => { cargarCalendario(); }, [cargarCalendario]);

  const cambiarMes = (delta) => {
    const fecha = new Date(anio, mes + delta, 1);
    setAnio(fecha.getFullYear());
    setMes(fecha.getMonth());
  };

  // Datos gráfica — reservas próximas por fecha
  const datosGrafica = stats?.reservas_proximas
    ?.slice(0, 7)
    .map(r => ({
      dia: r.fecha_inicio,
      monto: Number(r.precio_total),
    })) || [];

  const puedeCrearReserva = tienePermiso(usuario, "reservas", "crear");
  const puedeVerClientes = tienePermiso(usuario, "clientes", "ver");
  const puedeVerInventario = tienePermiso(usuario, "inventario", "ver");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          Bienvenido, {usuario?.first_name || usuario?.username} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("es-CO", {
            weekday: "long", year: "numeric",
            month: "long", day: "numeric"
          })}
        </p>
      </div>

      {/* Stats */}
      {cargandoStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border
                                                border-gray-100 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <TarjetaStat
            icono={BookOpen}
            colorFondo="bg-blue-50"
            colorIcono="text-blue-500"
            etiqueta="Reservas hoy"
            valor={stats?.reservas_hoy ?? "—"}
            subcampo={`${stats?.reservas_mes ?? 0} este mes`}
          />
          <TarjetaStat
            icono={DollarSign}
            colorFondo="bg-green-50"
            colorIcono="text-green-500"
            etiqueta="Ingresos del mes"
            valor={`$${Number(stats?.ingresos_mes ?? 0)
              .toLocaleString("es-CO")}`}
          />
          <TarjetaStat
            icono={AlertTriangle}
            colorFondo="bg-red-50"
            colorIcono="text-red-500"
            etiqueta="Ítems dañados"
            valor={stats?.items_danados ?? "—"}
          />
          <TarjetaStat
            icono={TrendingUp}
            colorFondo="bg-amber-50"
            colorIcono="text-amber-500"
            etiqueta="Próximas reservas"
            valor={stats?.reservas_proximas?.length ?? "—"}
            subcampo="en los próximos días"
          />
        </div>
      )}

      {/* Gráfica + Calendario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* Gráfica de reservas próximas */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              Próximas reservas
            </h2>
            <TrendingUp className="w-4 h-4 text-[#F5A623]" />
          </div>

          {datosGrafica.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p className="text-sm">No hay reservas próximas</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={datosGrafica}>
                <defs>
                  <linearGradient id="gradiente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dia"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v =>
                    `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={v =>
                    [`$${Number(v).toLocaleString("es-CO")}`, "Monto"]}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px"
                  }} />
                <Area type="monotone" dataKey="monto"
                  stroke="#F5A623" strokeWidth={2}
                  fill="url(#gradiente)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Calendario */}
        <Calendario
          reservas={reservasCal}
          anio={anio}
          mes={mes}
          onCambiarMes={cambiarMes}
        />
      </div>

      {/* Acciones rápidas según permisos */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">
          Acciones rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          {puedeCrearReserva && (
            <button
              onClick={() => navegar("/reservas/nueva")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                       bg-[#F5A623] text-[#1A1A1A] font-semibold
                                       hover:bg-[#D4890A] hover:text-white
                                       transition-colors text-sm shadow-sm">
              <Plus className="w-4 h-4" />
              Nueva reserva
            </button>
          )}
          {puedeVerClientes && (
            <button
              onClick={() => navegar("/clientes")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                       border border-gray-200 text-gray-700
                                       hover:bg-gray-50 transition-colors text-sm">
              <Users className="w-4 h-4" />
              Ver clientes
            </button>
          )}
          {puedeVerInventario && (
            <button
              onClick={() => navegar("/inventario")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                       border border-gray-200 text-gray-700
                                       hover:bg-gray-50 transition-colors text-sm">
              <Package className="w-4 h-4" />
              Ver inventario
            </button>
          )}
          <button
            onClick={() => navegar("/calendario")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                   border border-gray-200 text-gray-700
                                   hover:bg-gray-50 transition-colors text-sm">
            <Calendar className="w-4 h-4" />
            Calendario
          </button>
        </div>
      </div>

      {/* Reservas próximas */}
      {stats?.reservas_proximas?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mt-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            Próximas reservas pendientes
          </h2>
          <div className="space-y-2">
            {stats.reservas_proximas.map(r => (
              <button key={r.id}
                onClick={() => navegar(`/reservas/${r.id}`)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {r.cliente_detalle?.nombre}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.propiedad_nombre}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {r.fecha_inicio}
                  </p>
                  <p className="text-xs text-gray-400">
                    {r.dias} día{r.dias !== 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}