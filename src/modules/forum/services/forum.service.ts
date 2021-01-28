import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Forum } from '../schemas/forum.schema';
import { Model } from 'mongoose';
// import { ModelType } from '@typegoose/typegoose/lib/types';

@Injectable()
export class ForumService {
  constructor(@InjectModel('Forum') protected readonly forumModel: Model<Forum>) { }

  async create(forum: any): Promise<any> {
    const newForum = new this.forumModel(forum);
    return await newForum.save();
  }

  async get(id: string): Promise<any> {
    return this.forumModel.findOne({id}).then(data => JSON.parse(JSON.stringify(data)));
  }

  async find(): Promise<any[]> {
    return this.forumModel.find({}).then(data => JSON.parse(JSON.stringify(data)));
  }

  async delete(id: string) {
    return this.forumModel.deleteOne(id);
  }
}
