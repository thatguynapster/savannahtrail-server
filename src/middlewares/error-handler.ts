// src/middlewares/error.ts
import type { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import Joi from "joi";
import mongoose from "mongoose";
import { MulterError } from "multer";

export class AppError extends Error {
    statusCode: number;
    expose: boolean;
    details?: unknown;

    constructor(message: string, statusCode = 500, details?: unknown, expose = statusCode < 500) {
        super(message);
        this.statusCode = statusCode;
        this.expose = expose;
        this.details = details;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

export const notFound = (req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Route not found" });
};

export const errorConverter: ErrorRequestHandler = (err, _req, _res, next) => {
    if (err instanceof AppError) return next(err);

    // Malformed JSON body
    if (err instanceof SyntaxError && "body" in err) {
        return next(new AppError("Malformed JSON body", 400, undefined, true));
    }

    // Joi
    if ((err as any)?.isJoi) {
        const e = err as Joi.ValidationError;
        const details = e.details.map((d) => ({ path: d.path.join("."), message: d.message.replace(/["]/g, "") }));
        return next(new AppError("Validation error", 400, details, true));
    }

    // Multer
    if (err instanceof MulterError) {
        return next(new AppError(`Upload error: ${err.code}`, 400, err.message, true));
    }

    // Mongoose validation
    if (err instanceof mongoose.Error.ValidationError) {
        const details = Object.values(err.errors).map((e) => ({ path: (e as any).path, message: (e as any).message }));
        return next(new AppError("Model validation error", 400, details, true));
    }

    // Invalid ObjectId
    if (err instanceof mongoose.Error.CastError) {
        return next(new AppError(`Invalid ${err.path}: ${err.value}`, 400, undefined, true));
    }

    // Duplicate key
    if ((err as any)?.code === 11000) {
        const fields = Object.keys((err as any).keyValue || {});
        return next(new AppError(`Duplicate value for field(s): ${fields.join(", ")}`, 409, (err as any).keyValue, true));
    }

    // AWS SDK-ish (optional)
    if ((err as any)?.$metadata || String((err as any)?.name || "").startsWith("S3")) {
        return next(new AppError((err as any).message || "Cloud storage error", 502, { code: (err as any).name }, true));
    }

    const status = (err as any).statusCode || (err as any).status || 500;
    const message = (err as any).message || "Internal Server Error";
    next(new AppError(message, status));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    const env = process.env.NODE_ENV || "development";
    const appErr = err as AppError;

    const status = appErr.statusCode ?? 500;
    const expose = appErr.expose ?? status < 500;

    const payload: any = {
        success: false,
        message: expose ? appErr.message : "Internal Server Error",
    };

    if (expose && appErr.details) payload.details = appErr.details;
    if (env !== "production") {
        payload.stack = err.stack;
        payload.path = req.path;
        payload.method = req.method;
    }

    res.status(status).json(payload);
};

// Wrap async controllers to auto-forward rejections to next()
export const asyncHandler =
    <T extends (req: Request, res: Response, next: NextFunction) => Promise<any>>(fn: T) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next);
