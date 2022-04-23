import { Matches, IsString } from 'class-validator';

export class ForumParams {
	@Matches(/^[a-z](?:-?[a-z0-9]+)*$/i)
	@IsString()
	pathId: string
}