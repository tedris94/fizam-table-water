import fs from 'fs'
import path from 'path'

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(tsx|ts)$/.test(e.name)) {
      let c = fs.readFileSync(p, 'utf8')
      const n = c.replace(/@(\d+\.)+\d+(?=")/g, '')
      if (n !== c) {
        fs.writeFileSync(p, n)
        console.log('fixed', p)
      }
    }
  }
}

walk(path.join(process.cwd(), 'src', 'components'))
