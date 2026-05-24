export function calcularPrecio({
    precioBase,           // precio_base_por_dia de la propiedad
    precioTemporadaAlta,  // precio_temporada_alta de la propiedad
    precioTemporadaBaja,  // precio_temporada_baja de la propiedad
    capacidadMaxima,      // capacidad de la propiedad
    cantAsistentes,       // cant_asistentes ingresados
    dias,                 // número de días de la reserva
    temporada,            // 'alta' | 'baja'
    cobrarCapacidadTotal, // boolean — solo temporada alta
    descuentoTipo,        // 'porcentaje' | 'valor' | null
    descuentoValor,       // número
}) {
    if (!precioBase || !cantAsistentes || !dias || !temporada) return null;

    let precioPorPersona = Number(precioBase);
    if (temporada === 'alta' && precioTemporadaAlta) {
        precioPorPersona = Number(precioTemporadaAlta);
    } else if (temporada === 'baja' && precioTemporadaBaja) {
        precioPorPersona = Number(precioTemporadaBaja);
    }
    
    let personasCobradas = Number(cantAsistentes);
    if (temporada === 'alta' && cobrarCapacidadTotal) {
        personasCobradas = Number(capacidadMaxima);
    } else if (temporada === 'baja') {
        const UMBRAL_MINIMO = 20;
        personasCobradas = Math.max(personasCobradas, UMBRAL_MINIMO);
    }
    
    const subtotal = precioPorPersona * personasCobradas * dias;

    let montoDescuento = 0;
    if (descuentoTipo && descuentoValor && temporada !== 'alta') {
        if (descuentoTipo === 'porcentaje') {
            montoDescuento = subtotal * (Number(descuentoValor) / 100);
        } else {
            montoDescuento = Number(descuentoValor);
        }
    }

    const total = Math.max(0, subtotal - montoDescuento);

    return {
        precioPorPersona,
        personasCobradas,
        subtotal,
        montoDescuento,
        total,
        desglose: [
            `${precioPorPersona.toLocaleString("es-CO")} × ${personasCobradas} personas × ${dias} días = $${subtotal.toLocaleString("es-CO")}`,
            montoDescuento > 0 ? `Descuento: -$${montoDescuento.toLocaleString("es-CO")}` : null,
            `Total: $${total.toLocaleString("es-CO")}`,
        ].filter(Boolean),
    };
}