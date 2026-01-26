import { HttpException, HttpStatus } from '@nestjs/common';

export interface FieldError {
  field: string;
  message: string;
}

export const throwValidateError = (
  field: string,
  message: string,
  status: HttpStatus = HttpStatus.BAD_REQUEST,
): never => {
  throw new HttpException(
    [
      {
        field,
        message,
      },
    ] satisfies FieldError[],
    status,
  );
};
