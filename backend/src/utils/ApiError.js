class ApiError extends Error {
  constructor(
    message,
    code = 'INTERNAL_ERROR',
    statusCode = 500,
    isOperational = true
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // Convert error to JSON for API responses
  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
      },
    };
  }

  // Static methods for common error types
  static badRequest(message = 'Bad Request', code = 'BAD_REQUEST') {
    return new ApiError(message, code, 400);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new ApiError(message, code, 401);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new ApiError(message, code, 403);
  }

  static notFound(message = 'Not Found', code = 'NOT_FOUND') {
    return new ApiError(message, code, 404);
  }

  static conflict(message = 'Conflict', code = 'CONFLICT') {
    return new ApiError(message, code, 409);
  }

  static unprocessableEntity(
    message = 'Unprocessable Entity',
    code = 'UNPROCESSABLE_ENTITY'
  ) {
    return new ApiError(message, code, 422);
  }

  static tooManyRequests(
    message = 'Too Many Requests',
    code = 'TOO_MANY_REQUESTS'
  ) {
    return new ApiError(message, code, 429);
  }

  static internal(message = 'Internal Server Error', code = 'INTERNAL_ERROR') {
    return new ApiError(message, code, 500);
  }

  static notImplemented(message = 'Not Implemented', code = 'NOT_IMPLEMENTED') {
    return new ApiError(message, code, 501);
  }

  static serviceUnavailable(
    message = 'Service Unavailable',
    code = 'SERVICE_UNAVAILABLE'
  ) {
    return new ApiError(message, code, 503);
  }
}

export default ApiError;
