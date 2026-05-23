import { BrowserRouter, Routes, Route } from "react-router-dom";
import InicioSesion from "../pages/inicioSesion";
import Panel from "../pages/panel";
import RutaProtegida from "../components/RutaProtegida";
import Clientes from "../pages/Clientes";
import Propiedades from "../pages/Propiedades";

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
          path="/clientes"
          element={
            <RutaProtegida>
              <Clientes />
            </RutaProtegida>
          }
        />

        <Route
          path="/propiedades"
          element={
            <RutaProtegida>
              <Propiedades />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default RutasApp;