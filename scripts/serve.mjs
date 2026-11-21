// 极简静态服务器：只为本地预览 dist/ 与截图用，不参与生产构建
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const ROOT = process.argv[2] ?? 'dist'
const PORT = Number(process.argv[3] ?? 4399)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent((req.url ?? '/').split('?')[0])
    if (p === '/' || p === '') p = '/index.html'
    const file = normalize(join(ROOT, p))
    const info = await stat(file).catch(() => null)
    const target = info?.isFile() ? file : join(ROOT, 'index.html')
    const buf = await readFile(target)
    res.writeHead(200, {
      'Content-Type': MIME[extname(target)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    res.end(buf)
  } catch (e) {
    res.writeHead(500).end(String(e))
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`static server: http://127.0.0.1:${PORT}/  root=${ROOT}`)
})
