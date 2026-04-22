import { BrowserRouter, Routes, Route } from "react-router-dom";
import InicioSesion from "../paginas/inicioSesion";
import Panel from "../paginas/panel";
import RutaProtegida from "../proteccion/RutaProtegida";

function RutasApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioSesion />} />

        <Route
          path="/panel"
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