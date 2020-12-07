import { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
    this.name = 'HTTP Error';
  }
}

export function errorHandler(err: Error | HttpError, req: Request, res: Response, next: NextFunction) {
  if ('HTTP Error' === err.name) {
    const httpError = err as HttpError;
    res.status(httpError.status).send({ message: httpError.message });
  } else {
    next(err);
  }
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => any) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(err => next(err));
}
