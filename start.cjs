'use strict'
/**
 * Namecheap / LiteSpeed Passenger entry (use as Application startup file).
 * Sets LD_LIBRARY_PATH for sharp/libvips before Next standalone boots.
 * Prefer this over server.js when PassengerEnvVar / SetEnv are ignored.
 */
const path = require('path')

const libvipsLib = path.join(
  __dirname,
  'node_modules',
  '@img',
  'sharp-libvips-linux-x64',
  'lib',
)
process.env.LD_LIBRARY_PATH = [libvipsLib, process.env.LD_LIBRARY_PATH]
  .filter(Boolean)
  .join(':')

process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.NEXT_TELEMETRY_DISABLED = '1'

import('./server.js')
