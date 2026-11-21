# tienda-api (PC02 - Despliegue de Aplicaciones)

**Alumno:** Huayhuas David · Código 22200122 · Universidad ESAN

API de ejemplo sin dependencias. Requiere Node.js 20 o superior.

    npm test            # ejecuta las pruebas
    npm run test:cov    # pruebas con cobertura
    npm start           # inicia el servidor en el puerto 3000 (o el de PORT)
    node verificar.mjs  # autoverificación de la parte práctica
    npm run pipeline    # pruebas y notificación a Slack (requiere SLACK_WEBHOOK_URL)

## Rutas

| Ruta | Respuesta |
|---|---|
| `/health` | `200 {"status":"ok"}` (liveness) |
| `/ready` | `200 {"status":"listo"}`, o `503` si `BASE_DE_DATOS_OK=false` (readiness) |
| `/productos` | Lista de productos |
| `/total?ids=1,2&cupon=DESC10` | Total con cupón e IGV |

Cada petición escribe en la consola una línea JSON con `ts`, `level`, `msg`, `method`, `path`, `status` y `ms`.

## Resumen de la práctica

| Tarea | Qué se hizo |
|---|---|
| T1 | Se corrigió `aplicarCupon` en `src/precios.js` (el descuento se sumaba en vez de restarse y el código no aceptaba minúsculas). Se agregaron pruebas de `validarCantidad`. Cobertura de líneas de `src/precios.js`: 100 %. |
| T2 | `/health`, `/ready` y log JSON por petición con `res.on("finish")`. |
| T3 | `notificar.mjs` envía ÉXITO o ERROR a Slack. El webhook se lee solo de `SLACK_WEBHOOK_URL` y no está en ningún archivo. Script `npm run pipeline`. |
| T4 | `.github/workflows/ci.yml`: en cada Pull Request hacia `main` ejecuta `npm ci` y `npm test`, y notifica con `if: success()` / `if: failure()` usando `secrets.SLACK_WEBHOOK_URL`. |
| T5 | Despliegue en la nube (abajo) y versionado: tags `v1.0.0` y `v1.1.0`, con rollback a 1.0.0 mediante `git revert`. |

## Ejecutar el pipeline con Slack

En PowerShell:

    $env:SLACK_WEBHOOK_URL="URL_ENTREGADA_POR_EL_DOCENTE"
    $env:ALUMNO="Huayhuas David"
    npm run pipeline

En GitHub Actions el webhook se guarda en **Settings > Secrets and variables > Actions** como `SLACK_WEBHOOK_URL`.

## Despliegue (T5)

- **Plataforma:** Render (Web Service)
- **Build command:** `npm install`
- **Start command:** `npm start`
- **URL pública:** _pendiente_
- **Verificación:** `GET <URL pública>/health` responde `200 {"status":"ok"}`
