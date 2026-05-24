import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
//import { ArrowLeft, Save, Calculator, AlertTriangle, UserPlus, Search } from "lucide-react";
import { ArrowLeft, Save, Calculator, AlertTriangle, Search } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import { calcularPrecio } from "../../utils/calculadoraPrecio";
import reservaService from "../../services/reservaService";
import propiedadService from "../../services/propiedadService";
import clienteService from "../../services/clienteService";

function Campo({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
Campo.propTypes = { label: PropTypes.string.isRequired, error: PropTypes.string, children: PropTypes.node.isRequired };

const FORM_VACIO = {
    propiedad: "", cliente: "", fecha_inicio: "", fecha_fin: "",
    hora_entrada_estimada: "", hora_salida_estimada: "",
    cant_asistentes: 1, temporada: "", cobrar_capacidad_total: false,
    descuento_tipo: "", descuento_valor: "",
    precio_calculado: "", precio_total: "",
    precio_modificado_manualmente: false, notas: "",
};

const CLIENTE_VACIO = { nombre: "", telefono: "", email: "", tipo_documento: "", numero_documento: "" };

export default function FormularioReservas() {
    const { id } = useParams();
    const esEdicion = Boolean(id);
    const navegar = useNavigate();
    const { usuario } = useAuth();

    const puedeCrear = tienePermiso(usuario, "reservas", "crear");
    const puedeEditar = tienePermiso(usuario, "reservas", "editar");

    useEffect(() => {
        if (esEdicion && !puedeEditar) navegar("/reservas");
        if (!esEdicion && !puedeCrear) navegar("/reservas");
    }, [esEdicion, puedeCrear, puedeEditar, navegar]);

    const [form, setForm] = useState(FORM_VACIO);
    const [propiedades, setPropiedades] = useState([]);
    const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
    const [modoCliente, setModoCliente] = useState("buscar"); // "buscar" | "nuevo"
    const [busquedaCliente, setBusquedaCliente] = useState("");
    const [resultadosCliente, setResultadosCliente] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [clienteNuevo, setClienteNuevo] = useState(CLIENTE_VACIO);
    const [disponibilidad, setDisponibilidad] = useState(null);
    const [desglosePrecio, setDesglosePrecio] = useState(null);
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(esEdicion);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        propiedadService.listar()
            .then(res => setPropiedades(res.data.filter(p => p.esta_activa)));
    }, []);
    
    useEffect(() => {
        if (!esEdicion) return;
        reservaService.obtener(id).then(res => {
            const r = res.data;
            setForm({
                propiedad: String(r.propiedad), cliente: String(r.cliente),
                fecha_inicio: r.fecha_inicio, fecha_fin: r.fecha_fin,
                hora_entrada_estimada: r.hora_entrada_estimada || "",
                hora_salida_estimada: r.hora_salida_estimada || "",
                cant_asistentes: r.cant_asistentes, temporada: r.temporada || "",
                cobrar_capacidad_total: r.cobrar_capacidad_total,
                descuento_tipo: r.descuento_tipo || "", descuento_valor: r.descuento_valor || "",
                precio_calculado: r.precio_calculado || "", precio_total: r.precio_total,
                precio_modificado_manualmente: r.precio_modificado_manualmente, notas: r.notas || "",
            });
            setClienteSeleccionado(r.cliente_detalle);
            const prop = propiedades.find(p => p.id === r.propiedad);
            if (prop) setPropiedadSeleccionada(prop);
        }).catch(() => { alert("Error al cargar la reserva."); navegar("/reservas"); })
            .finally(() => setCargando(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, esEdicion]);
    
    useEffect(() => {
        if (form.propiedad) {
            const prop = propiedades.find(p => String(p.id) === form.propiedad);
            setPropiedadSeleccionada(prop || null);
        }
    }, [form.propiedad, propiedades]);
    
    useEffect(() => {
        if (!form.propiedad || !form.fecha_inicio || !form.fecha_fin) return;
        const params = {
            propiedad_id: form.propiedad,
            fecha_inicio: form.fecha_inicio,
            fecha_fin: form.fecha_fin,
        };
        if (esEdicion) params.reserva_id = id;
        reservaService.verificarDisponibilidad(params)
            .then(res => setDisponibilidad(res.data))
            .catch(() => setDisponibilidad(null));
    }, [form.propiedad, form.fecha_inicio, form.fecha_fin, esEdicion, id]);
    
    const buscarClientes = useCallback(async (termino) => {
        if (!termino.trim()) { setResultadosCliente([]); return; }
        try {
            const res = await clienteService.buscar(termino);
            setResultadosCliente(res.data);
        } catch { setResultadosCliente([]); }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => buscarClientes(busquedaCliente), 300);
        return () => clearTimeout(timer);
    }, [busquedaCliente, buscarClientes]);
    
    const calcularDias = () => {
        if (!form.fecha_inicio || !form.fecha_fin) return 0;
        const diff = new Date(form.fecha_fin) - new Date(form.fecha_inicio);
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    };
    
    const calcular = () => {
        if (!propiedadSeleccionada || !form.temporada) return;
        const dias = calcularDias();
        if (dias < 0) return;
        const resultado = calcularPrecio({
            precioBase: propiedadSeleccionada.precio_base_por_dia,
            precioTemporadaAlta: propiedadSeleccionada.precio_temporada_alta,
            precioTemporadaBaja: propiedadSeleccionada.precio_temporada_baja,
            capacidadMaxima: propiedadSeleccionada.capacidad,
            cantAsistentes: form.cant_asistentes,
            dias, temporada: form.temporada,
            cobrarCapacidadTotal: form.cobrar_capacidad_total,
            descuentoTipo: form.descuento_tipo || null,
            descuentoValor: form.descuento_valor || 0,
        });
        if (resultado) {
            setDesglosePrecio(resultado);
            setForm(prev => ({
                ...prev,
                precio_calculado: resultado.total,
                precio_total: resultado.total,
                precio_modificado_manualmente: false,
                personas_cobradas: resultado.personasCobradas,
            }));
        }
    };

    const actualizarCampo = (campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: "" }));
    };

    const manejarPrecioManual = (valor) => {
        setForm(prev => ({
            ...prev,
            precio_total: valor,
            precio_modificado_manualmente: valor !== String(prev.precio_calculado),
        }));
    };

    const validar = () => {
        const e = {};
        if (!form.propiedad) e.propiedad = "Selecciona una propiedad.";
        if (modoCliente === "buscar" && !clienteSeleccionado) e.cliente = "Selecciona un cliente.";
        if (modoCliente === "nuevo" && !clienteNuevo.nombre.trim()) e.cliente_nombre = "El nombre es obligatorio.";
        if (modoCliente === "nuevo" && !clienteNuevo.telefono.trim()) e.cliente_telefono = "El teléfono es obligatorio.";
        if (!form.fecha_inicio) e.fecha_inicio = "La fecha de inicio es obligatoria.";
        if (!form.fecha_fin) e.fecha_fin = "La fecha de fin es obligatoria.";
        if (form.fecha_inicio && form.fecha_fin) {
            const inicio = new Date(form.fecha_inicio);
            const fin = new Date(form.fecha_fin);
            if (fin <= inicio) {
                e.fecha_fin = "La fecha de fin debe ser posterior a la fecha de inicio.";
            }
        }
        if (!form.cant_asistentes || form.cant_asistentes <= 0) e.cant_asistentes = "Indica el número de asistentes.";
        if (propiedadSeleccionada && Number(form.cant_asistentes) > propiedadSeleccionada.capacidad) e.cant_asistentes = `La propiedad solo permite ${propiedadSeleccionada.capacidad} asistentes`;
        if (!form.temporada) e.temporada = "Selecciona la temporada.";
        if (!form.precio_total) e.precio_total = "El precio total es obligatorio.";
        if (Number(form.precio_total) < 0) e.precio_total = "El precio no puede ser negativo.";
        if (form.descuento_tipo === "porcentaje" && Number(form.descuento_valor) > 100) e.descuento_valor = "El descuento no puede ser mayor al 100%.";
        if ((form.descuento_tipo === "porcentaje" || form.descuento_tipo === "valor") && Number(form.descuento_valor) < 0) e.descuento_valor = "El descuento no puede ser negativo.";
        if (disponibilidad && !disponibilidad.disponible) e.fecha_inicio = "Ya hay una reserva en esas fechas.";
        return e;
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        const erroresValidacion = validar();
        if (Object.keys(erroresValidacion).length > 0) { setErrores(erroresValidacion); return; }
        setGuardando(true);
        setErrores({});
        try {
            const payload = { ...form };
            if (modoCliente === "buscar") {
                payload.cliente = clienteSeleccionado.id;
                delete payload.cliente_nuevo;
            } else {
                delete payload.cliente;
                payload.cliente_nuevo = clienteNuevo;
            }
            let reserva;
            if (esEdicion) {
                const res = await reservaService.actualizar(id, payload);
                reserva = res.data;
            } else {
                const res = await reservaService.crear(payload);
                reserva = res.data;
            }
            navegar(`/reservas/${reserva.id}`);
        } catch (err) {
            if (err.response?.data) setErrores(err.response.data);
            else setErrores({ general: "Error al guardar. Intenta de nuevo." });
        } finally { setGuardando(false); }
    };

    if (cargando) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full" /></div>;

    const dias = calcularDias();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navegar("/reservas")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">{esEdicion ? "Editar reserva" : "Nueva reserva"}</h1>
                    <p className="text-gray-500 text-sm mt-0.5">{esEdicion ? "Modifica los datos de la reserva" : "Completa los datos para crear una reserva"}</p>
                </div>
            </div>

            <form onSubmit={manejarEnvio} noValidate>
                {errores.general && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">{errores.general}</div>}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Propiedad y fechas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <Campo label="Propiedad *" error={errores.propiedad}>
                            <select value={form.propiedad} onChange={e => actualizarCampo("propiedad", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white ${errores.propiedad ? "border-red-400" : "border-gray-300"}`}>
                                <option value="">Seleccionar propiedad...</option>
                                {propiedades.map(p => <option key={p.id} value={String(p.id)}>{p.nombre} (cap. {p.capacidad})</option>)}
                            </select>
                        </Campo>

                        <Campo label="Temporada *" error={errores.temporada}>
                            <select value={form.temporada} onChange={e => actualizarCampo("temporada", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white ${errores.temporada ? "border-red-400" : "border-gray-300"}`}>
                                <option value="">Seleccionar temporada...</option>
                                <option value="alta">Temporada alta</option>
                                <option value="baja">Temporada baja</option>
                            </select>
                        </Campo>

                        <Campo label="Fecha inicio *" error={errores.fecha_inicio}>
                            <input type="date" value={form.fecha_inicio} onChange={e => actualizarCampo("fecha_inicio", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errores.fecha_inicio ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                        </Campo>

                        <Campo label="Fecha fin *" error={errores.fecha_fin}>
                            <input type="date" value={form.fecha_fin} onChange={e => actualizarCampo("fecha_fin", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errores.fecha_fin ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                        </Campo>

                        <Campo label="Hora entrada estimada" error={errores.hora_entrada_estimada}>
                            <input type="time" value={form.hora_entrada_estimada} onChange={e => actualizarCampo("hora_entrada_estimada", e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        </Campo>

                        <Campo label="Hora salida estimada" error={errores.hora_salida_estimada}>
                            <input type="time" value={form.hora_salida_estimada} onChange={e => actualizarCampo("hora_salida_estimada", e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        </Campo>
                    </div>

                    {dias > 0 && (
                        <p className="mt-3 text-sm text-gray-500">
                            Duración: <span className="font-semibold text-[#D4890A]">{dias} día{dias !== 1 ? "s" : ""}</span>
                        </p>
                    )}

                    {disponibilidad && !disponibilidad.disponible && (
                        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            Ya existe una reserva en esas fechas para esta propiedad.
                        </div>
                    )}
                    {disponibilidad?.brechas?.map((b, i) => (
                        <div key={i} className="mt-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {b.mensaje}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Cliente</h2>
                    <div className="flex gap-2 mb-4">
                        <button type="button" onClick={() => setModoCliente("buscar")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${modoCliente === "buscar" ? "bg-[#F5A623] text-[#1A1A1A]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            <Search className="w-4 h-4" />Buscar cliente
                        </button>
                        {/*
                        <button type="button" disabled="true" onClick={() => setModoCliente("nuevo")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${modoCliente === "nuevo" ? "bg-[#F5A623] text-[#1A1A1A]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            <UserPlus className="w-4 h-4" />Nuevo cliente
                        </button>
                        */}
                    </div>

                    {modoCliente === "buscar" ? (
                        <div>
                            {clienteSeleccionado ? (
                                <div className="flex items-center justify-between bg-[#FFFBEB] border border-[#F5A623]/30 rounded-xl px-4 py-3">
                                    <div>
                                        <p className="font-medium text-gray-900">{clienteSeleccionado.nombre}</p>
                                        <p className="text-xs text-gray-500">{clienteSeleccionado.telefono} · {clienteSeleccionado.email || "Sin email"}</p>
                                    </div>
                                    <button type="button" onClick={() => { setClienteSeleccionado(null); setBusquedaCliente(""); }}
                                        className="text-xs text-gray-400 hover:text-red-500 transition-colors">Cambiar</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input type="text" placeholder="Buscar por nombre, teléfono o documento..."
                                        value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errores.cliente ? "border-red-400" : "border-gray-300"}`} />
                                    {resultadosCliente.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                            {resultadosCliente.map(c => (
                                                <button key={c.id} type="button"
                                                    onClick={() => { setClienteSeleccionado(c); setBusquedaCliente(""); setResultadosCliente([]); actualizarCampo("cliente", c.id); }}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                                    <p className="font-medium text-gray-900 text-sm">{c.nombre}</p>
                                                    <p className="text-xs text-gray-400">{c.telefono} · {c.email || "Sin email"}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {errores.cliente && <p className="text-red-500 text-xs mt-1">{errores.cliente}</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Campo label="Nombre completo *" error={errores.cliente_nombre}>
                                <input type="text" value={clienteNuevo.nombre}
                                    onChange={e => setClienteNuevo(prev => ({ ...prev, nombre: e.target.value }))}
                                    placeholder="Ej: Juan Pérez"
                                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errores.cliente_nombre ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                            </Campo>
                            <Campo label="Teléfono *" error={errores.cliente_telefono}>
                                <input type="tel" value={clienteNuevo.telefono}
                                    onChange={e => setClienteNuevo(prev => ({ ...prev, telefono: e.target.value }))}
                                    placeholder="Ej: 3001234567"
                                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errores.cliente_telefono ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                            </Campo>
                            <Campo label="Email" error={null}>
                                <input type="email" value={clienteNuevo.email}
                                    onChange={e => setClienteNuevo(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Ej: juan@email.com"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                            </Campo>
                            <Campo label="Tipo documento" error={null}>
                                <select value={clienteNuevo.tipo_documento}
                                    onChange={e => setClienteNuevo(prev => ({ ...prev, tipo_documento: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="cc">Cédula de Ciudadanía</option>
                                    <option value="ce">Cédula de Extranjería</option>
                                    <option value="pasaporte">Pasaporte</option>
                                    <option value="nit">NIT</option>
                                </select>
                            </Campo>
                            <Campo label="Número documento" error={null}>
                                <input type="text" value={clienteNuevo.numero_documento}
                                    onChange={e => setClienteNuevo(prev => ({ ...prev, numero_documento: e.target.value }))}
                                    placeholder="Ej: 1234567890"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                            </Campo>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Asistentes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Campo label="Número de asistentes *" error={errores.cant_asistentes}>
                            <input type="number" min="1" max={propiedadSeleccionada?.capacidad || 999}
                                value={form.cant_asistentes} onChange={e => actualizarCampo("cant_asistentes", e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errores.cant_asistentes ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                            {propiedadSeleccionada && (
                                <p className="text-xs text-gray-400 mt-1">Capacidad máxima: {propiedadSeleccionada.capacidad} personas</p>
                            )}
                        </Campo>

                        {form.temporada === "alta" && (
                            <div className="flex items-center gap-3 sm:col-span-1 self-end pb-2">
                                <input type="checkbox" id="cobrar_capacidad_total" checked={form.cobrar_capacidad_total}
                                    onChange={e => actualizarCampo("cobrar_capacidad_total", e.target.checked)}
                                    className="w-4 h-4 accent-yellow-500" />
                                <label htmlFor="cobrar_capacidad_total" className="text-sm text-gray-700 cursor-pointer">
                                    Cobrar por capacidad total ({propiedadSeleccionada?.capacidad} personas)
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Precio</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {form.temporada !== "alta" && (
                            <>
                                <Campo label="Tipo de descuento" error={null}>
                                    <select value={form.descuento_tipo} onChange={e => actualizarCampo("descuento_tipo", e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                                        <option value="">Sin descuento</option>
                                        <option value="porcentaje">Porcentaje (%)</option>
                                        <option value="valor">Valor fijo ($)</option>
                                    </select>
                                </Campo>
                                {form.descuento_tipo && (
                                    <Campo label={form.descuento_tipo === "porcentaje" ? "Descuento (%)" : "Descuento ($)"} error={errores.descuento_valor}>
                                        <input type="number" min="0" value={form.descuento_valor}
                                            onChange={e => actualizarCampo("descuento_valor", e.target.value)}
                                            placeholder="0"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                                    </Campo>
                                )}
                            </>
                        )}
                    </div>

                    <button type="button" onClick={calcular}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium mb-4">
                        <Calculator className="w-4 h-4" />Calcular precio
                    </button>

                    {desglosePrecio && (
                        <div className="bg-[#FFFBEB] border border-[#F5A623]/30 rounded-xl px-4 py-3 mb-4 text-sm space-y-1">
                            {desglosePrecio.desglose.map((linea, i) => (
                                <p key={i} className={i === desglosePrecio.desglose.length - 1 ? "font-semibold text-[#D4890A]" : "text-gray-600"}>{linea}</p>
                            ))}
                        </div>
                    )}

                    <Campo label="Precio total *" error={errores.precio_total}>
                        <input type="number" min="0" step="0.01" value={form.precio_total}
                            onChange={e => manejarPrecioManual(e.target.value)}
                            placeholder="$ 0.00"
                            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errores.precio_total ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                    </Campo>

                    {form.precio_modificado_manualmente && (
                        <div className="mt-2 flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            El precio fue modificado manualmente. El valor calculado era ${Number(form.precio_calculado).toLocaleString("es-CO")}.
                        </div>
                    )}
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <Campo label="Notas" error={null}>
                        <textarea value={form.notas} onChange={e => actualizarCampo("notas", e.target.value)}
                            placeholder="Observaciones adicionales..." rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
                    </Campo>
                </div>

                <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => navegar("/reservas")} disabled={guardando}
                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium">
                        Cancelar
                    </button>
                    <button type="submit" disabled={guardando}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623] text-[#1A1A1A] font-semibold hover:bg-[#D4890A] hover:text-white transition-colors disabled:opacity-50 shadow-sm">
                        <Save className="w-4 h-4" />
                        {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear reserva"}
                    </button>
                </div>
            </form>
        </div>
    );
}