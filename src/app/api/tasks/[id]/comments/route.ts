import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest, notFound, serverError, forbidden } from '@/lib/apiResponse';
import { getTask } from '@/lib/tasks';
import { listComments, addComment } from '@/lib/taskComments';
import { addNotification } from '@/lib/notificationsStore';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/tasks/[id]/comments:GET', capability: 'manage_team', rate: { windowMs: 10_000, max: 60 }, csrf: false });
  if (g instanceof Response) return g;
  const task = await getTask(g.tenantId, params.id);
  if (!task) return notFound('Task not found');
  if (task.assignee !== g.actor && task.createdBy !== g.actor) return forbidden('Not allowed');
  const comments = await listComments(g.tenantId, task.id);
  return ok({ comments });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/tasks/[id]/comments:POST', capability: 'manage_team', rate: { windowMs: 10_000, max: 30 }, csrf: true });
  if (g instanceof Response) return g;
  try {
    const body = await req.json();
    const text = body.body as string;
    if (!text) return badRequest('Body required');
    const task = await getTask(g.tenantId, params.id);
    if (!task) return notFound('Task not found');
    if (task.assignee !== g.actor && task.createdBy !== g.actor) return forbidden('Not allowed');
    const comment = await addComment(g.tenantId, task.id, g.actor, text);
    // Notifications: notify other party/parties except author.
    const targets = new Set<string>();
    if (task.assignee !== g.actor) targets.add(task.assignee);
    if (task.createdBy !== g.actor) targets.add(task.createdBy);
    for (const user of targets) {
      await addNotification({
        tenantId: g.tenantId,
        user,
        type: 'task_comment',
        taskId: task.id,
        message: `New comment on task: ${task.title}`,
      });
    }
    return ok({ comment });
  } catch (e:any) {
    if (e.message === 'Forbidden') return forbidden('Not allowed');
    return serverError(e.message || 'Failed to add comment');
  }
}
