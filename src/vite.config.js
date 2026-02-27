import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { exec } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCRIPTS_DIR = path.resolve(__dirname, 'src/scripts')

function scriptApiPlugin() {
  return {
    name: 'script-api',
    configureServer(server) {
      server.middlewares.use('/api/execute-script', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          res.setHeader('Content-Type', 'application/json')
          let script
          try {
            script = JSON.parse(body).script
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid JSON' }))
            return
          }

          if (!script || script.includes('/') || !script.endsWith('.sh')) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid script name' }))
            return
          }

          const scriptPath = path.join(SCRIPTS_DIR, script)
          console.log(`\n[execute-script] Running: ${scriptPath}`)
          exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
            if (stdout) console.log(`[execute-script] stdout:\n${stdout}`)
            if (stderr) console.error(`[execute-script] stderr:\n${stderr}`)
            if (error) {
              console.error(`[execute-script] error: ${error.message}`)
              res.statusCode = 500
              res.end(JSON.stringify({ error: stderr || error.message }))
              return
            }
            console.log(`[execute-script] done.`)
            res.end(JSON.stringify({ output: stdout }))
          })
        })
      })

      // Simple latency check endpoint that pings the device IP
      server.middlewares.use('/api/latency', (_req, res) => {
        const targetIp = '192.168.194.151'
        const start = Date.now()

        exec(`ping -c 1 -W 1 ${targetIp}`, (error, stdout, stderr) => {
          res.setHeader('Content-Type', 'application/json')

          if (error) {
            console.error(`[latency] error pinging ${targetIp}:`, stderr || error.message)
            res.statusCode = 502
            res.end(JSON.stringify({ error: 'Unable to reach device', latencyMs: null }))
            return
          }

          // Try to parse latency from ping output; fallback to elapsed time
          let latencyMs = Date.now() - start
          const match = stdout.match(/time=([\d.]+)/)
          if (match && match[1]) {
            const parsed = Number(match[1])
            if (!Number.isNaN(parsed)) {
              latencyMs = parsed
            }
          }

          res.end(JSON.stringify({ latencyMs }))
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), scriptApiPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})
