import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import propiedadService from "../../services/propiedadService";

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

const FORM_VACIO = {
    nombre: "",
    tipo: "",
    descripcion: "",
    capacidad: "",
    ubicacion: "",
    precio_base_por_dia: "",
    precio_temporada_baja: "",
    precio_temporada_alta: "",
    esta_activa: true,
};

export default function FormPropiedad() {
    const { id } = useParams();
    const esEdicion = Boolean(id);
    const navegar = useNavigate();
    const { usuario } = useAuth();
    const inputImagenRef = useRef(null);

    const puedeCrear  = tienePermiso(usuario, "propiedades", "crear");
    const puedeEditar = tienePermiso(usuario, "propiedades", "editar");

    useEffect(() => {
        if (esEdicion && !puedeEditar) navegar("/propiedades");
        if (!esEdicion && !puedeCrear) navegar("/propiedades");
    }, [esEdicion, puedeCrear, puedeEditar, navegar]);

    const [form, setForm] = useState(FORM_VACIO);
    const [imagen, setImagen] = useState(null);   // archivo nuevo
    const [preview, setPreview] = useState(null);   // URL previa o nueva
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(esEdicion);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!esEdicion) return;
        const cargar = async () => {
            try {
                const res = await propiedadService.obtener(id);
                const p = res.data;
                setForm({
                    nombre: p.nombre,
                    tipo: p.tipo,
                    descripcion: p.descripcion || "",
                    capacidad: p.capacidad,
                    ubicacion: p.ubicacion || "",
                    precio_base_por_dia: p.precio_base_por_dia,
                    precio_temporada_baja: p.precio_temporada_baja || "",
                    precio_temporada_alta: p.precio_temporada_alta || "",
                    esta_activa: p.esta_activa,
                });
                if (p.imagen) setPreview(p.imagen);
            } catch {
                alert("Error al cargar la propiedad.");
                navegar("/propiedades");
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [id, esEdicion, navegar]);

    const manejarImagen = (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        setImagen(archivo);
        setPreview(URL.createObjectURL(archivo));
    };

    const quitarImagen = () => {
        setImagen(null);
        setPreview(null);
        if (inputImagenRef.current) inputImagenRef.current.value = "";
    };

    const validar = () => {
        const e = {};
        if (!form.nombre.trim()) {
            e.nombre = "El nombre es obligatorio.";
        }
        if (!form.tipo) {
            e.tipo = "Selecciona un tipo.";
        }
        if (!form.capacidad || form.capacidad <= 0) {
            e.capacidad = "La capacidad debe ser mayor a 0.";
        }
        if (!form.precio_base_por_dia || form.precio_base_por_dia <= 0) {
            e.precio_base_por_dia = "El precio base es obligatorio.";
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
            // Usamos FormData para poder enviar la imagen como archivo
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                payload.append(key, value);
            });
            if (imagen) payload.append("imagen", imagen);

            if (esEdicion) {
                await propiedadService.actualizar(id, payload);
            } else {
                await propiedadService.crear(payload);
            }
            navegar("/propiedades");
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
                <div className="animate-spin w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navegar("/propiedades")}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">
                        {esEdicion ? "Editar propiedad" : "Nueva propiedad"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {esEdicion ? "Modifica los datos de la propiedad" : "Completa los datos para registrar una nueva propiedad"}
                    </p>
                </div>
            </div>

            <form onSubmit={manejarEnvio} noValidate>
                {errores.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                        {errores.general}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Datos generales</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Campo label="Nombre *" error={errores.nombre}>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={e => actualizarCampo("nombre", e.target.value)}
                                placeholder="Ej: Villa Yaiza Principal"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.nombre ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                        </Campo>

                        <Campo label="Tipo *" error={errores.tipo}>
                            <select
                                value={form.tipo}
                                onChange={e => actualizarCampo("tipo", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 bg-white
                                            ${errores.tipo ? "border-red-400 bg-red-50" : "border-gray-300"}`}>
                                <option value="">Seleccionar tipo...</option>
                                <option value="finca">Finca</option>
                                <option value="apartamento">Apartamento</option>
                                <option value="cabaña">Cabaña</option>
                            </select>
                        </Campo>

                        <Campo label="Capacidad (personas) *" error={errores.capacidad}>
                            <input
                                type="number"
                                min="1"
                                value={form.capacidad}
                                onChange={e => actualizarCampo("capacidad", e.target.value)}
                                placeholder="Ej: 10"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.capacidad ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                        </Campo>

                        <Campo label="Ubicación" error={errores.ubicacion}>
                            <input
                                type="text"
                                value={form.ubicacion}
                                onChange={e => actualizarCampo("ubicacion", e.target.value)}
                                placeholder="Ej: Ibagué, Tolima"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                        </Campo>

                        <Campo label="Descripción" error={errores.descripcion}>
                            <textarea
                                value={form.descripcion}
                                onChange={e => actualizarCampo("descripcion", e.target.value)}
                                placeholder="Describe la propiedad..."
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                        resize-none col-span-2"/>
                        </Campo>

                        <div className="flex items-center gap-3 sm:col-span-2">
                            <input
                                type="checkbox"
                                id="esta_activa"
                                checked={form.esta_activa}
                                onChange={e => actualizarCampo("esta_activa", e.target.checked)}
                                className="w-4 h-4 accent-yellow-500"/>
                            <label htmlFor="esta_activa" className="text-sm text-gray-700 cursor-pointer">
                                Propiedad activa (disponible para reservas)
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Precios</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Campo label="Precio base por día *" error={errores.precio_base_por_dia}>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.precio_base_por_dia}
                                onChange={e => actualizarCampo("precio_base_por_dia", e.target.value)}
                                placeholder="$ 0.00"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.precio_base_por_dia ? "border-red-400 bg-red-50" : "border-gray-300"}`}/>
                        </Campo>

                        <Campo label="Precio temporada baja" error={errores.precio_temporada_baja}>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.precio_temporada_baja}
                                onChange={e => actualizarCampo("precio_temporada_baja", e.target.value)}
                                placeholder="$ 0.00"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                        </Campo>

                        <Campo label="Precio temporada alta" error={errores.precio_temporada_alta}>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.precio_temporada_alta}
                                onChange={e => actualizarCampo("precio_temporada_alta", e.target.value)}
                                placeholder="$ 0.00"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                        </Campo>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Imagen</h2>

                    {preview ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                            <img
                                src={preview}
                                alt="Vista previa"
                                className="w-full h-full object-cover"/>
                            <button
                                type="button"
                                onClick={quitarImagen}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow text-gray-600 hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => inputImagenRef.current?.click()}
                            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl
                                        flex flex-col items-center justify-center gap-2 text-gray-400
                                        hover:border-[#F5A623] hover:text-[#F5A623] transition-colors">
                            <Upload className="w-6 h-6" />
                            <span className="text-sm">Haz clic para subir una imagen</span>
                        </button>
                    )}

                    <input
                        ref={inputImagenRef}
                        type="file"
                        accept="image/*"
                        onChange={manejarImagen}
                        className="hidden"/>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => navegar("/propiedades")}
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
                        {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear propiedad"}
                    </button>
                </div>
            </form>
        </div>
    );
}