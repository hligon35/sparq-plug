import express from 'express'
import crypto from 'crypto'
import getRawBody from 'raw-body'
import { spawn } from 'child_process'

// In-memory single-worker queue to avoid overlapping builds
const queue = []
let running = false
let last = { startedAt: null, finishedAt: null, exitCode: null, runs: 0, lastError: null }
const ringLog = [] // small ring buffer for recent log lines
const MAX_LOG = 400
function log(line){
  const ts = new Date().toISOString()
  const msg = `[deployer] ${ts} ${line}`
  console.log(msg)
  ringLog.push(msg)
  if (ringLog.length > MAX_LOG) ringLog.splice(0, ringLog.length - MAX_LOG)
}

const app = express()
const PORT = process.env.PORT || 8787
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || ''

app.post('/webhook', async (req, res) => {
  try {
    const sig = req.header('X-Hub-Signature-256') || ''
    const raw = await getRawBody(req)
    if (!SECRET) return res.status(500).send('secret not configured')
    const hmac = crypto.createHmac('sha256', SECRET)
    const digest = 'sha256=' + hmac.update(raw).digest('hex')
    const ok = sig && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig))
    if (!ok) return res.status(401).send('invalid signature')
    const event = req.header('X-GitHub-Event') || ''
    if (event !== 'push') return res.status(202).send('ignored')
    // Minimal info for observability
    const body = JSON.parse(raw.toString('utf8'))
    const ref = body && body.ref
    const repo = body && body.repository && body.repository.full_name
    queue.push({ ts: Date.now(), ref, repo })
    log(`enqueued push: repo=${repo || 'unknown'} ref=${ref || 'unknown'} qlen=${queue.length}`)
    processQueue()
    return res.status(202).send('queued')
  } catch {
    return res.status(400).send('bad request')
  }
})

app.get('/healthz', (_req, res) => res.status(200).json({ ok:true, running, qlen: queue.length, last }))
app.get('/status', (_req, res) => res.json({ running, qlen: queue.length, last }))
app.get('/recent-logs', (req, res) => {
  // Optional limit: /recent-logs?n=200 (defaults to MAX_LOG)
  const n = Math.min(MAX_LOG, Math.max(1, Number(req.query?.n) || MAX_LOG))
  res.set('Cache-Control', 'no-store')
  res.type('text/plain').send(ringLog.slice(-n).join('\n'))
})
// Alternate endpoints to reduce likelihood of WAF/tooling issues
app.get('/logs.txt', (req, res) => {
  const n = Math.min(MAX_LOG, Math.max(1, Number(req.query?.n) || MAX_LOG))
  res.set('Cache-Control', 'no-store')
  res.type('text/plain').send(ringLog.slice(-n).join('\n'))
})
app.get('/logs.json', (req, res) => {
  const n = Math.min(MAX_LOG, Math.max(1, Number(req.query?.n) || MAX_LOG))
  res.set('Cache-Control', 'no-store')
  res.json({ lines: ringLog.slice(-n) })
})
app.get('/', (_req, res) => res.type('text/plain').send('SparQ deployer OK'))

function processQueue(){
  if (running) return
  const item = queue.shift()
  if (!item) return
  running = true
  last.startedAt = new Date().toISOString()
  last.finishedAt = null
  last.exitCode = null
  last.lastError = null
  last.runs = (last.runs || 0) + 1

  log(`starting runner for ${item.repo || 'unknown'} (${item.ref || ''})`)
  const child = spawn('/bin/bash', ['/app/runner.sh'], { stdio: ['ignore','pipe','pipe'] })

  const onLine = (buf) => buf.toString('utf8').split(/\r?\n/).forEach(l=> l && log(l))
  child.stdout.on('data', onLine)
  child.stderr.on('data', onLine)

  // Safety timeout (20 minutes) to prevent stuck builds
  const timeoutMs = Number(process.env.DEPLOY_TIMEOUT_MS || 20*60*1000)
  const t = setTimeout(()=>{
    try { child.kill('SIGKILL') } catch {}
    log('runner timed out and was killed')
  }, timeoutMs)

  child.on('close', (code) => {
    clearTimeout(t)
    last.exitCode = code
    last.finishedAt = new Date().toISOString()
    log(`runner finished with code=${code}`)
    running = false
    // Process next if present
    setTimeout(processQueue, 100)
  })
}

app.listen(PORT, () => log(`listening on ${PORT}`))
