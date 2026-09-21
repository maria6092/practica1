// bd.js
// Base de datos de usuarios de juegosdechicas.com
// Usa localStorage, así que los datos se guardan en el navegador
// y no hace falta ningún servidor.
//
// Cada usuario es un objeto: { nick, email, password }

const CLAVE_USUARIOS = 'jdc_usuarios';
const CLAVE_SESION = 'jdc_sesion';

// Devuelve la lista de usuarios. Si la base de datos no existe todavía
// la crea con un usuario de prueba.
function obtenerUsuarios() {
  try {
    const datos = localStorage.getItem(CLAVE_USUARIOS);

    if (datos === null) {
      const inicial = [
        { nick: 'maria', email: 'maria@gmail.com', password: 'Maria1234' }
      ];
      localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(inicial));
      return inicial;
    }

    return JSON.parse(datos);
  } catch (e) {
    return [];
  }
}

// Guarda la lista completa. Devuelve true si ha ido bien.
function guardarUsuarios(lista) {
  try {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
    return true;
  } catch (e) {
    return false;
  }
}

function buscarPorEmail(email) {
  const buscado = email.trim().toLowerCase();
  return obtenerUsuarios().find((u) => u.email === buscado) || null;
}

function buscarPorNick(nick) {
  const buscado = nick.trim().toLowerCase();
  return obtenerUsuarios().find((u) => u.nick.toLowerCase() === buscado) || null;
}

// Añade un usuario nuevo. Devuelve: 'ok', 'email-repetido', 'nick-repetido' o 'error'
function registrarUsuario(nick, email, password) {
  if (buscarPorEmail(email)) return 'email-repetido';
  if (buscarPorNick(nick)) return 'nick-repetido';

  const lista = obtenerUsuarios();
  lista.push({
    nick: nick.trim(),
    email: email.trim().toLowerCase(),
    password: password
  });

  return guardarUsuarios(lista) ? 'ok' : 'error';
}

// Devuelve el usuario si el email y la contraseña son correctos, o null
function comprobarLogin(email, password) {
  const usuario = buscarPorEmail(email);
  if (usuario && usuario.password === password) return usuario;
  return null;
}

/* ---------- Sesión (se borra al cerrar la pestaña) ---------- */

function guardarSesion(nick) {
  try { sessionStorage.setItem(CLAVE_SESION, nick); } catch (e) { /* nada */ }
}

function nickDeLaSesion() {
  try { return sessionStorage.getItem(CLAVE_SESION); } catch (e) { return null; }
}

function haySesion() {
  return nickDeLaSesion() !== null;
}

function cerrarSesion() {
  try { sessionStorage.removeItem(CLAVE_SESION); } catch (e) { /* nada */ }
}