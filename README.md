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

- **Plataforma:** Render (Web Service, plan Free, región Ohio)
- **Build command:** `npm install`
- **Start command:** `npm start`
- **URL pública:** https://pc-02-despleigue-de-palciaciones-huayhuas.onrender.com
- **Health check:** https://pc-02-despleigue-de-palciaciones-huayhuas.onrender.com/health responde `200 {"status":"ok"}`
- Render usa `/health` como Health Check Path; los logs del despliegue muestran `GET /health` con estado 200.
- Nota: en el plan Free el servicio se suspende tras ~15 minutos sin uso; la primera petición puede tardar unos 50 segundos.

## Evidencia del despliegue (T5)

Se verificó en el navegador que la URL pública responde correctamente:

    GET https://pc-02-despleigue-de-palciaciones-huayhuas.onrender.com/health
    200 {"status":"ok"}

Captura del despliegue en Render (estado **Deploy succeeded · Live**, commit `7bfbe51`, build `npm install` y start `npm run start`):

![Despliegue exitoso en Render](docs/evidencias/render-deploy.png)

Extracto de los logs de Render:

```text
==> Cloning from https://github.com/Davfre3/Pc-02-Despleigue-de-palciaciones-Huayhuas
==> Checking out commit 7bfbe51241269dc06fb1fb8907c36de56771511c in branch main
==> Running build command 'npm install'...
==> Build successful 🎉
==> Deploying...
==> Running 'npm run start'

> tienda-api@1.0.0 start
> node server.js

Servidor en el puerto 10000
{"ts":"2026-11-21T17:32:48.169Z","level":"info","msg":"peticion_http","method":"GET","path":"/health","status":200,"ms":0.89}
==> Your service is live 🎉
==> Available at your primary URL https://pc-02-despleigue-de-palciaciones-huayhuas.onrender.com
{"ts":"2026-11-21T17:32:54.136Z","level":"info","msg":"peticion_http","method":"GET","path":"/health","status":200,"ms":0.36}
```

Los logs muestran que el servidor toma el puerto de la variable `PORT` que asigna Render (10000), que el health check de Render consulta `/health` periódicamente con respuesta 200 y que cada petición queda registrada como log JSON (T2). Las respuestas 404 en `/` son esperadas: la API no tiene página de inicio.
