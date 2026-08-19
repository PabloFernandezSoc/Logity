#!/usr/bin/env python3
"""Genera logity-landing.html: la landing completa en un solo archivo.

Inlinea CSS, JS, tipografías, poster y video como data URI, para poder
compartirla o publicarla sin subir la carpeta de assets.

Uso:  python3 build-standalone.py
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "logity-landing.html"

MIME = {".woff2": "font/woff2", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp4": "video/mp4"}


def data_uri(rel: str) -> str:
    p = ROOT / rel
    mime = MIME[p.suffix]
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()


html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "styles.css").read_text(encoding="utf-8")
js = (ROOT / "main.js").read_text(encoding="utf-8")

# Tipografías dentro del CSS
css = re.sub(r"url\((assets/fonts/[^)]+)\)", lambda m: f"url({data_uri(m.group(1))})", css)

# Hoja de estilos y script en línea
html = html.replace('<link rel="stylesheet" href="styles.css" />', f"<style>\n{css}\n</style>")
html = html.replace('<script src="main.js"></script>', f"<script>\n{js}\n</script>")

# Precargas de fuentes: ya no aplican con los data URI
html = re.sub(r'\s*<link rel="preload" href="assets/fonts/[^>]+>', "", html)

# Media
for rel in ["assets/img/hero-poster.jpg", "assets/img/favicon.svg",
            "assets/video/hero-logity.mp4", "assets/video/hero-logity-mobile.mp4"]:
    html = html.replace(rel, data_uri(rel))

OUT.write_text(html, encoding="utf-8")
print(f"{OUT.name}: {OUT.stat().st_size/1024/1024:.2f} MB")
