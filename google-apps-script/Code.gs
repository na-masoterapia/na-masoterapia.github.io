/* ===================================================
   NA Nicole — Masoterapia — Código de Google Apps Script
   ===================================================
   CÓMO USAR ESTE ARCHIVO (ver README.md para el paso a paso completo):
   1. Crea un Google Sheet con 2 pestañas: "Servicios" y "Reservas".
   2. En el Sheet, ve a Extensiones > Apps Script.
   3. Borra el código de ejemplo que aparece y pega TODO este archivo.
   4. Reemplaza CALENDAR_ID más abajo por el ID de tu calendario "NA Nicole - Reservas"
      (instrucciones exactas de cómo obtenerlo en el README.md).
   5. Guarda, luego Implementar > Nueva implementación > Aplicación web.
   6. Copia la URL que te entrega y pégala en js/config.js
   ===================================================
   Estructura esperada de la pestaña "Servicios" (fila 1 = encabezados):
   Nombre | Duración (min) | Precio | Descripción | Activo (Sí/No)
   ===================================================
   Estructura de la pestaña "Reservas" (se crea automáticamente,
   pero puedes poner tú misma los encabezados en la fila 1):
   Fecha de solicitud | Nombre | Teléfono | Servicio | Modalidad | Día preferido | Hora preferida | Comentario | Evento en calendario
=================================================== */

// ID del calendario dedicado a las reservas de NA Nicole.
// Ver README.md, sección "Calendario", para saber cómo obtener este ID.
const CALENDAR_ID = 'PEGA_AQUI_EL_ID_DE_TU_CALENDARIO';

// Duración por defecto (en minutos) si el servicio solicitado no
// se encuentra en la pestaña Servicios con una duración definida.
const DURACION_POR_DEFECTO_MIN = 60;

function doGet(e) {
  const accion = e.parameter.action;
  if (accion === 'servicios') {
    return obtenerServicios();
  }
  return respuestaJson({ error: 'Acción no reconocida. Usa ?action=servicios' });
}

function doPost(e) {
  let estadoCalendario = 'No aplica';

  try {
    const datos = JSON.parse(e.postData.contents);
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservas');

    if (!hoja) {
      return respuestaJson({ error: 'No se encontró la pestaña "Reservas". Revisa el nombre exacto en tu Google Sheet.' });
    }

    // Intenta crear el evento en el calendario dedicado. Si falla por
    // cualquier motivo (fecha vacía, calendario mal configurado, etc.),
    // igual se guarda la fila en la planilla — el calendario es un
    // extra, nunca debe bloquear el registro de la solicitud.
    try {
      estadoCalendario = crearEventoCalendario(datos);
    } catch (errCal) {
      estadoCalendario = 'Error al crear evento: ' + errCal.message;
    }

    hoja.appendRow([
      new Date(),
      datos.nombre || '',
      datos.telefono || '',
      datos.servicio || '',
      datos.modalidad || '',
      datos.diaPreferido || '',
      datos.horaPreferida || '',
      datos.mensaje || '',
      estadoCalendario
    ]);

    return respuestaJson({ status: 'ok', calendario: estadoCalendario });
  } catch (err) {
    return respuestaJson({ error: 'Error al guardar la solicitud: ' + err.message });
  }
}

function crearEventoCalendario(datos) {
  if (!datos.diaPreferido || !datos.horaPreferida) {
    return 'Sin evento (el cliente no indicó día/hora)';
  }
  if (!CALENDAR_ID || CALENDAR_ID.indexOf('PEGA_AQUI') !== -1) {
    return 'Sin evento (falta configurar CALENDAR_ID en el script)';
  }

  const calendario = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!calendario) {
    return 'Sin evento (no se encontró el calendario con ese ID)';
  }

  const inicio = new Date(datos.diaPreferido + 'T' + datos.horaPreferida + ':00');
  if (isNaN(inicio.getTime())) {
    return 'Sin evento (fecha u hora con formato inválido)';
  }

  const duracion = obtenerDuracionServicio(datos.servicio);
  const fin = new Date(inicio.getTime() + duracion * 60000);

  const titulo = '[Por confirmar] ' + (datos.servicio || 'Masoterapia') + ' — ' + (datos.nombre || 'Sin nombre');
  const descripcion = [
    'Solicitud recibida desde el sitio web. Confirma con la clienta por WhatsApp antes de dar por agendada esta hora.',
    '',
    'Nombre: ' + (datos.nombre || '-'),
    'Teléfono: ' + (datos.telefono || '-'),
    'Servicio: ' + (datos.servicio || '-'),
    'Modalidad: ' + (datos.modalidad || '-'),
    'Comentario: ' + (datos.mensaje || '-')
  ].join('\n');

  const evento = calendario.createEvent(titulo, inicio, fin, { description: descripcion });
  evento.setColor(CalendarApp.EventColor.ORANGE);

  return 'Evento creado (Por confirmar)';
}

function obtenerDuracionServicio(nombreServicio) {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Servicios');
    if (!hoja || !nombreServicio) return DURACION_POR_DEFECTO_MIN;

    const filas = hoja.getDataRange().getValues();
    filas.shift();
    const fila = filas.find(f => f[0] === nombreServicio);
    const duracion = fila ? Number(fila[1]) : NaN;

    return !isNaN(duracion) && duracion > 0 ? duracion : DURACION_POR_DEFECTO_MIN;
  } catch (err) {
    return DURACION_POR_DEFECTO_MIN;
  }
}

function obtenerServicios() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Servicios');

  if (!hoja) {
    return respuestaJson({ error: 'No se encontró la pestaña "Servicios". Revisa el nombre exacto en tu Google Sheet.' });
  }

  const filas = hoja.getDataRange().getValues();
  filas.shift(); // quita la fila de encabezados

  const servicios = filas
    .filter(fila => {
      const tieneNombre = !!fila[0];
      const activo = String(fila[4]).trim().toLowerCase();
      return tieneNombre && (activo === 'sí' || activo === 'si');
    })
    .map(fila => ({
      nombre: fila[0],
      duracion: fila[1],
      precio: fila[2],
      descripcion: fila[3]
    }));

  return respuestaJson(servicios);
}

function respuestaJson(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
