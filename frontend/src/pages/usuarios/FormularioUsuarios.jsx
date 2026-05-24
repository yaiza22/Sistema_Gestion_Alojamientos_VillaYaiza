import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import MatrizPermisos from "../../components/MatrizPermisos";
import api from "../../services/api";

const PERMISOS_VACIOS = {
    reservas_ver: false,    reservas_crear: false,
    reservas_editar: false, reservas_eliminar: false,

    clientes_ver: false,    clientes_crear: false,
    clientes_editar: false, clientes_eliminar: false,

    propiedades_ver: false,    propiedades_crear: false,
    propiedades_editar: false, propiedades_eliminar: false,

    inventario_ver: false,    inventario_crear: false,
    inventario_editar: false, inventario_eliminar: false,

    reportes_ver: false,    reportes_crear: false,
    reportes_editar: false, reportes_eliminar: false,

    contratos_ver: false,    contratos_crear: false,
    contratos_editar: false, contratos_eliminar: false,

    usuarios_ver: false,    usuarios_crear: false,
    usuarios_editar: false, usuarios_eliminar: false,
};

function Campo({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

Campo.propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string,
    children: PropTypes.node.isRequired,
};

export default function FormularioUsuarios() {
    const { id } = useParams();
    const esEdicion = Boolean(id);
    const navegar = useNavigate();
    const { usuario: usuarioActual } = useAuth();

    const puedeCrear = tienePermiso(usuarioActual, "usuarios", "crear");
    const puedeEditar = tienePermiso(usuarioActual, "usuarios", "editar");

    useEffect(() => {
        if (esEdicion && !puedeEditar) navegar("/usuarios");
        if (!esEdicion && !puedeCrear) navegar("/usuarios");
    }, [esEdicion, puedeCrear, puedeEditar, navegar]);

    const [form, setForm] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        telefono: "",
        tipo_documento: "",
        numero_documento: "",
        rol: "empleado",
        is_active: true,
        password: "",
        confirmar_password: "",
    });

    const [permisos, setPermisos] = useState(PERMISOS_VACIOS);
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(esEdicion);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!esEdicion) return;
        const cargar = async () => {
            try {
                const res = await api.get(`/cuentas/usuarios/${id}/`);
                const u = res.data;
                setForm({
                    username: u.username,
                    email: u.email,
                    first_name: u.first_name,
                    last_name: u.last_name,
                    telefono: u.telefono || "",
                    tipo_documento: u.tipo_documento || "",
                    numero_documento: u.numero_documento || "",
                    rol: u.rol,
                    is_active: u.is_active,
                    password: "",
                    confirmar_password: "",
                });
                setPermisos(u.permisos);
            } catch {
                alert("Error al cargar el usuario.");
                navegar("/usuarios");
            } finally {
                setCargando(false);
            }
        };

        cargar();
    }, [id, esEdicion, navegar]);
    
    const validar = () => {
        const e = {};
        if (!form.username.trim()) e.username = "El nombre de usuario es obligatorio.";
        if (!form.email.trim()) e.email = "El email es obligatorio.";
        if (!form.first_name.trim()) e.first_name = "El nombre es obligatorio.";
        if (!form.last_name.trim()) e.last_name = "El apellido es obligatorio.";
        if (!esEdicion) {
            if (!form.password) e.password = "La contraseña es obligatoria.";
            else if (form.password.length < 8) e.password  = "Mínimo 8 caracteres.";
            
            if (form.password !== form.confirmar_password) e.confirmar_password = "Las contraseñas no coinciden.";
        }
        return e;
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        const erroresValidacion = validar();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            return;
        }

        setGuardando(true);
        setErrores({});

        try {
            const payload = { ...form, permisos };

            // En edición no s envian los campos de contraseña
            if (esEdicion) {
                delete payload.password;
                delete payload.confirmar_password;
            }

            if (esEdicion) {
                await api.put(`/cuentas/usuarios/${id}/`, payload);
            } else {
                await api.post("/cuentas/usuarios/", payload);
            }

            navegar("/usuarios");
        } catch (err) {
            if (err.response?.data) {
                // Mapea errores del backend al estado de errores
                setErrores(err.response.data);
            } else {
                setErrores({ general: "Error al guardar. Intenta de nuevo." });
            }
        } finally {
            setGuardando(false);
        }
    };

    const actualizarCampo = (campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: "" }));
    };

    if (cargando) {
        return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full" />
        </div>
        );
    }

    const esPropietario = form.rol === "propietario";

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navegar("/usuarios")}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">{esEdicion ? "Editar usuario" : "Nuevo usuario"}</h1>
                    <p className="text-gray-500 text-sm mt-0.5">{esEdicion ? "Modifica los datos y permisos del usuario" : "Completa los datos para crear un nuevo usuario"}</p>
                </div>
            </div>

            <form onSubmit={manejarEnvio} noValidate>
                {/* Error general */}
                {errores.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">{errores.general}</div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Datos personales</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Campo label="Nombre *" error={errores.first_name}>
                            <input
                                type="text"
                                value={form.first_name}
                                onChange={e => actualizarCampo("first_name", e.target.value)}
                                placeholder="Ej: María"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.first_name ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                        </Campo>

                        <Campo label="Apellido *" error={errores.last_name}>
                            <input
                                type="text"
                                value={form.last_name}
                                onChange={e => actualizarCampo("last_name", e.target.value)}
                                placeholder="Ej: García"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.last_name ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                        </Campo>

                        <Campo label="Usuario *" error={errores.username}>
                            <input
                                type="text"
                                value={form.username}
                                onChange={e => actualizarCampo("username", e.target.value)}
                                placeholder="Ej: maria.garcia"
                                disabled={esEdicion}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            disabled:bg-gray-50 disabled:cursor-not-allowed
                                            ${errores.username ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                            {esEdicion && (
                                <p className="text-xs text-gray-400 mt-1">El usuario no se puede cambiar.</p>
                            )}
                        </Campo>

                        <Campo label="Email *" error={errores.email}>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => actualizarCampo("email", e.target.value)}
                                placeholder="Ej: maria@finca.com"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.email ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                        </Campo>

                        <Campo label="Teléfono" error={errores.telefono}>
                            <input
                                type="tel"
                                value={form.telefono}
                                onChange={e => actualizarCampo("telefono", e.target.value)}
                                placeholder="Ej: 3001234567"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                        </Campo>

                        <Campo label="Tipo de documento" error={errores.tipo_documento}>
                            <select
                                value={form.tipo_documento}
                                onChange={e => actualizarCampo("tipo_documento", e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                                <option value="">Seleccionar...</option>
                                <option value="cc">Cédula de Ciudadanía</option>
                                <option value="ce">Cédula de Extranjería</option>
                                <option value="pasaporte">Pasaporte</option>
                                <option value="nit">NIT</option>
                            </select>
                        </Campo>

                        <Campo label="Número de documento" error={errores.numero_documento}>
                            <input
                                type="text"
                                value={form.numero_documento}
                                onChange={e => actualizarCampo("numero_documento", e.target.value)}
                                placeholder="Ej: 1234567890"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                        </Campo>

                        <Campo label="Rol *" error={errores.rol}>
                            <select
                                value={form.rol}
                                onChange={e => actualizarCampo("rol", e.target.value)}
                                disabled={esPropietario && usuarioActual?.rol !== "propietario"}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                            focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white
                                            disabled:bg-gray-50 disabled:cursor-not-allowed">
                                <option value="empleado">Empleado</option>
                                <option value="asistente">Asistente</option>
                                {usuarioActual?.rol === "propietario" && (
                                <option value="propietario">Propietario</option>
                                )}
                            </select>
                        </Campo>

                        {esEdicion && (
                            <Campo label="Estado" error={errores.is_active}>
                                <select
                                    value={form.is_active ? "true" : "false"}
                                    onChange={e => actualizarCampo("is_active", e.target.value === "true")}
                                    disabled={esPropietario}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                                focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white
                                                disabled:bg-gray-50 disabled:cursor-not-allowed">
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                            </Campo>
                        )}
                    </div>
                </div>

                {/* Contraseña — solo en creación */}
                {!esEdicion && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Contraseña</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Campo label="Contraseña *" error={errores.password}>
                                <input
                                type="password"
                                value={form.password}
                                onChange={e => actualizarCampo("password", e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.password ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                            </Campo>

                            <Campo label="Confirmar contraseña *" error={errores.confirmar_password}>
                                <input
                                type="password"
                                value={form.confirmar_password}
                                onChange={e => actualizarCampo("confirmar_password", e.target.value)}
                                placeholder="Repite la contraseña"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.confirmar_password ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                            </Campo>
                        </div>
                    </div>
                )}

                {/* Matriz de permisos — oculta para propietario */}
                {!esPropietario && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-base font-semibold text-gray-800 mb-1">Permisos</h2>
                        <p className="text-gray-500 text-xs mb-4">Define qué puede ver y hacer este usuario en cada módulo.</p>
                        <MatrizPermisos
                            permisos={permisos}
                            onChange={setPermisos}
                            deshabilitado={guardando}
                        />
                    </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => navegar("/usuarios")}
                        disabled={guardando}
                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700
                                hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={guardando}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623]
                                text-[#1A1A1A] font-semibold hover:bg-[#D4890A] hover:text-white
                                transition-colors disabled:opacity-50 shadow-sm">
                        <Save className="w-4 h-4" />
                        {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear usuario"}
                    </button>
                </div>
            </form>
        </div>
    );
}