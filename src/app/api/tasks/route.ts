import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest, serverError, forbidden, notFound } from '@/lib/apiResponse';
import { createTask, listTasks } from '@/lib/tasks';
import crypto from 'crypto';
import { addNotification } from '@/lib/notificationsStore';

// GET /api/tasks?scope=mine|all&assignee=x&status=open,in_progress
export async function GET(request: NextRequest) {
  const g = apiGuard(request, { path: '/api/tasks:GET', capability: 'manage_team', rate: { windowMs: 10_000, max: 50 }, csrf: false });
  if (g instanceof Response) return g;
  const { searchParams } = new URL(request.url);
  const scope = (searchParams.get('scope') as 'mine' | 'all' | null) || 'mine';
  const assignee = searchParams.get('assignee') || undefined;
  const statusRaw = searchParams.get('status') || '';
  const q = searchParams.get('q') || undefined;
  const status = statusRaw.split(',').map(s=>s.trim()).filter(Boolean) as any;
  const page = parseInt(searchParams.get('page')||'1',10);
  const pageSize = parseInt(searchParams.get('pageSize')||'20',10);
  const sort = (searchParams.get('sort') as any) || 'createdAt';
  const order = (searchParams.get('order') as any) || 'desc';
  try {
    const result = await listTasks(g.tenantId, { scope, assignee, mineFor: g.actor, status, q, page, pageSize, sort, order });
    // Build a weak ETag based on the subset result (tenant + filters). Use updatedAt + id for stability.
    const hashBase = result.tasks.map(t => `${t.id}:${t.updatedAt}:${t.status}`).join('|') + `|meta:${result.total}:${result.page}:${result.pageSize}`;
    const etag = 'W/"' + crypto.createHash('sha1').update(hashBase).digest('hex') + '"';
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers: { 'ETag': etag } });
    }
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json', 'ETag': etag } });
  } catch (e:any) {
    return serverError(e.message || 'Failed to list tasks');
  }
}

// POST /api/tasks { title, description?, assignee }
export async function POST(request: NextRequest) {
  const g = apiGuard(request, { path: '/api/tasks:POST', capability: 'manage_team', rate: { windowMs: 10_000, max: 20 }, csrf: true });
  if (g instanceof Response) return g;
  try {
    const body = await request.json();
    const { title, description, assignee } = body;
    if (!title) return badRequest('Title required');
    if (!assignee) return badRequest('Assignee required');
    const task = await createTask(g.tenantId, { title, description, assignee, actor: g.actor });
    if (assignee !== g.actor) {
      await addNotification({
        tenantId: g.tenantId,
        user: assignee,
        type: 'task_assigned',
        taskId: task.id,
        message: `New task assigned: ${task.title}`,
      });
    }
    return ok({ task });
  } catch (e: any) {
    if (e.message === 'Forbidden') return forbidden('Not allowed');
    return serverError(e.message || 'Failed to create task');
  }
}
