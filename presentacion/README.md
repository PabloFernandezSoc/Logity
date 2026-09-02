# Presentación — Modelo de negocio

`modelo-negocio.html` es un deck de 14 láminas sobre cómo se vende Logity a los
tres perfiles de cliente: el que quiere escalar (A), el que ya tiene sistema y
quiere potenciar o ahorrar (B) y el gran operador con el que la jugada es
integrarse (C).

Es un archivo único, sin dependencias ni build. Se abre directo en el navegador:

```bash
python3 -m http.server 8080   # luego abrir /presentacion/modelo-negocio.html
```

## Cómo se usa

| Acción | Cómo |
|---|---|
| Avanzar / retroceder | `→` `←`, barra espaciadora, `Re Pág` / `Av Pág`, o deslizar |
| Ir al inicio o al final | `Inicio` / `Fin` |
| Saltar a una lámina | Botón **Índice**, los puntos inferiores, o `#7` en la URL |
| Exportar a PDF | Botón **Exportar PDF** — cada lámina sale en una página apaisada |

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
