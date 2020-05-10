import { Matches, IsString } from 'class-validator';

export class ForumParams {
	@Matches(/^[a-z](?:_?[a-z0-9]+)*$/i)
	@IsString()
	path: string
}