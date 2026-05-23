import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

function CampoPassword({ label, value, onChange, error, placeholder }) {
    const [mostrar, setMostrar] = useState(false);

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    type={mostrar ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm focus:outline-none
                                focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                ${error ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                <button
                    type="button"
                    onClick={() => setMostrar(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                                hover:text-gray-600 transition-colors">
                    {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

CampoPassword.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string,
    placeholder: PropTypes.string,
};

export default function CambiarPassword() {
    const { id } = useParams();
    const navegar = useNavigate();
    const { usuario: usuarioActual } = useAuth();

    const esPropioUsuario = usuarioActual?.id === Number(id);
    const esPropietaria   = usuarioActual?.rol === "propietario";

    // Si no es su propio perfil y no es propietario, no debería estar aquí
    if (!esPropioUsuario && !esPropietaria) {
        navegar("/usuarios");
    }

    const [form, setForm] = useState({
        password_actual: "",
        password_nuevo: "",
        confirmar_password: "",
    });

    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [exito, setExito] = useState(false);

    const validar = () => {
        const e = {};
        if (!form.password_actual) {
            e.password_actual = "Ingresa tu contraseña actual.";
        }

        if (!form.password_nuevo) {
            e.password_nuevo = "Ingresa la nueva contraseña.";
        } else if (form.password_nuevo.length < 8) {
            e.password_nuevo = "Mínimo 8 caracteres.";
        }

        if (form.password_nuevo !== form.confirmar_password) {
            e.confirmar_password = "Las contraseñas no coinciden.";
        }

        if (form.password_actual && form.password_nuevo && form.password_actual === form.password_nuevo) {
            e.password_nuevo = "La nueva contraseña debe ser diferente a la actual.";
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
            await api.post(`/cuentas/usuarios/${id}/password/`, form);
            setExito(true);
            // Redirige después de 2 segundos
            setTimeout(() => navegar("/usuarios"), 2000);
        } catch (err) {
            if (err.response?.data?.error) {
                setErrores({ general: err.response.data.error });
            } else if (err.response?.data) {
                setErrores(err.response.data);
            } else {
                setErrores({ general: "Error al cambiar la contraseña. Intenta de nuevo." });
            }
        } finally {
            setGuardando(false);
        }
    };

    const actualizarCampo = (campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: "" }));
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">

            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navegar("/usuarios")}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">Cambiar contraseña</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {esPropioUsuario ? "Actualiza tu contraseña de acceso" : "Cambia la contraseña de este usuario"}
                    </p>
                </div>
            </div>

            {/* Mensaje de éxito */}
            {exito && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl
                                px-4 py-3 mb-6 text-sm flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Contraseña actualizada correctamente. Redirigiendo...
                </div>
            )}

            <form onSubmit={manejarEnvio} noValidate>
                {errores.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl
                                    px-4 py-3 mb-6 text-sm">
                        {errores.general}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <CampoPassword
                        label="Contraseña actual *"
                        value={form.password_actual}
                        onChange={e => actualizarCampo("password_actual", e.target.value)}
                        error={errores.password_actual}
                        placeholder="Tu contraseña actual"/>

                    <CampoPassword
                        label="Nueva contraseña *"
                        value={form.password_nuevo}
                        onChange={e => actualizarCampo("password_nuevo", e.target.value)}
                        error={errores.password_nuevo}
                        placeholder="Mínimo 8 caracteres"/>

                    <CampoPassword
                        label="Confirmar nueva contraseña *"
                        value={form.confirmar_password}
                        onChange={e => actualizarCampo("confirmar_password", e.target.value)}
                        error={errores.confirmar_password}
                        placeholder="Repite la nueva contraseña"/>
                </div>
                
                <div className="flex gap-3 justify-end mt-6">
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
                        disabled={guardando || exito}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623]
                                text-[#1A1A1A] font-semibold hover:bg-[#D4890A] hover:text-white
                                transition-colors disabled:opacity-50 shadow-sm">
                        <KeyRound className="w-4 h-4" />
                        {guardando ? "Guardando..." : "Cambiar contraseña"}
                    </button>
                </div>
            </form>
        </div>
    );
}