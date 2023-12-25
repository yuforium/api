import * as mongoose from 'mongoose';

export interface Forum extends mongoose.Document {
  id: string;
  name: string;
  summary: string;
}

export const ForumSchema = new mongoose.Schema({
  id:      String,
  name:    String,
  summary: String
});

export default mongoose.model<Forum>('Forum', ForumSchema);