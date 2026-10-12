import { Hono } from 'hono';
import { prisma } from '../db.js';

export const notificationsRoutes = new Hono();

notificationsRoutes.get('/', async (c) => {
  const role = c.req.query('role');
  const userId = c.req.query('userId');

  const notifications = await prisma.systemNotification.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const filtered = notifications.filter((n) => {
    if (n.targetUserId && n.targetUserId !== userId) return false;
    if (n.targetRole && n.targetRole !== role) return false;
    return true;
  });

  return c.json(filtered);
});

notificationsRoutes.patch('/:id/read', async (c) => {
  const { id } = c.req.param();
  const updated = await prisma.systemNotification.update({
    where: { id },
    data: { read: true },
  });
  return c.json(updated);
});
