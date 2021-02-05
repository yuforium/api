import { HttpException } from "@nestjs/common";

export class DuplicateRecordException extends HttpException {
	constructor(response: string | Record<string, any>, status = 200) {
		super({error: "duplicate record", message: "Record already exists"}, status);
	}
}