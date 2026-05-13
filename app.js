/**
 * Phusion Passenger entrypoint for Namecheap Stellar (cPanel "Setup Node.js App").
 *
 * After `npm run build` produces `.next/standalone/server.js`, copy that file's
 * runtime into this process. Passenger auto-loads `app.js` from the application root.
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.NEXT_TELEMETRY_DISABLED = '1'

// Default Passenger port; override by setting PORT in the cPanel UI.
process.env.PORT = process.env.PORT || '3000'

const path = require('path')

const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js')

try {
  require(standaloneServer)
} catch (err) {
  // Fallback: run `next start` if standalone wasn't shipped.
  // eslint-disable-next-line no-console
  console.error('Failed to load standalone server, falling back to next start:', err.message)
  const next = require('next')
  const http = require('http')
  const app = next({ dev: false, dir: __dirname })
  const handle = app.getRequestHandler()
  app.prepare().then(() => {
    http.createServer((req, res) => handle(req, res)).listen(Number(process.env.PORT))
  })
}
