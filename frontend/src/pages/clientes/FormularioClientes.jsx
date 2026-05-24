import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import clienteService from "../../services/clienteService";

function Campo({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                {label}
            </label>
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

const FORM_VACIO = {
    nombre: "",
    telefono: "",
    email: "",
    tipo_documento: "",
    numero_documento: "",
};

export default function FormCliente() {
    const { id } = useParams();
    const esEdicion = Boolean(id);
    const navegar = useNavigate();
    const { usuario } = useAuth();

    const puedeCrear = tienePermiso(usuario, "clientes", "crear");
    const puedeEditar = tienePermiso(usuario, "clientes", "editar");

    useEffect(() => {
        if (esEdicion && !puedeEditar) navegar("/clientes");
        if (!esEdicion && !puedeCrear) navegar("/clientes");
    }, [esEdicion, puedeCrear, puedeEditar, navegar]);

    const [form, setForm] = useState(FORM_VACIO);
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(esEdicion);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!esEdicion) return;
        const cargar = async () => {
            try {
                const res = await clienteService.obtener(id);
                const c = res.data;
                setForm({
                    nombre: c.nombre,
                    telefono: c.telefono,
                    email: c.email || "",
                    tipo_documento: c.tipo_documento || "",
                    numero_documento: c.numero_documento || "",
                });
            } catch {
                alert("Error al cargar el cliente.");
                navegar("/clientes");
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [id, esEdicion, navegar]);

    const validar = () => {
        const e = {};
        if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
        if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio.";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "El email no es válido.";
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
            if (esEdicion) {
                await clienteService.actualizar(id, form);
            } else {
                await clienteService.crear(form);
            }
            navegar("/clientes");
        } catch (err) {
            if (err.response?.data) {
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
                <div className="animate-spin w-8 h-8 border-4 border-[#F5A623]
                        border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">

            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navegar("/clientes")}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">
                        {esEdicion ? "Editar cliente" : "Nuevo cliente"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {esEdicion ? "Modifica los datos del cliente" : "Completa los datos para registrar un nuevo cliente"}
                    </p>
                </div>
            </div>

            <form onSubmit={manejarEnvio} noValidate>

                {errores.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                        {errores.general}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h2 className="text-base font-semibold text-gray-800">Datos del cliente</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <Campo label="Nombre completo *" error={errores.nombre}>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={e => actualizarCampo("nombre", e.target.value)}
                                placeholder="Ej: Beatriz Pinzón"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                            ${errores.nombre ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                        </Campo>

                        <Campo label="Teléfono *" error={errores.telefono}>
                            <input
                                type="tel"
                                value={form.telefono}
                                onChange={e => actualizarCampo("telefono", e.target.value)}
                                placeholder="Ej: 3001234567"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                            ${errores.telefono ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                        </Campo>

                        <Campo label="Email" error={errores.email}>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => actualizarCampo("email", e.target.value)}
                                placeholder="Ej: juan@email.com"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                            ${errores.email ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                        </Campo>

                        <Campo label="Tipo de documento" error={errores.tipo_documento}>
                            <select
                                value={form.tipo_documento}
                                onChange={e => actualizarCampo("tipo_documento", e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                            >
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
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                        </Campo>

                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        type="button"
                        onClick={() => navegar("/clientes")}
                        disabled={guardando}
                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={guardando}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623]
                                    text-[#1A1A1A] font-semibold hover:bg-[#D4890A] hover:text-white
                                    transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear cliente"}
                    </button>
                </div>

            </form>
        </div>
    );
}