import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.ts';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.url;
  const method = req.method;

  // Handle known AppError instances (4xx operational errors: validation, unauthorized, forbidden, not found, conflict)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details || null,
        statusCode: err.statusCode,
        path,
        method,
        timestamp,
      },
    });
  }

  // Handle Express body-parser SyntaxError (e.g. malformed JSON payload)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON_PAYLOAD',
        message: 'Malformed JSON payload provided in request body',
        details: err.message,
        statusCode: 400,
        path,
        method,
        timestamp,
      },
    });
  }

  // Unhandled / Internal Server Error (500)
  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
      details: isProduction ? null : err?.message || 'Server error',
      statusCode: 500,
      path,
      method,
      timestamp,
    },
  });
}

// 404 handler for unmatched API routes
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.originalUrl} does not exist`,
      statusCode: 404,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    },
  });
}

// Wrapper to catch async errors and pass them cleanly to next(err)
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
