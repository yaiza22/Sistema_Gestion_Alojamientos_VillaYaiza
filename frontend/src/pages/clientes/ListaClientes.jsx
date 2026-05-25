import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Pencil, Trash2, Search, Users } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import clienteService from "../../services/clienteService";

function ModalEliminar({ cliente, onConfirmar, onCancelar, eliminando }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar cliente?</h3>
                <p className="text-gray-500 text-sm mb-2">
                    Estás a punto de eliminar a{" "}
                    <span className="font-semibold text-gray-800">{cliente.nombre}</span>.
                </p>
                <p className="text-amber-600 text-xs mb-6 bg-amber-50 px-3 py-2 rounded-lg">Si este cliente tiene reservas asociadas, no podrá eliminarse.</p>
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
    cliente: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
    }).isRequired,
    onConfirmar: PropTypes.func.isRequired,
    onCancelar: PropTypes.func.isRequired,
    eliminando: PropTypes.bool.isRequired,
};

export default function ListaClientes() {
    const { usuario } = useAuth();
    const navegar = useNavigate();

    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    const puedeVer = tienePermiso(usuario, "clientes", "ver");
    const puedeCrear = tienePermiso(usuario, "clientes", "crear");
    const puedeEditar = tienePermiso(usuario, "clientes", "editar");
    const puedeEliminar = tienePermiso(usuario, "clientes", "eliminar");

    const cargarClientes = async () => {
        try {
            setCargando(true);
            setError(null);
            const res = await clienteService.listar();
            setClientes(res.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("No tienes permiso para ver los clientes.");
            } else {
                setError("Error al cargar los clientes. Intenta de nuevo.");
            }
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (puedeVer) cargarClientes();
        else setError("No tienes permiso para ver los clientes.");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmarEliminar = async () => {
        if (!clienteAEliminar) return;
        try {
            setEliminando(true);
            await clienteService.eliminar(clienteAEliminar.id);
            setClientes(prev => prev.filter(c => c.id !== clienteAEliminar.id));
            setClienteAEliminar(null);
        } catch (err) {
            const mensaje = err.response?.data?.detail || "No se puede eliminar este cliente. Puede tener reservas asociadas.";
            alert(mensaje);
        } finally {
            setEliminando(false);
        }
    };

    const clientesFiltrados = clientes.filter(c => {
        const termino = busqueda.toLowerCase();
        return (
            c.nombre.toLowerCase().includes(termino) || c.telefono.includes(termino) ||
            c.email?.toLowerCase().includes(termino) || c.numero_documento?.includes(termino)
        );
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
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">Clientes</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado{clientes.length !== 1 ? "s" : ""}
                    </p>
                </div>
                {puedeCrear && (
                    <button
                        onClick={() => navegar("/clientes/nuevo")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5A623]
                                text-[#1A1A1A] font-semibold hover:bg-[#D4890A] hover:text-white
                                transition-colors shadow-sm">
                        <UserPlus className="w-4 h-4" />
                        Nuevo cliente
                    </button>
                )}
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, teléfono, email o documento..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm
                            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
            </div>

            {clientesFiltrados.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron clientes</p>
                    <p className="text-sm mt-1">{busqueda ? "Intenta con otro término" : "Crea el primer cliente"}</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#FFFBEB] border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Teléfono</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Documento</th>
                                    {(puedeEditar || puedeEliminar) && (
                                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Acciones</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {clientesFiltrados.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#FFFBEB] border border-[#F5A623]/30
                                                    flex items-center justify-center text-[#D4890A] font-bold text-sm">
                                                    {c.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{c.nombre}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">{c.telefono}</td>

                                        <td className="px-4 py-3 text-gray-600">{c.email || "—"}</td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {c.tipo_documento && c.numero_documento
                                                ? `${c.tipo_documento.toUpperCase()} ${c.numero_documento}`
                                                : "—"}
                                        </td>

                                        {(puedeEditar || puedeEliminar) && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {puedeEditar && (
                                                        <button
                                                            onClick={() => navegar(`/clientes/${c.id}/editar`)}
                                                            title="Editar cliente"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-yellow-50 hover:text-[#D4890A] transition-colors">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {puedeEliminar && (
                                                        <button
                                                            onClick={() => setClienteAEliminar(c)}
                                                            title="Eliminar cliente"
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

            {clienteAEliminar && (
                <ModalEliminar
                    cliente={clienteAEliminar}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setClienteAEliminar(null)}
                    eliminando={eliminando}/>
            )}
        </div>
    );
}