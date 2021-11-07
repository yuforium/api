import { HttpException } from "@nestjs/common";

export class DuplicateRecordException extends HttpException {
  constructor(response?: string | Record<string, any>, status = 409) {
    super({error: "duplicate record", message: "Record already exists"}, status);
  }
}