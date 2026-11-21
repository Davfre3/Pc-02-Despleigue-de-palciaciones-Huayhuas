// Envía el resultado del pipeline a un canal de Slack mediante un Incoming Webhook.
// Uso:
//   node notificar.mjs exito
//   node notificar.mjs error "detalle opcional"
// La URL del webhook se lee SOLO de la variable de entorno SLACK_WEBHOOK_URL.
import { readFileSync } from 'node:fs'

const [estado = '', detalleArg] = process.argv.slice(2)

if (estado !== 'exito' && estado !== 'error') {
  console.error('Uso: node notificar.mjs exito|error "detalle opcional"')
  process.exit(1)
}

const webhook = process.env.SLACK_WEBHOOK_URL
if (!webhook) {
  console.error('Falta la variable de entorno SLACK_WEBHOOK_URL. No se envió la notificación.')
  process.exit(1)
}

const { name, version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const fecha = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })
const alumno = process.env.ALUMNO

const encabezado = estado === 'exito'
  ? ':white_check_mark: *ÉXITO*: todas las pruebas pasaron'
  : ':x: *ERROR*: el pipeline falló'
const detalle = detalleArg || (estado === 'exito' ? 'npm test terminó sin fallos' : 'npm test reportó pruebas fallidas')

const lineas = [
  encabezado,
  `Proyecto: ${name} v${version}`,
  `Detalle: ${detalle}`,
  `Fecha: ${fecha}`,
]
if (alumno) lineas.push(`Alumno: ${alumno}`)

try {
  const respuesta = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: lineas.join('\n') }),
  })
  if (!respuesta.ok) {
    console.error(`Slack respondió con el estado ${respuesta.status}. No se pudo notificar.`)
    process.exit(1)
  }
  console.log(`Notificación enviada a Slack (${estado}).`)
} catch (e) {
  console.error(`No se pudo conectar con Slack: ${e.message}`)
  process.exit(1)
}
