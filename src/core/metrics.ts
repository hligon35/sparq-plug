type Counter = { inc: (value?: number) => void; value: () => number };

const counters: Record<string, number> = {};

export function counter(name: string): Counter {
  if (!(name in counters)) counters[name] = 0;
  return {
    inc: (v = 1) => { counters[name] += v; },
    value: () => counters[name],
  };
}

export function snapshot() {
  return { counters: { ...counters } };
}
