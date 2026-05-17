/**
 * Phusion Passenger entrypoint for Namecheap cPanel "Setup Node.js App".
 *
 * CI flat bundle: server.js at app root → use startup file `server.js` (preferred).
 * Legacy layout: .next/standalone/server.js → this file loads it if startup is `app.js`.
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.NEXT_TELEMETRY_DISABLED = '1'
process.env.PORT = process.env.PORT || '3000'

const path = require('path')
const fs = require('fs')

const flatServer = path.join(__dirname, 'server.js')
const nestedServer = path.join(__dirname, '.next', 'standalone', 'server.js')

const entry =
  (fs.existsSync(flatServer) && flatServer) ||
  (fs.existsSync(nestedServer) && nestedServer)

if (!entry) {
  throw new Error(
    'No Next standalone server found. Deploy the CI flat ZIP (server.js at app root) or run a standalone build.',
  )
}

require(entry)
