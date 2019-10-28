import * as mongoose from "mongoose"

export const MessageSchema = new mongoose.Schema({
	id:      String,
	type:    String,
	name:    String,
	content: String
})