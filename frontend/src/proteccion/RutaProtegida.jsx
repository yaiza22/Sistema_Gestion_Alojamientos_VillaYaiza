import { Navigate } from "react-router-dom";

function RutaProtegida({ children }) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}

export default RutaProtegida;