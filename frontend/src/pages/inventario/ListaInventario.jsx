import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import inventarioService from "../../services/inventarioService";
import propiedadService from "../../services/propiedadService";

const ESTADOS_CONFIG = {
    disponible: { label: "Disponible", clase: "bg-green-100 text-green-700" },
    no_disponible: { label: "No disponible", clase: "bg-red-100 text-red-700" },
    en_reparacion: { label: "En reparación", clase: "bg-yellow-100 text-yellow-700" },
};

function BadgeEstado({ estado }) {
    const config = ESTADOS_CONFIG[estado] ||
        { label: estado, clase: "bg-gray-100 text-gray-700" };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.clase}`}>
            {config.label}
        </span>
    );
}

BadgeEstado.propTypes = { estado: PropTypes.string.isRequired };

function FotoItem({ foto, nombre }) {
    if (foto) {
        return (
            <img
                src={foto}
                alt={nombre}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
            />
        );
    }
    return (
        <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] border border-gray-200
                        flex items-center justify-center">
            <Package className="w-5 h-5 text-[#F5A623]" />
        </div>
    );
}

FotoItem.propTypes = {
    foto: PropTypes.string,
    nombre: PropTypes.string.isRequired,
};

function ModalEliminar({ item, onConfirmar, onCancelar, eliminando }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar ítem?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Estás a punto de eliminar{" "}
                    <span className="font-semibold text-gray-800">{item.nombre}</span>.
                    Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancelar}
                        disabled={eliminando}
                        className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700
                       hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirmar}
                        disabled={eliminando}
                        className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold
                       hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {eliminando ? "Eliminando..." : "Eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

ModalEliminar.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
    }).isRequired,
    onConfirmar: PropTypes.func.isRequired,
    onCancelar: PropTypes.func.isRequired,
    eliminando: PropTypes.bool.isRequired,
};

export default function ListaInventario() {
    const { usuario } = useAuth();
    const navegar = useNavigate();

    const [items, setItems] = useState([]);
    const [propiedades, setPropiedades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroPropiedad, setFiltroPropiedad] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [itemAEliminar, setItemAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    const puedeVer = tienePermiso(usuario, "inventario", "ver");
    const puedeCrear = tienePermiso(usuario, "inventario", "crear");
    const puedeEditar = tienePermiso(usuario, "inventario", "editar");
    const puedeEliminar = tienePermiso(usuario, "inventario", "eliminar");

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError(null);
            const [resItems, resPropiedades] = await Promise.all([
                inventarioService.listar(),
                propiedadService.listar(),
            ]);
            setItems(resItems.data);
            setPropiedades(resPropiedades.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("No tienes permiso para ver el inventario.");
            } else {
                setError("Error al cargar el inventario. Intenta de nuevo.");
            }
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (puedeVer) cargarDatos();
        else setError("No tienes permiso para ver el inventario.");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmarEliminar = async () => {
        if (!itemAEliminar) return;
        try {
            setEliminando(true);
            await inventarioService.eliminar(itemAEliminar.id);
            setItems(prev => prev.filter(i => i.id !== itemAEliminar.id));
            setItemAEliminar(null);
        } catch (err) {
            alert(err.response?.data?.detail || "Error al eliminar el ítem.");
        } finally {
            setEliminando(false);
        }
    };

    const itemsFiltrados = items.filter(i => {
        const termino = busqueda.toLowerCase();
        const coincideBusqueda = i.nombre.toLowerCase().includes(termino) || 
            i.categoria_display?.toLowerCase().includes(termino) || i.propiedad_nombre?.toLowerCase().includes(termino);
        const coincidePropiedad = !filtroPropiedad ||
            String(i.propiedad) === filtroPropiedad;
        const coincideEstado = filtroEstado === "todos" || i.estado === filtroEstado;
        return coincideBusqueda && coincidePropiedad && coincideEstado;
    });

    if (cargando) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">Inventario</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {items.length} ítem{items.length !== 1 ? "s" : ""} registrado{items.length !== 1 ? "s" : ""}
                    </p>
                </div>
                {puedeCrear && (
                    <button
                        onClick={() => navegar("/inventario/nuevo")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5A623] text-[#1A1A1A] 
                                    font-semibold hover:bg-[#D4890A] hover:text-white transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo ítem
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, categoría o propiedad..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
                <select
                    value={filtroPropiedad}
                    onChange={e => setFiltroPropiedad(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none 
                                focus:ring-2 focus:ring-yellow-400 bg-white"
                >
                    <option value="">Todas las propiedades</option>
                    {propiedades.map(p => (
                        <option key={p.id} value={String(p.id)}>{p.nombre}</option>
                    ))}
                </select>
                <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm
                     text-gray-700 focus:outline-none focus:ring-2
                     focus:ring-yellow-400 bg-white"
                >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="no_disponible">No disponible</option>
                    <option value="en_reparacion">En reparación</option>
                </select>
            </div>

            {itemsFiltrados.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron ítems</p>
                    <p className="text-sm mt-1">
                        {busqueda ? "Intenta con otro término" : "Agrega el primer ítem al inventario"}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#FFFBEB] border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Ítem</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Propiedad</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Categoría</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Cantidad</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                                    {(puedeEditar || puedeEliminar) && (
                                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Acciones</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {itemsFiltrados.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <FotoItem foto={item.foto} nombre={item.nombre} />
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.nombre}</p>
                                                    {item.esta_danado && (
                                                        <p className="text-xs text-red-500">⚠ Dañado</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">{item.propiedad_nombre}</td>

                                        <td className="px-4 py-3 text-gray-600">{item.categoria_display}</td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {item.cantidad_disponible}/{item.cantidad}
                                        </td>

                                        <td className="px-4 py-3">
                                            <BadgeEstado estado={item.estado} />
                                        </td>

                                        {(puedeEditar || puedeEliminar) && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {puedeEditar && (
                                                        <button
                                                            onClick={() => navegar(`/inventario/${item.id}/editar`)}
                                                            title="Editar ítem"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-yellow-50 hover:text-[#D4890A] transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {puedeEliminar && (
                                                        <button
                                                            onClick={() => setItemAEliminar(item)}
                                                            title="Eliminar ítem"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {itemAEliminar && (
                <ModalEliminar
                    item={itemAEliminar}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setItemAEliminar(null)}
                    eliminando={eliminando}
                />
            )}
        </div>
    );
}