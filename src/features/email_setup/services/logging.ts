export function newCorrelationId(): string {
  // Cheap correlation id; replace with crypto if needed
  return `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
