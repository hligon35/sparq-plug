export class AppError extends Error {
  status: number;
  code: string;
  details?: any;
  constructor(code: string, message: string, status = 400, details?: any) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(details: any) {
    super('VALIDATION_FAILED', 'Validation failed', 422, details);
  }
}

export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: { error: err.code, message: err.message, details: err.details },
    };
  }
  return {
    status: 500,
    body: { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  };
}
