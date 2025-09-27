// Lightweight browser-safe logger (avoids Node crypto dependency in core/logger)
type Level = 'info' | 'warn' | 'error' | 'debug';

function emit(level: Level, message: string, meta?: any) {
  const payload = { time: new Date().toISOString(), level, message, ...(meta || {}) };
  if (level === 'error') console.error(payload); else if (level === 'warn') console.warn(payload); else console.log(payload);
}

export const clientLogger = {
  info: (m: string, meta?: any) => emit('info', m, meta),
  warn: (m: string, meta?: any) => emit('warn', m, meta),
  error: (m: string, meta?: any) => emit('error', m, meta),
  debug: (m: string, meta?: any) => emit('debug', m, meta),
};

export default clientLogger;
