import { useEffect, useState } from 'react';
import propiedadService from '../services/propiedadService';

const camposVacios = {
  nombre: '', tipo: '', descripcion: '', capacidad: '',
  ubicacion: '', precio_base_por_dia: '', precio_temporada_baja: '',
  precio_temporada_alta: '', esta_activa: true
};

export default function Propiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [form, setForm] = useState(camposVacios);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  const cargarPropiedades = async () => {
    const res = await propiedadService.listar();
    setPropiedades(res.data);
  };

  useEffect(() => { cargarPropiedades(); }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.tipo || !form.capacidad || !form.precio_base_por_dia) {
      setError('Nombre, tipo, capacidad y precio base son obligatorios');
      return;
    }
    setError('');
    if (editandoId) {
      await propiedadService.actualizar(editandoId, form);
      setEditandoId(null);
    } else {
      await propiedadService.crear(form);
    }
    setForm(camposVacios);
    cargarPropiedades();
  };

  const handleEditar = (p) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre, tipo: p.tipo, descripcion: p.descripcion || '',
      capacidad: p.capacidad, ubicacion: p.ubicacion || '',
      precio_base_por_dia: p.precio_base_por_dia,
      precio_temporada_baja: p.precio_temporada_baja || '',
      precio_temporada_alta: p.precio_temporada_alta || '',
      esta_activa: p.esta_activa
    });
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Seguro que deseas eliminar esta propiedad?')) {
      await propiedadService.eliminar(id);
      cargarPropiedades();
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-yellow-500 mb-6">Gestión de Propiedades</h1>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editandoId ? 'Editar Propiedad' : 'Nueva Propiedad'}
        </h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <select name="tipo" value={form.tipo} onChange={handleChange} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">Tipo de propiedad</option>
            <option value="finca">Finca</option>
            <option value="apartamento">Apartamento</option>
            <option value="cabaña">Cabaña</option>
          </select>
          <input name="capacidad" value={form.capacidad} onChange={handleChange} placeholder="Capacidad" type="number" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ubicación" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <input name="precio_base_por_dia" value={form.precio_base_por_dia} onChange={handleChange} placeholder="Precio base por día" type="number" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <input name="precio_temporada_baja" value={form.precio_temporada_baja} onChange={handleChange} placeholder="Precio temporada baja" type="number" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <input name="precio_temporada_alta" value={form.precio_temporada_alta} onChange={handleChange} placeholder="Precio temporada alta" type="number" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-2" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="esta_activa" checked={form.esta_activa} onChange={handleChange} />
            Propiedad activa
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={handleSubmit} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm">
            {editandoId ? 'Actualizar' : 'Crear Propiedad'}
          </button>
          {editandoId && (
            <button onClick={() => { setEditandoId(null); setForm(camposVacios); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-yellow-500 text-white">
            <tr>
              {['Nombre', 'Tipo', 'Capacidad', 'Ubicación', 'Precio base', 'Activa', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {propiedades.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-6 text-gray-400">No hay propiedades registradas</td></tr>
            ) : (
              propiedades.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{p.nombre}</td>
                  <td className="px-4 py-3">{p.tipo}</td>
                  <td className="px-4 py-3">{p.capacidad}</td>
                  <td className="px-4 py-3">{p.ubicacion || '-'}</td>
                  <td className="px-4 py-3">${p.precio_base_por_dia}</td>
                  <td className="px-4 py-3">{p.esta_activa ? '✅' : '❌'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEditar(p)} className="text-blue-500 hover:underline text-xs">Editar</button>
                    <button onClick={() => handleEliminar(p.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}