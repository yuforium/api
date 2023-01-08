import { ApiParam, ApiProperty } from '@nestjs/swagger';
import { Matches, IsString } from 'class-validator';

export class ForumParams {
	@ApiProperty({type: 'string', required: true})
	@Matches(/^[a-z](?:-?[a-z0-9]+){3,255}$/i)
	@IsString()
	pathId: string | undefined;
}