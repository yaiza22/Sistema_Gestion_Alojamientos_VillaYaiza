import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Pencil, Trash2, KeyRound, Search, UserX, UserCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import api from "../../services/api";
import PropTypes from "prop-types";

const ROLES_LABEL = {
   propietario: { label: "Propietario", clase: "bg-yellow-100 text-yellow-800" },
   asistente:   { label: "Asistente",   clase: "bg-blue-100 text-blue-800"   },
   empleado:    { label: "Empleado",    clase: "bg-gray-100 text-gray-700"   },
};

function BadgeRol({ rol }) {
    const config = ROLES_LABEL[rol] || { label: rol, clase: "bg-gray-100 text-gray-700" };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.clase}`}>
            {config.label}
        </span>
    );
}

//function Avatar({ foto, nombre }) {
function Avatar({ nombre }) {
    /*
    if (foto) {
    return (
        <img
        src={foto}
        alt={nombre}
        className="w-9 h-9 rounded-full object-cover border border-gray-200"
        />
    );
    }
    */
    return (
        <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-sm">
            {nombre?.charAt(0)?.toUpperCase() || "?"}
        </div>
    );
}

function ModalEliminar({ usuario, onConfirmar, onCancelar, eliminando }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    ¿Eliminar usuario?
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                    Estás a punto de eliminar a{" "}
                    <span className="font-semibold text-gray-800">
                        {usuario.nombre_completo || usuario.username}
                    </span>
                    . Esta acción no se puede deshacer.
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

BadgeRol.propTypes = {
  rol: PropTypes.string.isRequired,
};

Avatar.propTypes = {
  foto: PropTypes.string,
  nombre: PropTypes.string,
};

ModalEliminar.propTypes = {
  usuario: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    nombre_completo: PropTypes.string,
  }).isRequired,
  onConfirmar: PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
  eliminando: PropTypes.bool.isRequired,
};

export default function ListaUsuarios() {
    const { usuario: usuarioActual } = useAuth();
    const navegar = useNavigate();

    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroRol, setFiltroRol] = useState("todos");
    const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    //const puedeVer = tienePermiso(usuarioActual, "usuarios", "ver");
    const puedeCrear = tienePermiso(usuarioActual, "usuarios", "crear");
    const puedeEditar = tienePermiso(usuarioActual, "usuarios", "editar");
    const puedeEliminar = tienePermiso(usuarioActual, "usuarios", "eliminar");
    
    const cargarUsuarios = async () => {
        try {
            setCargando(true);
            setError(null);
            const res = await api.get("/cuentas/usuarios/");
            setUsuarios(res.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("No tienes permiso para ver los usuarios.");
            } else {
                setError("Error al cargar los usuarios. Intenta de nuevo.");
            }
        } finally {
            setCargando(false);
        }
    };

    /*
    useEffect(() => {
        if (puedeVer) cargarUsuarios();
        else setError("No tienes permiso para ver los usuarios.");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    */
    useEffect(() => {
        const puedeVerLocal = tienePermiso(usuarioActual, "usuarios", "ver");
        if (puedeVerLocal) cargarUsuarios();
        else setError("No tienes permiso para ver los usuarios.");
    }, [usuarioActual]);

  const confirmarEliminar = async () => {
        if (!usuarioAEliminar) return;
        try {
            setEliminando(true);
            await api.delete(`/cuentas/usuarios/${usuarioAEliminar.id}/`);
            setUsuarios(prev => prev.filter(u => u.id !== usuarioAEliminar.id));
            setUsuarioAEliminar(null);
        } catch (err) {
            alert(err.response?.data?.error || "Error al eliminar el usuario.");
        } finally {
            setEliminando(false);
        }
    };

    const usuariosFiltrados = usuarios.filter(u => {
        const termino = busqueda.toLowerCase();
        const coincideBusqueda = u.username.toLowerCase().includes(termino) || u.email.toLowerCase().includes(termino) || u.nombre_completo?.toLowerCase().includes(termino);
        const coincideRol = filtroRol === "todos" || u.rol === filtroRol;
        return coincideBusqueda && coincideRol;
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
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">Usuarios del sistema</h1>
                    <p className="text-gray-500 text-sm mt-1"> {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""} </p>
                </div>
                {puedeCrear && (
                <button
                    onClick={() => navegar("/usuarios/nuevo")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5A623]
                            text-[#1A1A1A] font-semibold hover:bg-[#D4890A] hover:text-white
                            transition-colors shadow-sm">
                    <UserPlus className="w-4 h-4" />
                    Nuevo usuario
                </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, usuario o email..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm
                                    focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                </div>
                
                <select
                    value={filtroRol}
                    onChange={e => setFiltroRol(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700
                                focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                    <option value="todos">Todos los roles</option>
                    <option value="propietario">Propietario</option>
                    <option value="asistente">Asistente</option>
                    <option value="empleado">Empleado</option>
                </select>
            </div>

            {usuariosFiltrados.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-lg font-medium">No se encontraron usuarios</p>
                    <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#FFFBEB] border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Usuario</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Rol</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                                    {(puedeEditar || puedeEliminar) && (
                                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Acciones</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {usuariosFiltrados.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {/*<Avatar foto={u.foto} nombre={u.nombre_completo || u.username} />*/}
                                                <Avatar nombre={u.nombre_completo || u.username} />
                                                <div>
                                                    <p className="font-medium text-gray-900">{u.nombre_completo || u.username}</p>
                                                    <p className="text-xs text-gray-400">@{u.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                        <td className="px-4 py-3"><BadgeRol rol={u.rol} /></td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1 text-xs font-medium
                                                ${u.is_active ? "text-green-600" : "text-gray-400"}`}>
                                                {u.is_active ? <><UserCheck className="w-3.5 h-3.5" /> Activo</> : <><UserX className="w-3.5 h-3.5" /> Inactivo</>}
                                            </span>
                                        </td>

                                        {(puedeEditar || puedeEliminar) && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {puedeEditar && (
                                                        <>
                                                        <button
                                                            onClick={() => navegar(`/usuarios/${u.id}/editar`)}
                                                            title="Editar usuario"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-yellow-50
                                                                    hover:text-[#D4890A] transition-colors">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navegar(`/usuarios/${u.id}/password`)}
                                                            title="Cambiar contraseña"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50
                                                                    hover:text-blue-600 transition-colors">
                                                            <KeyRound className="w-4 h-4" />
                                                        </button>
                                                        </>
                                                    )}

                                                    {puedeEliminar && u.rol !== "propietario" && u.id !== usuarioActual?.id && (
                                                        <button
                                                            onClick={() => setUsuarioAEliminar(u)}
                                                            title="Eliminar usuario"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50
                                                                        hover:text-red-500 transition-colors">
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

            {usuarioAEliminar && (
                <ModalEliminar
                    usuario={usuarioAEliminar}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setUsuarioAEliminar(null)}
                    eliminando={eliminando}/>
            )}
        </div>
    );
}