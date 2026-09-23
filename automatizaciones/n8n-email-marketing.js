/**
 * Logity · campaña de email marketing
 * Nodo Code de n8n — modo "Run Once for All Items", lenguaje JavaScript.
 *
 * QUÉ HACE
 * Recibe una lista de contactos y devuelve, por cada uno, el correo ya armado:
 * asunto, preheader, HTML, versión en texto plano y las cabeceras de baja.
 * El nodo siguiente (Gmail, Send Email/SMTP, Brevo, Mailgun…) sólo envía.
 *
 * ENTRADA ESPERADA (un item por contacto)
 *   email    obligatorio
 *   nombre   opcional — si falta, el saludo cae a "Hola"
 *   empresa  opcional — si falta, se omite la frase que la menciona
 *   perfil   opcional — "escalar" | "potenciar" | "integrar" (default: "escalar")
 *   token    opcional — identificador para el link de baja; si falta se genera
 *
 * SALIDA (un item por contacto válido)
 *   to, toName, subject, preheader, html, text, headers, variante, perfil, campania
 *
 * Los contactos sin email válido no se caen: salen por la clave `descartados`
 * del último item para que puedas revisarlos o mandarlos a una hoja aparte.
 */

// ─────────────────────────────────────────────────────────────
// 1. Configuración — es lo único que hay que tocar entre campañas
// ─────────────────────────────────────────────────────────────
const CONFIG = {
  campania:    'logity-2026-q1-frio',
  remitente:   { nombre: 'Pablo · Logity', email: 'contacto@logity.com' },
  sitio:       'https://logity.com',
  demo:        'https://logity.com/#demo',
  bajaBase:    'https://logity.com/baja',
  empresa:     'Logity · Software para operadores logísticos terrestres',
  direccion:   'Santiago, Chile',
  // el perfil por defecto cuando el contacto no viene clasificado
  perfilDefault: 'escalar',
};

// ─────────────────────────────────────────────────────────────
// 2. Variantes de asunto (test A/B/C estable por contacto)
// ─────────────────────────────────────────────────────────────
const ASUNTOS = [
  { id: 'A', texto: '{empresa}: que tus clientes dejen de llamar por la carga' },
  { id: 'B', texto: 'Toda tu operación terrestre en una plataforma' },
  { id: 'C', texto: '¿Cuántas horas al día se van contestando dónde va el camión?' },
];

// ─────────────────────────────────────────────────────────────
// 3. Gancho por perfil — el párrafo que cambia según a quién le escribes
// ─────────────────────────────────────────────────────────────
const PERFILES = {
  escalar: {
    gancho: 'Cuando la operación crece, la planilla deja de alcanzar: la programación del día la edita una sola persona y el estado de cada carga se responde por teléfono.',
    puntos: [
      'Tus clientes ven su carga en línea: etapa, fechas, documentos y la posición del camión.',
      'La coordinación deja de depender de una persona y de su memoria.',
      'El margen de cada servicio se ve durante el mes, no cuando cierra la contabilidad.',
    ],
    cta: 'Ver cómo se vería con tu operación',
  },
  potenciar: {
    gancho: 'Si ya tienen sistema, la pregunta no es si digitalizarse: es por qué siguen cambiando tarifas a mano y mandando estados por correo.',
    puntos: [
      'Modificación masiva de tarifas por ruta, equipo y vigencia, con vista previa.',
      'Acuerdos comerciales con recargos —estadía, porteo, falso flete— vigentes al cotizar.',
      'Portal para tus clientes incluido, no cotizado aparte.',
    ],
    cta: 'Comparar con lo que pagas hoy',
  },
  integrar: {
    gancho: 'No venimos a reemplazar su ERP. Venimos a cubrir lo que queda en el borde: subcontratistas fuera del sistema, GPS de terceros y devoluciones de vacío que aparecen cuando ya corrió la estadía.',
    puntos: [
      'Portal de seguimiento para sus clientes, alimentado por API desde sus sistemas.',
      'Módulos puntuales para los procesos que el ERP corporativo no cubre bien.',
      'Piloto acotado a una sucursal o una ruta, con un indicador acordado antes de partir.',
    ],
    cta: 'Conversar un piloto acotado',
  },
};

// ─────────────────────────────────────────────────────────────
// 4. Utilidades
// ─────────────────────────────────────────────────────────────
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Escapa lo que va dentro del HTML: los nombres vienen de un CRM, no de nosotros. */
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** "juan carlos pérez" → "Juan Carlos"; corta en el primer nombre compuesto. */
function primerNombre(nombre) {
  const limpio = String(nombre ?? '').trim().replace(/\s+/g, ' ');
  if (!limpio) return '';
  return limpio.split(' ').slice(0, 1)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

/** djb2: reparto A/B/C estable — el mismo contacto siempre cae en la misma variante. */
function hash(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  return h;
}

/** Agrega los parámetros de campaña a cualquier link del correo. */
function conUtm(url, contenido) {
  const u = new URL(url);
  u.searchParams.set('utm_source', 'email');
  u.searchParams.set('utm_medium', 'email-marketing');
  u.searchParams.set('utm_campaign', CONFIG.campania);
  if (contenido) u.searchParams.set('utm_content', contenido);
  return u.toString();
}

// ─────────────────────────────────────────────────────────────
// 5. Plantillas
// ─────────────────────────────────────────────────────────────
function armarHtml({ saludo, empresa, perfil, linkDemo, linkSitio, linkBaja, preheader }) {
  const p = PERFILES[perfil];
  const frasEmpresa = empresa
    ? `En operaciones como la de ${esc(empresa)} eso se nota todos los días.`
    : 'En una operación de transporte de contenedores eso se nota todos los días.';

  const bullets = p.puntos.map((t) => `
              <tr>
                <td style="padding:0 0 12px 0;vertical-align:top;width:18px;">
                  <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#4f8cff;"></span>
                </td>
                <td style="padding:0 0 12px 0;color:#a9b6d4;font-size:15px;line-height:1.55;">${esc(t)}</td>
              </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Logity</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#04060d;">

<!-- preheader: lo que se lee en la bandeja, junto al asunto -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#04060d;font-size:1px;line-height:1px;">${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#04060d;">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#070b16;border:1px solid rgba(140,170,255,0.18);border-radius:14px;">

        <!-- cabecera -->
        <tr>
          <td style="padding:26px 32px 0 32px;">
            <a href="${linkSitio}" style="text-decoration:none;color:#e9eefb;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;letter-spacing:-0.4px;">Logity</a>
            <div style="margin-top:4px;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#6fe3ff;">Operación terrestre · import &amp; export</div>
          </td>
        </tr>

        <!-- cuerpo -->
        <tr>
          <td style="padding:24px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
            <h1 style="margin:0 0 16px 0;color:#ffffff;font-size:26px;line-height:1.2;font-weight:bold;letter-spacing:-0.5px;">
              Toda tu operación terrestre, en una sola plataforma
            </h1>
            <p style="margin:0 0 14px 0;color:#e9eefb;font-size:15px;line-height:1.6;">${esc(saludo)}</p>
            <p style="margin:0 0 14px 0;color:#a9b6d4;font-size:15px;line-height:1.6;">${esc(PERFILES[perfil].gancho)} ${frasEmpresa}</p>
            <p style="margin:0 0 18px 0;color:#a9b6d4;font-size:15px;line-height:1.6;">
              Logity centraliza el servicio completo —retiro, ruta, entrega y devolución del equipo— en una plataforma que se configura a tu forma de operar:
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${bullets}
            </table>
          </td>
        </tr>

        <!-- botón -->
        <tr>
          <td align="left" style="padding:14px 32px 26px 32px;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${linkDemo}" style="height:46px;v-text-anchor:middle;width:280px;" arcsize="22%" stroke="f" fillcolor="#2f6bff">
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${esc(PERFILES[perfil].cta)}</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a href="${linkDemo}" style="display:inline-block;background-color:#2f6bff;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:46px;text-align:center;text-decoration:none;width:280px;border-radius:10px;">${esc(PERFILES[perfil].cta)}</a>
            <!--<![endif]-->
            <p style="margin:12px 0 0 0;color:#7887a8;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;">
              Son 30 minutos, en línea, sobre tus servicios. Si no calza, te lo digo en la misma reunión.
            </p>
          </td>
        </tr>

        <!-- firma -->
        <tr>
          <td style="padding:0 32px 28px 32px;border-top:1px solid rgba(140,170,255,0.14);">
            <p style="margin:20px 0 0 0;color:#a9b6d4;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;">
              ${esc(CONFIG.remitente.nombre.split('·')[0].trim())}<br>
              <span style="color:#7887a8;font-size:13px;">${esc(CONFIG.empresa)}</span><br>
              <a href="mailto:${esc(CONFIG.remitente.email)}" style="color:#6fe3ff;text-decoration:none;font-size:13px;">${esc(CONFIG.remitente.email)}</a>
            </p>
          </td>
        </tr>
      </table>

      <!-- pie legal -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
        <tr>
          <td style="padding:18px 32px 0 32px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#59668a;">
            Recibes este correo porque trabajas en logística o transporte de carga.<br>
            <a href="${linkBaja}" style="color:#7887a8;text-decoration:underline;">Darme de baja</a> · ${esc(CONFIG.direccion)}
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
</body>
</html>`;
}

function armarTexto({ saludo, empresa, perfil, linkDemo, linkBaja }) {
  const p = PERFILES[perfil];
  const frasEmpresa = empresa
    ? `En operaciones como la de ${empresa} eso se nota todos los días.`
    : 'En una operación de transporte de contenedores eso se nota todos los días.';

  return [
    'LOGITY — Toda tu operación terrestre, en una sola plataforma',
    '',
    saludo,
    '',
    `${p.gancho} ${frasEmpresa}`,
    '',
    'Logity centraliza el servicio completo (retiro, ruta, entrega y devolución del equipo) en una plataforma que se configura a tu forma de operar:',
    '',
    ...p.puntos.map((t) => `- ${t}`),
    '',
    `${p.cta}: ${linkDemo}`,
    'Son 30 minutos, en línea, sobre tus servicios. Si no calza, te lo digo en la misma reunión.',
    '',
    CONFIG.remitente.nombre.split('·')[0].trim(),
    CONFIG.empresa,
    CONFIG.remitente.email,
    '',
    '—',
    `Para no recibir más correos: ${linkBaja}`,
    CONFIG.direccion,
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────
// 6. Proceso
// ─────────────────────────────────────────────────────────────
const salida = [];
const descartados = [];

for (const item of $input.all()) {
  const d = item.json ?? {};
  const email = String(d.email ?? '').trim().toLowerCase();

  if (!RE_EMAIL.test(email)) {
    descartados.push({ email: d.email ?? null, motivo: 'email inválido o vacío' });
    continue;
  }

  const perfil  = PERFILES[d.perfil] ? d.perfil : CONFIG.perfilDefault;
  const nombre  = primerNombre(d.nombre);
  const empresa = String(d.empresa ?? '').trim();
  const saludo  = nombre ? `Hola ${nombre},` : 'Hola,';

  // variante estable: el mismo correo siempre recibe el mismo asunto
  const variante = ASUNTOS[hash(email) % ASUNTOS.length];
  const subject  = variante.texto.replace('{empresa}', empresa || 'Tu operación');

  const token    = String(d.token ?? '').trim() || Buffer.from(email).toString('base64url');
  const linkBaja = `${CONFIG.bajaBase}?c=${encodeURIComponent(token)}&camp=${encodeURIComponent(CONFIG.campania)}`;
  const linkDemo = conUtm(CONFIG.demo, `cta-${perfil}-${variante.id}`);
  const linkSitio = conUtm(CONFIG.sitio, 'logo');

  const preheader = perfil === 'integrar'
    ? 'Visibilidad para tus clientes sin cambiar tu ERP.'
    : 'Retiro, ruta, entrega y devolución, con el margen a la vista.';

  const base = { saludo, empresa, perfil, linkDemo, linkSitio, linkBaja, preheader };

  salida.push({
    json: {
      to: email,
      toName: nombre || null,
      fromName: CONFIG.remitente.nombre,
      fromEmail: CONFIG.remitente.email,
      subject,
      preheader,
      html: armarHtml(base),
      text: armarTexto(base),
      // el nodo de envío las pasa tal cual: evitan la carpeta de spam y son obligatorias en envíos masivos
      headers: {
        'List-Unsubscribe': `<${linkBaja}>, <mailto:${CONFIG.remitente.email}?subject=baja>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      variante: variante.id,
      perfil,
      campania: CONFIG.campania,
      enviadoEn: new Date().toISOString(),
    },
  });
}

// los descartes viajan en el último item para no perderlos de vista
if (descartados.length) {
  salida.push({ json: { _descartados: descartados, total: descartados.length, campania: CONFIG.campania } });
}

return salida;
