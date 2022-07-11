import { ApiParam, ApiProperty } from '@nestjs/swagger';
import { Matches, IsString } from 'class-validator';

export class ForumParams {
	@ApiProperty({type: 'string', required: true})
	@Matches(/^[a-z](?:-?[a-z0-9]+)*$/i)
	@IsString()
	pathId: string
}