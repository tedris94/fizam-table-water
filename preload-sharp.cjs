'use strict'
/** Loaded via NODE_OPTIONS=--require /home/USER/fizam.ng/preload-sharp.cjs (LiteSpeed / Passenger). */
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
