export class ValidateError extends Error {
  statusCode = 400;
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = "ValidateError";
  }
}

export class LookUpError extends Error {
  statusCode = 500;
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = "LookUpError";
  }
}
