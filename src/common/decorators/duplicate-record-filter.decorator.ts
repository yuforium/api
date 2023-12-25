import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DuplicateRecordException } from '../exceptions/duplicate-record.exception';

@Catch(DuplicateRecordException)
export class DuplicateRecordFilter implements ExceptionFilter {
  catch(exception: DuplicateRecordException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();

    response.status(409).json(exception);
  }
}