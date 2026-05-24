import { BrowserRouter, Routes, Route } from "react-router-dom";
import InicioSesion from "../pages/inicioSesion";
import Panel from "../pages/panel";
import Layout from "../components/Layout";
import RutaProtegida from "../components/RutaProtegida";

import ListaUsuarios from "../pages/usuarios/ListaUsuarios";
import FormularioUsuarios from "../pages/usuarios/FormularioUsuarios";
import CambiarPassword from "../pages/usuarios/CambiarPassword";

import ListaPropiedades from "../pages/propiedades/ListaPropiedades";
import FormularioPropiedades from "../pages/propiedades/FormularioPropiedades";

import ListaClientes from "../pages/clientes/ListaClientes";
import FormularioClientes from "../pages/clientes/FormularioClientes";

import ListaInventario from "../pages/inventario/ListaInventario";
import FormularioInventario from "../pages/inventario/FormularioInventario";

import ListaReservas from "../pages/reservas/ListaReservas";
import FormularioReservas from "../pages/reservas/FormularioReservas";
import DetalleReserva from "../pages/reservas/DetalleReserva";
import ChecklistReserva from "../pages/reservas/ChecklistReserva";

function RutasApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioSesion />} />
        <Route path="/dashboard" element={<RutaProtegida><Layout><Panel /></Layout></RutaProtegida>}/>

        <Route path="/usuarios" element={<RutaProtegida><Layout><ListaUsuarios /></Layout></RutaProtegida>} />
        <Route path="/usuarios/nuevo" element={<RutaProtegida><Layout><FormularioUsuarios /></Layout></RutaProtegida>} />
        <Route path="/usuarios/:id/editar" element={<RutaProtegida><Layout><FormularioUsuarios /></Layout></RutaProtegida>} />
        <Route path="/usuarios/:id/password" element={<RutaProtegida><Layout><CambiarPassword /></Layout></RutaProtegida>} />

        <Route path="/propiedades" element={<RutaProtegida><Layout><ListaPropiedades /></Layout></RutaProtegida>} />
        <Route path="/propiedades/nueva" element={<RutaProtegida><Layout><FormularioPropiedades /></Layout></RutaProtegida>} />
        <Route path="/propiedades/:id/editar" element={<RutaProtegida><Layout><FormularioPropiedades /></Layout></RutaProtegida>} />

        <Route path="/clientes" element={<RutaProtegida><Layout><ListaClientes /></Layout></RutaProtegida>} />
        <Route path="/clientes/nuevo" element={<RutaProtegida><Layout><FormularioClientes /></Layout></RutaProtegida>} />
        <Route path="/clientes/:id/editar" element={<RutaProtegida><Layout><FormularioClientes /></Layout></RutaProtegida>} />

        <Route path="/inventario" element={<RutaProtegida><Layout><ListaInventario /></Layout></RutaProtegida>} />
        <Route path="/inventario/nuevo" element={<RutaProtegida><Layout><FormularioInventario /></Layout></RutaProtegida>} />
        <Route path="/inventario/:id/editar" element={<RutaProtegida><Layout><FormularioInventario /></Layout></RutaProtegida>} />

        <Route path="/reservas" element={<RutaProtegida><Layout><ListaReservas /></Layout></RutaProtegida>} />
        <Route path="/reservas/nueva" element={<RutaProtegida><Layout><FormularioReservas /></Layout></RutaProtegida>} />
        <Route path="/reservas/:id" element={<RutaProtegida><Layout><DetalleReserva /></Layout></RutaProtegida>} />
        <Route path="/reservas/:id/editar" element={<RutaProtegida><Layout><FormularioReservas /></Layout></RutaProtegida>} />
        <Route path="/reservas/:id/checklist" element={<RutaProtegida><Layout><ChecklistReserva /></Layout></RutaProtegida>} />
        <Route path="/reservas/:id/checkout" element={<RutaProtegida><Layout><ChecklistReserva /></Layout></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  );
}

export default RutasApp;