'use strict'
/**
 * LiteSpeed / CloudLinux often ignores cPanel NODE_OPTIONS.
 * Use as Application startup file: launcher.cjs (not server.js).
 */
const { spawn } = require('child_process')
const path = require('path')

const appRoot = __dirname
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

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
