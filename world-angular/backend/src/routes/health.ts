import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/', (_req: Request, res: Response) => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  res.status(200).json({
    status: 'ok',
    timestamp,
    uptime: Math.floor(uptime),
  });
});

export default router;
