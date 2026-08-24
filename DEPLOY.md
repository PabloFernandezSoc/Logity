# Publicar la landing en un servidor

Es un sitio **estático**: HTML, CSS, JS y assets. No hay build, no hay
dependencias, no hay Node ni base de datos. Se copian los archivos al servidor
y funciona.

---

## 1. Antes de publicar

Cuatro cosas que dependen del dominio y del contacto reales. Están todas
marcadas con el dominio de ejemplo `logity.com`:

| Qué | Dónde |
|---|---|
| Dominio real | `index.html` → `<link rel="canonical">` y `<meta property="og:image">` |
| Dominio real | `robots.txt` y `sitemap.xml` |
| Correo de contacto | `index.html` (enlace del footer) y `main.js` → `CONTACT_EMAIL` |
| Destino del formulario | `main.js` → `FORM_ENDPOINT` |

Sobre el formulario: si `FORM_ENDPOINT` queda vacío, el formulario abre el
cliente de correo del visitante hacia `CONTACT_EMAIL`. Funciona, pero pierde
envíos. Lo recomendable es apuntarlo al CRM, a un webhook o a un servicio tipo
Formspree: recibe un `POST` con JSON (`nombre`, `empresa`, `email`, `telefono`,
`interes`, `mensaje`) y basta con que responda `200`.

---

## 2. Qué se sube

Estos archivos y carpetas, respetando la estructura:

```
index.html
styles.css
main.js
robots.txt
sitemap.xml
assets/          (video, fuentes, poster, favicon)
```

Lo demás del repositorio es para desarrollo y **no hace falta subirlo**:
`README.md`, `DEPLOY.md`, `deploy/`, `build-standalone.py`, `.gitignore`.
Si igual se suben, no molestan.

---

## 3. Servidor propio

### Copiar los archivos

Con `rsync` (recomendado: sincroniza y borra lo que sobra):

```bash
rsync -avz --delete \
  --exclude '.git' --exclude 'deploy' --exclude '*.md' \
  --exclude 'build-standalone.py' --exclude '.gitignore' \
  ./ usuario@servidor:/var/www/logity/
```

O clonando en el servidor, si se prefiere actualizar con `git pull`:

```bash
git clone https://github.com/PabloFernandezSoc/Logity.git /var/www/logity
```

Permisos, según el usuario del servidor web:

```bash
sudo chown -R www-data:www-data /var/www/logity
sudo find /var/www/logity -type d -exec chmod 755 {} \;
sudo find /var/www/logity -type f -exec chmod 644 {} \;
```

### Configurar el servidor web

Hay configuraciones listas en `deploy/`:

- **Nginx** → `deploy/nginx.conf`. Copiar a `/etc/nginx/sites-available/logity`,
  enlazar a `sites-enabled/`, ajustar `server_name`, `root` y los certificados,
  y recargar con `sudo nginx -t && sudo systemctl reload nginx`.
- **Apache** → `deploy/apache.htaccess`. Copiar como `.htaccess` en la raíz del
  sitio. Necesita `mod_deflate`, `mod_expires` y `mod_headers`.

Ambas hacen lo mismo: HTTPS, compresión donde sirve, caché larga para los
assets, revalidación del HTML y los tipos MIME de `woff2` y `mp4`.

### Los dos detalles que suelen fallar

1. **`.woff2` sin tipo MIME.** Si el servidor no lo reconoce, el navegador
   descarta las fuentes y la página se ve con la tipografía del sistema. Las
   configuraciones de `deploy/` ya lo declaran.
2. **Comprimir el video o las fuentes.** Ya vienen comprimidos: volver a
   comprimirlos gasta CPU y no baja el peso. Comprimir solo HTML, CSS, JS y SVG.

---

## 4. Hosting estático

Si no hay servidor propio, sirve cualquiera de estos y no requieren
configuración: **Netlify**, **Vercel**, **Cloudflare Pages**, **GitHub Pages**,
**Amazon S3 + CloudFront**.

En los tres primeros basta con conectar el repositorio y dejar el comando de
build vacío y el directorio de publicación en la raíz (`.`). Con Netlify también
se puede arrastrar la carpeta a su panel.

---

## 5. Verificar después de publicar

- [ ] La página abre por HTTPS y el candado no muestra advertencias.
- [ ] **El video del hero se reproduce.** Verificarlo en un navegador real
      (Chrome, Safari, Firefox) en escritorio y en teléfono: es lo único que no
      se puede comprobar desde un entorno sin códecs propietarios. Los archivos
      son H.264 + `yuv420p` con `faststart`, el formato de máxima compatibilidad.
      Si no se ve, queda el poster y la página igual funciona.
- [ ] Los títulos se ven con la tipografía Archivo, no con la del sistema.
      Si se ven distintos, es el tipo MIME de `woff2` (ver arriba).
- [ ] Los enlaces del menú bajan a cada sección.
- [ ] El formulario envía y aparece el mensaje de confirmación.
- [ ] En la consola del navegador no hay errores ni recursos en 404.

---

## 6. Si hay que reemplazar el video o una imagen

Los archivos de `assets/` se sirven con caché de un año (`immutable`), así que
un archivo nuevo **con el mismo nombre** no le llega a quien ya visitó el sitio.
Al reemplazar un asset, cambiarle el nombre (por ejemplo
`hero-logity-2.mp4`) y actualizar la referencia en `index.html`.

## 7. Versión de un archivo único

`python3 build-standalone.py` genera `logity-landing.html` (≈1,7 MB) con todo
incrustado: CSS, JS, tipografías, poster y video. Sirve para mandar la landing
por correo o publicarla sin subir la carpeta `assets/`. No se versiona porque se
regenera con ese comando.
