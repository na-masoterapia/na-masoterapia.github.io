/* ===================================================
   NA Nicole — Masoterapia — main.js
   Requiere que config.js esté cargado antes que este archivo.
=================================================== */

/* ----- MENÚ MÓVIL ----- */
function toggleNav(){
  const nav = document.getElementById('navLinks');
  if(nav) nav.classList.toggle('open');
}

/* ----- CARGA DE SERVICIOS DESDE GOOGLE SHEETS -----
   Llama al Apps Script con ?action=servicios y pinta
   las tarjetas en cualquier elemento con id="serviciosGrid".
   Si el elemento tiene [data-modo="select"], en vez de tarjetas
   llena un <select id="servicioSelect"> (usado en el formulario).
------------------------------------------------------ */
async function cargarServicios(){
  const grid = document.getElementById('serviciosGrid');
  const select = document.getElementById('servicioSelect');

  if(!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('PEGA_AQUI') !== -1){
    mostrarErrorServicios(grid, select, 'El sitio aún no está conectado a Google Sheets. Sigue las instrucciones del README para conectar la hoja de servicios.');
    return;
  }

  try{
    const res = await fetch(`${APPS_SCRIPT_URL}?action=servicios`);
    if(!res.ok) throw new Error('Respuesta no válida del servidor');
    const servicios = await res.json();

    if(!Array.isArray(servicios) || servicios.length === 0){
      mostrarErrorServicios(grid, select, 'Todavía no hay servicios cargados en la hoja de cálculo.');
      return;
    }

    if(grid){
      grid.innerHTML = servicios.map(s => `
        <div class="servicio-card">
          <h3>${escapeHtml(s.nombre)}</h3>
          <div class="meta">${escapeHtml(String(s.duracion))} min</div>
          <div class="precio">$${formatearPrecio(s.precio)}</div>
          ${s.descripcion ? `<p class="desc">${escapeHtml(s.descripcion)}</p>` : ''}
        </div>
      `).join('');
    }

    if(select){
      select.innerHTML = '<option value="">Selecciona un servicio</option>' +
        servicios.map(s => `<option value="${escapeHtml(s.nombre)}">${escapeHtml(s.nombre)} — $${formatearPrecio(s.precio)}</option>`).join('');
    }
  }catch(err){
    console.error(err);
    mostrarErrorServicios(grid, select, 'No se pudieron cargar los servicios en este momento. Escríbenos directo por WhatsApp y te contamos las opciones disponibles.');
  }
}

function mostrarErrorServicios(grid, select, mensaje){
  if(grid){
    grid.innerHTML = `<div class="estado-error">${mensaje}</div>`;
  }
  if(select){
    select.innerHTML = `<option value="">${mensaje}</option>`;
  }
}

function formatearPrecio(n){
  const num = Number(n) || 0;
  return num.toLocaleString('es-CL');
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

/* ----- ENVÍO DEL FORMULARIO DE RESERVA -----
   Envía los datos al Apps Script (que los escribe en la
   pestaña "Reservas" del Google Sheet).
------------------------------------------------------ */
async function enviarReserva(event){
  event.preventDefault();
  const form = event.target;
  const boton = form.querySelector('button[type="submit"]');
  const mensajeEl = document.getElementById('formMensaje');

  const datos = {
    nombre: form.nombre.value.trim(),
    telefono: form.telefono.value.trim(),
    servicio: form.servicio.value,
    modalidad: form.modalidad.value,
    diaPreferido: form.diaPreferido.value,
    horaPreferida: form.horaPreferida.value,
    mensaje: form.mensaje.value.trim()
  };

  if(!datos.nombre || !datos.telefono || !datos.servicio){
    mostrarMensajeForm(mensajeEl, 'error', 'Por favor completa al menos tu nombre, teléfono y el servicio que te interesa.');
    return;
  }

  if(!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('PEGA_AQUI') !== -1){
    mostrarMensajeForm(mensajeEl, 'error', 'El formulario aún no está conectado a Google Sheets (falta configurar la URL en js/config.js). Mientras tanto, puedes escribirnos directo por WhatsApp.');
    return;
  }

  boton.disabled = true;
  boton.textContent = 'Enviando...';

  try{
    // Nota técnica: se usa 'no-cors' porque Google Apps Script no siempre
    // permite leer la respuesta desde otro dominio (GitHub Pages). Esto no
    // impide que los datos se guarden correctamente en la hoja — solo
    // significa que no podemos leer la confirmación desde el navegador,
    // por eso asumimos éxito si fetch no lanza un error de red.
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(datos)
    });

    mostrarMensajeForm(mensajeEl, 'ok', '¡Listo! Tu solicitud fue enviada. Nicole se va a contactar contigo por WhatsApp para confirmar el día y la hora.');
    form.reset();
  }catch(err){
    console.error(err);
    mostrarMensajeForm(mensajeEl, 'error', 'Hubo un problema de conexión al enviar tu solicitud. Por favor intenta de nuevo o escríbenos directo por WhatsApp.');
  }finally{
    boton.disabled = false;
    boton.textContent = 'Enviar solicitud';
  }
}

function mostrarMensajeForm(el, tipo, texto){
  if(!el) return;
  el.className = 'form-mensaje ' + tipo;
  el.textContent = texto;
}

/* ----- INICIALIZAR ENLACES DE WHATSAPP E INSTAGRAM EN TODA LA PÁGINA ----- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    const msg = el.getAttribute('data-whatsapp-msg') || '';
    el.setAttribute('href', whatsappLink(msg));
  });
  document.querySelectorAll('[data-instagram]').forEach(el => {
    el.setAttribute('href', INSTAGRAM_URL);
  });
});
