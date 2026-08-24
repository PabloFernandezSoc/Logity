# Logity — Landing page

Landing page de **Logity**, el software que centraliza la operación terrestre de los
servicios de importación y exportación: retiro, ruta, entrega y devolución.

## Contenido de la página

| Sección | Qué comunica |
|---|---|
| Hero | Propuesta de valor (operación terrestre) + video de marca de fondo + CTA |
| Plataforma | Los dos ejes: portal de clientes + operación |
| Portal de clientes | Visibilidad para los clientes de nuestros clientes |
| Comercial | Modificación masiva de tarifas, acuerdos comerciales, análisis de ventas, trazabilidad |
| Operacional | Proyección de carga → coordinación → en curso → finalizado, sala de control y links GPS del camión |
| A tu medida | Flujos configurables por operación + integraciones (GPS, ERP, API) y la conexión con embarcadoras marcada **En desarrollo**, con CTA intermedio |
| Beneficios | Cuatro razones concretas |
| FAQ | Cuatro preguntas frecuentes |
| Demo | Formulario de contacto |

El texto es deliberadamente breve: cada sección explica una idea y empuja hacia
la demo. Hay tres llamados a la acción — hero, franja intermedia y formulario —
además del botón permanente en la barra de navegación.

El alcance que comunica la página es el **servicio terrestre**. La conexión con
embarcadoras, para que el cliente final vea el flujo global de su carga, aparece
en dos lugares y siempre como pendiente: la tarjeta "En desarrollo" de
integraciones y una pregunta del FAQ. Cuando exista, basta con sacar la clase
`is-soon` de esa tarjeta y actualizar ambos textos.

## Estructura

```
index.html          Página completa (una sola página, anclas de navegación)
styles.css          Estilos y design tokens (:root)
main.js             Nav móvil, reveal al scroll, control del video y formulario
assets/video/       Video del hero (versión escritorio y móvil, optimizados)
assets/img/         Poster del video y favicon
assets/fonts/       Tipografías self-hosted (woff2, subconjunto latino)
build-standalone.py Genera la versión de un solo archivo
```

## Cómo verla en local

No requiere build ni dependencias. Basta con servir la carpeta:

```bash
python3 -m http.server 8080
# luego abrir http://localhost:8080
```

## Personalización rápida

- **Colores y tipografías**: variables CSS en el bloque `:root` de `styles.css`.
- **Formulario de demo**: en `main.js`, define `FORM_ENDPOINT` con la URL de tu CRM,
  Formspree o webhook. Si queda vacío, el formulario abre el cliente de correo hacia
  `CONTACT_EMAIL` como fallback.
- **Correo de contacto**: constante `CONTACT_EMAIL` en `main.js` y enlace del footer en `index.html`.
- **Dominio**: actualizar `canonical`, `og:image` y `robots.txt` cuando exista el dominio definitivo.

## Video del hero

El video original (12 MB) fue recodificado para web: 754 KB en escritorio (1600 px) y
289 KB en móvil (960 px), sin audio y con `faststart` para que empiece a reproducirse
antes de descargarse completo. El poster (`assets/img/hero-poster.jpg`) se muestra
mientras carga y en navegadores que bloquean el autoplay.

## Accesibilidad y rendimiento

- Navegación por teclado, `skip link` y foco visible.
- Respeta `prefers-reduced-motion`: se detienen el video y las animaciones de entrada.
- Sin dependencias externas: ni JS de terceros ni Google Fonts.
- Datos estructurados `SoftwareApplication` y metadatos Open Graph.

## Versión en un solo archivo

`python3 build-standalone.py` genera `logity-landing.html`: la página completa
con CSS, JS, tipografías, poster y video incrustados (≈1,7 MB). Útil para
compartirla por correo o publicarla sin subir la carpeta `assets/`.

## Tipografías

Self-hosted en `assets/fonts/` (120 KB en total, subconjunto latino):

- **Archivo** — titulares. Grotesca de señalética, apropiada para logística.
- **IBM Plex Sans** — texto corrido, legible en pantallas densas.
- **IBM Plex Mono** — datos operativos: tarifas, folios de servicio, KPIs y etiquetas.

No hay llamadas a Google Fonts ni a ningún otro tercero.
