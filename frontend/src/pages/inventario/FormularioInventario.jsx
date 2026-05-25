import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import inventarioService from "../../services/inventarioService";
import propiedadService from "../../services/propiedadService";

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
    propiedad: "",
    nombre: "",
    categoria: "",
    descripcion: "",
    cantidad: 1,
    cantidad_disponible: 1,
    costo_unitario: "",
    esta_danado: false,
    notas_dano: "",
    estado: "disponible",
    notas: "",
};

export default function FormularioInventario() {
    const { id } = useParams();
    const esEdicion = Boolean(id);
    const navegar = useNavigate();
    const { usuario } = useAuth();
    const inputFotoRef = useRef(null);

    const puedeCrear = tienePermiso(usuario, "inventario", "crear");
    const puedeEditar = tienePermiso(usuario, "inventario", "editar");

    useEffect(() => {
        if (esEdicion && !puedeEditar) navegar("/inventario");
        if (!esEdicion && !puedeCrear) navegar("/inventario");
    }, [esEdicion, puedeCrear, puedeEditar, navegar]);

    const [form, setForm] = useState(FORM_VACIO);
    const [propiedades, setPropiedades] = useState([]);
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            try {
                const resPropiedades = await propiedadService.listar();
                setPropiedades(resPropiedades.data.filter(p => p.esta_activa));

                if (esEdicion) {
                    const resItem = await inventarioService.obtener(id);
                    const item = resItem.data;
                    setForm({
                        propiedad: String(item.propiedad),
                        nombre: item.nombre,
                        categoria: item.categoria,
                        descripcion: item.descripcion || "",
                        cantidad: item.cantidad,
                        cantidad_disponible: item.cantidad_disponible,
                        costo_unitario: item.costo_unitario || "",
                        esta_danado: item.esta_danado,
                        notas_dano: item.notas_dano || "",
                        estado: item.estado,
                        notas: item.notas || "",
                    });
                    if (item.foto) setPreview(item.foto);
                }
            } catch {
                alert("Error al cargar los datos.");
                navegar("/inventario");
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [id, esEdicion, navegar]);

    const manejarFoto = (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        setFoto(archivo);
        setPreview(URL.createObjectURL(archivo));
    };

    const quitarFoto = () => {
        setFoto(null);
        setPreview(null);
        if (inputFotoRef.current) inputFotoRef.current.value = "";
    };

    const validar = () => {
        const e = {};
        if (!form.propiedad) e.propiedad = "Selecciona una propiedad.";
        if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
        if (!form.categoria) e.categoria = "Selecciona una categoría.";
        if (form.cantidad <= 0) e.cantidad = "La cantidad debe ser mayor a 0.";
        if (form.cantidad_disponible < 0 || Number(form.cantidad_disponible) > Number(form.cantidad))
            e.cantidad_disponible = "No puede superar la cantidad total.";
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
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                payload.append(key, value);
            });
            if (foto) payload.append("foto", foto);

            if (esEdicion) {
                await inventarioService.actualizar(id, payload);
            } else {
                await inventarioService.crear(payload);
            }
            navegar("/inventario");
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
                    onClick={() => navegar("/inventario")}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">
                        {esEdicion ? "Editar ítem" : "Nuevo ítem"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {esEdicion ? "Modifica los datos del ítem" : "Completa los datos para registrar un nuevo ítem"}
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
                        <Campo label="Propiedad *" error={errores.propiedad}>
                            <select
                                value={form.propiedad}
                                onChange={e => actualizarCampo("propiedad", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 
                                            focus:ring-yellow-400 bg-white ${errores.propiedad ? "border-red-400" : "border-gray-300"}`}
                            >
                                <option value="">Seleccionar propiedad...</option>
                                {propiedades.map(p => (
                                    <option key={p.id} value={String(p.id)}>{p.nombre}</option>
                                ))}
                            </select>
                        </Campo>

                        <Campo label="Nombre *" error={errores.nombre}>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={e => actualizarCampo("nombre", e.target.value)}
                                placeholder="Ej: Silla plástica"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 
                                            focus:ring-yellow-400 focus:border-transparent ${errores.nombre ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                        </Campo>

                        <Campo label="Categoría *" error={errores.categoria}>
                            <select
                                value={form.categoria}
                                onChange={e => actualizarCampo("categoria", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 
                                            focus:ring-yellow-400 bg-white ${errores.categoria ? "border-red-400" : "border-gray-300"}`}
                            >
                                <option value="">Seleccionar categoría...</option>
                                <option value="mobiliario">Mobiliario</option>
                                <option value="electrodomestico">Electrodoméstico</option>
                                <option value="ropa_cama">Ropa de cama</option>
                                <option value="utensilio_cocina">Utensilio de cocina</option>
                                <option value="decoracion">Decoración</option>
                                <option value="herramienta">Herramienta</option>
                                <option value="juegos">Juegos</option>
                                <option value="otro">Otro</option>
                            </select>
                        </Campo>

                        <Campo label="Estado *" error={errores.estado}>
                            <select
                                value={form.estado}
                                onChange={e => actualizarCampo("estado", e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                                            focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                            >
                                <option value="disponible">Disponible</option>
                                <option value="no_disponible">No disponible</option>
                                <option value="en_reparacion">En reparación</option>
                            </select>
                        </Campo>

                        <Campo label="Cantidad total *" error={errores.cantidad}>
                            <input
                                type="number"
                                min="1"
                                value={form.cantidad}
                                onChange={e => actualizarCampo("cantidad", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none 
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.cantidad ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                        </Campo>

                        <Campo label="Cantidad disponible *" error={errores.cantidad_disponible}>
                            <input
                                type="number"
                                min="0"
                                value={form.cantidad_disponible}
                                onChange={e => actualizarCampo("cantidad_disponible", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none
                                            focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                                            ${errores.cantidad_disponible ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                        </Campo>

                        <Campo label="Costo unitario" error={errores.costo_unitario}>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.costo_unitario}
                                onChange={e => actualizarCampo("costo_unitario", e.target.value)}
                                placeholder="$ 0.00"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </Campo>

                        <Campo label="Descripción" error={errores.descripcion}>
                            <textarea
                                value={form.descripcion}
                                onChange={e => actualizarCampo("descripcion", e.target.value)}
                                placeholder="Descripción opcional..."
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                            />
                        </Campo>

                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Estado de daños</h2>
                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="checkbox"
                            id="esta_danado"
                            checked={form.esta_danado}
                            onChange={e => actualizarCampo("esta_danado", e.target.checked)}
                            className="w-4 h-4 accent-yellow-500"
                        />
                        <label htmlFor="esta_danado" className="text-sm text-gray-700 cursor-pointer">
                            Este ítem tiene daños
                        </label>
                    </div>

                    {form.esta_danado && (
                        <Campo label="Notas del daño" error={errores.notas_dano}>
                            <textarea
                                value={form.notas_dano}
                                onChange={e => actualizarCampo("notas_dano", e.target.value)}
                                placeholder="Describe el daño..."
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                            />
                        </Campo>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Foto</h2>
                    {preview ? (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                            <img src={preview} alt="Vista previa"
                                className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={quitarFoto}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow text-gray-600 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => inputFotoRef.current?.click()}
                            className="w-full h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center 
                                        justify-center gap-2 text-gray-400 hover:border-[#F5A623] hover:text-[#F5A623] transition-colors"
                        >
                            <Upload className="w-5 h-5" />
                            <span className="text-sm">Haz clic para subir una foto</span>
                        </button>
                    )}
                    <input
                        ref={inputFotoRef}
                        type="file"
                        accept="image/*"
                        onChange={manejarFoto}
                        className="hidden"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <Campo label="Notas generales" error={errores.notas}>
                        <textarea
                            value={form.notas}
                            onChange={e => actualizarCampo("notas", e.target.value)}
                            placeholder="Observaciones adicionales..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                        />
                    </Campo>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => navegar("/inventario")}
                        disabled={guardando}
                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={guardando}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623] text-[#1A1A1A] 
                                font-semibold hover:bg-[#D4890A] hover:text-white transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear ítem"}
                    </button>
                </div>

            </form>
        </div>
    );
}