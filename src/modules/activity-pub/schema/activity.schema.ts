import { Prop, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { BaseObject } from "./base-object.schema";

export type ActivityDocument = Activity & mongoose.Document;

const {Mixed} = mongoose.Schema.Types;

export class Activity extends BaseObject {
	@Prop({type: Mixed})
	actor?: any;

	@Prop({type: Mixed})
	target?: any;

	@Prop({type: Mixed})
	result?: any;

	@Prop({type: Mixed})
	origin?: any;

	@Prop({type: Mixed})
	instrument?: any;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);