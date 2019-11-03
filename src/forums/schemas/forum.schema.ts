import * as mongoose from "mongoose"

export const ForumSchema = new mongoose.Schema({
	id:   String,
	name: String
})