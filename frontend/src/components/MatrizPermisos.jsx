import PropTypes from "prop-types";

const MODULOS = [
    { key: "reservas", label: "Reservas" },
    { key: "clientes", label: "Clientes" },
    { key: "propiedades", label: "Propiedades" },
    { key: "inventario", label: "Inventario" },
    { key: "reportes", label: "Reportes" },
    { key: "contratos", label: "Contratos" },
    { key: "usuarios", label: "Usuarios del sistema" },
];

const ACCIONES = [
    { key: "ver", label: "Ver" },
    { key: "crear", label: "Crear" },
    { key: "editar", label: "Editar" },
    { key: "eliminar", label: "Eliminar" },
];

MatrizPermisos.propTypes = {
    permisos: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    deshabilitado: PropTypes.bool,
};

export default function MatrizPermisos({ permisos, onChange, deshabilitado }) {
  // Si se activa crear/editar/eliminar, activa ver automáticamente
  // Si se desactiva ver, desactiva todo el módulo
    const manejarCambioInteligente = (modulo, accion) => {
        const campo = `${modulo}_${accion}`;
        const valorActual = permisos[campo];
        let nuevosPermisos = { ...permisos };

        if (accion === "ver" && valorActual) {
            // Desactivar ver → desactiva todo el módulo
            ACCIONES.forEach(a => {
                nuevosPermisos[`${modulo}_${a.key}`] = false;
            });
        } else if (accion !== "ver" && !valorActual) {
            // Activar crear/editar/eliminar → activa ver también
            nuevosPermisos[campo] = true;
            nuevosPermisos[`${modulo}_ver`] = true;
        } else {
            nuevosPermisos[campo] = !valorActual;
        }

        onChange(nuevosPermisos);
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-[#FFFBEB]">
                    <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 w-40">Módulo</th>
                        {ACCIONES.map(a => (
                            <th key={a.key} className="text-center px-3 py-3 font-semibold text-gray-700">{a.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {MODULOS.map(modulo => (
                        <tr key={modulo.key} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">
                                {modulo.label}
                            </td>
                            {ACCIONES.map(accion => (
                                <td key={accion.key} className="px-3 py-3 text-center">
                                    <input
                                        type="checkbox"
                                        checked={!!permisos[`${modulo.key}_${accion.key}`]}
                                        onChange={() => manejarCambioInteligente(modulo.key, accion.key)}
                                        disabled={deshabilitado}
                                        className="w-4 h-4 accent-yellow-500 disabled:cursor-not-allowed"/>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}