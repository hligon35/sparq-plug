import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest, serverError, forbidden, notFound } from '@/lib/apiResponse';
import { createTask, listTasks } from '@/lib/tasks';
import { addNotification } from '@/lib/notificationsStore';

// GET /api/tasks?scope=mine|all&assignee=x&status=open,in_progress
export async function GET(request: NextRequest) {
  const g = apiGuard(request, { path: '/api/tasks:GET', capability: 'manage_team', rate: { windowMs: 10_000, max: 50 }, csrf: false });
  if (g instanceof Response) return g;
  const { searchParams } = new URL(request.url);
  const scope = (searchParams.get('scope') as 'mine' | 'all' | null) || 'mine';
  const assignee = searchParams.get('assignee') || undefined;
  const statusRaw = searchParams.get('status') || '';
  const status = statusRaw.split(',').map(s=>s.trim()).filter(Boolean) as any;
  try {
    const tasks = await listTasks(g.tenantId, { scope, assignee, mineFor: g.actor, status });
    return ok({ tasks });
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
