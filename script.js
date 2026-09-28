'use strict';

const PAGINA_LOGIN = 'index.html';
const PAGINA_RESULTADOS = 'resultados.html';

const CLAVE_VISITAS = 'jdc_visitas';
const CLAVE_VISITA_SESION = 'jdc_visita_contada';

const REQUISITOS = [
  { id: 'longitud', texto: 'mínimo 8 caracteres', cumple: v => v.length >= 8 },
  { id: 'mayuscula', texto: 'una mayúscula', cumple: v => /[A-ZÁÉÍÓÚÑÜ]/.test(v) },
  { id: 'minuscula', texto: 'una minúscula', cumple: v => /[a-záéíóúñü]/.test(v) },
  { id: 'numero', texto: 'un número', cumple: v => /[0-9]/.test(v) }
];

function validarNick(valor) {
  const nick = valor.trim();
  if (nick === '') return 'Escribe un nombre de usuario.';
  if (nick.length < 3) return 'El usuario necesita 3 caracteres como mínimo.';
  if (nick.length > 16) return 'El usuario puede tener 16 caracteres como máximo.';
  if (!/^[A-Za-z0-9_]+$/.test(nick)) return 'Solo se permiten letras, números y guiones bajos.';
  return '';
}

function validarEmail(valor) {
  const email = valor.trim();
  if (email === '') return 'Escribe tu email.';
  if (!email.includes('@') || !email.includes('.')) return 'El email no es válido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'El formato del email no es válido.';
  return '';
}

function validarPassword(valor) {
  if (valor === '') return 'Escribe tu contraseña.';
  const faltan = REQUISITOS.filter(r => !r.cumple(valor)).map(r => r.texto);
  if (faltan.length === 0) return '';
  return 'La contraseña necesita ' + faltan.join(', ') + '.';
}

function validarRepetir(password, repetida) {
  if (repetida === '') return 'Repite la contraseña.';
  if (password !== repetida) return 'Las contraseñas no coinciden.';
  return '';
}

function marcarCampo(idCampo, estado, mensaje) {
  const campo = document.getElementById(idCampo);
  const error = campo.querySelector('.mensaje-error');

  campo.classList.remove('campo-error', 'campo-ok');
  error.textContent = '';

  if (estado === 'error') {
    campo.classList.add('campo-error');
    error.textContent = mensaje;
  } else if (estado === 'ok') {
    campo.classList.add('campo-ok');
  }
}

function mostrarGeneral(tipo, texto) {
  const caja = document.getElementById('mensaje-general');
  caja.hidden = false;
  caja.className = 'mensaje-general mensaje-general-' + tipo;
  caja.textContent = texto;
}

function ocultarGeneral() {
  const caja = document.getElementById('mensaje-general');
  caja.hidden = true;
}

function iniciarBotonesVer() {
  document.querySelectorAll('.ver-password').forEach(boton => {
    const input = boton.previousElementSibling;
    boton.addEventListener('click', () => {
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      boton.textContent = visible ? 'Mostrar' : 'Ocultar';
    });
  });
}

function iniciarLogin() {
  const form = document.getElementById('form-login');
  if (!form) return;

  const inputEmail = document.getElementById('email');
  const inputPassword = document.getElementById('password');
  const botonLogin = document.getElementById('btn-login');

  inputEmail.addEventListener('input', () => {
    marcarCampo('campo-email', 'neutro');
    ocultarGeneral();
  });

  inputPassword.addEventListener('input', () => {
    marcarCampo('campo-password', 'neutro');
    ocultarGeneral();
  });

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    ocultarGeneral();

    const email = inputEmail.value.trim();
    const password = inputPassword.value;

    const errorEmail = validarEmail(email);
    const errorPassword = password === '' ? 'Escribe tu contraseña.' : '';

    marcarCampo('campo-email', errorEmail ? 'error' : 'neutro', errorEmail);
    marcarCampo('campo-password', errorPassword ? 'error' : 'neutro', errorPassword);

    if (errorEmail || errorPassword) {
      mostrarGeneral('error', 'Revisa los campos marcados antes de continuar.');
      return;
    }

    const usuario = comprobarLogin(email, password);

    if (!usuario) {
      mostrarGeneral('error', 'Email o contraseña incorrectos. ¿Todavía no tienes cuenta? Regístrate abajo.');
      return;
    }

    guardarSesion(usuario.nick);
    mostrarGeneral('ok', 'Datos correctos. Entrando al Top 8...');
    botonLogin.disabled = true;
    setTimeout(() => { window.location.href = PAGINA_RESULTADOS; }, 900);
  });
}

function iniciarRegistro() {
  const form = document.getElementById('form-registro');
  if (!form) return;

  const inputNick = document.getElementById('nick');
  const inputEmail = document.getElementById('email');
  const inputPassword = document.getElementById('password');
  const inputRepetir = document.getElementById('repetir');
  const botonRegistro = document.getElementById('btn-registro');
  const itemsRequisitos = document.querySelectorAll('[data-requisito]');

  function pintarChecklist() {
    const valor = inputPassword.value;
    itemsRequisitos.forEach(li => {
      const requisito = REQUISITOS.find(r => r.id === li.dataset.requisito);
      li.classList.toggle('cumple', requisito.cumple(valor));
    });
  }

  inputNick.addEventListener('input', () => {
    marcarCampo('campo-nick', 'neutro');
    ocultarGeneral();
  });

  inputEmail.addEventListener('input', () => {
    marcarCampo('campo-email', 'neutro');
    ocultarGeneral();
  });

  inputPassword.addEventListener('input', () => {
    pintarChecklist();
    marcarCampo('campo-password', 'neutro');
    ocultarGeneral();
  });

  inputRepetir.addEventListener('input', () => {
    marcarCampo('campo-repetir', 'neutro');
    ocultarGeneral();
  });

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    ocultarGeneral();

    const nick = inputNick.value.trim();
    const email = inputEmail.value.trim();
    const password = inputPassword.value;
    const repetida = inputRepetir.value;

    const errorNick = validarNick(nick);
    const errorEmail = validarEmail(email);
    const errorPassword = validarPassword(password);
    const errorRepetir = validarRepetir(password, repetida);

    marcarCampo('campo-nick', errorNick ? 'error' : 'ok', errorNick);
    marcarCampo('campo-email', errorEmail ? 'error' : 'ok', errorEmail);
    marcarCampo('campo-password', errorPassword ? 'error' : 'ok', errorPassword);
    marcarCampo('campo-repetir', errorRepetir ? 'error' : 'ok', errorRepetir);

    if (errorNick || errorEmail || errorPassword || errorRepetir) {
      mostrarGeneral('error', 'Revisa los campos marcados antes de continuar.');
      return;
    }

    const resultado = registrarUsuario(nick, email, password);

    if (resultado === 'email-repetido') {
      marcarCampo('campo-email', 'error', 'Ya existe una cuenta con este email.');
      mostrarGeneral('error', 'Ese email ya está registrado. Prueba a iniciar sesión.');
      return;
    }

    if (resultado === 'nick-repetido') {
      marcarCampo('campo-nick', 'error', 'Este nombre de usuario ya está cogido.');
      mostrarGeneral('error', 'Elige otro nombre de usuario.');
      return;
    }

    guardarSesion(nick);
    mostrarGeneral('ok', 'Cuenta creada. Entrando al Top 8...');
    botonRegistro.disabled = true;
    setTimeout(() => { window.location.href = PAGINA_RESULTADOS; }, 900);
  });

  pintarChecklist();
}

function iniciarResultados() {
  if (document.body.dataset.protegida !== 'true') return;

  if (!haySesion()) {
    window.location.href = PAGINA_LOGIN;
    return;
  }
  document.body.classList.add('sesion-verificada');

  const saludo = document.getElementById('saludo');
  if (saludo) saludo.textContent = 'Hola, ' + nickDeLaSesion();

  const botonSalir = document.getElementById('cerrar-sesion');
  if (botonSalir) {
    botonSalir.addEventListener('click', () => {
      cerrarSesion();
      window.location.href = PAGINA_LOGIN;
    });
  }

  document.querySelectorAll('.ficha img').forEach(img => {
    function ponerInicial() {
      const ficha = img.parentElement;
      const nick = ficha.closest('.jugador').querySelector('.nick').textContent;
      ficha.textContent = nick.charAt(0).toUpperCase();
    }
    if (img.complete && img.naturalWidth === 0) ponerInicial();
    else img.addEventListener('error', ponerInicial);
  });
}

function cargarGifs() {
  document.querySelectorAll('[data-gif]').forEach(hueco => {
    const imagen = new Image();
    imagen.addEventListener('load', () => {
      hueco.appendChild(imagen);
      hueco.classList.add('gif-cargado');
    });
    imagen.src = hueco.dataset.gif;
  });
}

function iniciarContador() {
  document.querySelectorAll('[data-contador]').forEach(el => {
    const inicial = el.dataset.contador;
    let visitas = parseInt(inicial, 10) || 0;

    const guardado = parseInt(localStorage.getItem(CLAVE_VISITAS), 10);
    if (!Number.isNaN(guardado) && guardado > visitas) visitas = guardado;

    if (!sessionStorage.getItem(CLAVE_VISITA_SESION)) {
      visitas += 1;
      localStorage.setItem(CLAVE_VISITAS, String(visitas));
      sessionStorage.setItem(CLAVE_VISITA_SESION, '1');
    }

    el.textContent = '';
    String(visitas).padStart(inicial.length, '0').split('').forEach(cifra => {
      const caja = document.createElement('span');
      caja.textContent = cifra;
      el.appendChild(caja);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarResultados();
  iniciarLogin();
  iniciarRegistro();
  iniciarBotonesVer();
  cargarGifs();
  iniciarContador();
});