import http from 'http';
import https from 'https';
import { exec } from 'child_process';

const env = (k, d=null) => process.env[k] ?? d;
const INTERVAL = Number(env('CHECK_INTERVAL_MS', 30000));
const THRESH = Number(env('FAIL_THRESHOLD', 3));
const LOG = env('LOG_LEVEL','info');
const TUNNEL = env('TUNNEL_CONTAINER','cloudflared');

const urls = {
  public: [
    env('PUBLIC_PORTAL_URL','https://portal.getsparqd.com/healthz'),
    env('PUBLIC_SPARGPLUG_URL','https://sparqplug.getsparqd.com/_app_health'),
    env('PUBLIC_STATIC_URL','https://getsparqd.com/')
  ],
  internal: [
    env('INTERNAL_PORTAL_URL','http://portal-app:3003/healthz'),
    env('INTERNAL_SPARGPLUG_URL','http://sparqplug:3000/_app_health'),
    env('INTERNAL_STATIC_URL','http://static-site:80/')
  ]
};

function log(level, msg){ if(level==='error'|| LOG==='debug' || (LOG==='info' && level!=='debug')) console.log(`[${new Date().toISOString()}] [${level}] ${msg}`) }

function req(u){
  return new Promise(resolve=>{
    if(!u) return resolve(false);
    const mod = u.startsWith('https')? https : http;
    try {
      const url = new URL(u);
      const r = mod.request({hostname:url.hostname, path:url.pathname+url.search, method:'HEAD', timeout:5000}, res=>{
        resolve(res.statusCode && res.statusCode>=200 && res.statusCode<400);
      });
      r.on('error', ()=>resolve(false));
      r.on('timeout', ()=>{ try{r.destroy()}catch{}; resolve(false) });
      r.end();
    } catch { resolve(false); }
  })
}

let publicFails = 0;
let internalFails = 0;

async function checkOnce(){
  const pub = (await Promise.all(urls.public.map(req))).every(Boolean);
  const int = (await Promise.all(urls.internal.map(req))).every(Boolean);
  log('debug', `checks: public=${pub} internal=${int}`);
  if(!pub){ publicFails++; } else { publicFails = 0; }
  if(!int){ internalFails++; } else { internalFails = 0; }

  // If internal OK but public failing repeatedly -> restart tunnel
  if(int && !pub && publicFails >= THRESH){
    log('error', `public checks failing ${publicFails}x while internal healthy; restarting ${TUNNEL}`);
    exec(`docker restart ${TUNNEL}`, (err, stdout, stderr)=>{
      if(err) log('error', `restart ${TUNNEL} failed: ${err.message}`); else log('info', `restarted ${TUNNEL}: ${stdout.trim()}`);
    });
    publicFails = 0;
  }
}

setInterval(checkOnce, INTERVAL);
checkOnce();
