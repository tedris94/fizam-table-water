/**
 * LiteSpeed / CloudLinux startup (use Application startup file: launcher.js).
 * Spawns server.js with --disable-wasm-trap-handler and preload-sharp.cjs.
 * cPanel often ignores NODE_OPTIONS; .cjs startup files may not run at all.
 */
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const appRoot = fileURLToPath(new URL('.', import.meta.url))
const node = process.execPath
const preload = path.join(appRoot, 'preload-sharp.cjs')
const server = path.join(appRoot, 'server.js')
const libvipsLib = path.join(
  appRoot,
  'node_modules',
  '@img',
  'sharp-libvips-linux-x64',
  'lib',
)

const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  // CloudLinux often sets HOSTNAME to the server IP; Passenger cannot reach that bind → timeout.
  HOSTNAME: '0.0.0.0',
  HOST: '0.0.0.0',
  LD_LIBRARY_PATH: [libvipsLib, process.env.LD_LIBRARY_PATH]
    .filter(Boolean)
    .join(':'),
}

const child = spawn(
  node,
  ['--disable-wasm-trap-handler', '--require', preload, server],
  { stdio: 'inherit', env, cwd: appRoot },
)

function forward(sig) {
  if (!child.killed) child.kill(sig)
}

process.on('SIGTERM', () => forward('SIGTERM'))
process.on('SIGINT', () => forward('SIGINT'))
child.on('exit', (code) => process.exit(code ?? 1))
