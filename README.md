# NA Nicole — Sitio web de Masoterapia

Sitio de 4 páginas (Inicio, Servicios, Sobre mí, Contacto) con formulario de solicitud de hora conectado a Google Sheets. No requiere servidor propio — funciona 100% gratis con GitHub Pages + Google Apps Script.

Hay que hacer **3 configuraciones una sola vez** antes de que todo funcione. Después de eso, Nicole solo va a necesitar editar una planilla de Google, nunca el código.

---

## PARTE 1 — Crear el Google Sheet (la "base de datos" del sitio)

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja de cálculo nueva. Ponle de nombre, por ejemplo, **"NA Nicole - Datos del sitio"**.
2. Por defecto la hoja tiene una pestaña llamada "Hoja 1". Renómbrala a **`Servicios`** (clic derecho en la pestaña abajo > Cambiar nombre).
3. Importa la plantilla de servicios: Archivo > Importar > Subir > selecciona el archivo `google-apps-script/plantilla_servicios.csv` que viene en esta carpeta > elige la opción **"Reemplazar hoja actual"**.
4. Verás 2 filas de ejemplo marcadas "No" en la columna Activo. **Bórralas y reemplázalas por los servicios reales de Nicole.** La columna "Activo" controla qué se muestra en el sitio: escribe **Sí** para que un servicio aparezca públicamente, o **No** para ocultarlo sin borrarlo.
5. Crea una segunda pestaña (clic en el **+** abajo a la izquierda) y ponle de nombre exactamente **`Reservas`**. En la fila 1, agrega estos encabezados (opcional pero recomendado, solo para que se entienda la planilla):
   `Fecha de solicitud | Nombre | Teléfono | Servicio | Modalidad | Día preferido | Hora preferida | Comentario`
   (No hace falta que hagas nada más aquí — el sitio va a escribir las filas automáticamente debajo).

**Cómo le enseñas esto a Nicole (para que ella lo maneje sola):**
> "Para agregar un masaje nuevo, ve a la pestaña Servicios y escribe una fila nueva con el nombre, duración, precio y descripción, y pon 'Sí' en la última columna. Para que un servicio deje de aparecer, cambia esa columna a 'No'. No necesitas tocar nada más. Cada vez que alguien pide una hora desde la página web, va a aparecer automáticamente como una fila nueva en la pestaña Reservas."

---

## PARTE 2 — Conectar el Sheet al sitio (Google Apps Script)

1. Dentro del mismo Google Sheet, ve al menú **Extensiones > Apps Script**.
2. Se abrirá un editor con un código de ejemplo (`function myFunction() {}`). **Bórralo todo.**
3. Abre el archivo `google-apps-script/Code.gs` de esta carpeta, copia todo su contenido, y pégalo en el editor de Apps Script.
4. **Antes de guardar**, sigue la sección "PARTE 2.5 — Calendario" de abajo para crear tu calendario dedicado y pegar su ID en la línea `CALENDAR_ID` al inicio del código.
5. Guarda (ícono de disquete o Ctrl+S). Ponle un nombre al proyecto si te lo pide, por ejemplo "NA Nicole Backend".
6. Haz clic en **Implementar > Nueva implementación**.
7. En "Selecciona el tipo", haz clic en el ícono de engranaje ⚙️ y elige **"Aplicación web"**.
8. Configura así (muy importante):
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
9. Haz clic en **Implementar**. Google te va a pedir autorizar permisos — esta vez te va a pedir **dos permisos**: acceso a Google Sheets y acceso a Google Calendar (porque ahora el script también crea eventos). Dale clic en "Autorizar acceso", elige tu cuenta, y si aparece una advertencia de "app no verificada", haz clic en "Configuración avanzada" > "Ir a NA Nicole Backend (no seguro)". Es normal, es tu propio script, no hay ningún riesgo.
10. Copia la **URL de la aplicación web** que te entrega (termina en `/exec`). La vas a necesitar en la Parte 3.

**Nota de seguridad:** "Quién tiene acceso: Cualquier usuario" permite que el *sitio web* pueda enviar y leer datos — **no** significa que cualquiera pueda editar tu Google Sheet o tu Calendario directamente. Ambos siguen siendo privados y solo los puede editar quien tú invites.

---

## PARTE 2.5 — Crear el calendario dedicado a las reservas

Para que las solicitudes no se mezclen con tus eventos personales, van a vivir en un calendario nuevo, solo de NA Nicole.

1. Ve a [calendar.google.com](https://calendar.google.com), con la misma cuenta que usaste para el Google Sheet.
2. En el panel izquierdo, junto a "Otros calendarios", haz clic en el **+** > **Crear nuevo calendario**.
3. Ponle de nombre **"NA Nicole - Reservas"** y haz clic en **Crear calendario**.
4. Vuelve al panel izquierdo, pasa el mouse sobre el calendario recién creado, haz clic en los 3 puntos > **Configuración y uso compartido**.
5. Baja hasta la sección **"Integrar calendario"** y copia el valor de **"ID de calendario"** (se ve parecido a `abcdefg12345@group.calendar.google.com`).
6. Vuelve al editor de Apps Script (Extensiones > Apps Script) y reemplaza esta línea al inicio del código:
   ```js
   const CALENDAR_ID = 'PEGA_AQUI_EL_ID_DE_TU_CALENDARIO';
   ```
   por (ejemplo):
   ```js
   const CALENDAR_ID = 'abcdefg12345@group.calendar.google.com';
   ```
7. Guarda el script.

**Cómo funciona una vez conectado:** cada vez que alguien completa el formulario indicando día y hora, aparece automáticamente un evento en "NA Nicole - Reservas" con el título `[Por confirmar] Servicio — Nombre del cliente`, en **color naranjo** para que se distinga de un vistazo de tus horas ya confirmadas. La descripción del evento trae el teléfono, la modalidad y el comentario del cliente. Tú revisas ese calendario, confirmas con la clienta por WhatsApp, y ahí decides si dejas el evento (puedes sacarle el "[Por confirmar]" del título) o lo borras si finalmente no se concreta.

Si el cliente deja el día u hora en blanco (son campos opcionales del formulario), no se crea ningún evento — la solicitud igual queda guardada en la pestaña Reservas para que la contactes tú directamente.

---

## PARTE 3 — Conectar el código de la URL al sitio

1. Abre el archivo `js/config.js` de este proyecto.
2. Reemplaza `"PEGA_AQUI_TU_URL_DE_APPS_SCRIPT"` por la URL que copiaste en el paso anterior, dejándola entre comillas. Por ejemplo:
   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
3. Guarda el archivo.

Con esto, el sitio ya queda 100% conectado: la página de Servicios va a leer los datos desde tu Sheet, y el formulario de Contacto va a escribir cada solicitud en la pestaña Reservas.

---

## PARTE 4 — Publicar el sitio en GitHub Pages (gratis)

1. Crea una cuenta en [github.com](https://github.com) si no tienes una.
2. Crea un repositorio nuevo (botón verde "New"), por ejemplo llamado `na-nicole-masoterapia`. Puede ser público.
3. Sube **todos los archivos y carpetas de este proyecto** (arrastra la carpeta completa a la página del repositorio, o usa "uploading an existing file").
4. Ve a la pestaña **Settings** del repositorio > en el menú lateral, **Pages**.
5. En "Source", elige la rama `main` y la carpeta `/ (root)`. Guarda.
6. Espera 1-2 minutos y GitHub te va a mostrar el link público, algo como:
   `https://tu-usuario.github.io/na-nicole-masoterapia/`

Ese es el link definitivo del sitio — es el que compartes en Instagram, WhatsApp, etc.

---

## PARTE 5 — Personalización (colores, logo, contenido)

- **Colores:** todos los colores del sitio están centralizados en las primeras líneas de `css/style.css`, dentro de `:root { ... }`. Cambia esos valores hexadecimales y se actualiza todo el sitio automáticamente.
- **Logo:** reemplaza el archivo `img/logo.jpeg` por uno nuevo con el mismo nombre exacto (`logo.jpeg`) y listo.
- **Texto de "Sobre mí":** el archivo `sobre-mi.html` tiene un texto de ejemplo marcado claramente para reemplazar por la historia real de Nicole.
- **WhatsApp:** el número ya está configurado en `js/config.js` (`WHATSAPP_NUMERO`), en caso de que cambie en el futuro.

---

## Cómo probar que todo funciona antes de compartir el sitio

1. Abre el sitio (localmente o ya en GitHub Pages) y entra a la página **Servicios** — deberían aparecer los servicios que escribiste en la pestaña Servicios del Sheet (los marcados "Sí").
2. Ve a **Contacto**, llena el formulario con datos de prueba **incluyendo un día y hora**, y envíalo.
3. Vuelve al Google Sheet, pestaña **Reservas** — debería haber aparecido una fila nueva con esos datos de prueba, y en la última columna debería decir "Evento creado (Por confirmar)".
4. Abre **Google Calendar** y busca el calendario "NA Nicole - Reservas" en el panel izquierdo (actívalo si aparece apagado) — debería aparecer un evento naranjo con el título `[Por confirmar] ...` en la fecha y hora que pusiste de prueba.
5. Si no aparece nada, revisa: que la URL en `js/config.js` sea exactamente la del paso 2.10, que el despliegue de Apps Script tenga acceso "Cualquier usuario", que los nombres de las pestañas sean exactamente `Servicios` y `Reservas`, y que `CALENDAR_ID` en el script sea exactamente el ID que copiaste de la configuración del calendario (sin espacios de más).

## Limitaciones honestas de esta solución (para que las tengas claras)

- **No es un calendario en tiempo real** con horas que se bloquean automáticamente — es un formulario de solicitud que Nicole confirma manualmente por WhatsApp. El evento se crea igual en el calendario para que tengas visibilidad inmediata, pero siempre marcado como "Por confirmar" hasta que tú lo revises.
- **No hay un "panel de administración" con usuario y contraseña dentro del sitio** — como se explicó, eso no sería realmente seguro en un sitio estático. El Google Sheet y el Google Calendar cumplen esa función, protegidos por el login real de la cuenta de Google de Nicole.
- **La zona horaria del evento depende de la configuración de tu proyecto de Apps Script.** Si notas que las horas del calendario aparecen corridas, ve en el editor de Apps Script al ícono de engranaje ⚙️ (Configuración del proyecto) y confirma que la zona horaria esté en "(GMT-04:00) Hora de Chile continental" o equivalente.
