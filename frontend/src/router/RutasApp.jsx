import { BrowserRouter, Routes, Route } from "react-router-dom";
import InicioSesion from "../pages/inicioSesion";
import Panel from "../pages/panel";
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

        <Route path="/dashboard" element={<RutaProtegida><Panel /></RutaProtegida>}/>

        <Route path="/usuarios" element={<RutaProtegida><ListaUsuarios /></RutaProtegida>}/>
        <Route path="/usuarios/nuevo" element={<RutaProtegida><FormularioUsuarios /></RutaProtegida>}/>
        <Route path="/usuarios/:id/editar" element={<RutaProtegida><FormularioUsuarios /></RutaProtegida>}/>
        <Route path="/usuarios/:id/password" element={<RutaProtegida><CambiarPassword /></RutaProtegida>}/>

        <Route path="/propiedades" element={<RutaProtegida><ListaPropiedades /></RutaProtegida>}/>
        <Route path="/propiedades/nueva" element={<RutaProtegida><FormularioPropiedades /></RutaProtegida>}/>
        <Route path="/propiedades/:id/editar" element={<RutaProtegida><FormularioPropiedades /></RutaProtegida>}/>

        <Route path="/clientes" element={<RutaProtegida><ListaClientes /></RutaProtegida>}/>
        <Route path="/clientes/nuevo" element={<RutaProtegida><FormularioClientes /></RutaProtegida>}/>
        <Route path="/clientes/:id/editar" element={<RutaProtegida><FormularioClientes /></RutaProtegida>}/>

        <Route path="/inventario" element={<RutaProtegida><ListaInventario /></RutaProtegida>}/>
        <Route path="/inventario/nuevo" element={<RutaProtegida><FormularioInventario /></RutaProtegida>}/>
        <Route path="/inventario/:id/editar" element={<RutaProtegida><FormularioInventario /></RutaProtegida>}/>

        <Route path="/reservas" element={<RutaProtegida><ListaReservas /></RutaProtegida>} />
        <Route path="/reservas/nueva" element={<RutaProtegida><FormularioReservas /></RutaProtegida>} />
        <Route path="/reservas/:id" element={<RutaProtegida><DetalleReserva /></RutaProtegida>} />
        <Route path="/reservas/:id/editar" element={<RutaProtegida><FormularioReservas /></RutaProtegida>} />
        <Route path="/reservas/:id/checklist" element={<RutaProtegida><ChecklistReserva /></RutaProtegida>} />
        <Route path="/reservas/:id/checkout" element={<RutaProtegida><ChecklistReserva /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  );
}

export default RutasApp;