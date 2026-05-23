export function tienePermiso(usuario, modulo, accion) {
  if (!usuario) return false;
  if (usuario.rol === "propietario") return true;
  return usuario.permisos?.[`${modulo}_${accion}`] === true;
}

export function puedeGestionarUsuarios(usuario) {
  if (!usuario) return false;
  return usuario.rol === "propietario" || usuario.rol === "asistente";
}