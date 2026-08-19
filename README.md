# Logity — Landing page

Landing page de **Logity**, el software integral para operadores logísticos que centraliza
la gestión de servicios de importación y exportación.

## Contenido de la página

| Sección | Qué comunica |
|---|---|
| Hero | Propuesta de valor + video de marca de fondo |
| Problema | El dolor actual: planillas, correos y falta de una única fuente de verdad |
| Plataforma | Los dos grandes ejes: portal de clientes + operación |
| Portal de clientes | Visibilidad para los clientes de nuestros clientes |
| Comercial | Modificación masiva de tarifas, mantenedor de acuerdos, análisis de ventas, trazabilidad |
| Operacional | Proyección de carga → coordinación → en curso → finalizado, sala de control y links GPS automáticos |
| A tu medida | Módulos adaptados a la operación de cada cliente (diagnóstico → configuración → puesta en marcha → evolución) |
| Beneficios | Seis razones concretas |
| FAQ | Preguntas frecuentes |
| Demo | Formulario de contacto |

## Estructura

```
index.html          Página completa (una sola página, anclas de navegación)
styles.css          Estilos y design tokens (:root)
main.js             Nav móvil, reveal al scroll, control del video y formulario
assets/video/       Video del hero (versión escritorio y móvil, optimizados)
assets/img/         Poster del video y favicon
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
- Sin dependencias JS externas; solo Google Fonts.
- Datos estructurados `SoftwareApplication` y metadatos Open Graph.
