import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
  } from "@nestjs/common";
  
  @Catch()
  export class HttpExceptionFormatterFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const context = host.switchToHttp();
      const response = context.getResponse();
      const request = context.getRequest();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let code = "INTERNAL_ERROR";
      let message = "Unexpected server error.";
      let details: unknown = null;
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const payload = exception.getResponse();
  
        if (typeof payload === "string") {
          message = payload;
        } else if (payload && typeof payload === "object") {
          const errorPayload = payload as Record<string, unknown>;
  
          if (typeof errorPayload.message === "string") {
            message = errorPayload.message;
          } else if (Array.isArray(errorPayload.message)) {
            message = errorPayload.message.join(", ");
            details = errorPayload.message;
          }
  
          if (typeof errorPayload.code === "string") {
            code = errorPayload.code;
          } else {
            code = mapStatusToCode(status);
          }
  
          if (details === null && "details" in errorPayload) {
            details = errorPayload.details;
          }
        } else {
          code = mapStatusToCode(status);
        }
      }
  
      if (!(exception instanceof HttpException)) {
        code = "INTERNAL_ERROR";
      }
  
      response.status(status).json({
        ok: false,
        statusCode: status,
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
  
  function mapStatusToCode(status: number) {
    switch (status) {
      case 400:
        return "BAD_REQUEST";
      case 401:
        return "UNAUTHORIZED";
      case 403:
        return "FORBIDDEN";
      case 404:
        return "NOT_FOUND";
      case 409:
        return "CONFLICT";
      case 422:
        return "VALIDATION_ERROR";
      case 429:
        return "RATE_LIMITED";
      default:
        return "HTTP_ERROR";
    }
  }