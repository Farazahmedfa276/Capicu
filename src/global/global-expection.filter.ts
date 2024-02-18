import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';
import { MongoServerError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapter: AbstractHttpAdapter) {
    super(httpAdapter);
  }

  catch(_exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Check that exception is of MongoServerError type
    if (
      JSON.stringify(Object.getPrototypeOf(_exception)) ===
      JSON.stringify(MongoServerError.prototype)
    ) {
      const exception = _exception as MongoServerError;

      // MongoServer error -> Duplicate value for unique fileds
      if (exception.code === 11000) {
        const fields = Object.keys(exception.keyPattern);

        let message = 'Values for the following field(s) are not available:\n';

        fields.forEach((field, i) => {
          message = `${message}${i + 1}. ${field}\n`;
        });

        const statusCode = HttpStatus.CONFLICT;

        const responseBody = { statusCode, message };

        this.logger.error(_exception.message);

        return this.httpAdapter.reply(response, responseBody, statusCode);
      }
    }

    this.logger.error(_exception.message);

    return super.catch(_exception, host);
  }
}
