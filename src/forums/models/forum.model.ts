import { prop } from "@typegoose/typegoose"
import { IsString } from "class-validator"

export class Forum 
{
	@IsString()
	@prop({required: true, unique: true})
	path: string

	@IsString()
	@prop()
	name: string

	@IsString()
	@prop()
	description: string
}