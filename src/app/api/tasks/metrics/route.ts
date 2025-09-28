import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { serverError } from '@/lib/apiResponse';
import { listTasks } from '@/lib/tasks';

// GET /api/tasks/metrics - returns counts of (open/in_progress) tasks assigned to current actor
export async function GET(request: NextRequest) {
  const g = apiGuard(request, { path: '/api/tasks/metrics:GET', capability: 'manage_team', rate: { windowMs: 10_000, max: 40 }, csrf: false });
  if (g instanceof Response) return g;
  try {
    // Pull open + in progress tasks in scope mine
    const result = await listTasks(g.tenantId, { scope: 'mine', mineFor: g.actor, status: ['open','in_progress'] as any, page: 1, pageSize: 200 });
    const assigned = result.tasks.filter(t => t.assignee === g.actor);
    const openAssigned = assigned.filter(t => t.status === 'open').length;
    const inProgressAssigned = assigned.filter(t => t.status === 'in_progress').length;
    const totalOpenAssigned = openAssigned + inProgressAssigned;
    return new Response(JSON.stringify({ openAssigned, inProgressAssigned, totalOpenAssigned }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e:any) {
    return serverError(e.message || 'Failed to load metrics');
  }
}
