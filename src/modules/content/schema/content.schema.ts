import { Prop, Schema } from "@nestjs/mongoose";

@Schema({collection: 'stream-object'})
export class Content {
	@Prop({unique: true, lowercase: true})
	id: string;
}