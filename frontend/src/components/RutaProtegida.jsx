import { Navigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

import { useAuth } from "../hooks/useAuth";

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  // Mientras verifica el token no renderiza nada
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
        <div className="animate-spin w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/" />;
  }

  return children;
}

RutaProtegida.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RutaProtegida;

/*
function RutaProtegida({ children }) {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    const decoded = jwtDecode(token);
    const ahora = Date.now() / 1000;
    if (decoded.exp < ahora) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      return <Navigate to="/" />;
    }
  } catch {
    return <Navigate to="/" />;
  }

  return children;
}

RutaProtegida.propTypes = {
  children: PropTypes.node,
};

export default RutaProtegida;
*/