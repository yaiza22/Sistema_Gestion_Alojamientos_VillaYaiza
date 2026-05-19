import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

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