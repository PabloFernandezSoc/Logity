# Presentaciones

Dos decks, mismo sistema visual y mismos controles. El primero es interno; el
segundo se muestra en reunión con el cliente.

| Archivo | Para quién | Largo |
|---|---|---|
| `modelo-negocio.html` | interno — comercial y socios | 14 láminas |
| `comercial-clientes.html` | el cliente, en reunión o por correo | 8 láminas |

---

## `comercial-clientes.html` — presentación de venta

Corta y sin jerga interna: el problema del día a día, los dos ejes de la
plataforma, el portal, el módulo comercial y el operacional con pantallas de
ejemplo, las integraciones y el cierre con la demo. No menciona segmentación,
precios ni estrategia — eso vive en el deck interno.

Publicada en https://claude.ai/artifact/8bcNkQHzzHP6DEYKSxQQUn

---

## `modelo-negocio.html` — deck interno

Deck de 14 láminas sobre cómo se vende Logity a los
tres perfiles de cliente: el que quiere escalar (A), el que ya tiene sistema y
quiere potenciar o ahorrar (B) y el gran operador con el que la jugada es
integrarse (C).

Es un archivo único, sin dependencias ni build. Se abre directo en el navegador:

```bash
python3 -m http.server 8080   # luego abrir /presentacion/modelo-negocio.html
```

## Cómo se usan (los dos)

| Acción | Cómo |
|---|---|
| Avanzar / retroceder | `→` `←`, barra espaciadora, `Re Pág` / `Av Pág`, o deslizar |
| Ir al inicio o al final | `Inicio` / `Fin` |
| Saltar a una lámina | Botón **Índice**, los puntos inferiores, o `#7` en la URL |
| Exportar a PDF | Botón **Exportar PDF** — cada lámina sale en una página apaisada de 1280 × 720 (16:9) |

En pantallas bajo 900 px el deck se lee como documento: las láminas se apilan y
se recorren con scroll.

## Estilo

Toma la identidad de la landing: azul eléctrico sobre negro, Archivo para
títulos e IBM Plex Sans/Mono para cuerpo y datos. Aquí las tipografías vienen de
Google Fonts (la landing las tiene self-hosted) para que el archivo viaje solo.
Cada perfil tiene su acento —cian, azul, violeta— y el orden del color es el
orden de madurez del cliente.

## Qué falta completar

Los montos no están en el deck a propósito: la lámina 12 muestra la estructura
de cobro (implementación, suscripción por módulo, usuarios, volumen,
integraciones) y los valores se toman de la lista de precios interna. La lámina
8 arma el cuadro de ahorro con los costos reales del prospecto, no con cifras de
ejemplo.

## Versión publicada

El mismo deck está publicado como artifact en
https://claude.ai/code/artifact/a67bc236-c153-45b9-8835-a4f8c213d5f0 — para
actualizarlo hay que republicar desde la sesión que lo creó o pasando esa URL.
