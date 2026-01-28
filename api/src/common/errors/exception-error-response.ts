import { HttpException, HttpStatus } from '@nestjs/common';
export interface FieldError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: FieldError[];
}

export const throwValidateError = (
  field: string,
  message: string,
  status: HttpStatus = HttpStatus.BAD_REQUEST,
): never => {
  throw new HttpException(
    {
      statusCode: status,
      message: [
        {
          field,
          message,
        },
      ],
    } satisfies ErrorResponse,
    status,
  );
};
