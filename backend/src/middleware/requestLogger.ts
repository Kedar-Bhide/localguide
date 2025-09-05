import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Log request start
  logger.info(`${method} ${url}`, {
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    // Log response
    logger.info(`${method} ${url} - ${statusCode}`, {
      ip,
      userAgent,
      statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};