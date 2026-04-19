export const login = async (correo, contraseña) => {
  // Simulación temporal
  if (correo === "juan@test.com" && contraseña === "1234") {
    const fakeToken = "123456789";

    localStorage.setItem("token", fakeToken);

    return { success: true };
  }

  return { success: false };
};
