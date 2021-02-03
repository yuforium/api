import { Injectable } from '@nestjs/common';

@Injectable()
export class DomainService {
	public async get(hostname) {
		return 'yuforia.com';
	}
}
