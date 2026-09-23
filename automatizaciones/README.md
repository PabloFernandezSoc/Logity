# Automatizaciones

## `n8n-email-marketing.js` — armado del correo de campaña

Nodo **Code** de n8n (JavaScript, modo *Run Once for All Items*). Recibe contactos
y devuelve el correo listo: asunto, preheader, HTML, texto plano y cabeceras de
baja. No envía nada: de eso se encarga el nodo siguiente.

### El flujo completo

```
Google Sheets / CRM / Postgres        → la lista de contactos
        ↓
Code  «Armar correo Logity»           → este archivo
        ↓
Loop Over Items (lotes de 20-50)      → para no pasarte del límite del proveedor
        ↓
Gmail · Send Email (SMTP) · Brevo     → envío
        ↓
Google Sheets  «Registrar envío»      → to, variante, perfil, enviadoEn
```

### Qué espera de cada contacto

| Campo | Obligatorio | Para qué |
|---|---|---|
| `email` | sí | destinatario; si no es válido, el contacto se descarta sin cortar el flujo |
| `nombre` | no | saludo personalizado; si falta queda "Hola," |
| `empresa` | no | aparece en el asunto de la variante A y en el segundo párrafo |
| `perfil` | no | `escalar`, `potenciar` o `integrar` — cambia el gancho, los tres puntos y el texto del botón |
| `token` | no | identificador para el link de baja; si falta se genera desde el correo |

### Qué devuelve

`to`, `toName`, `fromName`, `fromEmail`, `subject`, `preheader`, `html`, `text`,
`headers`, `variante`, `perfil`, `campania` y `enviadoEn`.

En el nodo de envío: **Subject** `{{ $json.subject }}`, **HTML** `{{ $json.html }}`,
**Text** `{{ $json.text }}` y las cabeceras desde `{{ $json.headers }}`.

### Decisiones que conviene conocer

- **Test A/B/C estable.** La variante de asunto sale de un hash del correo, no de
  un azar: el mismo contacto recibe siempre la misma y los resultados se pueden
  comparar entre envíos.
- **Tres ganchos por perfil.** Son los mismos segmentos del deck interno de modelo
  de negocio: el que quiere escalar, el que quiere potenciar o ahorrar, y el
  grande con el que la jugada es integrarse.
- **Baja obligatoria.** Van el link en el pie y las cabeceras `List-Unsubscribe` y
  `List-Unsubscribe-Post`. Gmail y Outlook las exigen para envíos masivos; sin
  ellas la campaña termina en spam. El link `/baja` tiene que existir y dar de
  baja de verdad.
- **Todo dato del CRM se escapa** antes de entrar al HTML: un `&` o un `<` en el
  nombre de una empresa rompe el correo o abre un hoyo de inyección.
- **HTML de correo, no de web.** Tablas, estilos en línea, ancho 600 px, fuentes
  del sistema y botón con fallback VML para Outlook. Nada de flexbox ni webfonts.

### Antes de la primera campaña

1. Completar `CONFIG`: campaña, remitente, dominio y dirección física.
2. Verificar SPF, DKIM y DMARC del dominio que envía.
3. Probar el HTML en Gmail, Outlook y un cliente móvil antes del envío masivo.
4. Partir con un lote chico: reputación de dominio nuevo se quema rápido.
