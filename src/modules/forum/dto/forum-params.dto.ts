import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Matches, IsString } from 'class-validator';

export class ForumParams {
	@ApiProperty({type: 'string', required: true})
	@Matches(/^[a-z](?:-?[a-z0-9]+){3,255}$/i)
	@IsString()
	@Transform(({value}: {value: string}) => value.toLowerCase())
	pathId!: string;
}