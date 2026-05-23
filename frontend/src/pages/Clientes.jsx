import { useEffect, useState } from 'react';
import clienteService from '../services/clienteService';

const camposVacios = {
  nombre: '', telefono: '', email: '',
  tipo_documento: '', numero_documento: ''
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(camposVacios);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  const cargarClientes = async () => {
    const res = await clienteService.listar();
    setClientes(res.data);
  };

  useEffect(() => { cargarClientes(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.telefono) {
      setError('Nombre y teléfono son obligatorios');
      return;
    }
    setError('');
    if (editandoId) {
      await clienteService.actualizar(editandoId, form);
      setEditandoId(null);
    } else {
      await clienteService.crear(form);
    }
    setForm(camposVacios);
    cargarClientes();
  };

  const handleEditar = (cliente) => {
    setEditandoId(cliente.id);
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email || '',
      tipo_documento: cliente.tipo_documento || '',
      numero_documento: cliente.numero_documento || '',
    });
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este cliente?')) {
      await clienteService.eliminar(id);
      cargarClientes();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-yellow-500 mb-6">Gestión de Clientes</h1>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editandoId ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'nombre', placeholder: 'Nombre completo' },
            { name: 'telefono', placeholder: 'Teléfono' },
            { name: 'email', placeholder: 'Email' },
            { name: 'tipo_documento', placeholder: 'Tipo documento' },
            { name: 'numero_documento', placeholder: 'Número documento' },
          ].map(({ name, placeholder }) => (
            <input
              key={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSubmit}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm"
          >
            {editandoId ? 'Actualizar' : 'Crear Cliente'}
          </button>
          {editandoId && (
            <button
              onClick={() => { setEditandoId(null); setForm(camposVacios); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
            >
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
              {['Nombre', 'Teléfono', 'Email', 'Documento', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No hay clientes registrados
                </td>
              </tr>
            ) : (
              clientes.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{c.nombre}</td>
                  <td className="px-4 py-3">{c.telefono}</td>
                  <td className="px-4 py-3">{c.email || '-'}</td>
                  <td className="px-4 py-3">{c.tipo_documento} {c.numero_documento}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEditar(c)}
                      className="text-blue-500 hover:underline text-xs"
                    >Editar</button>
                    <button
                      onClick={() => handleEliminar(c.id)}
                      className="text-red-500 hover:underline text-xs"
                    >Eliminar</button>
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