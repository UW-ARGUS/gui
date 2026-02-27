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
    }
  }
}

export default defineConfig({
  plugins: [react(), scriptApiPlugin()],
})
