import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import reservaService from "../../services/reservaService";

const ESTADOS_CONFIG = {
    pendiente: { label: "Pendiente", clase: "bg-yellow-100 text-yellow-700" },
    en_curso: { label: "En curso", clase: "bg-blue-100 text-blue-700" },
    completada: { label: "Completada", clase: "bg-green-100 text-green-700" },
    cancelada: { label: "Cancelada", clase: "bg-red-100 text-red-700" },
};

function BadgeEstado({ estado }) {
    const config = ESTADOS_CONFIG[estado] || { label: estado, clase: "bg-gray-100 text-gray-700" };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.clase}`}>{config.label}</span>
    );
}
BadgeEstado.propTypes = { estado: PropTypes.string.isRequired };

export default function ListaReservas() {
    const { usuario } = useAuth();
    const navegar = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");

    const puedeVer = tienePermiso(usuario, "reservas", "ver");
    const puedeCrear = tienePermiso(usuario, "reservas", "crear");

    useEffect(() => {
        if (!puedeVer) { setError("No tienes permiso para ver las reservas."); setCargando(false); return; }
        reservaService.listar()
            .then(res => setReservas(res.data))
            .catch(() => setError("Error al cargar las reservas."))
            .finally(() => setCargando(false));
    }, [puedeVer]);

    const reservasFiltradas = reservas.filter(r => {
        const termino = busqueda.toLowerCase();
        const coincide = r.cliente_detalle?.nombre?.toLowerCase().includes(termino) ||
            r.propiedad_nombre?.toLowerCase().includes(termino);
        const estado = filtroEstado === "todos" || r.estado === filtroEstado;
        return coincide && estado;
    });

    if (cargando) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full" /></div>;
    if (error) return <div className="flex items-center justify-center h-64"><p className="text-red-500 text-sm">{error}</p></div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">Reservas</h1>
                    <p className="text-gray-500 text-sm mt-1">{reservas.length} reserva{reservas.length !== 1 ? "s" : ""}</p>
                </div>
                {puedeCrear && (
                    <button onClick={() => navegar("/reservas/nueva")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5A623] text-[#1A1A1A] font-semibold hover:bg-[#D4890A] hover:text-white transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />Nueva reserva
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Buscar por cliente o propiedad..."
                        value={busqueda} onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_curso">En curso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                </select>
            </div>

            {reservasFiltradas.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron reservas</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#FFFBEB] border-b border-gray-100">
                                <tr>
                                    {["#", "Cliente", "Propiedad", "Fechas", "Asistentes", "Total", "Estado"].map(h => (
                                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reservasFiltradas.map(r => (
                                    <tr key={r.id} onClick={() => navegar(`/reservas/${r.id}`)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer">
                                        <td className="px-4 py-3 text-gray-400 text-xs">#{r.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{r.cliente_detalle?.nombre}</td>
                                        <td className="px-4 py-3 text-gray-600">{r.propiedad_nombre}</td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">
                                            {r.fecha_inicio} → {r.fecha_fin}
                                            <span className="ml-1 text-gray-400">({r.dias}d)</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{r.cant_asistentes}</td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">
                                            ${Number(r.precio_total).toLocaleString("es-CO")}
                                        </td>
                                        <td className="px-4 py-3"><BadgeEstado estado={r.estado} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}