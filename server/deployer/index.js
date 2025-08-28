import express from 'express'
import crypto from 'crypto'
import getRawBody from 'raw-body'
import { spawn } from 'child_process'

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
    const child = spawn('/bin/bash', ['/app/runner.sh'], { stdio: 'ignore', detached: true })
    child.unref()
    return res.status(202).send('queued')
  } catch {
    return res.status(400).send('bad request')
  }
})

app.get('/healthz', (_req, res) => res.status(200).send('ok'))

app.listen(PORT, () => console.log(`[deployer] listening on ${PORT}`))
