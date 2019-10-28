import {Document} from "mongoose"

export interface Message extends Document {
	id: string
	type: string
	name: string
	content: string
}
