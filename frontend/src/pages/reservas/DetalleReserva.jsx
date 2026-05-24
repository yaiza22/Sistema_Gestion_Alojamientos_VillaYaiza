import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, LogIn, LogOut, Plus, X, AlertTriangle } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import reservaService from "../../services/reservaService";

const ESTADOS_CONFIG = {
    pendiente: { label: "Pendiente", clase: "bg-yellow-100 text-yellow-700" },
    en_curso: { label: "En curso", clase: "bg-blue-100 text-blue-700" },
    completada: { label: "Completada", clase: "bg-green-100 text-green-700" },
    cancelada: { label: "Cancelada", clase: "bg-red-100 text-red-700" },
};

function BadgeEstado({ estado }) {
    const config = ESTADOS_CONFIG[estado] || { label: estado, clase: "bg-gray-100 text-gray-700" };
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.clase}`}>{config.label}</span>;
}
BadgeEstado.propTypes = { estado: PropTypes.string.isRequired };

function Seccion({ titulo, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h2 className="text-base font-semibold text-gray-800 mb-4">{titulo}</h2>
            {children}
        </div>
    );
}
Seccion.propTypes = { titulo: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

function FilaDato({ label, valor }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-800">{valor || "—"}</span>
        </div>
    );
}
FilaDato.propTypes = {
    label: PropTypes.string.isRequired,
    valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function ModalCancelar({ onConfirmar, onCancelar, guardando }) {
    const [opcion, setOpcion] = useState("sin_devolucion");
    const [monto, setMonto] = useState("");
    const [metodo, setMetodo] = useState("efectivo");
    const [nuevaFechaInicio, setNuevaFechaInicio] = useState("");
    const [nuevaFechaFin, setNuevaFechaFin] = useState("");
    const [notas, setNotas] = useState("");

    const manejar = () => {
        const data = { opcion, notas };
        if (opcion === "con_devolucion") { data.monto_devolucion = monto; data.metodo_devolucion = metodo; }
        if (opcion === "cambio_fechas") { data.nueva_fecha_inicio = nuevaFechaInicio; data.nueva_fecha_fin = nuevaFechaFin; }
        onConfirmar(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cancelar reserva</h3>
                <div className="space-y-3 mb-4">
                    {[
                        { value: "sin_devolucion", label: "Cancelar sin devolver dinero" },
                        { value: "con_devolucion", label: "Cancelar con devolución" },
                        { value: "cambio_fechas", label: "Cambiar fechas" },
                    ].map(op => (
                        <label key={op.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
                            <input type="radio" name="opcion" value={op.value} checked={opcion === op.value}
                                onChange={() => setOpcion(op.value)} className="accent-yellow-500" />
                            <span className="text-sm text-gray-700">{op.label}</span>
                        </label>
                    ))}
                </div>

                {opcion === "con_devolucion" && (
                    <div className="space-y-3 mb-4">
                        <input type="number" placeholder="Monto a devolver" value={monto}
                            onChange={e => setMonto(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        <select value={metodo} onChange={e => setMetodo(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="tarjeta">Tarjeta</option>
                        </select>
                    </div>
                )}

                {opcion === "cambio_fechas" && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <input type="date" value={nuevaFechaInicio}
                            onChange={e => setNuevaFechaInicio(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        <input type="date" value={nuevaFechaFin}
                            onChange={e => setNuevaFechaFin(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    </div>
                )}

                <textarea placeholder="Notas opcionales..." value={notas}
                    onChange={e => setNotas(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none mb-4" />

                <div className="flex gap-3">
                    <button onClick={onCancelar} disabled={guardando}
                        className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={manejar} disabled={guardando}
                        className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50">
                        {guardando ? "Procesando..." : "Confirmar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
ModalCancelar.propTypes = {
    onConfirmar: PropTypes.func.isRequired,
    onCancelar: PropTypes.func.isRequired,
    guardando: PropTypes.bool.isRequired,
};

function ModalPago({ onGuardar, onCancelar, guardando }) {
    const [form, setForm] = useState({ monto: "", metodo: "efectivo", banco: "", notas: "" });
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar pago</h3>
                <div className="space-y-3 mb-4">
                    <input type="number" placeholder="Monto *" value={form.monto}
                        onChange={e => setForm(p => ({ ...p, monto: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    <select value={form.metodo} onChange={e => setForm(p => ({ ...p, metodo: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                    </select>
                    <input type="text" placeholder="Banco (opcional)" value={form.banco}
                        onChange={e => setForm(p => ({ ...p, banco: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    <textarea placeholder="Notas..." value={form.notas}
                        onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancelar} disabled={guardando}
                        className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={() => onGuardar(form)} disabled={guardando || !form.monto}
                        className="flex-1 py-2 rounded-xl bg-[#F5A623] text-[#1A1A1A] font-semibold hover:bg-[#D4890A] hover:text-white disabled:opacity-50">
                        {guardando ? "Guardando..." : "Registrar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
ModalPago.propTypes = {
    onGuardar: PropTypes.func.isRequired,
    onCancelar: PropTypes.func.isRequired,
    guardando: PropTypes.bool.isRequired,
};

export default function DetalleReserva() {
    const { id } = useParams();
    const navegar = useNavigate();
    const { usuario } = useAuth();

    const puedeEditar = tienePermiso(usuario, "reservas", "editar");
    const puedeEliminar = tienePermiso(usuario, "reservas", "eliminar");

    const [reserva, setReserva] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [modalCancelar, setModalCancelar] = useState(false);
    const [modalPago, setModalPago] = useState(false);
    const [procesando, setProcesando] = useState(false);

    const cargar = () => {
        setCargando(true);
        reservaService.obtener(id)
            .then(res => setReserva(res.data))
            .catch(() => setError("Error al cargar la reserva."))
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargar(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleEliminar = async () => {
        if (!window.confirm("¿Eliminar esta reserva? Esta acción no se puede deshacer.")) return;
        try {
            await reservaService.eliminar(id);
            navegar("/reservas");
        } catch { alert("Error al eliminar la reserva."); }
    };

    const handleCancelar = async (data) => {
        setProcesando(true);
        try {
            await reservaService.cancelar(id, data);
            setModalCancelar(false);
            cargar();
        } catch { alert("Error al procesar la cancelación."); }
        finally { setProcesando(false); }
    };

    const handleAgregarPago = async (data) => {
        setProcesando(true);
        try {
            await reservaService.agregarPago(id, data);
            setModalPago(false);
            cargar();
        } catch { alert("Error al registrar el pago."); }
        finally { setProcesando(false); }
    };

    const handleEliminarPago = async (pagoId) => {
        if (!window.confirm("¿Eliminar este pago?")) return;
        try {
            await reservaService.eliminarPago(id, pagoId);
            cargar();
        } catch { alert("Error al eliminar el pago."); }
    };

    const handleCheckin = async () => {
        setProcesando(true);
        try {
            await reservaService.iniciarCheckin(id, {});
            cargar();
        } catch { alert("Error al realizar el check-in."); }
        finally { setProcesando(false); }
    };

    // ── NUEVO: confirmar reserva como completada ─────────────────────────────
    const handleConfirmarCompletada = async () => {
        setProcesando(true);
        try {
            await reservaService.confirmarCompletada(id);
            cargar();
        } catch { alert("Error al completar la reserva."); }
        finally { setProcesando(false); }
    };

    // ── NUEVO: actualizar costo de daños ─────────────────────────────────────
    const handleActualizarCostoDanio = async (data) => {
        setProcesando(true);
        try {
            await reservaService.actualizarCostoDanio(id, data);
            cargar();
        } catch { alert("Error al actualizar el costo de daños."); }
        finally { setProcesando(false); }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    if (cargando) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full" />
        </div>
    );
    if (error) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-red-500 text-sm">{error}</p>
        </div>
    );
    if (!reserva) return null;

    const totalPagado = Number(reserva.total_pagado);
    const saldoPendiente = Number(reserva.saldo_pendiente);

    return (
        <div className="p-6 max-w-4xl mx-auto">

            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navegar("/reservas")}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-[#1A1A1A]">Reserva #{reserva.id}</h1>
                            <BadgeEstado estado={reserva.estado} />
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {reserva.cliente_detalle?.nombre} · {reserva.propiedad_nombre}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {puedeEditar && ["pendiente", "en_curso", "completada"].includes(reserva.estado) && (
                        <button onClick={() => navegar(`/reservas/${id}/editar`)}
                            className="p-2 rounded-xl text-gray-500 hover:bg-yellow-50 hover:text-[#D4890A] transition-colors"
                            title="Editar">
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}
                    {puedeEditar && ["pendiente", "en_curso"].includes(reserva.estado) && (
                        <button onClick={() => setModalCancelar(true)}
                            className="px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                            Cancelar reserva
                        </button>
                    )}
                    {puedeEliminar && reserva.estado === "cancelada" && (
                        <button onClick={handleEliminar}
                            className="p-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Botones check-in / check-out / checklist */}
            {puedeEditar && (
                <div className="flex flex-wrap gap-3 mb-4">
                    {reserva.estado === "pendiente" && (
                        <button onClick={handleCheckin} disabled={procesando}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50">
                            <LogIn className="w-4 h-4" />Check-in
                        </button>
                    )}
                    {reserva.estado === "en_curso" && (
                        <>
                            <button onClick={() => navegar(`/reservas/${id}/checkout`)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors">
                                <LogOut className="w-4 h-4" />Check-out
                            </button>
                            <button onClick={() => navegar(`/reservas/${id}/checklist`)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors text-sm">
                                Ver checklist de inventario
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* NUEVO: aviso de checkout registrado + confirmar completada */}
            {puedeEditar && reserva.estado === "en_curso" && reserva.hora_salida_real && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-green-800">Check-out registrado</p>
                        <p className="text-xs text-green-600 mt-0.5">
                            Revisa pagos pendientes y daños antes de cerrar la reserva.
                        </p>
                    </div>
                    <button onClick={handleConfirmarCompletada} disabled={procesando}
                        className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold
                                   hover:bg-green-600 transition-colors disabled:opacity-50 ml-4 whitespace-nowrap">
                        {procesando ? "Procesando..." : "Marcar como completada"}
                    </button>
                </div>
            )}

            {/* Datos generales */}
            <Seccion titulo="Datos generales">
                <FilaDato label="Propiedad" valor={reserva.propiedad_nombre} />
                <FilaDato label="Temporada" valor={reserva.temporada_display} />
                <FilaDato label="Fecha inicio" valor={reserva.fecha_inicio} />
                <FilaDato label="Fecha fin" valor={reserva.fecha_fin} />
                <FilaDato label="Duración" valor={`${reserva.dias} día${reserva.dias !== 1 ? "s" : ""}`} />
                <FilaDato label="Hora entrada estimada" valor={reserva.hora_entrada_estimada} />
                <FilaDato label="Hora salida estimada" valor={reserva.hora_salida_estimada} />
                {reserva.hora_entrada_real && (
                    <FilaDato label="Check-in real"
                        valor={new Date(reserva.hora_entrada_real).toLocaleString("es-CO")} />
                )}
                {reserva.hora_salida_real && (
                    <FilaDato label="Check-out real"
                        valor={new Date(reserva.hora_salida_real).toLocaleString("es-CO")} />
                )}
                <FilaDato label="Asistentes"
                    valor={`${reserva.cant_asistentes} persona${reserva.cant_asistentes !== 1 ? "s" : ""}`} />
                <FilaDato label="Personas cobradas" valor={reserva.personas_cobradas} />
                {reserva.notas && <FilaDato label="Notas" valor={reserva.notas} />}
            </Seccion>

            {/* Cliente */}
            <Seccion titulo="Cliente">
                <FilaDato label="Nombre" valor={reserva.cliente_detalle?.nombre} />
                <FilaDato label="Teléfono" valor={reserva.cliente_detalle?.telefono} />
                <FilaDato label="Email" valor={reserva.cliente_detalle?.email} />
                <FilaDato label="Documento" valor={
                    reserva.cliente_detalle?.tipo_documento && reserva.cliente_detalle?.numero_documento
                        ? `${reserva.cliente_detalle.tipo_documento.toUpperCase()} ${reserva.cliente_detalle.numero_documento}`
                        : null
                } />
            </Seccion>

            {/* Resumen financiero */}
            <Seccion titulo="Resumen financiero">
                <FilaDato label="Precio calculado"
                    valor={reserva.precio_calculado
                        ? `$${Number(reserva.precio_calculado).toLocaleString("es-CO")}`
                        : "—"} />
                {reserva.precio_modificado_manualmente && (
                    <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg my-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Precio modificado manualmente
                    </div>
                )}
                <FilaDato label="Precio total"
                    valor={`$${Number(reserva.precio_total).toLocaleString("es-CO")}`} />
                <FilaDato label="Total pagado"
                    valor={`$${totalPagado.toLocaleString("es-CO")}`} />
                <FilaDato label="Saldo pendiente"
                    valor={`$${saldoPendiente.toLocaleString("es-CO")}`} />
            </Seccion>

            {/* Pagos */}
            <Seccion titulo="Pagos">
                {reserva.pagos?.length === 0 ? (
                    <p className="text-gray-400 text-sm">No hay pagos registrados.</p>
                ) : (
                    <div className="space-y-2 mb-4">
                        {reserva.pagos?.map(p => (
                            <div key={p.id}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border
                                    ${p.es_devolucion ? "border-red-100 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
                                <div>
                                    <p className={`text-sm font-medium ${p.es_devolucion ? "text-red-600" : "text-gray-800"}`}>
                                        {p.es_devolucion ? "- " : "+ "}
                                        ${Number(p.monto).toLocaleString("es-CO")}
                                        {p.es_devolucion && (
                                            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                Devolución
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {p.metodo_display} {p.banco ? `· ${p.banco}` : ""}
                                        · {new Date(p.fecha_pago).toLocaleDateString("es-CO")}
                                    </p>
                                </div>
                                {puedeEditar && !p.es_devolucion && reserva.estado !== "cancelada" && (
                                    <button onClick={() => handleEliminarPago(p.id)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {/* CAMBIO: permite pagos también en completada */}
                {puedeEditar && reserva.estado !== "cancelada" && (
                    <button onClick={() => setModalPago(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5A623] text-[#1A1A1A]
                                   font-semibold hover:bg-[#D4890A] hover:text-white transition-colors text-sm">
                        <Plus className="w-4 h-4" />Registrar pago
                    </button>
                )}
            </Seccion>

            {/* NUEVO: Resumen de daños con edición y botón cobrado */}
            {reserva.costo_danio && (
                <Seccion titulo="Resumen de daños">
                    <FilaDato label="Ítems dañados" valor={reserva.costo_danio.items_danados} />
                    <FilaDato label="Ítems perdidos" valor={reserva.costo_danio.items_perdidos} />
                    <FilaDato label="Ítems incompletos" valor={reserva.costo_danio.items_incompletos} />
                    <FilaDato label="Total calculado"
                        valor={`$${Number(reserva.costo_danio.total_calculado).toLocaleString("es-CO")}`} />

                    {/* Total a cobrar editable */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Total a cobrar</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={reserva.costo_danio.total_a_cobrar}
                            onBlur={e => handleActualizarCostoDanio({ total_a_cobrar: e.target.value })}
                            disabled={reserva.costo_danio.cobrado}
                            className="text-sm font-medium text-gray-800 text-right border-b border-dashed
                                       border-gray-300 focus:outline-none focus:border-[#F5A623] w-32
                                       disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                        />
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Estado cobro</span>
                        <span className={`text-sm font-medium ${reserva.costo_danio.cobrado ? "text-green-600" : "text-amber-600"}`}>
                            {reserva.costo_danio.cobrado ? "✅ Cobrado" : "⏳ Pendiente"}
                        </span>
                    </div>

                    {puedeEditar && !reserva.costo_danio.cobrado && (
                        <button
                            onClick={() => handleActualizarCostoDanio({ cobrado: true })}
                            disabled={procesando}
                            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5A623]
                                       text-[#1A1A1A] text-sm font-semibold hover:bg-[#D4890A] hover:text-white
                                       transition-colors disabled:opacity-50">
                            {procesando ? "Guardando..." : "Marcar daños como cobrados"}
                        </button>
                    )}
                </Seccion>
            )}

            {modalCancelar && (
                <ModalCancelar
                    onConfirmar={handleCancelar}
                    onCancelar={() => setModalCancelar(false)}
                    guardando={procesando}
                />
            )}
            {modalPago && (
                <ModalPago
                    onGuardar={handleAgregarPago}
                    onCancelar={() => setModalPago(false)}
                    guardando={procesando}
                />
            )}
        </div>
    );
}