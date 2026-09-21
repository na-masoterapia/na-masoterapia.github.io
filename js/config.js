/* ===================================================
   CONFIGURACIÓN DEL SITIO — NA Nicole Masoterapia
   ===================================================
   Este es el ÚNICO lugar donde tienes que pegar la URL
   de tu Google Apps Script una vez que lo despliegues.
   Instrucciones completas en README.md
=================================================== */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx4tX7wrOeQRbpubGXt96eGWmHUZc_kA_LYkNGs5omIZyKTfYbE8kQeaGxsZkA9GY1xpw/exec";

// Número de WhatsApp del negocio (con código de país, sin + ni espacios)
const WHATSAPP_NUMERO = "56950602786";

// Instagram del negocio
const INSTAGRAM_URL = "https://instagram.com/ni_masoterapia";

function whatsappLink(mensaje){
  const texto = encodeURIComponent(mensaje || "Hola, quiero agendar una hora de masoterapia con NA Nicole");
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;
}
