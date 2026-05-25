import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import reporteService from "../../services/reporteService";
import propiedadService from "../../services/propiedadService";
import PropTypes from "prop-types";

const COLORES = ["#F5A623", "#D4890A", "#FFFBEB", "#1A1A1A", "#6B7280"];

function Tarjeta({ titulo, valor, subtitulo, color = "text-[#1A1A1A]" }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{titulo}</p>
            <p className={`text-2xl font-bold ${color}`}>{valor}</p>
            {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
        </div>
    );
}

Tarjeta.propTypes = {
  titulo:    PropTypes.string.isRequired,
  valor:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitulo: PropTypes.string,
  color:     PropTypes.string,
};

function Seccion({ titulo, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">{titulo}</h2>
            {children}
        </div>
    );
}
Seccion.propTypes = {
  titulo:   PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function Reportes() {
    const { usuario } = useAuth();
    const puedeVer = tienePermiso(usuario, "reportes", "ver");

    const [tipo, setTipo] = useState("ingresos");
    const [propiedades, setPropiedades] = useState([]);
    const [filtros, setFiltros] = useState({
        fecha_inicio: "", fecha_fin: "", propiedad_id: "",
    });
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        propiedadService.listar().then(res => setPropiedades(res.data));
    }, []);

    const generarReporte = async () => {
        setCargando(true);
        setError(null);
        try {
            const params = {};
            if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
            if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;
            if (filtros.propiedad_id) params.propiedad_id = filtros.propiedad_id;

            const res = await reporteService[tipo](params);
            setDatos(res.data);
        } catch {
            setError("Error al generar el reporte. Intenta de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    if (!puedeVer) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500 text-sm">No tienes permiso para ver reportes.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">

            {/* Encabezado */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1A1A1A]">Reportes</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Genera reportes con filtros personalizados
                </p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Parámetros</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Tipo de reporte
                        </label>
                        <select value={tipo} onChange={e => { setTipo(e.target.value); setDatos(null); }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                            <option value="ingresos">Ingresos</option>
                            <option value="ocupacion">Ocupación</option>
                            <option value="inventario">Inventario</option>
                        </select>
                    </div>

                    {tipo !== "inventario" && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Fecha inicio
                                </label>
                                <input type="date" value={filtros.fecha_inicio}
                                    onChange={e => setFiltros(p => ({ ...p, fecha_inicio: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Fecha fin
                                </label>
                                <input type="date" value={filtros.fecha_fin}
                                    onChange={e => setFiltros(p => ({ ...p, fecha_fin: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Propiedad
                        </label>
                        <select value={filtros.propiedad_id}
                            onChange={e => setFiltros(p => ({ ...p, propiedad_id: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                            <option value="">Todas</option>
                            {propiedades.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button onClick={generarReporte} disabled={cargando}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623] text-[#1A1A1A]
                     font-semibold hover:bg-[#D4890A] hover:text-white transition-colors
                     disabled:opacity-50 shadow-sm">
                    {cargando ? "Generando..." : "Generar reporte"}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                    {error}
                </div>
            )}

            {/* Resultados — Ingresos */}
            {datos && tipo === "ingresos" && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Tarjeta
                            titulo="Total ingresos"
                            valor={`$${Number(datos.total_ingresos).toLocaleString("es-CO")}`}
                            color="text-[#D4890A]"
                        />
                        <Tarjeta
                            titulo="Propiedades"
                            valor={datos.por_propiedad.length}
                            subtitulo="con ingresos en el período"
                        />
                        <Tarjeta
                            titulo="Reservas"
                            valor={datos.por_propiedad.reduce((s, p) => s + p.reservas, 0)}
                            subtitulo="en el período seleccionado"
                        />
                    </div>

                    {datos.por_mes.length > 0 && (
                        <Seccion titulo="Ingresos por mes">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={datos.por_mes}>
                                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }}
                                        tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        formatter={v => [`$${Number(v).toLocaleString("es-CO")}`, "Ingresos"]} />
                                    <Bar dataKey="total" fill="#F5A623" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Seccion>
                    )}

                    {datos.por_propiedad.length > 0 && (
                        <Seccion titulo="Ingresos por propiedad">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={datos.por_propiedad} layout="vertical">
                                    <XAxis type="number" tick={{ fontSize: 11 }}
                                        tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                    <YAxis type="category" dataKey="propiedad"
                                        tick={{ fontSize: 11 }} width={120} />
                                    <Tooltip
                                        formatter={v => [`$${Number(v).toLocaleString("es-CO")}`, "Total"]} />
                                    <Bar dataKey="total" fill="#D4890A" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Seccion>
                    )}

                    {datos.por_metodo.length > 0 && (
                        <Seccion titulo="Ingresos por método de pago">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={datos.por_metodo} dataKey="total" nameKey="metodo"
                                        cx="50%" cy="50%" outerRadius={80} label={({ metodo, percent }) =>
                                            `${metodo} ${(percent * 100).toFixed(0)}%`}>
                                        {datos.por_metodo.map((_, i) => (
                                            <Cell key={i} fill={COLORES[i % COLORES.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip formatter={v => `$${Number(v).toLocaleString("es-CO")}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Seccion>
                    )}
                </>
            )}

            {/* Resultados — Ocupación */}
            {datos && tipo === "ocupacion" && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <Tarjeta titulo="Total reservas" valor={datos.total_reservas} />
                        <Tarjeta titulo="Completadas" valor={datos.completadas} color="text-green-600" />
                        <Tarjeta titulo="Canceladas" valor={datos.canceladas} color="text-red-500" />
                        <Tarjeta titulo="Tasa cancelación" valor={`${datos.tasa_cancelacion}%`} color="text-amber-600" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {datos.por_propiedad.length > 0 && (
                            <Seccion titulo="Reservas por propiedad">
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={datos.por_propiedad}>
                                        <XAxis dataKey="propiedad" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="total" fill="#F5A623" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Seccion>
                        )}

                        {datos.por_temporada.length > 0 && (
                            <Seccion titulo="Reservas por temporada">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={datos.por_temporada} dataKey="total"
                                            nameKey="temporada" cx="50%" cy="50%" outerRadius={80}
                                            label={({ temporada, percent }) =>
                                                `${temporada} ${(percent * 100).toFixed(0)}%`}>
                                            {datos.por_temporada.map((_, i) => (
                                                <Cell key={i} fill={COLORES[i % COLORES.length]} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Seccion>
                        )}
                    </div>

                    <Seccion titulo="Resumen adicional">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <Tarjeta titulo="Pendientes" valor={datos.pendientes} />
                            <Tarjeta titulo="En curso" valor={datos.en_curso} color="text-blue-600" />
                            <Tarjeta titulo="Prom. asistentes" valor={datos.promedio_asistentes} subtitulo="por reserva" />
                        </div>
                    </Seccion>
                </>
            )}

            {/* Resultados — Inventario */}
            {datos && tipo === "inventario" && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <Tarjeta titulo="Total ítems" valor={datos.total_items} />
                        <Tarjeta titulo="Disponibles" valor={datos.disponibles} color="text-green-600" />
                        <Tarjeta titulo="No disponibles" valor={datos.no_disponibles} color="text-red-500" />
                        <Tarjeta titulo="Dañados" valor={datos.danados} color="text-amber-600" />
                    </div>

                    {datos.por_categoria.length > 0 && (
                        <Seccion titulo="Ítems por categoría">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={datos.por_categoria}>
                                    <XAxis dataKey="categoria" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#F5A623" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Seccion>
                    )}

                    {datos.por_propiedad.length > 0 && (
                        <Seccion titulo="Ítems por propiedad">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#FFFBEB] border-b border-gray-100">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Propiedad</th>
                                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Total ítems</th>
                                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Dañados</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {datos.por_propiedad.map((p, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{p.propiedad}</td>
                                                <td className="px-4 py-3 text-gray-600">{p.total}</td>
                                                <td className="px-4 py-3">
                                                    <span className={p.danados > 0 ? "text-red-500 font-medium" : "text-gray-400"}>
                                                        {p.danados}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Seccion>
                    )}
                </>
            )}
        </div>
    );
}