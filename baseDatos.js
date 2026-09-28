const CLAVE_USUARIOS = 'jdc_usuarios';
const CLAVE_SESION = 'jdc_sesion';

function obtenerUsuarios() {
  const datos = localStorage.getItem(CLAVE_USUARIOS);

  if (datos === null) {
    const inicial = [
      { nick: 'maria', email: 'maria@gmail.com', password: 'Maria1234' }
    ];
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(inicial));
    return inicial;
  }

  return JSON.parse(datos);
}

function guardarUsuarios(lista) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
}

function buscarPorEmail(email) {
  const buscado = email.trim().toLowerCase();
  return obtenerUsuarios().find(u => u.email === buscado) || null;
}

function buscarPorNick(nick) {
  const buscado = nick.trim().toLowerCase();
  return obtenerUsuarios().find(u => u.nick.toLowerCase() === buscado) || null;
}

function registrarUsuario(nick, email, password) {
  if (buscarPorEmail(email)) return 'email-repetido';
  if (buscarPorNick(nick)) return 'nick-repetido';

  const lista = obtenerUsuarios();
  lista.push({
    nick: nick.trim(),
    email: email.trim().toLowerCase(),
    password: password
  });
  guardarUsuarios(lista);
  return 'ok';
}

function comprobarLogin(email, password) {
  const usuario = buscarPorEmail(email);
  if (usuario && usuario.password === password) return usuario;
  return null;
}

function guardarSesion(nick) {
  sessionStorage.setItem(CLAVE_SESION, nick);
}

function nickDeLaSesion() {
  return sessionStorage.getItem(CLAVE_SESION);
}

function haySesion() {
  return nickDeLaSesion() !== null;
}

function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}