import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, LogOut } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { tienePermiso } from "../../utils/permisos";
import reservaService from "../../services/reservaService";

const ESTADOS_ITEM = [
    { value: "bien", label: "En buen estado" },
    { value: "danado", label: "Dañado" },
    { value: "perdido", label: "Perdido" },
    { value: "incompleto", label: "Incompleto" },
];

function ItemChecklist({ item, esCheckout, onActualizar }) {
    const [form, setForm] = useState({
        incluido_en_checkin: item.incluido_en_checkin,
        estado_entrada: item.estado_entrada || "bien",
        cantidad_entregada: item.cantidad_entregada || item.item_cantidad_total || 1,
        notas_entrada: item.notas_entrada || "",
        revisado_en_checkout: item.revisado_en_checkout,
        estado_salida: item.estado_salida || "bien",
        cantidad_devuelta: item.cantidad_devuelta || item.cantidad_entregada || 1,
        notas_salida: item.notas_salida || "",
        tiene_costo: item.tiene_costo,
        costo_a_cobrar: item.costo_a_cobrar || "",
    });
    const [guardando, setGuardando] = useState(false);

    const guardar = async () => {
        setGuardando(true);
        try { await onActualizar(item.id, form); }
        finally { setGuardando(false); }
    };

    return (
        <div className={`bg-white rounded-xl border p-4 ${form.incluido_en_checkin ? "border-[#F5A623]/40" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="font-medium text-gray-900 text-sm">{item.item_nombre}</p>
                    <p className="text-xs text-gray-400">{item.item_categoria} · {item.item_cantidad_total} disponibles</p>
                </div>
                {!esCheckout && (
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.incluido_en_checkin}
                            onChange={e => setForm(p => ({ ...p, incluido_en_checkin: e.target.checked }))}
                            className="w-4 h-4 accent-yellow-500" />
                        <span className="text-xs text-gray-600">Incluir</span>
                    </label>
                )}
            </div>

            {(!esCheckout && form.incluido_en_checkin) && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Estado entrada</label>
                        <select value={form.estado_entrada} onChange={e => setForm(p => ({ ...p, estado_entrada: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                            {ESTADOS_ITEM.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad entregada</label>
                        <input type="number" min="0" value={form.cantidad_entregada}
                            onChange={e => setForm(p => ({ ...p, cantidad_entregada: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
                        <input type="text" value={form.notas_entrada} onChange={e => setForm(p => ({ ...p, notas_entrada: e.target.value }))}
                            placeholder="Observaciones..." className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    </div>
                </div>
            )}

            {(esCheckout && item.incluido_en_checkin) && (
                <div className="space-y-3 mb-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Estado salida</label>
                            <select value={form.estado_salida} onChange={e => setForm(p => ({ ...p, estado_salida: e.target.value }))}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
                                {ESTADOS_ITEM.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad devuelta</label>
                            <input type="number" min="0" value={form.cantidad_devuelta}
                                onChange={e => setForm(p => ({ ...p, cantidad_devuelta: e.target.value }))}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        </div>
                    </div>
                    <input type="text" value={form.notas_salida} onChange={e => setForm(p => ({ ...p, notas_salida: e.target.value }))}
                        placeholder="Notas de salida..." className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400" />

                    {["danado", "perdido", "incompleto"].includes(form.estado_salida) && (
                        <div className="space-y-2 bg-red-50 rounded-lg p-3">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-red-700">
                                <input type="checkbox" checked={form.tiene_costo} onChange={e => setForm(p => ({ ...p, tiene_costo: e.target.checked }))} className="w-3.5 h-3.5 accent-red-500" />
                                Cobrar por este ítem
                            </label>
                            {form.tiene_costo && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Costo unitario de referencia: ${item.item_costo_unitario ? Number(item.item_costo_unitario).toLocaleString("es-CO") : "—"}</p>
                                    <input type="number" min="0" step="0.01" value={form.costo_a_cobrar}
                                        onChange={e => setForm(p => ({ ...p, costo_a_cobrar: e.target.value }))}
                                        placeholder="Monto a cobrar"
                                        className="w-full px-3 py-1.5 border border-red-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-300" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {((form.incluido_en_checkin && !esCheckout) || (item.incluido_en_checkin && esCheckout)) && (
                <button onClick={guardar} disabled={guardando}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#1A1A1A] text-xs font-semibold hover:bg-[#D4890A] hover:text-white transition-colors disabled:opacity-50">
                    <Save className="w-3 h-3" />{guardando ? "Guardando..." : "Guardar"}
                </button>
            )}
        </div>
    );
}
ItemChecklist.propTypes = {
    item: PropTypes.object.isRequired,
    esCheckout: PropTypes.bool.isRequired,
    onActualizar: PropTypes.func.isRequired,
};

export default function ChecklistReserva() {
    const { id } = useParams();
    const navegar = useNavigate();
    const { usuario } = useAuth();
    const esCheckout = window.location.pathname.includes("checkout");

    const puedeEditar = tienePermiso(usuario, "reservas", "editar");

    const [reserva, setReserva] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        if (!puedeEditar) { navegar("/reservas"); return; }
        reservaService.obtener(id)
            .then(res => setReserva(res.data))
            .catch(() => navegar("/reservas"))
            .finally(() => setCargando(false));
    }, [id, puedeEditar, navegar]);

    const actualizarItem = async (itemId, data) => {
        await reservaService.actualizarChecklist(id, itemId, data);
        const res = await reservaService.obtener(id);
        setReserva(res.data);
    };

    const confirmarCheckout = async () => {
        if (!window.confirm(
            "¿Confirmar el check-out?\n\n" +
            "Se registrará la hora de salida. " +
            "Podrás revisar pagos y daños antes de cerrar la reserva."
        )) return;

        setProcesando(true);
        try {
            await reservaService.iniciarCheckout(id, {});
            navegar(`/reservas/${id}`);
        } catch { alert("Error al confirmar el check-out."); }
        finally { setProcesando(false); }
    };

    if (cargando) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full" /></div>;
    if (!reserva) return null;

    const itemsChecklist = reserva.checklist || [];
    const itemsConCosto = itemsChecklist.filter(i => i.tiene_costo && i.costo_a_cobrar);
    const totalDanios = itemsConCosto.reduce((sum, i) => sum + Number(i.costo_a_cobrar), 0);

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navegar(`/reservas/${id}`)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">{esCheckout ? "Check-out" : "Check-in"} — Reserva #{id}</h1>
                    <p className="text-gray-500 text-sm mt-0.5">{reserva.propiedad_nombre} · {reserva.cliente_detalle?.nombre}</p>
                </div>
            </div>

            {!esCheckout && (
                <div className="bg-[#FFFBEB] border border-[#F5A623]/30 rounded-xl px-4 py-3 mb-6 text-sm text-[#D4890A]">
                    Selecciona los ítems que aplican para esta reserva y registra su estado de entrada.
                </div>
            )}

            {esCheckout && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
                    Revisa el estado de cada ítem al finalizar la reserva. Marca daños o pérdidas para generar el resumen de costos.
                </div>
            )}

            <div className="space-y-3 mb-6">
                {itemsChecklist.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No hay ítems en el checklist.</p>
                ) : (
                    itemsChecklist.map(item => (
                        <ItemChecklist key={item.id} item={item} esCheckout={esCheckout} onActualizar={actualizarItem} />
                    ))
                )}
            </div>

            {esCheckout && itemsConCosto.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-3">Resumen de costos</h2>
                    {itemsConCosto.map(i => (
                        <div key={i.id} className="flex justify-between py-1.5 text-sm">
                            <span className="text-gray-600">{i.item_nombre}</span>
                            <span className="font-medium text-red-600">${Number(i.costo_a_cobrar).toLocaleString("es-CO")}</span>
                        </div>
                    ))}
                    <div className="flex justify-between py-2 border-t border-gray-100 mt-2 font-semibold">
                        <span>Total daños</span>
                        <span className="text-red-600">${totalDanios.toLocaleString("es-CO")}</span>
                    </div>
                </div>
            )}

            {esCheckout && (
                <div className="flex justify-end">
                    <button onClick={confirmarCheckout} disabled={procesando}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors disabled:opacity-50">
                        <LogOut className="w-4 h-4" />{procesando ? "Procesando..." : "Confirmar check-out"}
                    </button>
                </div>
            )}
        </div>
    );
}