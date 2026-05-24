import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Home } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import propiedadService from "../../services/propiedadService";

const TIPOS_LABEL = {
    finca: { label: "Finca", clase: "bg-green-100 text-green-800"  },
    apartamento: { label: "Apartamento", clase: "bg-blue-100 text-blue-800"    },
    cabaña: { label: "Cabaña", clase: "bg-orange-100 text-orange-800"},
};

function BadgeTipo({ tipo }) {
    const config = TIPOS_LABEL[tipo] || { label: tipo, clase: "bg-gray-100 text-gray-700" };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.clase}`}>{config.label}</span>
    );
}

BadgeTipo.propTypes = {
    tipo: PropTypes.string.isRequired,
};

function ImagenPropiedad({ imagen, nombre }) {
    if (imagen) {
        return (
            <img
                src={imagen}
                alt={nombre}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200"/>
        );
    }
    return (
        <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] border border-gray-200 flex items-center justify-center">
            <Home className="w-5 h-5 text-[#F5A623]" />
        </div>
    );
}

ImagenPropiedad.propTypes = {
    imagen: PropTypes.string,
    nombre: PropTypes.string.isRequired,
};

function ModalEliminar({ propiedad, onConfirmar, onCancelar, eliminando }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar propiedad?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Estás a punto de eliminar{" "}
                    <span className="font-semibold text-gray-800">{propiedad.nombre}</span>.
                    Esta acción no se puede deshacer.
                </p>
                
                <div className="flex gap-3">
                    <button
                        onClick={onCancelar}
                        disabled={eliminando}
                        className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700
                                    hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirmar}
                        disabled={eliminando}
                        className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold
                                hover:bg-red-600 transition-colors disabled:opacity-50">
                        {eliminando ? "Eliminando..." : "Eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

ModalEliminar.propTypes = {
    propiedad: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
    }).isRequired,
    onConfirmar: PropTypes.func.isRequired,
    onCancelar: PropTypes.func.isRequired,
    eliminando: PropTypes.bool.isRequired,
};

export default function ListaPropiedades() {
    const { usuario } = useAuth();
    const navegar = useNavigate();

    const [propiedades, setPropiedades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("todos");
    const [propiedadAEliminar, setPropiedadAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    const puedeVer = tienePermiso(usuario, "propiedades", "ver");
    const puedeCrear = tienePermiso(usuario, "propiedades", "crear");
    const puedeEditar = tienePermiso(usuario, "propiedades", "editar");
    const puedeEliminar = tienePermiso(usuario, "propiedades", "eliminar");

    const cargarPropiedades = async () => {
        try {
            setCargando(true);
            setError(null);
            const res = await propiedadService.listar();
            setPropiedades(res.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("No tienes permiso para ver las propiedades.");
            } else {
                setError("Error al cargar las propiedades. Intenta de nuevo.");
            }
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (puedeVer) {
            cargarPropiedades();
        } else {
            setError("No tienes permiso para ver las propiedades.");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmarEliminar = async () => {
        if (!propiedadAEliminar) return;
        try {
            setEliminando(true);
            await propiedadService.eliminar(propiedadAEliminar.id);
            setPropiedades(prev => prev.filter(p => p.id !== propiedadAEliminar.id));
            setPropiedadAEliminar(null);
        } catch (err) {
            alert(err.response?.data?.detail || "Error al eliminar la propiedad.");
        } finally {
            setEliminando(false);
        }
    };

    const propiedadesFiltradas = propiedades.filter(p => {
        const termino = busqueda.toLowerCase();
        const coincideBusqueda = p.nombre.toLowerCase().includes(termino) || p.ubicacion?.toLowerCase().includes(termino);
        const coincideTipo = filtroTipo === "todos" || p.tipo === filtroTipo;
        return coincideBusqueda && coincideTipo;
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
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">Propiedades</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {propiedades.length} propiedad{propiedades.length !== 1 ? "es" : ""} registrada{propiedades.length !== 1 ? "s" : ""}
                    </p>
                </div>
                {puedeCrear && (
                    <button
                        onClick={() => navegar("/propiedades/nueva")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5A623]
                                text-[#1A1A1A] font-semibold hover:bg-[#D4890A] hover:text-white
                                transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Nueva propiedad
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ubicación..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm
                                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                </div>
                <select
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                    <option value="todos">Todos los tipos</option>
                    <option value="finca">Finca</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="cabaña">Cabaña</option>
                </select>
            </div>
            
            {propiedadesFiltradas.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron propiedades</p>
                    <p className="text-sm mt-1">{busqueda ? "Intenta con otro término de búsqueda" : "Crea la primera propiedad"}</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#FFFBEB] border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Propiedad</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Tipo</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Capacidad</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Precio base</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                                    {(puedeEditar || puedeEliminar) && (
                                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Acciones</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {propiedadesFiltradas.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <ImagenPropiedad imagen={p.imagen} nombre={p.nombre} />
                                                <div>
                                                    <p className="font-medium text-gray-900">{p.nombre}</p>
                                                    {p.ubicacion && (
                                                        <p className="text-xs text-gray-400">{p.ubicacion}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <BadgeTipo tipo={p.tipo} />
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {p.capacidad} persona{p.capacidad !== 1 ? "s" : ""}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            ${Number(p.precio_base_por_dia).toLocaleString("es-CO")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full
                                                ${p.esta_activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                {p.esta_activa ? "Activa" : "Inactiva"}
                                            </span>
                                        </td>
                                        {(puedeEditar || puedeEliminar) && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {puedeEditar && (
                                                        <button
                                                            onClick={() => navegar(`/propiedades/${p.id}/editar`)}
                                                            title="Editar propiedad"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-yellow-50 hover:text-[#D4890A] transition-colors">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {puedeEliminar && (
                                                        <button
                                                            onClick={() => setPropiedadAEliminar(p)}
                                                            title="Eliminar propiedad"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
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

            {propiedadAEliminar && (
                <ModalEliminar
                    propiedad={propiedadAEliminar}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setPropiedadAEliminar(null)}
                    eliminando={eliminando}/>
            )}
        </div>
    );
}