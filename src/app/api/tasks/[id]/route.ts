import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, serverError, notFound, badRequest, forbidden } from '@/lib/apiResponse';
import { getTask, updateTaskStatus } from '@/lib/tasks';
import { addNotification } from '@/lib/notificationsStore';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/tasks/[id]:GET', capability: 'manage_team', rate: { windowMs: 10_000, max: 60 }, csrf: false });
  if (g instanceof Response) return g;
  const task = await getTask(g.tenantId, params.id);
  if (!task) return notFound('Task not found');
  if (task.assignee !== g.actor && task.createdBy !== g.actor) return forbidden('Not allowed');
  return ok({ task });
}

// PATCH body { status }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/tasks/[id]:PATCH', capability: 'manage_team', rate: { windowMs: 10_000, max: 40 }, csrf: true });
  if (g instanceof Response) return g;
  try {
    const body = await req.json();
    const status = body.status as string;
    if (!['open','in_progress','done'].includes(status)) return badRequest('Invalid status');
    const updated = await updateTaskStatus(g.tenantId, params.id, status as any, g.actor);
    if (!updated) return notFound('Task not found');
    // Notify creator when assignee completes
    if (status === 'done' && updated.createdBy !== g.actor) {
      await addNotification({
        tenantId: g.tenantId,
        user: updated.createdBy,
        type: 'task_completed',
        taskId: updated.id,
        message: `Task completed: ${updated.title}`,
      });
    }
    return ok({ task: updated });
  } catch (e: any) {
    if (e.message === 'Forbidden') return forbidden('Not allowed');
    return serverError(e.message || 'Failed to update task');
  }
}
