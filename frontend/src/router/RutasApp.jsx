import { BrowserRouter, Routes, Route } from "react-router-dom";
import InicioSesion from "../pages/inicioSesion";
import Panel from "../pages/panel";
import RutaProtegida from "../components/RutaProtegida";

import ListaUsuarios from "../pages/usuarios/ListaUsuarios";
import FormularioUsuarios from "../pages/usuarios/FormularioUsuarios";
import CambiarPassword from "../pages/usuarios/CambiarPassword";
import ListaPropiedades from "../pages/propiedades/ListaPropiedades";
import FormularioPropiedades from "../pages/propiedades/FormularioPropiedades";
import Clientes from "../pages/Clientes";

function RutasApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioSesion />} />

        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Panel />
            </RutaProtegida>
          }
        />
        <Route 
          path="/usuarios" 
          element={
            <RutaProtegida>
              <ListaUsuarios />
            </RutaProtegida>
          } 
        />

        <Route 
          path="/usuarios/nuevo" 
          element={
            <RutaProtegida>
              <FormularioUsuarios />
            </RutaProtegida>
          } 
        />

        <Route 
          path="/usuarios/:id/editar" 
          element={
            <RutaProtegida>
              <FormularioUsuarios />
            </RutaProtegida>
          } 
        />

        <Route
          path="/usuarios/:id/password"
          element={
            <RutaProtegida>
              <CambiarPassword />
            </RutaProtegida>
          }
        />

        <Route path="/propiedades" 
          element={
            <RutaProtegida>
              <ListaPropiedades />
            </RutaProtegida>
          }
        />

        <Route path="/propiedades/nueva" 
          element={
            <RutaProtegida>
              <FormularioPropiedades />
            </RutaProtegida>
          } 
        />

        <Route path="/propiedades/:id/editar" 
          element={
            <RutaProtegida>
              <FormularioPropiedades />
            </RutaProtegida>
          }
        />

        <Route
          path="/clientes"
          element={
            <RutaProtegida>
              <Clientes />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default RutasApp;