import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UserService {
	protected readonly users = [
		{
			userId: 1,
			username: 'superuser',
			password: process.env.SUPERUSER_PASSWORD
		}
	];

	public async findOne(username: string): Promise<User | undefined> {
		return this.users.find(user => user.username === username);
	}
}
