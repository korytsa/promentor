import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

type ErrorPayload = {
  message: string;
  error?: string;
  errors?: string[] | null;
  statusCode: number;
  success: false;
  timestamp: string;
  path: string;
};

function getHttpErrorPayload(
  exception: HttpException,
): Pick<ErrorPayload, "message" | "error" | "errors"> {
  const response = exception.getResponse();

  if (typeof response === "string") {
    return {
      message: response,
      error: exception.name,
      errors: null,
    };
  }

  if (response && typeof response === "object") {
    const payload = response as {
      message?: string | string[];
      error?: string;
    };
    const errors = Array.isArray(payload.message) ? payload.message : null;

    return {
      message:
        typeof payload.message === "string"
          ? payload.message
          : (errors?.[0] ?? exception.message),
      error: payload.error ?? exception.name,
      errors,
    };
  }

  return {
    message: exception.message,
    error: exception.name,
    errors: null,
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const basePayload =
      exception instanceof HttpException
        ? getHttpErrorPayload(exception)
        : {
            message: "Internal server error",
            error: "InternalServerError",
            errors: null,
          };

    const payload: ErrorPayload = {
      success: false,
      statusCode,
      message: basePayload.message,
      error: basePayload.error,
      errors: basePayload.errors,
      timestamp: new Date().toISOString(),
      path: request.originalUrl || request.url,
    };

    response.status(statusCode).json(payload);
  }
}
