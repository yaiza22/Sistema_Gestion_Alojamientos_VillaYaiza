import { useState } from "react";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login data:", { correo, contraseña });

    // Aquí luego conectamos con Django
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Iniciar sesión
        </h2>

        <input
          type="email"
          placeholder="Correo"
          className="w-full p-2 mb-3 border rounded"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 mb-3 border rounded"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;