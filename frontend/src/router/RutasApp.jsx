import { BrowserRouter, Routes, Route } from "react-router-dom";
import InicioSesion from "../pages/inicioSesion";
import Panel from "../pages/panel";
import RutaProtegida from "../components/RutaProtegida";

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
      </Routes>
    </BrowserRouter>
  );
}

export default RutasApp;