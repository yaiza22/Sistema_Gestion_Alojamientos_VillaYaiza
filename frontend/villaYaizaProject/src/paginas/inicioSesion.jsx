import { useState } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

function InicioSesion() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await login(correo, contraseña);

    if (response.success) {
      navigate("/panel");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={contraseña}
        onChange={(e) => setContraseña(e.target.value)}
      />

      <button type="submit">Entrar</button>
    </form>
  );
}

export default InicioSesion;