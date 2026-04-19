import { BrowserRouter, Routes, Route } from "react-router-dom";
import InicioSesion from "../paginas/inicioSesion";
import Dashboard from "../paginas/panel";

function RutasApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioSesion />} />
        <Route path="/panel" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RutasApp;